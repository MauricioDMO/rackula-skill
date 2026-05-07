# Troubleshooting

## pnpm positional arguments not passed

**Symptom:**
```bash
pnpm run zip-yaml -- ./input ./output
# → Missing required --input and/or --output flags
```

**Workaround:** Use explicit flags instead of positional arguments:

```bash
pnpm run zip-yaml -- --input ./input --output ./output
```

## Bun build fails with parseArgs error

**Symptom:**
```
error: Browser polyfill for module "node:util" doesn't have a matching export named "parseArgs"
```

**Workaround:** Add `--target=node` to the build command in `package.json`:

```bash
bun build src/zip-yaml.ts --target=node --outfile=.agents/skills/rackula/scripts/zip-yaml.js
```

## Missing metadata.name

**Symptom:**
```
input/my-layout.rackula.yaml must include metadata.name
```

**Workaround:** Ensure every `.rackula.yaml` file has `metadata.name` in its frontmatter:

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Layout"
```

The `metadata.id` is optional (defaults to `null`), but `metadata.name` is required.