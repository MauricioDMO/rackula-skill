# Rackula Skill

OpenCode skill workspace for creating, editing, and packaging Rackula rack layout YAML files.

## Quick Start

```bash
pnpm install
```

## Workflow

1. **Create** Rackula YAML files in `input/` with `*.rackula.yaml` naming.
2. **Include** `metadata.id` (UUID) and `metadata.name` in each file.
3. **Package** with `pnpm run zip-yaml` to generate `.Rackula.zip` artifacts in `output/`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run zip-yaml` | Package all `input/*.rackula.yaml` files |
| `pnpm run zip-yaml -- ./input ./output` | Package custom input/output directories |

## Project Structure

```
.
├── .agents/skills/rackula-skill/
│   ├── SKILL.md          # Skill definition and schema guidance
│   └── evals/evals.json  # Eval prompts
├── scripts/zip-yaml.js   # ZIP packaging script
├── input/                 # YAML source files (*.rackula.yaml)
└── output/                # Packaged .Rackula.zip artifacts
```

## Example YAML Metadata

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Homelab"
  schema_version: "1.0"
  description: "Basement rack"
version: "1.0.0"
name: "My Homelab"
racks: []
device_types: []
settings:
  display_mode: label
```

## Notes

- Positions use internal `1/6U` units (U25 = `position: 150`).
- Modern files use `racks: [...]` (not `rack:`).
- Child devices in containers use `container_id` + `slot_id`, allowing `position: 0`.
- See `AGENTS.md` for full YAML rules and schema details.