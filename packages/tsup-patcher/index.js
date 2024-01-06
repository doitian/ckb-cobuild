const fs = require("node:fs");

const srcFile = "./package.json";
const bakFile = srcFile + ".bak";

function getBase(path) {
  if (path.startsWith("./")) {
    path = path.substring(2);
  }
  const startPos = path.indexOf("/");
  const endPos = path.lastIndexOf(".");
  return path.substring(startPos + 1, endPos);
}

function patch(dict, ecma, commonjs, types) {
  const base = getBase(dict[ecma]);
  dict[ecma] = `./dist/${base}.js`;
  dict[commonjs] = `./dist/${base}.mjs`;
  dict[types] = `./dist/${base}.d.ts`;
}

const package = JSON.parse(fs.readFileSync(srcFile));

patch(package, "main", "module", "types");
if ("exports" in package) {
  for (const key in package.exports) {
    const value = package.exports[key];
    const dict =
      typeof value === "string" || value instanceof String
        ? { import: value }
        : value;
    package.exports[key] = dict;
    patch(dict, "import", "require", "types");
  }
}

if (!fs.existsSync(bakFile)) {
  fs.copyFileSync(srcFile, bakFile);
}
fs.writeFileSync(srcFile, JSON.stringify(package, null, 2));
