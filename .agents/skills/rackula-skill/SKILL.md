---
name: rackula
description: |
  Rackula rack layout YAML creation, editing, validation, packaging, and documentation. Use this skill whenever the user works with `.rackula.yaml` files, `.Rackula.zip` archives, Rackula layouts, rack diagrams, rack visualization, homelab/server rack planning, NetBox-style DCIM device definitions, device placements, rack U positions, blade/container devices, half-width devices, ports, rack connections, or asks to create an importable Rackula file. When a Rackula workspace provides an `input/` folder and `zip-yaml` tool, create generated YAML there and run the tool to produce the `.Rackula.zip`. Prefer this skill over generic YAML help whenever rack equipment, racks, U positions, device types, Rackula YAML, or Rackula ZIP packaging are involved. Do not use for unrelated YAML configuration.
---

# Rackula Skill

Rackula is an open-source rack layout designer. This skill creates, edits, validates, and documents Rackula YAML layouts using the schema implemented in the current Rackula codebase, not only the public docs. The public `docs/reference/SCHEMA.md` has useful explanations but is behind the current Zod schema in several places.

## Source Of Truth

Prefer the current app schema behavior:

- Modern layouts use top-level `racks: [...]`; `rack:` singular is legacy input only.
- YAML parsing is lenient: unknown fields are preserved, but generated files should use known fields.
- Modern rack-level device positions use internal `1/6U` units, not human U numbers.
- Layouts with `version` lower than `0.7.0` may contain old human-U positions and are migrated by multiplying by `6`.
- The current schema accepts rack widths `10`, `19`, `21`, and `23`.
- The current categories include `chassis`.

## Top-Level YAML

Use this order for new files:

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Layout"
  schema_version: "1.0"
  description: "Optional notes"
version: "1.0.0"
name: "My Layout"
racks:
  - id: "rack-1"
    name: "Primary Rack"
    height: 42
    width: 19
    desc_units: false
    show_rear: true
    form_factor: 4-post-cabinet
    starting_unit: 1
    position: 0
    devices: []
device_types: []
settings:
  display_mode: label
  show_labels_on_images: false
```

Required top-level fields for modern files:

- `version`: string. Use `"1.0.0"` unless the user needs a specific app version.
- `name`: layout name, 1-100 chars.
- `racks`: array with at least one rack.
- `device_types`: array, may be empty.
- `settings`: object.

Optional top-level fields:

- `metadata`: stable identity for persistence and `.Rackula.zip` folder naming.
- `rack_groups`: groups of rack IDs for row/bayed layouts.
- `connections`: current port-to-port connection model.
- `cables`: deprecated legacy connection model.
- `rack`: legacy single-rack input; avoid emitting it in new files.

## Metadata

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Homelab"
  schema_version: "1.0"
  description: "Basement rack"
```

- `id`: valid UUID, required when `metadata` is present.
- `name`: required, 1-100 chars.
- `schema_version`: required non-empty string, usually `"1.0"`.
- `description`: optional, max 1000 chars.

## Rack

```yaml
racks:
  - id: "rack-primary"
    name: "Primary Rack"
    height: 42
    width: 19
    desc_units: false
    show_rear: true
    form_factor: 4-post-cabinet
    starting_unit: 1
    position: 0
    notes: "Optional rack notes"
    devices: []
```

- `id`: required in modern output.
- `name`: required, 1-100 chars.
- `height`: integer `1-100`.
- `width`: `10`, `19`, `21`, or `23`.
- `desc_units`: boolean. If `true`, U1 is displayed at top.
- `show_rear`: boolean, defaults to `true` if omitted. Include when documenting complete schema.
- `form_factor`: `2-post`, `4-post`, `4-post-cabinet`, `wall-mount`, or `open-frame`.
- `starting_unit`: integer `>= 1`.
- `position`: integer `>= 0`, used for rack ordering.
- `devices`: required array of placed devices.
- `notes`: optional, max 1000 chars.

## Position Semantics

Rackula v0.7.0+ stores rack-level positions in internal units where `6` units equal `1U`.

| Human position | YAML `position` |
| --- | --- |
| U1 | `6` |
| U1 1/3 | `8` |
| U1 1/2 | `9` |
| U2 | `12` |
| U10 | `60` |
| U25 | `150` |

When generating a modern layout from user-friendly rack U positions, convert with:

```text
yaml_position = human_u * 6
```

Important placement rules:

