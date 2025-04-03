const { loadAdoptionBlacklist, saveAdoptionBlacklist } = require('./utils/blacklist.js');
const { createProjectFileMeta } = require('./utils/file.js');
const { hashString } = require('./utils/hash.js');
const { meta } = require('./utils/meta.js');

/**
 * @typedef {import('./utils/file').ProjectFileMeta} ProjectFileMeta
 * @typedef {import('./utils/file').AbsolutePath} AbsolutePath
 * @typedef {import('./utils/file').RelativePath} RelativePath
 * @typedef {import('./utils/file').ProjectRoot} ProjectRoot
 * @typedef {import('eslint').Linter.LintMessage} LintMessage
 * @typedef {import('eslint').Linter.Processor} Processor
 */

/**
 * @param {ProjectFileMeta} projectFile
 * @param {string} fileHash
 * @param {LintMessage[]} messages
 */
const updateConfig = (projectFile, fileHash, messages) => {
  const minimumSeverity = process.env.IGNORE_WARNINGS ? 2 : 1;

  /** @type {Set<string>} */
  const failingRules = messages.reduce((acc, message) => {
    if (message.severity >= minimumSeverity && message.ruleId !== null) {
      acc.add(message.ruleId);
    }
    return acc;
  }, new Set());

  if (!failingRules.size) {
    return;
  }

  const fileHashesToRules = loadAdoptionBlacklist(projectFile);

  fileHashesToRules[fileHash] = {
    file: projectFile.relativePath,
    rules: Array.from(failingRules),
  };

  saveAdoptionBlacklist(projectFile, fileHashesToRules);
};

/** @type {Map<AbsolutePath, string | undefined>} */
const fileHashCache = new Map();

/** @type {Set<ProjectRoot>} */
const projectVisitedCache = new Set();
/** @param {ProjectFileMeta} projectFile */
const projectSetup = (projectFile) => {
  const { projectRoot } = projectFile;
  if (projectVisitedCache.has(projectRoot)) {
    return;
  }
  projectVisitedCache.add(projectRoot);
  if (process.env.UPDATE_ADOPTION_BLACKLIST) {
    // Clear file before updating with new entries
    saveAdoptionBlacklist(projectFile, {});
  }
};

/** @satisfies {Processor} */
const processor = {
  meta: {
    name: 'processor',
    version: meta.version,
  },
  supportsAutofix: true,
  preprocess(text, filePath) {
    const projectFile = createProjectFileMeta(filePath);
    projectSetup(projectFile);
    const fileHash = hashString(`${projectFile.relativePath}${text}`);
    fileHashCache.set(projectFile.absoluePath, fileHash);
    return [text];
  },
  postprocess(blockMessages, filePath) {
    const projectFile = createProjectFileMeta(filePath);
    const fileHash = fileHashCache.get(projectFile.absoluePath);
    const messages = blockMessages.flat();

    if (!fileHash) {
      // Should never happen but just in case, do nothing
      return messages;
    }

    if (process.env.UPDATE_ADOPTION_BLACKLIST) {
      updateConfig(projectFile, fileHash, messages);
    }

    const parsedConfig = loadAdoptionBlacklist(projectFile);

    const ignoredRules = new Set(parsedConfig[fileHash]?.rules || []);

    return messages.filter((message) => {
      return !(message.ruleId && ignoredRules.has(message.ruleId));
    });
  },
};

module.exports = { processor };
