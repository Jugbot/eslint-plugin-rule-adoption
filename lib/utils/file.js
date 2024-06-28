const fs = require('fs');
const path = require('path');

/**
 * @param {string} directory
 * @returns {string}
 */
function findProjectRoot(directory) {
  if (directory === '/') {
    throw new Error('Could not find project root');
  }

  if (hasPackageJson(directory)) {
    return directory;
  }

  return findProjectRoot(path.dirname(directory));
}

/** @param {string} directory */
function hasPackageJson(directory) {
  const packageJsonPath = path.join(directory, 'package.json');
  return fs.existsSync(packageJsonPath);
}

/**
 * @typedef {string & {_brand: 'absolutePath'}} AbsolutePath - absolute path to the file
 * @typedef {string & {_brand: 'projectRoot'}} ProjectRoot - absolute path to the nearest project root (where package.json is located)
 * @typedef {string & {_brand: 'relativePath'}} RelativePath - relative path from projectRoot to absolutePath
 */

/**
 * @description An object representing a file being linted in a project, containing file paths in different contexts.
 * @typedef {Object} ProjectFileMeta
 * @property {AbsolutePath} absoluePath - absolute path to the file
 * @property {ProjectRoot} projectRoot - absolute path to the nearest project root (where package.json is located)
 * @property {RelativePath} relativePath - relative path from projectRoot to absoluePath
 */

/**
 * @param {string} absoluePath
 * @returns {ProjectFileMeta}
 */
function createProjectFileMeta(absoluePath) {
  const projectRoot = findProjectRoot(absoluePath);
  const relativePath = path.relative(projectRoot, absoluePath);

  return /** @type {ProjectFileMeta} */ ({
    absoluePath,
    projectRoot,
    relativePath,
  });
}

module.exports = {
  createProjectFileMeta,
};
