# Troubleshooting

Common issues and solutions when working with Rackula YAML.

## YAML Structure

- **Do not use `rack:`** (singular) for new layouts; use `racks: [...]`
- **Do not omit `device_types` or `settings`** from new files
- **Preserve unknown fields** when editing legacy YAML; Rackula keeps them

## Positions

- **Write internal units, not human U** — positions are in 1/6U units where `6 units = 1U`. For example, U42 = `position: 252`, U25 = `position: 150`, U1 = `position: 6`
- **Do not use `position: 0`** for rack-level devices; only container children use 0
- **Quote `device_bays[].position`** as `"1"` — it's a string in the current schema

## Device Types

- **Do not use `u_height: 0`** — minimum is `0.5`
- **Use `#RRGGBB` only** — not `#FFF`, named colors, or `rgb(...)`
- **Do not duplicate `device_types[].slug`** values
- **Do not use `management`** as an interface type — use `1000base-t`, `10gbase-x-sfpp`, `console`, `virtual`, or `other`

## Connections

- **Do not use `connections[].from` or `connections[].to`** — Rackula expects `a_port_id` and `b_port_id`
- **Do not nest endpoint objects** like `{ device_id, port_id }` inside a connection
- **Validate schema and references separately** — first confirm connection keys are exactly valid, then confirm both port IDs exist
- **Use `color: "#RRGGBB"`** if setting a connection color

## Rack Size

For small homelabs (desktop-sized racks), use `height: 6` with half-width devices like Raspberry Pi. A 42U rack is a full-size data center rack, not a "small" layout.

## Command Line

- **Use the bundled script** — package with `bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output`
- **Fallback to Node when Bun is unavailable** — run `node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output`
- **Use explicit flags** — do not use positional arguments like `./input ./output`
- **Do not require project scripts** — normal skill usage must not depend on `package.json`, `pnpm`, or a cloned development workspace

## Validation Commands

- **Use the bundled validator** — `bun run .agents/skills/rackula/scripts/validate-rackula.js --file ./input/layout.rackula.yaml`
- **Fallback to Node for validation** — `node .agents/skills/rackula/scripts/validate-rackula.js --file ./input/layout.rackula.yaml`
- **Do not assume a Node YAML package exists in the workspace** — avoid ad hoc `require("yaml")`; the bundled validator already includes its YAML parser
