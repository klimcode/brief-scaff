const lastOf = array => array[array.length - 1];
const trimIndent = (string, indent) => string.slice(indent);
const getIndent = (string) => {
  const pos = string.search(/\S/);
  return pos === -1
    ? string.length
    : pos;
};
const getType = function getType(string, indent, prevIndent) {
  if (indent === 0) return 'root';
  if (indent > 0 && string[indent] === '/') return 'dir';
  if (indent > prevIndent) return 'content';
  return 'file';
};
const getFiles = function getFiles(input) {
  const strings = input.split('\n');
  const result = [];
  let fileIndent;
  let contentIndent;

  strings.forEach((str) => {
    const prevIndent = lastOf(result) && lastOf(result).indent && fileIndent;
    const prevType = lastOf(result) && lastOf(result).type;
    const indent = getIndent(str);
    const type = getType(str, indent, prevIndent);
    let value = str;

    if (type === 'file') fileIndent = indent;

    if (type === 'content' && type === prevType) {
      lastOf(result).value += `\n${trimIndent(str, contentIndent)}`;
    } else {
      if (type === 'content') { // first line of the content
        contentIndent = indent;
      }
      value = trimIndent(str, indent);
      if (str) result.push({ value, indent, type });
    }
  });

  return result;
};
const getBlueprint = function getBlueprint(filesArray, args) {
  let result;

  filesArray.forEach((file) => {
    const { value, type } = file;

    if (type === 'root') {
      const blueprint = value.split(' ')[0];

      if (blueprint === args[0]) {
        result = {
          blueprint,
          dirs: [],
          toReplace: value.split(' ').slice(1),
        };
      }
    } else {
      if (!result) return;
      const { blueprint: bpName, dirs, toReplace } = result;
      if (!bpName) return;

      // it's a kind of magic...
      const replaced = toReplace.reduce(
        (acc, toRep, i) => acc.replace(
          new RegExp(toRep, 'g'),
          args[i + 1],
        ),
        value,
      );

      if (type === 'dir') dirs.push({ name: replaced, files: [] });
      else {
        const { files } = lastOf(dirs);
        if (type === 'file') files.push({ name: replaced, content: '' });
        else lastOf(files).content = replaced;
      }
    }
  });
  result = result || null;
  delete result.toReplace;

  return result;
};


module.exports = (input, args) => {
  const files = getFiles(input);
  const blueprint = getBlueprint(files, args);

  return blueprint;
};
