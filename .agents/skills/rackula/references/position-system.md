# Position System

Modern Rackula v0.7.0+ uses internal units where `6 units = 1U`.

**U1 is at the bottom of the rack (lowest position). U42 is at the top (highest position).**
Heavy equipment (UPS, batteries, storage, blade chassis) must use low U numbers (U1-U10).

## Conversion

| Human U | YAML `position` | Location |
|---------|-----------------|----------|
| U1 | 6 | Bottom |
| U2 | 12 | Bottom |
| U10 | 60 | Lower-middle |
| U25 | 150 | Upper-middle |
| U40 | 240 | Near top |

**Formula:** `yaml_position = human_u * 6`

## Rules

- Rack-level devices: `position >= 0.5` before migration, normally `>= 6` in modern files
- Container children: `position` is relative to container, so `0` is valid
- `u_height` stays in human rack units (e.g., `u_height: 4` = 4U device)
- **Low positions = bottom of rack (U1-U15). Place heavy equipment here.**
- **High positions = top of rack (U30+). Place patch panels, cable management, light gear.**

**Fit check:** `position + (u_height * 6) - 1 <= rack.height * 6`

## Common Mistakes

- **Do not write human U positions** like `position: 25` for U25; use `position: 150`
- **Do not use `position: 0`** for rack-level devices (only valid for container children)
- **Do not place UPS at high positions** (U30+) — it violates weight and safety rules
- **Do not place KVM consoles at U1-U3** — not ergonomic for human access