const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
/** @type {{version: string, name: string}} */
const { version, name } = packageJson;

module.exports = { meta: { version, name } };
