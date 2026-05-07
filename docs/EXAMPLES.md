# Rackula YAML Examples

Practical examples for common Rackula layouts. See [SKILL.md](./SKILL.md) for the full schema reference.

## Minimal Layout

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Homelab"
  schema_version: "1.0"
  description: "Basement rack"
version: "1.0.0"
name: "My Homelab"
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

## Device Type Templates

### 1U Full-Depth Server

```yaml
- slug: "generic-1u-server"
  model: "1U Server"
  u_height: 1
  is_full_depth: true
  airflow: front-to-rear
  colour: "#4A7A8A"
  category: server
```

### 1U Network Switch

```yaml
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
```

### 2U UPS

```yaml
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
```

### 1U Patch Panel

```yaml
- slug: "patch-panel-24"
  model: "24-Port Patch Panel"
  u_height: 1
  is_full_depth: false
  airflow: passive
  colour: "#6272A4"
  category: patch-panel
```

### 1U Blank Panel

```yaml
- slug: "blank-1u"
  model: "1U Blank Panel"
  u_height: 1
  is_full_depth: false
  airflow: passive
  colour: "#44475A"
  category: blank
```

### Half-Width Mini PC

```yaml
- slug: "mini-pc"
  model: "Mini PC"
  u_height: 1
  slot_width: 1
  is_full_depth: false
  colour: "#4A7A8A"
  category: server
```

## Full Device Type

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

## Container / Blade Layout

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

## Connections

```yaml
connections:
  - id: "connection-1"
    a_port_id: "port-a"
    b_port_id: "port-b"
    label: "uplink"
    color: "#FF5500"
```

## Rack Groups

```yaml
rack_groups:
  - id: "group-1"
    name: "Main Row"
    rack_ids: ["rack-1", "rack-2"]
    layout_preset: row
```

## Interface Types

Allowed interface `type` values:

```text
100base-tx, 1000base-t, 2.5gbase-t, 5gbase-t, 10gbase-t,
1000base-x-sfp, 10gbase-x-sfpp, 25gbase-x-sfp28,
40gbase-x-qsfpp, 100gbase-x-qsfp28, 100gbase-x-qsfpdd,
200gbase-x-qsfp56, 200gbase-x-qsfpdd, 400gbase-x-qsfpdd,
console, usb-a, usb-b, usb-c, usb-mini-b, usb-micro-b,
virtual, lag, other
```

## Enums Summary

| Enum             | Values                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`       | `server`, `network`, `patch-panel`, `power`, `storage`, `kvm`, `av-media`, `cooling`, `shelf`, `blank`, `cable-management`, `chassis`, `other` |
| `face`           | `front`, `rear`, `both`                                                                                                                        |
| `form_factor`    | `2-post`, `4-post`, `4-post-cabinet`, `wall-mount`, `open-frame`                                                                               |
| `airflow`        | `passive`, `front-to-rear`, `rear-to-front`, `left-to-right`, `right-to-left`, `side-to-rear`, `mixed`                                         |
| `display_mode`   | `label`, `image`, `image-label`                                                                                                                |
| `subdevice_role` | `parent`, `child`                                                                                                                              |
| `slot_position`  | `left`, `right`, `full`                                                                                                                        |
| `weight_unit`    | `kg`, `lb`                                                                                                                                     |
| `poe_mode`       | `pd`, `pse`                                                                                                                                    |
| `feed_leg`       | `A`, `B`, `C`                                                                                                                                  |