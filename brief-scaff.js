#!/usr/bin/env node

const FS = require('fs');
const PATH = require('path');
const OPN = require('opn');
const BRIEF = require('brief-async');
const FILE = require('fs-handy-wraps');
const PARSE = require('./parser');

const { CWD } = FILE;
const osHomeDir = FILE.HOME;
const ARGS = process.argv.slice(2);
const HOMEDIR = PATH.join(osHomeDir, 'brief-scaff');
const CONFIG_FILE_PATH = PATH.join(HOMEDIR, 'config.txt');


const log = (...args) => {
  console.log(...args); // eslint-disable-line no-console
};
const checkDir = function checkDir(path, resolve) {
  FILE.dir(path, resolve);
};
const getConfig = function getConfig(_, resolve) {
  const path = CONFIG_FILE_PATH;

  const makeDefConfig = (res, rej) => {
    FILE.read('default-config.txt', res, rej);
    log(`New config file is created here: ${CONFIG_FILE_PATH}`);
  };

  FILE.rom(path, makeDefConfig, resolve);
};
const readConfig = function readConfig(content, resolve, reject) {
  if (!content) {
    log('config file is empty');
    OPN(CONFIG_FILE_PATH);
  }

  if (ARGS[0]) {
    const blueprints = PARSE(content, ARGS);

    if (blueprints) resolve(blueprints);
    else reject('config is broken. Delete it to get default config.');
  } else {
    log('editing config file mode...');
    OPN(CONFIG_FILE_PATH);
  }
};
const makeThings = function makeThings(blueprintConfig, resolve) {
  const worker = async function dirFileMaker(config, parentDir) {
    if (!!config.dirs) {
      config.dirs.forEach(dirFileMaker);
    } else if (!!config.files) {
      const dirName = config.name;
      const dirPath = PATH.join(CWD, dirName);

      log(`dir ${dirName}`);
      await FILE.dir(dirPath);

      await config.files.forEach(dirConfig => dirFileMaker(dirConfig, dirPath));
    } else {
      const fileName = config.name;
      const fileContent = config.content;

      log(`file ${fileName}`);
      await FILE.write(PATH.join(parentDir, fileName), fileContent);
    }
  };

  worker(blueprintConfig);
  setTimeout(resolve, 50); // TODO: refactor this!
};


const roadmap = [
  [HOMEDIR],    checkDir,
  [checkDir],   getConfig,
  [getConfig],  readConfig,
  [readConfig], makeThings,
];
BRIEF(roadmap)
  .then(() => log('The job is finished successfully'));
