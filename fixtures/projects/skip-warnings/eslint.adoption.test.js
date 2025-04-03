const fs = require('fs');
const path = require('path');

describe('adoption config', () => {
  it('should ignore only the error', () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, './eslint.adoption.json'), 'utf-8')
    );
    const entries = Object.entries(config);

    expect(entries).toHaveLength(1);
    const [_, value] = entries[0];
    expect(value).toMatchInlineSnapshot(`
      {
        "file": "index.js",
        "rules": [
          "no-unused-vars",
        ],
      }
    `);
  });
});
