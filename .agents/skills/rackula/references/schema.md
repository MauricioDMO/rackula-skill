# Rackula YAML Schema

Top-level structure, field requirements, and archive format.

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
    face: front                # front, rear, or both
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

Optional: `name`, `slot_position`, `ports`, `front_image`, `rear_image`, `colour_override`, `container_id`, `slot_id`, `notes`, `custom_fields`.

If `container_id` is set, `slot_id` is required.

## Archive Format

Modern `.Rackula.zip` structure:

```
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

Only custom images are included. Bundled Rackula images load from the app.