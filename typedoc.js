/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ["packages/cobuild"],
  entryPointStrategy: "packages",
  plugin: ["typedoc-plugin-missing-exports"]
  out: "apps/docs/public/api/",
};
