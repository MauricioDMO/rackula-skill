# Troubleshooting

Common issues and solutions when working with Rackula YAML.

## Missing `metadata.name`

**Symptom:**
```
input/my-layout.rackula.yaml must include metadata.name
```

Every `.rackula.yaml` file needs `metadata.name` in frontmatter. The `metadata.id` is optional.

## Bun Build `parseArgs` Error

**Symptom:**
```
error: Browser polyfill for module "node:util" doesn't have a matching export named "parseArgs"
```

**Fix:** Add `--target=node` to the build command:

```bash
bun build src/zip-yaml.ts --target=node --outfile=.agents/skills/rackula/scripts/zip-yaml.js
```

## pnpm Positional Arguments Not Passed

**Symptom:**
```bash
pnpm run zip-yaml -- ./input ./output
# → Missing required --input and/or --output flags
```

**Fix:** Use explicit flags instead of positional arguments:

```bash
pnpm run zip-yaml -- --input ./input --output ./output
```

pnpm does not pass positional args after `--`. Always use explicit `--input` and `--output` flags.

## Common Mistakes To Avoid

- **Do not use `rack:`** (singular) for new layouts; use `racks: [...]`
- **Do not write human U positions** like `position: 25` for U25; use `position: 150`
- **Do not use `position: 0`** for rack-level devices
- **Quote `device_bays[].position`** as `"1"` — it's a string in the current schema
- **Do not omit `device_types` or `settings`** from new files
- **Use `#RRGGBB` only** — not `#FFF`, named colors, or `rgb(...)`
- **Do not duplicate `device_types[].slug`** values
- **Do not use `management`** as an interface type
- **Do not use `u_height: 0`** — minimum is `0.5`
- **Preserve unknown fields** when editing legacy YAML; Rackula keeps them