const crypto = require('crypto');

/**
 * sha256 hash represented in hex encoding
 * @param {crypto.BinaryLike} str
 */
const hashString = (str) => crypto.createHash('sha256').update(str).digest('hex');

module.exports = { hashString };
