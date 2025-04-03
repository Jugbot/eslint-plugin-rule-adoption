const { processor } = require('./processor');
const { meta } = require('./utils/meta.js');

/** @type {import('eslint').ESLint.Plugin} */
module.exports = {
  meta,
  processors: {
    [processor.meta.name]: processor,
  },
};
