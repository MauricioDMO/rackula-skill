# Development

## Source Structure

```
src/
├── zip-yaml.ts    # CLI entry point (parseArgs + run call)
├── runner.ts      # Input routing (text/file/directory modes)
├── zipper.ts      # ZIP creation (CRC32, local+central headers, EOCD)
└── extractor.ts   # YAML metadata parsing and filename sanitization
```

### Module Responsibilities

| Module         | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `zip-yaml.ts`  | Argument parsing via `parseArgs`, dispatches to `runner.ts`       |
| `runner.ts`    | Routes to text/file/directory handlers, orchestrates ZIP creation |
| `zipper.ts`    | Pure ZIP assembly: CRC32 checksum, ZIP format structure           |
| `extractor.ts` | Regex-based YAML frontmatter extraction                           |

## Build Pipeline

The `pnpm run build` command:

```bash
bun build src/zip-yaml.ts \
  --target=node \
  --outfile=.agents/skills/rackula/scripts/zip-yaml.js
```

### Why `--target=node`?

Without it, Bun bundles for browser and `node:util.parseArgs` is not available. The build fails with:

```
error: Browser polyfill for module "node:util" doesn't have a matching export named "parseArgs"
```

## Dependency-Free Bundled Script

The skill ships `.agents/skills/rackula/scripts/zip-yaml.js` as a standalone file with no runtime dependencies. It uses only Node.js built-ins (`node:fs/promises`, `node:path`, `node:util`).

The source TypeScript is split into modules for maintainability; the bundled output is flat and self-contained.

## Modifying the Script

1. Edit source files in `src/`
2. Run `pnpm run build`
3. Test with `pnpm run zip-yaml -- --input ./input --output ./output`
4. Package the skill with `python3 -m scripts.package_skill .agents/skills/rackula/` (from skill-creator)

## Running from Source

For development without building:

```bash
bun run src/zip-yaml.ts -- --input ./input --output ./output
```

The bundled `.js` file is only needed for the packaged skill distribution.