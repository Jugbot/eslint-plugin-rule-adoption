/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/no-extraneous-dependencies
const { baseJestConfig } = require('@attentive/tools-config/jest');

const config = {
  ...baseJestConfig,
  rootDir: './',
  testMatch: ['<rootDir>/src/**/*.test.js'],
};

module.exports = config;
