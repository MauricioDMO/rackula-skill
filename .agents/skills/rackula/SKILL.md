---
name: rackula
description: |
  Rackula rack layout YAML creation, editing, validation, packaging, and documentation. Use this skill whenever the user works with `.rackula.yaml` files, `.Rackula.zip` archives, Rackula layouts, rack diagrams, rack visualization, homelab/server rack planning, NetBox-style DCIM device definitions, device placements, rack U positions, blade/container devices, half-width devices, ports, rack connections, or asks to create an importable Rackula file. When a Rackula workspace provides an `input/` folder and `zip-yaml` tool, create generated YAML there and run the tool to produce the `.Rackula.zip`. Prefer this skill over generic YAML help whenever rack equipment, racks, U positions, device types, Rackula YAML, or Rackula ZIP packaging are involved. Do not use for unrelated YAML configuration.
---

# Rackula Skill

Rackula is an open-source rack layout designer. This skill creates, edits, validates, and documents Rackula YAML layouts.

## Workflow

When a user asks for an importable Rackula artifact in a workspace with `input/` and `zip-yaml`:

1. **Create YAML** in `input/*.rackula.yaml` with `metadata.id` (UUID) and `metadata.name`
2. **Build** the packager: `pnpm run build`
3. **Package** the YAML: `pnpm run zip-yaml -- --input ./input --output ./output`
4. **Report** both YAML path and ZIP path for import at `https://count.racku.la/`

## Key Rules

- Use `racks: [...]` (plural). The singular `rack:` is legacy input only — never emit it in new files.
- Modern positions use internal 1/6U units where `6 units = 1U`. See `references/position-system.md`.
- Use `container_id`/`slot_id` for blade/container devices. See `references/container-blade.md`.
- Quote `device_bays[].position` as a string — it's a string in the current schema.
- Do not use `management` as an interface type.
- Use `#RRGGBB` colors only — not `#FFF`, named colors, or `rgb(...)`.

## File Structure

```
SKILL.md                    # This file — workflow and key rules
references/
  schema.md                 # Top-level YAML structure, metadata, rack, placed device
  position-system.md        # 1/6U conversion and fit check
  device-types.md           # Device type definitions, interfaces, power ports, templates
  container-blade.md        # Container/slot model for blade devices
  connections.md            # Connections and rack groups
  enums.md                  # All allowed enum values
  collision.md              # Collision detection rules
  troubleshooting.md        # Common mistakes and fixes
scripts/
  zip-yaml.js               # Packager script (built from src/)
evals/
  evals.json                # Test cases
```

## Schema Reference

For the complete schema details, read the relevant reference file:

| Task | Reference |
|------|-----------|
| Top-level structure, metadata, rack, placed device | `references/schema.md` |
| Position conversion (U → internal units) | `references/position-system.md` |
| Device types, interfaces, power ports | `references/device-types.md` |
| Blade chassis and container children | `references/container-blade.md` |
| Port-to-port connections, rack groups | `references/connections.md` |
| All enum values | `references/enums.md` |
| Collision rules | `references/collision.md` |
| Common mistakes | `references/troubleshooting.md` |

## Packaging

When the user wants an importable `.Rackula.zip`:

```bash
pnpm run build
pnpm run zip-yaml -- --input ./input --output ./output
```

Report both paths: `input/<file>.rackula.yaml` and `output/<name>-<id>.Rackula.zip`.

**Important:** pnpm does not pass positional args — always use `--` before flags:

```bash
# WRONG
pnpm run zip-yaml -- ./input ./output

# CORRECT
pnpm run zip-yaml -- --input ./input --output ./output
```