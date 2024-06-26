const fs = require('fs');
const path = require('path');

/**
 * @typedef {import('./file').ProjectFileMeta} ProjectFileMeta
 * @typedef {import('./file').AbsolutePath} AbsolutePath
 * @typedef {import('./file').RelativePath} RelativePath
 * @typedef {import('./file').ProjectRoot} ProjectRoot
 */

const configFileName = 'eslint.adoption.json';

/** @param {ProjectFileMeta} projectFile */
const projectBlacklistFilePath = (projectFile) => {
  return path.join(projectFile.projectRoot, configFileName);
};

/**
 * @typedef {Object} FileRules
 * @property {RelativePath} file - The file path
 * @property {string[]} rules - The array of rules
 */

/**
 * @typedef {Record<string, FileRules | undefined>} FileRuleBlacklist
 */

/**
 * @param {ProjectFileMeta} projectFile
 * @returns {FileRuleBlacklist}
 */
const loadAdoptionBlacklist = (projectFile) => {
  const filePath = projectBlacklistFilePath(projectFile);

  /** @type {FileRuleBlacklist} */
  let parsedConfig = {};
  if (fs.existsSync(filePath)) {
    const configContent = fs.readFileSync(filePath, 'utf8');
    parsedConfig = JSON.parse(configContent);
  }

  return parsedConfig;
};

/**
 * @param {ProjectFileMeta} projectFile
 * @param {FileRuleBlacklist} fileHashesToRules
 */
const saveAdoptionBlacklist = (projectFile, fileHashesToRules) => {
  const filePath = projectBlacklistFilePath(projectFile);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  if (Object.keys(fileHashesToRules).length !== 0) {
    fs.writeFileSync(filePath, JSON.stringify(fileHashesToRules, null, 2));
  }
};

module.exports = { loadAdoptionBlacklist, saveAdoptionBlacklist };
