# Device Types

Defining and referencing device types in Rackula YAML.

## Device Type Structure

```yaml
device_types:
  - slug: "dell-r650"
    manufacturer: "Dell"
    model: "PowerEdge R650"
    part_number: "R650"
    u_height: 1                 # 0.5-50, multiple of 0.5
    slot_width: 2              # 1=half-width, 2=full-width
    rack_widths: [19]           # [10, 19, 21, 23]
    is_full_depth: true
    is_powered: true
    weight: 18.5
    weight_unit: kg
    airflow: front-to-rear
    front_image: true
    rear_image: true
    colour: "#4A7A8A"           # #RRGGBB only
    category: server
    tags: [production, compute]
    notes: "Device type notes"
    serial_number: "ABC123"
    asset_tag: "ASSET-001"
    links:
      - label: "Manual"
        url: "https://example.com/manual"
    interfaces: []
    power_ports: []
    power_outlets: []
    device_bays: []
    inventory_items: []
    subdevice_role: parent
    va_rating: 3000
    slots: []
    custom_fields: {}
```

Required: `slug` (unique kebab-case, max 100 chars), `u_height`, `colour`, `category`.

## Interface Template

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

Allowed `type` values:

```
100base-tx, 1000base-t, 2.5gbase-t, 5gbase-t, 10gbase-t,
1000base-x-sfp, 10gbase-x-sfpp, 25gbase-x-sfp28,
40gbase-x-qsfpp, 100gbase-x-qsfp28, 100gbase-x-qsfpdd,
200gbase-x-qsfp56, 200gbase-x-qsfpdd, 400gbase-x-qsfpdd,
console, usb-a, usb-b, usb-c, usb-mini-b, usb-micro-b,
virtual, lag, other
```

**Do not use `management`** as interface type. It appears in TypeScript comments but is not accepted by the Zod enum.

## Power Ports And Outlets

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

## Device Bays

```yaml
device_bays:
  - name: "Bay 1"
    position: "1"               # STRING in current schema — quote numeric values
```

## Common Device Type Templates

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

## Common Mistakes

- **Do not use `u_height: 0`** — minimum is `0.5`
- **Use `#RRGGBB` only** — not `#FFF`, named colors, or `rgb(...)`
- **Do not duplicate `device_types[].slug`** values
- **Quote `device_bays[].position`** as `"1"` — it's a string in the current schema