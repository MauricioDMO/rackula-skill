---
name: rackula
description: |
  Rackula rack layout YAML creation, editing, validation, packaging, and documentation. Use this skill whenever the user works with `.rackula.yaml` files, `.Rackula.zip` archives, Rackula layouts, rack diagrams, rack visualization, homelab/server rack planning, NetBox-style DCIM device definitions, device placements, rack U positions, blade/container devices, half-width devices, ports, rack connections, or asks to create an importable Rackula file. When a Rackula workspace provides an `input/` folder and `zip-yaml` tool, create generated YAML there and run the tool to produce the `.Rackula.zip`. Prefer this skill over generic YAML help whenever rack equipment, racks, U positions, device types, Rackula YAML, or Rackula ZIP packaging are involved. Do not use for unrelated YAML configuration.
---

# Rackula Skill

Rackula is an open-source rack layout designer. This skill helps create, edit, validate, package, and explain Rackula YAML layouts.

## First Decision

Classify the user's request before writing YAML:

1. **Create** a new Rackula layout.
2. **Edit** an existing `.rackula.yaml` file.
3. **Validate/debug** YAML or a failed import.
4. **Package** YAML into an importable `.Rackula.zip`.
5. **Explain/document** a rack architecture.

This classification matters because each path needs different context. Do not load every reference file by default; load the smallest set that matches the task.

## Operating Workflow

Follow this sequence for Rackula work:

1. **Inspect inputs and workspace.** Check whether the user provided a file, whether `input/` and `output/` exist, and whether an existing `.rackula.yaml` must be preserved.
2. **Load task-specific context.** Use the reference map below to read only the schema, examples, or architecture guidance needed for the task.
3. **Model the physical rack before YAML.** Decide rack size, rack type, heavy-device placement, power assumptions, airflow, cabling path, maintenance access, and expansion space.
4. **Define device types first.** Every placed `device_type` slug must exist in `device_types`; keep slugs unique and valid kebab-case.
5. **Place devices with internal positions.** Convert human U positions to Rackula internal units where `position = U * 6`; U1 is the bottom of the rack.
6. **Apply physical architecture rules.** Heavy gear low, UPS/batteries at the bottom, switches near cabling, KVM consoles at ergonomic height, explicit blanks for unused rack units when producing a complete diagram.
7. **Validate before final output.** Check schema shape, positions, fit, collisions, `face`, device type references, colors, enum values, and port references.
8. **Package when requested.** If the user wants an importable artifact, build and run `zip-yaml`, then report both YAML and ZIP paths.

## Context Loading Guide

| User task | Read these files |
|-----------|------------------|
| New basic layout | `references/schema.md`, `references/position-system.md`, `references/device-types.md` |
| Existing YAML edit | `references/schema.md`, then preserve unknown fields in the target file |
| Rack placement/architecture | `references/rack-layout-architecture.md` |
| Homelab or small rack | `examples/homelab-small.rackula.yaml`, `examples/homelab-router-switch.rackula.yaml` |
| Datacenter rack | `examples/datacenter-42u.rackula.yaml`, `references/rack-layout-architecture.md` |
| Blade chassis/container devices | `references/container-blade.md` |
| Multi-rack rows or port links | `references/connections.md` |
| Enum or type uncertainty | `references/enums.md`, `references/device-types.md` |
| Collision or fit problems | `references/collision.md`, `references/position-system.md` |
| Import/package error | `references/troubleshooting.md`, `docs/TROUBLESHOOTING.md` if available |

## Required YAML Rules

- Use `racks: [...]` for new files. The singular `rack:` key is legacy input only.
- Include `metadata.name` when creating files that will be packaged.
- Use top-level order: `metadata`, `version`, `name`, `racks`, `device_types`, `settings`, then optional `rack_groups`, `connections`.
- Define every `device_types[].slug` referenced by rack devices.
- Use internal positions: U1 = `position: 6`, U25 = `position: 150`, U42 = `position: 252`.
- Do not use `position: 0` for rack-level devices; `0` is valid only for container children.
- Use `face: both` for full-depth rack-mounted servers, storage, UPS, firewalls, and other rear-visible devices. Use `face: front` for front-only/passive items like patch panels or front-only blanks.
- Fill unused rack units with explicit blank devices when creating a complete diagram; blank device types use `category: blank` and a gray `#RRGGBB` color, preferably `#44475A`.
- Use `#RRGGBB` colors only.
- Do not use `management` as an interface type; use `1000base-t`, `10gbase-x-sfpp`, `console`, `virtual`, or `other` as appropriate.
- Quote `device_bays[].position` values if working with legacy device bays.
- Prefer `connections` over deprecated `cables` for port-to-port links.

