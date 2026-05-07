# Rackula Skill Documentation

Quick reference for the Rackula skill and its bundled packager.

## Sections

- [Commands](./COMMANDS.md) — CLI usage, flags, and examples
- [Development](./DEVELOPMENT.md) — Source structure and build pipeline
- [Troubleshooting](./TROUBLESHOOTING.md) — Known issues and workarounds
- [Skill Reference](./SKILL.md) — Detailed Rackula YAML guidance
- [Examples](./EXAMPLES.md) — Common device types, placements, and layouts

## Overview

The installed skill contains:

- Skill source at [`.agents/skills/rackula/`](../.agents/skills/rackula/)
- Bundled ZIP packager script
- Bundled Bun structural validator script
- YAML fixtures for testing

## Quick Start

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
```

## Key Files

| File                                                                                          | Purpose                               |
| --------------------------------------------------------------------------------------------- | ------------------------------------- |
| [`.agents/skills/rackula/scripts/zip-yaml.js`](../.agents/skills/rackula/scripts/zip-yaml.js) | Bundled output                        |
| [`.agents/skills/rackula/scripts/validate-rackula.js`](../.agents/skills/rackula/scripts/validate-rackula.js) | Bundled structural validator          |
| [`AGENTS.md`](../AGENTS.md)                                                                   | Agent instructions for this workspace |
