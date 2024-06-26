# eslint-plugin rule adoption

An eslint plugin for incremental rule adoption, when `--fix` and codemods don't cut it.

## Usage

This plugin comes with a processor.

In your eslint config, you will need to add the following:
```json5
{
  "processor": [
    /** other processors, order matters here and this one should be last */
    "rule-adoption/processor"
  ],
  "plugins": [
    /** other plugins */
    "eslint-plugin-rule-adoption"
  ]
}
```

### Adopting new rules

Run eslint with the `UPDATE_ADOPTION_BLACKLIST` environment variable set to a truthy value.
```sh
UPDATE_ADOPTION_BLACKLIST=true npx eslint <your-eslint-args>
```

> [!NOTE]
> Updating the blcaklist using multiple eslint processes at the same time is not supported and can lead to undefined behavior. You must use one eslint process per project.

You will then see a new file `eslint.adoption.json` next to your package.json, which contains an object where keys correspond to file hashes and the values contain information on where the file is located (for humans to read) and a list of rules that are disabled in the file.

```json5
{
  "3e40fad28e92c430b85f6f82b918c754c1a008451670a27b70906561e08e23df": {
    "file": "src\\rendererCore\\main.ts",
    "rules": [
      "react/react-in-jsx-scope",
      "react/no-unknown-property",
      "no-console"
    ]
  }
}
```

It can be helpful to regenerate this config every once and a while to get rid of old file hashes, but otherwise it is completely harmless to leave old entries here.

