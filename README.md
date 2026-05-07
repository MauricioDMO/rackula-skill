# Rackula Skill

Create, edit, validate, and package Rackula rack layout YAML files. Produces importable `.Rackula.zip` archives ready for the [Rackula](https://github.com/RackulaLives/Rackula) web app at [count.racku.la](https://count.racku.la/).

## Installation

```bash
npx skills add MauricioDMO/rackula-skill
```

## What This Skill Does

Rackula is an open-source rack layout designer. This skill enables an AI agent to:

- **Create** `.rackula.yaml` files for any rack layout (homelab, server room, datacenter)
- **Edit** existing layouts (add devices, modify settings, update rack groups)
- **Validate** YAML against the Rackula schema and reference docs
- **Package** YAML into `.Rackula.zip` for import at `count.racku.la`

## Workflow

```
User → Create YAML → Build packager → Package to ZIP → Import at count.racku.la
```

For a workspace that provides `input/` and `zip-yaml`:

1. **Create** the layout file in `input/*.rackula.yaml` with `metadata.id` and `metadata.name`
2. **Build** the packager: `pnpm run build`
3. **Package** the YAML: `pnpm run zip-yaml -- --input ./input --output ./output`
4. **Report** both the YAML path and the ZIP path

> pnpm requires `--` before flags. Use `pnpm run zip-yaml -- --input ./input --output ./output`, NOT `pnpm run zip-yaml -- ./input ./output`.

## Key Rules

| Rule                     | Correct                                   | Wrong                            |
| ------------------------ | ----------------------------------------- | -------------------------------- |
| Top-level rack key       | `racks: [...]`                            | `rack:` (legacy only)            |
| Positions                | Internal 1/6U units (U25 = `240`)         | U-numbers directly               |
| Interface type           | `1000base-t`, `10gbase-x-sfpp`, `console` | `management`                     |
| Colors                   | `#RRGGBB` (e.g. `#50FA7B`)                | `#FFF`, named colors, `rgb(...)` |
| `device_bays[].position` | quoted as string: `position: "1"`         | unquoted                         |
| Container children       | `position: 0` (relative to container)     | rack-level position              |

## Minimal Example

```yaml
metadata:
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Homelab"
version: "1.0.0"
name: "My Homelab"
racks:
  - id: "rack-1"
    name: "Primary Rack"
    height: 42
    width: 19
    form_factor: 4-post-cabinet
    starting_unit: 1
    position: 0
    devices:
      - id: "server-1"
        device_type: "dell-r650"
        name: "Web Server 1"
        position: 252
        face: front
device_types:
  - slug: "dell-r650"
    manufacturer: "Dell"
    model: "PowerEdge R650"
    u_height: 1
    is_full_depth: true
    airflow: front-to-rear
    colour: "#4A7A8A"
    category: server
settings:
  display_mode: label
```

## Core Concepts

### Positions (1/6U System)

Rackula uses internal units where `6 units = 1U`. To convert:

```
U25  → position 150   (25 × 6 = 150)
U42  → position 252   (42 × 6 = 252)
U1-2 → position 6-12   (1 × 6 = 6, 2 × 6 = 12)
```

### Device Types

Every placed device must reference a defined `device_type`. Key fields:

- `slug` — unique identifier, kebab-case
- `u_height` — height in U (0.5 minimum)
- `category` — `server`, `network`, `patch-panel`, `power`, `storage`, `chassis`, `blank`, etc.
- `airflow` — `front-to-rear`, `rear-to-front`, `side-to-rear`, `passive`
- `colour` — hex color `#RRGGBB`

### Half-Width Devices

Set `slot_width: 1` on the device type and use `slot_position: left` or `right` on the placement. Full-width uses `slot_position: full`.

### Blade / Container Devices

Define `slots` on the parent device type, then reference with `container_id` and `slot_id` on child placements. Container children use `position: 0` (relative to container, not rack-level).

## Enums

| Field            | Allowed Values                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `category`       | `server`, `network`, `patch-panel`, `power`, `storage`, `kvm`, `av-media`, `cooling`, `shelf`, `blank`, `cable-management`, `chassis`, `other`                               |
| `form_factor`    | `2-post`, `4-post`, `4-post-cabinet`, `wall-mount`, `open-frame`                                                                                                             |
| `airflow`        | `passive`, `front-to-rear`, `rear-to-front`, `left-to-right`, `right-to-left`, `side-to-rear`, `mixed`                                                                       |
| `face`           | `front`, `rear`, `both`                                                                                                                                                      |
| `slot_position`  | `left`, `right`, `full`                                                                                                                                                      |
| `interface type` | `1000base-t`, `10gbase-x-sfpp`, `25gbase-x-sfp28`, `40gbase-x-qsfpp`, `100gbase-x-qsfp28`, `console`, `virtual`, and [more...](./.agents/skills/rackula/references/enums.md) |

## File Structure

```
.agents/skills/rackula/
├── SKILL.md                  # Skill definition — workflow and rules
├── examples/                 # Valid YAML examples
│   ├── homelab-small.rackula.yaml
│   ├── homelab-router-switch.rackula.yaml
│   └── datacenter-42u.rackula.yaml
├── scripts/zip-yaml.js       # Packager script
├── references/
│   ├── schema.md            # Top-level structure and fields
│   ├── position-system.md   # 1/6U conversion
│   ├── device-types.md      # Device type schema
│   ├── container-blade.md   # Blade/container model
│   ├── connections.md       # Port-to-port links and rack groups
│   ├── enums.md            # All allowed enum values
│   ├── collision.md        # Collision detection
│   └── troubleshooting.md   # Common mistakes and fixes
└── evals/evals.json         # 7 test cases
```

## Links

- [Rackula GitHub](https://github.com/Rackula/rackula)
- [Rackula App](https://count.racku.la/)