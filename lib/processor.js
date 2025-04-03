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
 * @param {1 | 2} minSeverity
 */
const updateConfig = (projectFile, fileHash, messages, minSeverity) => {
  /** @type {Set<string>} */
  const failingRules = messages.reduce((acc, message) => {
    if (message.severity >= minSeverity && message.ruleId !== null) {
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

/**
 * @typedef {Object} ProcessorOptions
 * @property {string} name
 * @property {1 | 2} minSeverity
 */

/**
 * @satisfies {(options: ProcessorOptions) => Processor}
 */
const createProcessor = (options) => ({
  meta: {
    name: options.name,
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
      updateConfig(projectFile, fileHash, messages, options.minSeverity);
    }

    const parsedConfig = loadAdoptionBlacklist(projectFile);

    const ignoredRules = new Set(parsedConfig[fileHash]?.rules || []);

    return messages.filter((message) => {
      return !(message.ruleId && ignoredRules.has(message.ruleId));
    });
  },
});

module.exports = {
  processor: createProcessor({ name: 'processor', minSeverity: 1 }),
  processorSkipWarn: createProcessor({ name: 'processor-skip-warnings', minSeverity: 2 }),
};
