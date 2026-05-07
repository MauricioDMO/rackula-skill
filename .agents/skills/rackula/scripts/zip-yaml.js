// src/zip-yaml.ts
import { parseArgs } from "node:util";

// src/runner.ts
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// src/extractor.ts
function extractMetadata(yaml, fileName = "input") {
  const id = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+id:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const name = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+name:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  if (!name) {
    throw new Error(`${fileName} must include metadata.name`);
  }
  return { id: id ?? null, name: name?.trim() ?? "schema" };
}
function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim();
}

// src/zipper.ts
var encoder = new TextEncoder;
function writeUInt16LE(buffer, offset, value) {
  buffer[offset] = value & 255;
  buffer[offset + 1] = value >>> 8 & 255;
}
function writeUInt32LE(buffer, offset, value) {
  buffer[offset] = value & 255;
  buffer[offset + 1] = value >>> 8 & 255;
  buffer[offset + 2] = value >>> 16 & 255;
  buffer[offset + 3] = value >>> 24 & 255;
}
function crc32(data) {
  let crc = 4294967295;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0;bit < 8; bit += 1) {
      crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
    }
  }
  return (crc ^ 4294967295) >>> 0;
}
function createZip(fileName, content) {
  const fileNameBytes = encoder.encode(fileName);
  const checksum = crc32(content);
  const dosTime = 0;
  const dosDate = 33;
  const localHeaderLength = 30 + fileNameBytes.length;
  const centralHeaderLength = 46 + fileNameBytes.length;
  const endRecordLength = 22;
  const totalLength = localHeaderLength + content.length + centralHeaderLength + endRecordLength;
  const zip = new Uint8Array(totalLength);
  let offset = 0;
  writeUInt32LE(zip, offset, 67324752);
  writeUInt16LE(zip, offset + 4, 20);
  writeUInt16LE(zip, offset + 6, 0);
  writeUInt16LE(zip, offset + 8, 0);
  writeUInt16LE(zip, offset + 10, dosTime);
  writeUInt16LE(zip, offset + 12, dosDate);
  writeUInt32LE(zip, offset + 14, checksum);
  writeUInt32LE(zip, offset + 18, content.length);
  writeUInt32LE(zip, offset + 22, content.length);
  writeUInt16LE(zip, offset + 26, fileNameBytes.length);
  writeUInt16LE(zip, offset + 28, 0);
  zip.set(fileNameBytes, offset + 30);
  offset += localHeaderLength;
  zip.set(content, offset);
  offset += content.length;
  const centralDirectoryOffset = offset;
  writeUInt32LE(zip, offset, 33639248);
  writeUInt16LE(zip, offset + 4, 20);
  writeUInt16LE(zip, offset + 6, 20);
  writeUInt16LE(zip, offset + 8, 0);
  writeUInt16LE(zip, offset + 10, 0);
  writeUInt16LE(zip, offset + 12, dosTime);
  writeUInt16LE(zip, offset + 14, dosDate);
  writeUInt32LE(zip, offset + 16, checksum);
  writeUInt32LE(zip, offset + 20, content.length);
  writeUInt32LE(zip, offset + 24, content.length);
  writeUInt16LE(zip, offset + 28, fileNameBytes.length);
  writeUInt16LE(zip, offset + 30, 0);
  writeUInt16LE(zip, offset + 32, 0);
  writeUInt16LE(zip, offset + 34, 0);
  writeUInt16LE(zip, offset + 36, 0);
  writeUInt32LE(zip, offset + 38, 0);
  writeUInt32LE(zip, offset + 42, 0);
  zip.set(fileNameBytes, offset + 46);
  offset += centralHeaderLength;
  writeUInt32LE(zip, offset, 101010256);
  writeUInt16LE(zip, offset + 4, 0);
  writeUInt16LE(zip, offset + 6, 0);
  writeUInt16LE(zip, offset + 8, 1);
  writeUInt16LE(zip, offset + 10, 1);
  writeUInt32LE(zip, offset + 12, centralHeaderLength);
  writeUInt32LE(zip, offset + 16, centralDirectoryOffset);
  writeUInt16LE(zip, offset + 20, 0);
  return zip;
}

