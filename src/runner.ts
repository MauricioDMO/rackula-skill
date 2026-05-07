import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extractMetadata, sanitizeFileName } from "./extractor";
import { createZip } from "./zipper";

export async function run({ input, output, text, file, name: nameOverride, stdout }: {
  input?: string;
  output?: string;
  text?: string;
  file?: string;
  name?: string;
  stdout?: boolean;
}): Promise<string[]> {
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

  const inputStats = await stat(inputDir).catch(() => undefined);
  if (!inputStats?.isDirectory()) {
    throw new Error(`Input directory not found: ${input}`);
  }

  await mkdir(outputDir, { recursive: true });

  const yamlFiles = (await readdir(inputDir)).filter((f) => f.endsWith(".rackula.yaml"));

  if (yamlFiles.length === 0) {
    console.log(`No .rackula.yaml files found in ${input}`);
    return [];
  }

  const results: string[] = [];
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

async function processText({ text, name, stdout, output, cwd }: {
  text: string;
  name?: string;
  stdout?: boolean;
  output?: string;
  cwd: string;
}): Promise<string[]> {
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

async function processFile({ file, name, stdout, output, cwd }: {
  file: string;
  name?: string;
  stdout?: boolean;
  output?: string;
  cwd: string;
}): Promise<string[]> {
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