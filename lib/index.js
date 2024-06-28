const { processor } = require('./processor');

/** @type {import('eslint').ESLint.Plugin} */
module.exports = {
  processors: {
    processor,
  },
};
