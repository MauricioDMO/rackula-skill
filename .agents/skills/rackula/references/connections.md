# Connections

Prefer `connections` over the deprecated `cables` field.

## Connection Structure

```yaml
connections:
  - id: "connection-1"
    a_port_id: "port-a"         # references PlacedDevice.ports[].id
    b_port_id: "port-b"
    label: "uplink"
    color: "#FF5500"            # #RRGGBB
```

Rules:
- `a_port_id` and `b_port_id` must not be equal
- `color`, if present, must be hex `#RRGGBB`

## Rack Groups

```yaml
rack_groups:
  - id: "group-1"
    name: "Main Row"
    rack_ids: ["rack-1", "rack-2"]
    layout_preset: row           # row or bayed
```

Rules:
- `rack_ids`: required, at least one ID, all must reference existing racks
- `layout_preset`: `row` or `bayed`
- `bayed` groups require all referenced racks to have the same `height`