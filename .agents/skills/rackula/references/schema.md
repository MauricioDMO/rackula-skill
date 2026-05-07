# Rackula YAML Schema

Top-level structure and field requirements.

## Top-Level YAML Structure

New files must use this order:

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

Required fields: `version`, `name`, `racks` (array), `device_types` (array), `settings`.

**Important:** Use `racks: [...]` (plural). The singular `rack:` key is legacy input only — never emit it in new files.

Optional: `metadata` (stable identity for .Rackula.zip naming), `rack_groups`, `connections`, `cables` (deprecated).

## Metadata

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"  # UUID, required when metadata present
  name: "My Layout"                            # required, 1-100 chars
  schema_version: "1.0"                       # required non-empty string
  description: "Optional description"           # max 1000 chars
```

## Rack Definition

```yaml
racks:
  - id: "rack-primary"
    name: "Primary Rack"
    height: 42          # integer 1-100
    width: 19           # 10, 19, 21, or 23
    desc_units: false   # if true, U1 displayed at top
    show_rear: true     # defaults to true if omitted
    form_factor: 4-post-cabinet  # 2-post, 4-post, 4-post-cabinet, wall-mount, open-frame
    starting_unit: 1    # integer >= 1
    position: 0         # integer >= 0, used for rack ordering
    notes: "Optional rack notes"
    devices: []         # required array of placed devices
```

## Placed Device

```yaml
devices:
  - id: "server-1"
    device_type: "dell-r650"    # slug reference to device_types
    name: "Web Server 1"
    position: 240              # internal units (U40 = 240)
    face: both                 # front, rear, or both; use both for rear-visible full-depth devices
    slot_position: full        # left, right, or full for half-width
    ports:
      - id: "port-1"
        template_name: "NIC1"
        template_index: 0
        type: 10gbase-x-sfpp
    notes: "Optional notes"
    custom_fields:
      ip: "192.168.1.10"
```

Required: `id`, `device_type`, `position`, `face`.

`face` is Rackula's mounted-face setting in YAML. Use `face: both` for rack-mounted servers, storage, UPS, firewalls, and other full-depth devices that must appear in the rear view. Use `face: front` only for truly front-only/passive items such as patch panels or front-only blanks.

Optional: `name`, `slot_position`, `ports`, `front_image`, `rear_image`, `colour_override`, `container_id`, `slot_id`, `notes`, `custom_fields`.

If `container_id` is set, `slot_id` is required.

## Connections

Use `connections` for port-to-port links. Each connection references placed-device port IDs directly:

```yaml
connections:
  - id: "conn-router-switch"
    a_port_id: "router-lan"
    b_port_id: "switch-uplink-router"
    label: "Router LAN to switch uplink"
    color: "#FFB86C"
```

Required: `id`, `a_port_id`, `b_port_id`.

Optional: `label`, `color`.

Do not use `from`/`to` objects or nested `{ device_id, port_id }` endpoints. This shape is invalid for Rackula even if it is human-readable.

Validation: both `a_port_id` and `b_port_id` must match existing `racks[].devices[].ports[].id` values, and `color` must be `#RRGGBB` when present.
