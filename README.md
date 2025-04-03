# eslint-plugin-rule-adoption

An eslint plugin for incremental rule adoption, when `--fix` and codemods don't cut it.

If you deal with very large codebases such as monorepos, you may find that adopting new rules can be a huge chore.
This plugin forceably shares the burden of eslint rule adoption amoungst all maintainers.

### Similar Projects

1. [eslint-patch](https://www.npmjs.com/package/@rushstack/eslint-patch)
2. [eslint-nibble](https://www.npmjs.com/package/eslint-nibble)

## Install

npm:

```
npm i --save-dev eslint-plugin-rule-adoption
```

yarn:

```
yarn add -D eslint-plugin-rule-adoption
```

## Usage

This plugin comes with a processor.

In your eslint config, you will need to add the following:

```json
{
  "processor": "rule-adoption/processor",
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

If you don't want to blacklist warnings, use the `IGNORE_WARNINGS` flag as well

```sh
UPDATE_ADOPTION_BLACKLIST=true IGNORE_WARNINGS=true npx eslint <your-eslint-args>
```

> [!NOTE]
> Updating the blacklist using multiple eslint processes at the same time is not supported and can lead to undefined behavior. You must use one eslint process per project.

You will then see a new file `eslint.adoption.json` next to your package.json, which contains an object where keys correspond to file hashes and the values contain information on where the file is located (for humans to read) and a list of rules that are disabled in the file.

```json
{
  "3e40fad28e92c430b85f6f82b918c754c1a008451670a27b70906561e08e23df": {
    "file": "src\\rendererCore\\main.ts",
    "rules": ["react/react-in-jsx-scope", "react/no-unknown-property", "no-console"]
  }
  // etc...
}
```

It can be helpful to regenerate this config every once and a while to get rid of old file hashes, but otherwise it is completely harmless to leave old entries here.

### Caveats

Since rules are disabled on a per-file basis, it is not recommended to be used with rules that function across files, since changing one file would require fixing multiple files causing a cascade of needed fixes that defeats the purpose of this plugin.

To get around this, you can exclude certain rules from being ignored via eslint's cli.

```sh
UPDATE_ADOPTION_BLACKLIST=true npx eslint --rule "import/no-extraneous-dependencies: off" <your-eslint-args>
```

Or you can just modify the eslint config temporarily.