- Rack-level devices must have `position >= 0.5` before migration and should normally use internal values `>= 6` in modern files.
- Container children with `container_id` use `position` relative to the container and may use `0`.
- `u_height` remains human rack units, e.g. `u_height: 4` is a 4U device.
- To check fit in modern files, compare internal values: `position + (u_height * 6) - 1 <= rack.height * 6`.

## Placed Device

```yaml
devices:
  - id: "server-1"
    device_type: "dell-r650"
    name: "Web Server 1"
    position: 240
    face: front
    slot_position: full
    ports:
      - id: "port-1"
        template_name: "NIC1"
        template_index: 0
        type: 10gbase-x-sfpp
    front_image: "custom-front.png"
    rear_image: "custom-rear.png"
    colour_override: "#FF5555"
    notes: "Optional placement notes"
    custom_fields:
      ip: "192.168.1.10"
```

Required fields:

- `id`: unique string within the rack. UUIDs are good, but non-empty IDs are accepted.
- `device_type`: slug reference to `device_types[].slug`.
- `position`: number. Use internal units for modern rack-level devices.
- `face`: `front`, `rear`, or `both`.

Optional fields:

- `name`: placement display name, max 100 chars.
- `slot_position`: `left`, `right`, or `full` for half-width devices.
- `ports`: instantiated ports used by `connections`.
- `front_image`, `rear_image`: placement-specific image overrides.
- `colour_override`: hex color override.
- `parent_device`, `device_bay`: legacy/schema-only parent-child placement fields.
- `container_id`, `slot_id`: current container slot placement. If `container_id` is set, `slot_id` is required.
- `notes`: max 1000 chars.
- `custom_fields`: arbitrary object.

## Device Type

```yaml
device_types:
  - slug: "dell-r650"
    manufacturer: "Dell"
    model: "PowerEdge R650"
    part_number: "R650"
    u_height: 1
    slot_width: 2
    rack_widths: [19]
    is_full_depth: true
    is_powered: true
    weight: 18.5
    weight_unit: kg
    airflow: front-to-rear
    front_image: true
    rear_image: true
    colour: "#4A7A8A"
    category: server
    tags: [production, compute]
    notes: "Device type notes"
    serial_number: "ABC123"
    asset_tag: "ASSET-001"
    links:
      - label: "Manual"
        url: "https://example.com/manual"
    interfaces:
      - name: "NIC1"
        type: 10gbase-x-sfpp
        label: "uplink"
        mgmt_only: false
        position: rear
    power_ports:
      - name: "PSU1"
        type: "iec-60320-c14"
        maximum_draw: 750
        allocated_draw: 400
    power_outlets: []
    device_bays: []
    inventory_items: []
    subdevice_role: parent
    va_rating: 3000
    slots: []
    custom_fields: {}
```

Required fields:

- `slug`: unique kebab-case identifier, max 100 chars.
- `u_height`: number `0.5-50`, multiple of `0.5`.
- `colour`: `#RRGGBB`.
- `category`: one of the device categories.

Common optional physical fields:

- `slot_width`: `1` for half-width, `2` for full-width.
- `rack_widths`: array of compatible rack widths: `10`, `19`, `21`, `23`.
- `is_full_depth`: boolean. Default behavior treats omitted as full-depth for placement defaults.
- `is_powered`: boolean.
- `weight` and `weight_unit`: if `weight` is present, prefer `weight_unit: kg` or `lb`.
- `airflow`: see enum list.

## Component Types

### Interface Template

```yaml
interfaces:
  - name: "iDRAC"
    type: 1000base-t
    label: "mgmt"
    mgmt_only: true
    position: rear
    poe_mode: pd
    poe_type: type1-ieee802.3af
```

Allowed interface `type` values in the Zod schema:

```text
100base-tx, 1000base-t, 2.5gbase-t, 5gbase-t, 10gbase-t,
1000base-x-sfp, 10gbase-x-sfpp, 25gbase-x-sfp28,
40gbase-x-qsfpp, 100gbase-x-qsfp28, 100gbase-x-qsfpdd,
200gbase-x-qsfp56, 200gbase-x-qsfpdd, 400gbase-x-qsfpdd,
console, usb-a, usb-b, usb-c, usb-mini-b, usb-micro-b,
virtual, lag, other
```

Do not emit `management` as an interface type; it appears in TypeScript comments but is not accepted by the current Zod enum.

### Power Ports And Outlets