## Rack Architecture Reasoning

Before placing equipment, reason in this order:

1. Mechanical safety and weight distribution.
2. Power architecture and redundancy.
3. Cooling and airflow.
4. Network/data cabling paths.
5. Human operation and maintenance access.
6. Logical grouping and failure-domain separation.
7. Expansion space and documentation clarity.

Use `references/rack-layout-architecture.md` for detailed placement rules. A rack that looks organized but violates weight, power, cooling, or maintenance principles is not a correct layout.

## Rack Size Selection

Choose rack height from the user's actual scenario:

| Use case | Typical height | Notes |
|----------|----------------|-------|
| Desktop/homelab | `6` to `10` | Mini PCs, Raspberry Pi, small NAS, half-width devices |
| Small office | `18` to `24` | Wall-mount or open-frame racks, patching, a few servers |
| Datacenter | `42` | Full-size racks with UPS, servers, storage, network gear |

Do not make every small layout `42U`. If the user's scope is ambiguous, ask one short question or choose the smallest realistic rack and state the assumption.

## Create-New-Layout Checklist

When creating a `.rackula.yaml` file:

1. Choose a filename under `input/` if this workspace provides an `input/` folder; otherwise use the user-requested path.
2. Add `metadata.id`, `metadata.name`, `version`, `name`, `racks`, `device_types`, and `settings`.
3. Define racks with `height`, `width`, `form_factor`, `starting_unit`, `position`, and `devices`.
4. Define all device types with valid `u_height`, `slot_width`, `colour`, `category`, depth, airflow, interfaces, and power ports when relevant.
5. Convert all human U positions to internal positions.
6. Check every device fits: `position + (u_height * 6) - 1 <= rack.height * 6`.
7. Add blanks or reserved panels for unused spaces when producing a complete visual diagram.
8. Validate that all ports referenced by `connections` exist on placed devices.

## Edit-Existing-Layout Checklist

When editing an existing `.rackula.yaml` file:

1. Read the target file first.
2. Preserve unrelated fields, unknown fields, IDs, names, rack order, device order, and user comments where possible.
3. Use modern structures for new additions, but do not rewrite the whole file just to modernize it unless the user asks.
4. Add missing `device_types` only for new `device_type` slugs.
5. Revalidate positions and collisions only in the affected rack or container unless a global change requires more.
6. Mention any assumptions or suspicious legacy fields in the final response.

## Blade And Container Devices

Use the modern `slots` plus `container_id`/`slot_id` model for blade chassis and nested devices. Read `references/container-blade.md` before generating this pattern.

Key rule: rack-level container devices use normal rack positions; child devices inside the container use `position: 0` and must reference both `container_id` and `slot_id`.

## Half-Width Devices

Half-width device types use `slot_width: 1`. Placements should use `slot_position: left` or `slot_position: right`. Full-width device types use `slot_width: 2` and usually `slot_position: full`.

Check collisions separately for left/right/full placements at the same U position.

## Packaging

When the user wants an importable `.Rackula.zip`, run the project workflow from the workspace root:

```bash
pnpm run build
pnpm run zip-yaml -- --input ./input --output ./output
```

Report both paths:

```text
YAML: input/<file>.rackula.yaml
ZIP: output/<metadata.name>.Rackula.zip
```

Important: pnpm does not pass positional arguments here. Use explicit flags after `--`; do not run `pnpm run zip-yaml -- ./input ./output`.

## Final Response

For generated or edited layouts, summarize:

1. Files created or modified.
2. Packaging result, if any.
3. Important architecture assumptions such as rack height, cable entry, airflow, and power redundancy.
4. Warnings for unsafe or uncertain placements.

Keep the response concise. The YAML file is the source of truth.
