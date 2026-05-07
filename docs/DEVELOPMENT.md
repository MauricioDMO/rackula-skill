# Development

This page is for maintainers who are editing bundled script sources. Agents doing normal Rackula packaging should use the bundled scripts documented in [Commands](./COMMANDS.md), not these development commands.

## Source Structure

```
src/
├── zip-yaml.ts         # ZIP packager CLI entry point
├── validate-rackula.ts # Structural validator CLI entry point
├── runner.ts           # Input routing (text/file/directory modes)
├── zipper.ts           # ZIP creation (CRC32, local+central headers, EOCD)
└── extractor.ts        # YAML metadata parsing and filename sanitization
```

### Module Responsibilities

| Module         | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `zip-yaml.ts`         | Argument parsing via `parseArgs`, dispatches to `runner.ts`       |
| `validate-rackula.ts` | Structural validation for Rackula YAML using the bundled `yaml` parser |
| `runner.ts`           | Routes to text/file/directory handlers, orchestrates ZIP creation |
| `zipper.ts`           | Pure ZIP assembly: CRC32 checksum, ZIP format structure           |
| `extractor.ts`        | Regex-based YAML frontmatter extraction                           |

## Build Pipeline

The `pnpm run build` command:

```bash
bun build src/zip-yaml.ts src/validate-rackula.ts \
  --target=node \
  --outdir=.agents/skills/rackula/scripts
```

### Why `--target=node`?

Without it, Bun bundles for browser and `node:util.parseArgs` is not available. The build fails with:

```
error: Browser polyfill for module "node:util" doesn't have a matching export named "parseArgs"
```

## Generated Bundled Scripts

The skill ships generated scripts in `.agents/skills/rackula/scripts/`.

Do not edit generated `.js` files manually. Edit `src/*.ts`, run `pnpm run build`, and keep the regenerated `.js` artifacts with the source change.

`zip-yaml.js` is dependency-free at runtime and uses only Node.js built-ins. `validate-rackula.js` bundles the `yaml` parser dependency, so the generated script can run with Bun or Node without requiring `node_modules` in the installed skill workspace.

## Modifying Scripts

1. Edit source files in `src/`
2. Run `pnpm run build`
3. Test the ZIP packager with `bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output`
4. Test the Node fallback for packaging with `node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output`
5. Test the validator with `bun run .agents/skills/rackula/scripts/validate-rackula.js --file ./input/<file>.rackula.yaml`
6. Test the Node validator fallback with `node .agents/skills/rackula/scripts/validate-rackula.js --file ./input/<file>.rackula.yaml`

## Running from Source

For development without building:

```bash
bun run src/zip-yaml.ts -- --input ./input --output ./output
bun run src/validate-rackula.ts -- --file ./input/<file>.rackula.yaml
```

The bundled `.js` files are only needed for the packaged skill distribution.
