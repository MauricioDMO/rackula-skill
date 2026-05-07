import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";

type LayoutObject = Record<string, any>;

const hexColor = /^#[0-9A-Fa-f]{6}$/;
const deviceCategories = new Set([
  "server",
  "network",
  "patch-panel",
  "power",
  "storage",
  "kvm",
  "av-media",
  "cooling",
  "shelf",
  "blank",
  "cable-management",
  "chassis",
  "other",
]);
const formFactors = new Set(["2-post", "4-post", "4-post-cabinet", "wall-mount", "open-frame"]);
const airflowValues = new Set(["passive", "front-to-rear", "rear-to-front", "left-to-right", "right-to-left", "side-to-rear", "mixed"]);
const faceValues = new Set(["front", "rear", "both"]);
const slotPositions = new Set(["left", "right", "full"]);
const slotWidths = new Set([1, 2]);
const rackWidths = new Set([10, 19, 21, 23]);
const interfaceTypes = new Set([
  "100base-tx",
  "1000base-t",
  "2.5gbase-t",
  "5gbase-t",
  "10gbase-t",
  "1000base-x-sfp",
  "10gbase-x-sfpp",
  "25gbase-x-sfp28",
  "40gbase-x-qsfpp",
  "100gbase-x-qsfp28",
  "100gbase-x-qsfpdd",
  "200gbase-x-qsfp56",
  "200gbase-x-qsfpdd",
  "400gbase-x-qsfpdd",
  "console",
  "usb-a",
  "usb-b",
  "usb-c",
  "usb-mini-b",
  "usb-micro-b",
  "virtual",
  "lag",
  "other",
]);

const { values } = parseArgs({
  options: {
    file: { type: "string", short: "f" },
    input: { type: "string", short: "i" },
    help: { type: "boolean", short: "h" },
  },
});

if (values.help) {
  console.log(`Usage:
  bun run .agents/skills/rackula/scripts/validate-rackula.js --file ./input/layout.rackula.yaml
  node .agents/skills/rackula/scripts/validate-rackula.js --file ./input/layout.rackula.yaml
  bun run .agents/skills/rackula/scripts/validate-rackula.js --input ./input
  node .agents/skills/rackula/scripts/validate-rackula.js --input ./input

Options:
  -f, --file <path>     Validate one .rackula.yaml file
  -i, --input <dir>     Validate every .rackula.yaml file in a directory
  -h, --help            Show this help
`);
  process.exit(0);
}

async function listFiles(input?: string): Promise<string[]> {
  if (values.file) return [resolve(process.cwd(), values.file)];
  if (!input) throw new Error("Missing --file or --input");

  const inputDir = resolve(process.cwd(), input);
  const entries = await readdir(inputDir);

  return entries
    .filter((entry) => entry.endsWith(".rackula.yaml"))
    .map((entry) => resolve(inputDir, entry));
}

function asArray(value: unknown): LayoutObject[] {
  return Array.isArray(value) ? value : [];
}

function allowedValues(values: ReadonlySet<string | number>): string {
  return Array.from(values).join(", ");
}

function validateEnum(
  errors: string[],
  label: string,
  value: unknown,
  values: ReadonlySet<string | number>,
  required = false,
): void {
  if (value === undefined || value === null || value === "") {
    if (required) errors.push(`${label}: missing value`);
    return;
  }

  if (!values.has(value as string | number)) {
    errors.push(`${label}: invalid value ${String(value)} (allowed: ${allowedValues(values)})`);
  }
}

