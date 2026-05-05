import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";

const inputDir = process.argv[2] ?? "input";
const outputDir = process.argv[3] ?? "output";
const encoder = new TextEncoder();

function extractMetadata(yaml, fileName) {
  const id = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+id:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  const name = yaml.match(/^metadata:\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+name:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();

  if (!id || !name) {
    throw new Error(`${fileName} must include metadata.id and metadata.name`);
  }

  return { id, name };
}

function sanitizeFileName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim();
}

function crc32(data) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUInt16LE(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
}

function writeUInt32LE(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
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

  writeUInt32LE(zip, offset, 0x04034b50);
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
  writeUInt32LE(zip, offset, 0x02014b50);
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

  writeUInt32LE(zip, offset, 0x06054b50);
  writeUInt16LE(zip, offset + 4, 0);
  writeUInt16LE(zip, offset + 6, 0);
  writeUInt16LE(zip, offset + 8, 1);
  writeUInt16LE(zip, offset + 10, 1);
  writeUInt32LE(zip, offset + 12, centralHeaderLength);
  writeUInt32LE(zip, offset + 16, centralDirectoryOffset);
  writeUInt16LE(zip, offset + 20, 0);

  return zip;
}

const inputStats = await stat(inputDir).catch(() => undefined);

if (!inputStats?.isDirectory()) {
  throw new Error(`Input directory not found: ${inputDir}`);
}

await mkdir(outputDir, { recursive: true });

const yamlFiles = (await readdir(inputDir)).filter((fileName) => fileName.endsWith(".rackula.yaml"));

if (yamlFiles.length === 0) {
  console.log(`No .rackula.yaml files found in ${inputDir}`);
  process.exit(0);
}

for (const yamlFile of yamlFiles) {
  const sourcePath = `${inputDir}/${yamlFile}`;
  const yaml = await readFile(sourcePath, "utf8");
  const metadata = extractMetadata(yaml, yamlFile);
  const outputName = `${sanitizeFileName(metadata.name)}-${metadata.id}.Rackula.zip`;
  const zip = createZip(yamlFile, encoder.encode(yaml));

  await writeFile(`${outputDir}/${outputName}`, zip);
  console.log(`Created ${outputDir}/${outputName}`);
}