```yaml
power_ports:
  - name: "Input"
    type: "iec-60320-c14"
    maximum_draw: 750
    allocated_draw: 400
power_outlets:
  - name: "Outlet 1"
    type: "iec-60320-c13"
    power_port: "Input"
    feed_leg: A
```

### Device Bays

```yaml
device_bays:
  - name: "Bay 1"
    position: "1"
```

`device_bays[].position` is a string in the current schema. Quote numeric-looking positions.

### Inventory Items And Links

```yaml
inventory_items:
  - name: "CPU"
    manufacturer: "Intel"
    part_id: "Xeon"
    serial: "XYZ"
    asset_tag: "CPU-1"
links:
  - label: "Vendor Manual"
    url: "https://example.com/manual"
```

## Containers And Blade-Style Devices

There are two related patterns. Prefer the current `slots` + `container_id` model for new work because it is validated for single-level nesting.

### Current Container Slot Model

```yaml
device_types:
  - slug: "blade-chassis"
    model: "Blade Chassis"
    u_height: 4
    colour: "#5A6A8A"
    category: chassis
    slots:
      - id: "bay-1"
        name: "Bay 1"
        position:
          row: 0
          col: 0
        width_fraction: 0.25
        height_units: 4
        accepts: [server]
  - slug: "blade-server"
    model: "Blade Server"
    u_height: 1
    colour: "#4A7A8A"
    category: server

racks:
  - id: "rack-1"
    name: "Primary Rack"
    height: 42
    width: 19
    desc_units: false
    form_factor: 4-post-cabinet
    starting_unit: 1
    position: 0
    devices:
      - id: "chassis-1"
        device_type: "blade-chassis"
        position: 120
        face: both
      - id: "blade-1"
        device_type: "blade-server"
        position: 0
        face: both
        container_id: "chassis-1"
        slot_id: "bay-1"
```

Rules:

- A device type with non-empty `slots` is a container.
- A child with `container_id` must also have `slot_id`.
- `slot_id` must match a slot on the parent container's device type.
- Containers cannot be nested inside other containers.
- Child `position` is relative to the container, so `0` is valid for children.

### Legacy Subdevice Fields

`subdevice_role`, `device_bays`, `parent_device`, and `device_bay` exist, but current validation around zero positions is tied to `container_id`. If using `parent_device`/`device_bay` without `container_id`, avoid `position: 0` in generated modern files unless the user explicitly needs to mirror an existing legacy file.

## Rack Groups

```yaml
rack_groups:
  - id: "group-1"
    name: "Main Row"
    rack_ids: ["rack-1", "rack-2"]
    layout_preset: row
```

- `rack_ids`: required, at least one ID, all must reference existing racks.
- `layout_preset`: `row` or `bayed`.
- `bayed` groups require all referenced racks to have the same `height`.

## Connections

Prefer `connections` for new port-to-port links:

```yaml
connections:
  - id: "connection-1"
    a_port_id: "port-a"
    b_port_id: "port-b"
    label: "uplink"
    color: "#FF5500"
```

- `a_port_id` and `b_port_id` reference `PlacedDevice.ports[].id`.
- They must not be equal.
- `color`, if present, must be hex `#RRGGBB`.

`cables` is deprecated but accepted for older layouts. Use only when editing existing cable-based files.

## Enums

### Device Categories

```text
server, network, patch-panel, power, storage, kvm, av-media, cooling,
shelf, blank, cable-management, chassis, other
```

### Other Enums

- `face`: `front`, `rear`, `both`.
- `form_factor`: `2-post`, `4-post`, `4-post-cabinet`, `wall-mount`, `open-frame`.
- `airflow`: `passive`, `front-to-rear`, `rear-to-front`, `left-to-right`, `right-to-left`, `side-to-rear`, `mixed`.
- `display_mode`: `label`, `image`, `image-label`.
- `subdevice_role`: `parent`, `child`.
- `slot_position`: `left`, `right`, `full`.
- `slot_width`: `1`, `2`.
- `weight_unit`: `kg`, `lb`.
- `poe_mode`: `pd`, `pse`.
- `feed_leg`: `A`, `B`, `C`.

## Collision Model

Two rack-level devices collide when their vertical ranges overlap, their faces collide, and their slot positions overlap.

Face rules:

| Face A | Face B | Collision |
| --- | --- | --- |
| `both` | any | yes |
| `front` | `front` | yes |
| `rear` | `rear` | yes |
| `front` | `rear` | no |

`face` is authoritative for collision. `is_full_depth` only influences default placement face; a user can override `face`.

Slot rules:

