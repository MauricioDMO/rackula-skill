# Connections

Prefer `connections` over the deprecated `cables` field.

## Connection Structure

Rackula connections reference placed-device port IDs directly. Use this exact schema:

```yaml
connections:
  - id: "connection-1"
    a_port_id: "port-a"         # references PlacedDevice.ports[].id
    b_port_id: "port-b"
    label: "uplink"
    color: "#FF5500"            # #RRGGBB
```

Rules:
- Use `a_port_id` and `b_port_id`; these are required for every connection
- Do not use `from`, `to`, `source`, `target`, nested endpoint objects, or `{ device_id, port_id }` pairs
- Both values must reference existing `racks[].devices[].ports[].id` values
- `a_port_id` and `b_port_id` must not be equal
- `color`, if present, must be hex `#RRGGBB`

Wrong:

```yaml
connections:
  - id: "bad-connection"
    from:
      device_id: "router"
      port_id: "router-lan"
    to:
      device_id: "switch"
      port_id: "switch-uplink"
```

Right:

```yaml
connections:
  - id: "router-to-switch"
    a_port_id: "router-lan"
    b_port_id: "switch-uplink"
    label: "Router LAN to switch uplink"
    color: "#FFB86C"
```

Validation checklist:
- Check schema keys exactly: `id`, `a_port_id`, `b_port_id`, optional `label`, optional `color`
- Check both port IDs exist globally across all placed device ports
- Check colors use `#RRGGBB`
- Check no legacy endpoint keys remain after edits

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
