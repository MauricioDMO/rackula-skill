# Commands

## zip-yaml

Packages `.rackula.yaml` files into importable `.Rackula.zip` artifacts.

Use the script bundled with the installed skill. Do not require a cloned development workspace, `package.json`, or package-manager scripts.

### Usage

Choose the smallest mode that matches the task. Prefer `--file` when packaging one layout so unrelated files in `input/` are not processed.

Prefer Bun first:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input <input-dir> --output <output-dir>
```

If Bun is not installed, use Node:

```bash
node .agents/skills/rackula/scripts/zip-yaml.js --input <input-dir> --output <output-dir>
```

### Arguments

| Flag       | Short | Description                                           |
| ---------- | ----- | ----------------------------------------------------- |
| `--input`  | `-i`  | Batch package a directory containing `.rackula.yaml` files |
| `--output` | `-o`  | Output directory for `.Rackula.zip` files             |
| `--name`   |       | Override `metadata.name` for output filename          |
| `--text`   | `-t`  | YAML content as string (alternative to `--input`)     |
| `--file`   | `-f`  | Package a single YAML file without batch processing   |
| `--stdout` |       | Write ZIP to stdout instead of file                   |
| `--help`   | `-h`  | Show usage help                                       |

### Packaging Modes

Single file, recommended when the user names one layout:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --output ./output
```

Directory batch, only when the user wants every `.rackula.yaml` in a folder:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
```

YAML text from stdin:

```bash
cat layout.rackula.yaml | bun run .agents/skills/rackula/scripts/zip-yaml.js --text - --output ./output
cat layout.rackula.yaml | node .agents/skills/rackula/scripts/zip-yaml.js --text - --output ./output
```

Override the ZIP filename derived from `metadata.name`:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --output ./output --name "Custom Layout"
node .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --output ./output --name "Custom Layout"
```

Write ZIP bytes to stdout:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --stdout > my-layout.Rackula.zip
node .agents/skills/rackula/scripts/zip-yaml.js --file ./input/my-layout.rackula.yaml --stdout > my-layout.Rackula.zip
```

Show help:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --help
node .agents/skills/rackula/scripts/zip-yaml.js --help
```

### Examples

Package default `input/` to `output/`:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
```

Single file from stdin:

```bash
cat layout.rackula.yaml | bun run .agents/skills/rackula/scripts/zip-yaml.js --text -
cat layout.rackula.yaml | node .agents/skills/rackula/scripts/zip-yaml.js --text -
```

Process specific file:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./my-layout.rackula.yaml --output ./output
node .agents/skills/rackula/scripts/zip-yaml.js --file ./my-layout.rackula.yaml --output ./output
```

Use this mode instead of `--input` when only one file should be packaged.

## Important: Argument Passing

Use explicit flags. Positional arguments are easy to misroute through wrappers and should be avoided. This is wrong:

```bash
.agents/skills/rackula/scripts/zip-yaml.js ./input ./output      # WRONG
```

You must use explicit flags:

```bash
bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output  # CORRECT
```

## Output Naming

The output filename is derived from `metadata.name` in the YAML, not the input filename:

| YAML metadata.name      | Output file                         |
| ----------------------- | ----------------------------------- |
| `Universidad Servicios` | `Universidad Servicios.Rackula.zip` |

Invalid filename characters (`\/:*?"<>|`) are replaced with `-`.

## validate-rackula

Validates Rackula YAML structure with the skill's bundled validator. The YAML parser is bundled into `validate-rackula.js`, so installed skill usage does not require `node_modules`.

Validate one file, recommended when working on a single layout:

```bash
bun run .agents/skills/rackula/scripts/validate-rackula.js --file ./input/my-layout.rackula.yaml
node .agents/skills/rackula/scripts/validate-rackula.js --file ./input/my-layout.rackula.yaml
```

Validate every `.rackula.yaml` file in a directory:

```bash
bun run .agents/skills/rackula/scripts/validate-rackula.js --input ./input
node .agents/skills/rackula/scripts/validate-rackula.js --input ./input
```

Show help:

```bash
bun run .agents/skills/rackula/scripts/validate-rackula.js --help
node .agents/skills/rackula/scripts/validate-rackula.js --help
```

The validator checks required top-level fields, device type references, rack fit, collisions, rack-level `position: 0`, duplicate port IDs, `connections` with `a_port_id`/`b_port_id`, referenced port IDs, and connection colors.

Do not use `node -e 'require("yaml")...'`; the user's workspace may not have that package. Use the bundled validator instead.

## Exit Codes

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 0    | Success (no files found is also 0)                  |
| 1    | Error (missing flags, file not found, invalid YAML) |

## Workflow

1. Create or edit YAML in `input/*.rackula.yaml`
2. Ensure `metadata.id` and `metadata.name` are present
3. For one layout, validate with `bun run .agents/skills/rackula/scripts/validate-rackula.js --file ./input/<file>.rackula.yaml` or `node .agents/skills/rackula/scripts/validate-rackula.js --file ./input/<file>.rackula.yaml`
4. For one layout, package with `bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./input/<file>.rackula.yaml --output ./output`
5. For all layouts in a folder, validate with `bun run .agents/skills/rackula/scripts/validate-rackula.js --input ./input` or `node .agents/skills/rackula/scripts/validate-rackula.js --input ./input`
6. For all layouts in a folder, package with `bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output`
7. Import the `.Rackula.zip` at [count.racku.la](https://count.racku.la/)
