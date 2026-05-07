# Position System

Modern Rackula v0.7.0+ uses internal units where `6 units = 1U`.

## Conversion

| Human U | YAML `position` |
|---------|-----------------|
| U1 | 6 |
| U1 1/3 | 8 |
| U1 1/2 | 9 |
| U2 | 12 |
| U10 | 60 |
| U25 | 150 |

**Formula:** `yaml_position = human_u * 6`

## Rules

- Rack-level devices: `position >= 0.5` before migration, normally `>= 6` in modern files
- Container children: `position` is relative to container, so `0` is valid
- `u_height` stays in human rack units (e.g., `u_height: 4` = 4U device)

**Fit check:** `position + (u_height * 6) - 1 <= rack.height * 6`

## Common Mistakes

- **Do not write human U positions** like `position: 25` for U25; use `position: 150`
- **Do not use `position: 0`** for rack-level devices (only valid for container children)