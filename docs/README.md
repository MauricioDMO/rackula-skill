# Rackula Skill Documentation

Quick reference for the [rackula skill](./SKILL.md) and its workspace.

## Sections

- [Commands](./COMMANDS.md) — CLI usage, flags, and examples
- [Development](./DEVELOPMENT.md) — Source structure and build pipeline
- [Troubleshooting](./TROUBLESHOOTING.md) — Known issues and workarounds
- [Skill Reference](./SKILL.md) — Detailed Rackula YAML guidance
- [Examples](./EXAMPLES.md) — Common device types, placements, and layouts

## Project Overview

This repo is the development workspace for the `rackula` skill. It contains:

- Skill source at [`.agents/skills/rackula/`](../.agents/skills/rackula/)
- Bundled ZIP packager script
- YAML fixtures for testing
- Build tooling to update the skill

## Quick Start

```bash
pnpm install
pnpm run build
pnpm run zip-yaml -- --input ./input --output ./output
```

## Key Files

| File                                                                                          | Purpose                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------- |
| [`package.json`](../package.json)                                                             | Scripts: `build`, `zip-yaml`          |
| [`src/zip-yaml.ts`](../src/zip-yaml.ts)                                                       | CLI entry point                       |
| [`.agents/skills/rackula/scripts/zip-yaml.js`](../.agents/skills/rackula/scripts/zip-yaml.js) | Bundled output                        |
| [`AGENTS.md`](../AGENTS.md)                                                                   | Agent instructions for this workspace |