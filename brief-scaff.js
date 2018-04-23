#!/usr/bin/env node

const PATH = require('path');
const OPN = require('opn');
const BRIEF = require('brief-async');
const FILE = require('fs-handy-wraps');
const PARSE = require('./parser');
const osHomeDir = require('os').homedir();

const HOMEDIR = PATH.join(osHomeDir, 'brief-scaff');
const CONFIG_FILE_PATH = PATH.join(HOMEDIR, 'config.txt');


const log = (...args) => {
  console.log(...args); // eslint-disable-line no-console
};
const checkDir = function checkDir(path, resolve) {
  FILE.makeDir(path, resolve);
};
const getConfig = function getConfig(_, resolve) {
  const path = CONFIG_FILE_PATH;

  const makeConfig = () => {
    log(`New config file created here: ${CONFIG_FILE_PATH}`);
    resolve();
  };

  FILE.readOrMake(
    path,
    resolve,
    makeConfig,
  );
};
const readConfig = function readConfig(content, resolve) {
  if (!content) {
    log(`config file is empty. It's here: ${CONFIG_FILE_PATH}`);
    OPN(CONFIG_FILE_PATH);
  }

  const blueprints = PARSE(content, ['react', 'yy', 'zz']);

  resolve(blueprints);
};
const makeThings = function makeThings(blueprintConfig, resolve) {
  const worker = async function dirFileMaker(config, parentDir) {
    if (!!config.dirs) {
      config.dirs.forEach(dirFileMaker);
    } else if (!!config.files) {
      const dirName = config.name;
      const dirPath = PATH.join(HOMEDIR, dirName);

      log(`dir ${dirName}`);
      await FILE.makeDir(dirPath);
      config.files.forEach(dirConfig => dirFileMaker(dirConfig, dirPath));
    } else {
      const fileName = config.name;
      const fileContent = config.content;

      log(`file ${fileName}`);
      await FILE.write(PATH.join(parentDir, fileName), fileContent);
    }
  };

  worker(blueprintConfig);
  resolve();
};


const roadmap = [
  [HOMEDIR],    checkDir,
  [checkDir],   getConfig,
  [getConfig],  readConfig,
  [readConfig], makeThings,
];
BRIEF(roadmap);
