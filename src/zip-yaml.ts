import { parseArgs } from "node:util";
import { run } from "./runner";

const { values } = parseArgs({
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
  console.log(`Usage: bun run zip-yaml.ts [options]

Options:
  -t, --text <yaml>     YAML content as string
  -f, --file <path>     Process specific YAML file
  -i, --input <dir>     Input directory (required without -t/-f)
  -o, --output <dir>    Output directory (default: cwd)
  --name <name>         Override metadata.name for output filename
  --stdout              Write ZIP to stdout
  -h, --help            Show this help
`);
  process.exit(0);
}

const positionalArgs = (values._ as string[]) ?? [];

try {
  await run({
    input: values.input ?? positionalArgs[0],
    output: values.output ?? positionalArgs[1],
    text: values.text,
    file: values.file,
    name: values.name,
    stdout: values.stdout,
  });
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}