// src/runner.ts
async function run({ input, output, text, file, name: nameOverride, stdout }) {
  const cwd = process.cwd();
  if (text !== undefined) {
    return processText({ text, name: nameOverride, stdout, output, cwd });
  }
  if (file !== undefined) {
    return processFile({ file, name: nameOverride, stdout, output, cwd });
  }
  if (input === undefined || output === undefined) {
    throw new Error("Missing required --input and/or --output flags");
  }
  const inputDir = resolve(cwd, input);
  const outputDir = resolve(cwd, output);
  const inputStats = await stat(inputDir).catch(() => {
    return;
  });
  if (!inputStats?.isDirectory()) {
    throw new Error(`Input directory not found: ${input}`);
  }
  await mkdir(outputDir, { recursive: true });
  const yamlFiles = (await readdir(inputDir)).filter((f) => f.endsWith(".rackula.yaml"));
  if (yamlFiles.length === 0) {
    console.log(`No .rackula.yaml files found in ${input}`);
    return [];
  }
  const results = [];
  for (const yamlFile of yamlFiles) {
    const sourcePath = `${inputDir}/${yamlFile}`;
    const yaml = await readFile(sourcePath, "utf8");
    const metadata = extractMetadata(yaml, yamlFile);
    const name = nameOverride ?? metadata.name;
    const outputName = `${sanitizeFileName(name)}.Rackula.zip`;
    const zip = createZip(yamlFile, new TextEncoder().encode(yaml));
    if (stdout) {
      process.stdout.write(zip);
      results.push(outputName);
    } else {
      await writeFile(`${outputDir}/${outputName}`, zip);
      console.log(`Created ${outputDir}/${outputName}`);
      results.push(`${outputDir}/${outputName}`);
    }
  }
  return results;
}
async function processText({ text, name, stdout, output, cwd }) {
  const metadata = extractMetadata(text, "stdin");
  const finalName = name ?? metadata.name;
  const outputName = `${sanitizeFileName(finalName)}.Rackula.zip`;
  const zip = createZip("rackula.yaml", new TextEncoder().encode(text));
  if (stdout) {
    process.stdout.write(zip);
  } else {
    const outputDir = output ? resolve(cwd, output) : cwd;
    await mkdir(outputDir, { recursive: true });
    await writeFile(`${outputDir}/${outputName}`, zip);
    console.log(`Created ${outputDir}/${outputName}`);
  }
  return [outputName];
}
async function processFile({ file, name, stdout, output, cwd }) {
  const filePath = resolve(cwd, file);
  const yaml = await readFile(filePath, "utf8");
  const fileName = file.split("/").pop() ?? "rackula.yaml";
  const metadata = extractMetadata(yaml, fileName);
  const finalName = name ?? metadata.name;
  const outputName = `${sanitizeFileName(finalName)}.Rackula.zip`;
  const zip = createZip(fileName, new TextEncoder().encode(yaml));
  if (stdout) {
    process.stdout.write(zip);
  } else {
    const outputDir = output ? resolve(cwd, output) : cwd;
    await mkdir(outputDir, { recursive: true });
    await writeFile(`${outputDir}/${outputName}`, zip);
    console.log(`Created ${outputDir}/${outputName}`);
  }
  return [outputName];
}

// src/zip-yaml.ts
var { values } = parseArgs({
  options: {
    text: {
      type: "string",
      short: "t"
    },
    file: {
      type: "string",
      short: "f"
    },
    input: {
      type: "string",
      short: "i"
    },
    output: {
      type: "string",
      short: "o"
    },
    name: {
      type: "string"
    },
    stdout: {
      type: "boolean"
    },
    help: {
      type: "boolean",
      short: "h"
    }
  },
  allowPositionals: true
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
var positionalArgs = values._ ?? [];
try {
  await run({
    input: values.input ?? positionalArgs[0],
    output: values.output ?? positionalArgs[1],
    text: values.text,
    file: values.file,
    name: values.name,
    stdout: values.stdout
  });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
