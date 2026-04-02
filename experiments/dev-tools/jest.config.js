const config = require("@lensapp/jest").monorepoPackageConfig(__dirname).configForReact;

module.exports = { ...config, coverageThreshold: undefined };
