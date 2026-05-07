# Commands

## Build

Compiles `src/zip-yaml.ts` and outputs to the skill's bundled script location.

```bash
pnpm run build
```

**Output:** `.agents/skills/rackula/scripts/zip-yaml.js`

This must be run after modifying the source and before using `zip-yaml` or packaging the skill.

## zip-yaml

Packages `.rackula.yaml` files into importable `.Rackula.zip` artifacts.

### Usage

```bash
pnpm run zip-yaml -- --input <input-dir> --output <output-dir>
```

### Arguments

| Flag       | Short | Description                                           |
| ---------- | ----- | ----------------------------------------------------- |
| `--input`  | `-i`  | Input directory containing `.rackula.yaml` files      |
| `--output` | `-o`  | Output directory for `.Rackula.zip` files             |
| `--name`   |       | Override `metadata.name` for output filename          |
| `--text`   | `-t`  | YAML content as string (alternative to `--input`)     |
| `--file`   | `-f`  | Process a single YAML file (alternative to `--input`) |
| `--stdout` |       | Write ZIP to stdout instead of file                   |
| `--help`   | `-h`  | Show usage help                                       |

### Examples

Package default `input/` to `output/`:

```bash
pnpm run zip-yaml -- --input ./input --output ./output
```

Single file from stdin:

```bash
cat layout.rackula.yaml | pnpm run zip-yaml -- --text -
```

Process specific file:

```bash
pnpm run zip-yaml -- --file ./my-layout.rackula.yaml --output ./output
```

## Important: pnpm Argument Passing

Due to a pnpm behavior, positional arguments after `--` are not passed to the underlying script. This fails:

```bash
pnpm run zip-yaml -- ./input ./output      # WRONG
```

You must use explicit flags:

```bash
pnpm run zip-yaml -- --input ./input --output ./output  # CORRECT
```

For details, see [Troubleshooting](./TROUBLESHOOTING.md#pnpm-positional-arguments).

## Output Naming

The output filename is derived from `metadata.name` in the YAML, not the input filename:

| YAML metadata.name      | Output file                         |
| ----------------------- | ----------------------------------- |
| `Universidad Servicios` | `Universidad Servicios.Rackula.zip` |

Invalid filename characters (`\/:*?"<>|`) are replaced with `-`.

## Exit Codes

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 0    | Success (no files found is also 0)                  |
| 1    | Error (missing flags, file not found, invalid YAML) |

## Workflow

1. Create or edit YAML in `input/*.rackula.yaml`
2. Ensure `metadata.id` and `metadata.name` are present
3. Run `pnpm run build` to update the bundled script
4. Run `pnpm run zip-yaml` to package
5. Import the `.Rackula.zip` at [count.racku.la](https://count.racku.la/)