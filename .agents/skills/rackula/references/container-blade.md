# Containers And Blade Devices

Blade/chassis systems use the `slots` + `container_id` model, not legacy `subdevice_role`/`device_bays`.

## Device Type With Slots (Container)

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
```

## Child Placement In Container

```yaml
racks:
  - id: "rack-1"
    name: "Primary Rack"
    height: 42
    width: 19
    form_factor: 4-post-cabinet
    starting_unit: 1
    position: 0
    devices:
      - id: "chassis-1"
        device_type: "blade-chassis"
        position: 120           # rack-level position (U20 = 120)
        face: both
      - id: "blade-1"
        device_type: "blade-server"
        position: 0             # relative to container — 0 is valid
        face: both
        container_id: "chassis-1"
        slot_id: "bay-1"
```

## Rules

- A device type with non-empty `slots` is a container
- A child with `container_id` must also have `slot_id`
- `slot_id` must match a slot on the parent container's device type
- Containers cannot nest inside other containers
- Child `position` is relative to the container, so `0` is valid for children

## Legacy Fields

`subdevice_role`, `device_bays`, `parent_device`, and `device_bay` exist but current validation around zero positions is tied to `container_id`. If using `parent_device`/`device_bay` without `container_id`, avoid `position: 0` in generated modern files unless the user explicitly needs to mirror an existing legacy file.