function validateLayout(doc: LayoutObject, file: string): void {
  const errors: string[] = [];
  const racks = asArray(doc?.racks);
  const deviceTypes = asArray(doc?.device_types);
  const typeBySlug = new Map<string, LayoutObject>();
  const portIds = new Set<string>();

  if (!doc || typeof doc !== "object") errors.push("document must be a YAML object");
  if (doc?.rack) errors.push("use top-level racks array, not legacy rack object");
  if (!doc?.version) errors.push("missing version");
  if (!doc?.name) errors.push("missing name");
  if (!Array.isArray(doc?.racks)) errors.push("missing racks array");
  if (!Array.isArray(doc?.device_types)) errors.push("missing device_types array");
  if (!doc?.settings || typeof doc.settings !== "object") errors.push("missing settings object");

  for (const type of deviceTypes) {
    if (!type?.slug) {
      errors.push("device_type missing slug");
      continue;
    }

    if (typeBySlug.has(type.slug)) errors.push(`duplicate device_type slug ${type.slug}`);
    typeBySlug.set(type.slug, type);

    if (typeof type.u_height !== "number" || type.u_height < 0.5) errors.push(`${type.slug}: u_height must be >= 0.5`);
    if (type.colour && !hexColor.test(type.colour)) errors.push(`${type.slug}: colour must be #RRGGBB`);
    validateEnum(errors, `${type.slug}: category`, type.category, deviceCategories, true);
    validateEnum(errors, `${type.slug}: airflow`, type.airflow, airflowValues);
    validateEnum(errors, `${type.slug}: slot_width`, type.slot_width, slotWidths);

    for (const iface of asArray(type?.interfaces)) {
      validateEnum(errors, `${type.slug}: interface ${iface?.name ?? iface?.id ?? "unnamed"} type`, iface?.type, interfaceTypes, true);
    }
  }

  for (const rack of racks) {
    if (!rack?.id) errors.push("rack missing id");
    if (!Array.isArray(rack?.devices)) errors.push(`${rack?.id ?? "rack"}: missing devices array`);
    validateEnum(errors, `${rack?.id ?? "rack"}: width`, rack?.width, rackWidths);
    validateEnum(errors, `${rack?.id ?? "rack"}: form_factor`, rack?.form_factor, formFactors);

    const occupied: Array<{ id: string; start: number; end: number; slot: string }> = [];
    const rackUnits = Number(rack?.height) * 6;

    for (const device of asArray(rack?.devices)) {
      const deviceId = device?.id ?? "unnamed-device";
      const type = typeBySlug.get(device?.device_type);
      const isContainerChild = Boolean(device?.container_id);

      if (!device?.id) errors.push(`${rack?.id ?? "rack"}: device missing id`);
      if (!device?.device_type) errors.push(`${deviceId}: missing device_type`);
      if (!type) errors.push(`${deviceId}: missing device_type ${device?.device_type}`);
      if (!device?.face) errors.push(`${deviceId}: missing face`);
      if (device?.position === 0 && !isContainerChild) errors.push(`${deviceId}: rack-level device uses position 0`);
      validateEnum(errors, `${deviceId}: face`, device?.face, faceValues);
      validateEnum(errors, `${deviceId}: slot_position`, device?.slot_position, slotPositions);

      for (const port of asArray(device?.ports)) {
        if (!port?.id) errors.push(`${deviceId}: port missing id`);
        else if (portIds.has(port.id)) errors.push(`${deviceId}: duplicate port id ${port.id}`);
        else portIds.add(port.id);
        validateEnum(errors, `${deviceId}: port ${port?.id ?? "unnamed"} type`, port?.type, interfaceTypes, true);
      }

      if (type && typeof device?.position === "number" && !isContainerChild) {
        const end = device.position + type.u_height * 6 - 1;
        if (end > rackUnits) errors.push(`${deviceId}: does not fit in rack`);
        occupied.push({
          id: deviceId,
          start: device.position,
          end,
          slot: device.slot_position ?? "full",
        });
      }
    }

    for (let i = 0; i < occupied.length; i += 1) {
      for (let j = i + 1; j < occupied.length; j += 1) {
        const a = occupied[i];
        const b = occupied[j];
        if (!a || !b) continue;

        const overlaps = a.start <= b.end && b.start <= a.end;
        const slotConflicts = a.slot === "full" || b.slot === "full" || a.slot === b.slot;
        if (overlaps && slotConflicts) errors.push(`collision: ${a.id} and ${b.id}`);
      }
    }
  }

  for (const connection of asArray(doc?.connections)) {
    const id = connection?.id ?? "unnamed-connection";

    if (connection.from || connection.to || connection.source || connection.target) {
      errors.push(`${id}: connections must use a_port_id and b_port_id, not from/to/source/target`);
    }
    if (!connection?.a_port_id) errors.push(`${id}: missing a_port_id`);
    if (!connection?.b_port_id) errors.push(`${id}: missing b_port_id`);
    if (connection?.a_port_id && !portIds.has(connection.a_port_id)) errors.push(`${id}: missing a_port_id port ${connection.a_port_id}`);
    if (connection?.b_port_id && !portIds.has(connection.b_port_id)) errors.push(`${id}: missing b_port_id port ${connection.b_port_id}`);
    if (connection?.a_port_id && connection.a_port_id === connection.b_port_id) errors.push(`${id}: a_port_id and b_port_id must differ`);
    if (connection?.color && !hexColor.test(connection.color)) errors.push(`${id}: color must be #RRGGBB`);
  }

  if (errors.length > 0) {
    throw new Error(`${file}\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  }
}

try {
  const files = await listFiles(values.input);
  let checked = 0;

  for (const file of files) {
    if (!(await stat(file)).isFile()) continue;

    const yaml = await readFile(file, "utf8");
    const doc = parse(yaml) as LayoutObject;
    validateLayout(doc, file);
    checked += 1;
  }

  console.log(`Rackula structural validation passed (${checked} file${checked === 1 ? "" : "s"})`);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
