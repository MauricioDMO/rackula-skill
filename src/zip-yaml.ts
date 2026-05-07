import { parseArgs } from "node:util";
import { run } from "./runner";

const { values, positionals } = parseArgs({
  options: {
    text: {
      type: "string",
      short: "t",
    },
    file: {
      type: "string",
      short: "f",
    },
    input: {
      type: "string",
      short: "i",
    },
    output: {
      type: "string",
      short: "o",
    },
    name: {
      type: "string",
    },
    stdout: {
      type: "boolean",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`Usage:
  bun run .agents/skills/rackula/scripts/zip-yaml.js [options]
  node .agents/skills/rackula/scripts/zip-yaml.js [options]

Options:
  -i, --input <dir>     Batch package directory containing .rackula.yaml files
  -f, --file <path>     Package one specific .rackula.yaml file
  -t, --text <yaml>     Package YAML content as string; use - for stdin
  -o, --output <dir>    Output directory for .Rackula.zip files (default: cwd)
  --name <name>         Override metadata.name for output ZIP filename
  --stdout              Write ZIP bytes to stdout instead of a file
  -h, --help            Show this help

Examples:
  bun run .agents/skills/rackula/scripts/zip-yaml.js --file ./input/layout.rackula.yaml --output ./output
  bun run .agents/skills/rackula/scripts/zip-yaml.js --input ./input --output ./output
  node .agents/skills/rackula/scripts/zip-yaml.js --file ./input/layout.rackula.yaml --stdout > layout.Rackula.zip
`);
  process.exit(0);
}

try {
  await run({
    input: values.input ?? positionals[0],
    output: values.output ?? positionals[1],
    text: values.text,
    file: values.file,
    name: values.name,
    stdout: values.stdout,
  });
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
