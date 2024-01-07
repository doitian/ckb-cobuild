/** @type {import('typedoc').TypeDocOptions} */
const config = {
  entryPoints: ["packages/cobuild"],
  entryPointStrategy: "packages",
  plugin: ["typedoc-plugin-missing-exports"],
  out: "apps/docs/public/api/",
};

if (process.env.VERCEL !== undefined) {
  config.disableGit = true;
  config.sourceLinkTemplate = `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}/blob/{gitRevision}/{path}#L{line}`;
  config.gitRevision = process.env.VERCEL_GIT_COMMIT_SHA;
}

module.exports = config;
