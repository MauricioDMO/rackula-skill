# Troubleshooting

## Packaging command not found

**Symptom:**
```bash
bun: command not found
```

**Workaround:** Use Node with the bundled script:

```bash
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
```

## Package scripts unavailable

**Symptom:**
```bash
ERR_PNPM_NO_SCRIPT Missing script: zip-yaml
```

**Workaround:** Do not use package-manager scripts for normal skill usage. Use the bundled script directly:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
```

## Positional arguments fail

**Symptom:**
```bash
node .agents/skills/rackula/scripts/zip-yaml.js ./input ./output
# → Missing required --input and/or --output flags
```

**Workaround:** Use explicit flags:

```bash
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
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