- `slot_width: 1` device types are half-width and should use placement `slot_position: left` or `right`.
- Full-width devices should use or imply `slot_position: full`.
- Left and right half-width placements can share the same U and face.

Container collision is separate:

- Rack-level devices collide only with other rack-level devices.
- Children with `container_id` collide only with siblings in the same container.
- Children in different containers do not collide.

## Archive Format

Modern `.Rackula.zip` exports use a folder structure:

```text
My Layout-550e8400-e29b-41d4-a716-446655440000.Rackula.zip
└── My Layout-550e8400-e29b-41d4-a716-446655440000/
    ├── my-layout.rackula.yaml
    └── assets/
        └── device-slug/
            ├── front.png
            ├── rear.png
            ├── placed-device-id-front.png
            └── placed-device-id-rear.png
```

Only custom images are included. Bundled Rackula images are loaded by the app.

## Common Templates

```yaml
# 1U full-depth server
- slug: "generic-1u-server"
  model: "1U Server"
  u_height: 1
  is_full_depth: true
  airflow: front-to-rear
  colour: "#4A7A8A"
  category: server

# 1U network switch
- slug: "switch-48-port"
  model: "48-Port Switch"
  u_height: 1
  is_full_depth: true
  airflow: side-to-rear
  colour: "#7B6BA8"
  category: network
  interfaces:
    - name: "Management"
      type: 1000base-t
      mgmt_only: true

# 2U UPS
- slug: "ups-2u"
  model: "2U UPS"
  u_height: 2
  is_full_depth: true
  airflow: front-to-rear
  colour: "#A84A4A"
  category: power
  va_rating: 3000
  power_ports:
    - name: "Input"
      type: "nema-l5-30p"
      maximum_draw: 2700

# 1U patch panel
- slug: "patch-panel-24"
  model: "24-Port Patch Panel"
  u_height: 1
  is_full_depth: false
  airflow: passive
  colour: "#6272A4"
  category: patch-panel

# 1U blank panel
- slug: "blank-1u"
  model: "1U Blank Panel"
  u_height: 1
  is_full_depth: false
  airflow: passive
  colour: "#44475A"
  category: blank

# Half-width mini PC
- slug: "mini-pc"
  model: "Mini PC"
  u_height: 1
  slot_width: 1
  is_full_depth: false
  colour: "#4A7A8A"
  category: server
```

Avoid `u_height: 0`; the current schema minimum is `0.5`.

## Common Mistakes To Avoid

- Do not generate `rack:` for new layouts; use `racks: [...]`.
- Do not write human U positions like `position: 25` for U25 in modern files; write `position: 150`.
- Do not use `position: 0` for rack-level devices.
- Do not use `device_bays[].position: 1` as a number; quote it as `"1"`.
- Do not omit `device_types` or `settings`.
- Do not use `#FFF`, named colors, or `rgb(...)`; use `#RRGGBB`.
- Do not duplicate `device_types[].slug` values.
- Do not use `management` as an interface `type`.
- Do not use `u_height: 0` for 0U PDUs; model them outside rack U space only if the app supports that specific workflow, otherwise use at least `0.5` or document the limitation.
- If preserving an existing legacy file, do not over-normalize unknown fields because Rackula preserves them.

## Output Style

When asked to create or edit a Rackula YAML file:

- Output valid YAML with 2-space indentation.
- Keep top-level order: `metadata`, `version`, `name`, `racks`, `device_types`, `settings`, then optional `rack_groups`, `connections`, `cables` if needed.
- Include enough device type definitions for every placed `device_type` reference.
- Use clear IDs that are stable and unique; UUIDs are preferred for metadata and acceptable for placements.
- If the user speaks in human U positions, convert to internal units and mention the conversion briefly if explaining.

## Local Workspace Packaging Tool

When working in the `rackula-skill` workspace, use the repository tool instead of only returning YAML text:

1. Create new Rackula layout files under `input/` with a `*.rackula.yaml` filename.
2. Ensure the file includes `metadata.id` and `metadata.name`; the ZIP tool uses them to name the archive.
3. Run `pnpm run zip-yaml` from the workspace root after creating or updating input YAML.
4. Report both paths: `input/<file>.rackula.yaml` and `output/<metadata.name>-<metadata.id>.Rackula.zip`.

The tool reads every `input/*.rackula.yaml` file and writes one `.Rackula.zip` per file to `output/`. If a user specifically asks for an importable Rackula artifact, complete the workflow end-to-end by generating the YAML and running the packaging command.
