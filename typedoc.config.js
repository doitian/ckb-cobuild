const fs = require("node:fs");

/** @type {import('typedoc').TypeDocOptions} */
const config = {
  entryPoints: [],
  entryPointStrategy: "packages",
  plugin: ["typedoc-plugin-missing-exports"],
  out: "apps/docs/public/api/",
};

for (const package of fs.readdirSync("./packages")) {
  const packageJsonPath = `./packages/${package}/package.json`
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath)
    if (packageJson.private !== true) {
      config.entryPoints.push(`packages/${package}`);
    }
  }
}

if (process.env.VERCEL !== undefined) {
  const { execSync } = require("node:child_process");
  const remote = `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}.git`;
  execSync(`git remote add origin ${remote}`);
}

module.exports = config;
