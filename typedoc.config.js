/** @type {import('typedoc').TypeDocOptions} */
const config = {
  entryPoints: ["packages/cobuild"],
  entryPointStrategy: "packages",
  plugin: ["typedoc-plugin-missing-exports"],
  out: "apps/docs/public/api/",
};

if (process.env.VERCEL !== undefined) {
  const { execSync } = require("node:child_process");
  const remote = `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}.git`;
  execSync(`git remote add origin ${remote}`);
}

module.exports = config;
