---
name: rackula
description: |
  Rackula rack layout YAML creation, editing, validation, packaging, and documentation. Use this skill whenever the user works with `.rackula.yaml` files, `.Rackula.zip` archives, Rackula layouts, rack diagrams, rack visualization, homelab/server rack planning, NetBox-style DCIM device definitions, device placements, rack U positions, blade/container devices, half-width devices, ports, rack connections, or asks to create an importable Rackula file. When a Rackula workspace provides an `input/` folder and `zip-yaml` tool, create generated YAML there and run the tool to produce the `.Rackula.zip`. Prefer this skill over generic YAML help whenever rack equipment, racks, U positions, device types, Rackula YAML, or Rackula ZIP packaging are involved. Do not use for unrelated YAML configuration.
---

# Rackula Skill

Rackula is an open-source rack layout designer. This skill creates, edits, validates, and documents Rackula YAML layouts.

## Workflow

When a user asks for an importable Rackula artifact in a workspace with `input/` and `zip-yaml`:

1. **Create YAML** in `input/*.rackula.yaml` with `metadata.id` (UUID) and `metadata.name`
2. **Build** the packager: `pnpm run build`
3. **Package** the YAML: `pnpm run zip-yaml -- --input ./input --output ./output`
4. **Report** both YAML path and ZIP path for import at `https://count.racku.la/`

## Key Rules

- Use `racks: [...]` (plural). The singular `rack:` is legacy input only — never emit it in new files.
- Modern positions use internal 1/6U units where `6 units = 1U`. See `references/position-system.md`.
- Use `container_id`/`slot_id` for blade/container devices. See `references/container-blade.md`.
- Quote `device_bays[].position` as a string — it's a string in the current schema.
- Do not use `management` as an interface type.
- Use `#RRGGBB` colors only — not `#FFF`, named colors, or `rgb(...)`.

## Rack Layout Architecture Rules

When generating datacenter rack diagrams, do not place equipment only by visual symmetry or available space. Always reason through the physical, electrical, thermal, operational, and cabling constraints before assigning rack units.

### Core reasoning order

Before producing a rack layout, apply this order of reasoning:

1. Mechanical safety and weight distribution.
2. Power architecture and redundancy.
3. Cooling and airflow.
4. Network/data cabling paths.
5. Human operation and maintenance access.
6. Logical grouping and failure-domain separation.
7. Expansion space and documentation clarity.

A rack layout is invalid if it looks organized but violates safety, power, cooling, or maintenance principles.

---

## 1. Mechanical safety and weight distribution

Heavy equipment must be placed in the lower part of the rack.

Place these components near the bottom:

- UPS units.
- External battery packs.
- Large storage systems.
- NAS/SAN equipment.
- Blade chassis.
- Heavy servers.
- Large power modules.

Do not place UPS units or battery banks in high rack units unless there is an explicit engineering justification, rack anchoring, manufacturer approval, and load calculation.

Preferred bottom-up order:

```text
Bottom rack units:
- Battery banks
- UPS modules
- Heavy storage
- Blade chassis / dense compute
- Standard servers
- Lighter appliances
- Patch panels / cable managers / lightweight network gear
Top rack units:
- Cable management, patching, blanking, or future expansion
```

When in doubt, move heavier equipment lower.

---

## 2. UPS and power placement

UPS equipment should normally be placed at the bottom of the rack or in a dedicated power rack.

Avoid placing UPS units:

- Above servers.
- Above storage.
- In the top third of the rack.
- In a position where battery replacement becomes unsafe or difficult.

For critical systems, prefer an A/B power design:

```text
Server PSU 1 -> PDU A -> UPS/feed A
Server PSU 2 -> PDU B -> UPS/feed B
```

If equipment has only one power supply, consider whether it requires:

- ATS.
- Redundant upstream power.
- Separate backup strategy.
- Clear labeling as a single-power dependency.

Do not claim redundancy if both power paths depend on the same UPS, same PDU, same breaker, or same physical failure point.

Use vertical 0U PDUs at the rear/side of the rack when possible to avoid wasting front rack units.

---

## 3. KVM, console, and human access

Distinguish between:

- A KVM switch without screen.
- A rack console with keyboard/monitor.
- A serial console server.
- A crash cart connection point.

A rack console with keyboard and monitor should be placed at a comfortable human operating height, usually around the middle of the rack.

Avoid placing an interactive KVM console at the very bottom or very top of the rack.

Reasoning:

```text
If humans operate it directly -> place at ergonomic height.
If it is only a passive/remote device -> place near cabling or management equipment.
```

Recommended placement:

```text
Rack console / drawer KVM: middle section
KVM switch only: near servers or management cabling
Serial console server: near network management gear
```

---

## 4. Cooling and airflow

Every rack layout must assume a defined airflow model.

Usually:

```text
Front = cold aisle / air intake
Rear  = hot aisle / exhaust
```

For every device, verify or assume airflow direction:

- Front-to-back.
- Back-to-front.
- Side-to-side.
- Port-side intake.
- Port-side exhaust.

Network switches must be oriented according to their airflow modules, not just cable convenience.

Invalid layout examples:

- Switch intake facing hot aisle.
- Switch exhaust blowing into cold aisle.
- Mixed airflow devices without ducting or containment.
- Empty rack gaps without blanking panels.
- Cable bundles blocking fan exhaust.

All unused rack spaces should be covered with blanking panels unless intentionally reserved and documented.

---

## 5. Cable management and patching

Place patch panels and switches according to the real cable entry path.

If cabling enters from above:

```text
Top area:
- Fiber patch panels
- Copper patch panels
- Horizontal cable managers
- Top-of-rack switches
```

If cabling enters from below:

```text
Bottom/low area may contain:
- Patch panels
- Cable managers
- Network equipment
```

Do not place Top-of-Rack switches at the bottom unless the cabling path or design explicitly justifies it.

Separate cable types:

```text
Power cables: rear/one side
Data cables: rear or opposite side
Fiber: protected path with bend-radius control
Copper: managed with horizontal/vertical organizers
Console/OOB: clearly separated and labeled
```

Avoid crossing power and data cables unnecessarily.

Use cable managers between dense patching zones and switches.

---

## 6. Network architecture placement

For network racks, group equipment by function but avoid creating unnecessary single points of failure.

Typical order:

```text
Top:
- Fiber patch panels
- Copper patch panels
- Cable managers

Upper-middle:
- Distribution/access switches
- WiFi controllers
- NAC/RADIUS appliances

Middle/lower-middle:
- Core switches
- Routers
- Firewalls
- Load balancers

Middle ergonomic zone:
- KVM console, if interactive

Rear/side:
- PDUs A/B
- Cable vertical managers
```

For redundant core equipment, consider whether both primary and secondary devices should be in the same rack. In a basic lab diagram this may be acceptable, but in a stronger architecture, redundant devices should be separated by:

- Rack.
- Power feed.
- PDU.
- Cable path.
- Cooling dependency.
- Maintenance zone.

Do not mark a design as highly available if both HA members share the same physical failure domain.

---

## 7. Server rack placement

For server racks, use this general pattern:

```text
Top:
- Patch panels
- ToR switches
- Cable managers

Upper/middle:
- 1U/2U application servers
- Lightweight compute nodes

Middle/lower:
- Database servers
- Storage-heavy servers
- Backup servers

Lower:
- NAS/SAN
- Tape library
- Blade chassis
- UPS only if local UPS is required

Bottom:
- UPS / battery / heaviest equipment
```

Do not place a local UPS above compute, storage, or blade chassis.

If a rack uses centralized UPS from a power rack, avoid duplicating local UPS units unless there is a clear reason.

---

## 8. Energy rack placement

For dedicated UPS/power racks, use this logic:

```text
Bottom:
- Battery banks
- External battery modules
- Heaviest UPS modules

Lower/middle:
- UPS main units
- Power modules

Middle:
- ATS
- Bypass units
- Power distribution modules

Upper/middle:
- Energy monitoring
- Network management cards
- Lightweight control equipment

Top:
- Cable management
- Blanking panels
- Future expansion
```

Never place heavy UPS or battery banks in the top third of a rack.

---

## 9. Blank spaces and expansion

Do not leave empty rack units visually open in production diagrams.

If a rack has unused space, label it as:

```text
- Blanking panel
- Reserved expansion
- Future server space
- Cable management
- Airflow containment
```

Empty space must not imply an open airflow gap.

Use blanking panels to reduce hot-air recirculation.

---

## 10. Required validation checklist

Before finalizing any rack diagram, validate the following:

```text
[ ] Are all heavy devices placed low?
[ ] Are UPS and battery banks at the bottom or in a dedicated power rack?
[ ] Is the rack stable and not top-heavy?
[ ] Are KVM consoles placed at ergonomic height?
[ ] Are non-interactive KVM/console devices placed near their cabling paths?
[ ] Is airflow direction defined for each rack?
[ ] Are switches oriented according to intake/exhaust direction?
[ ] Are cold aisle and hot aisle assumptions clear?
[ ] Are empty rack units covered with blanking panels or labeled as reserved?
[ ] Are PDUs placed logically, preferably as rear/side 0U PDUs?
[ ] Are A/B power paths clearly separated?
[ ] Are redundant systems actually separated by failure domain?
[ ] Are patch panels near the real cable entry path?
[ ] Are ToR switches near server cabling, not placed arbitrarily?
[ ] Are power and data cable paths separated?
[ ] Is there enough service clearance for replacing batteries, PSUs, fans, and disks?
[ ] Is the layout maintainable by a technician without unsafe posture or unsafe lifting?
```

If any answer is no, revise the rack layout before outputting the final diagram.

---

## 11. Output requirements for generated rack diagrams

When generating a rack layout, include:

1. Rack name and purpose.
2. Front and rear view if relevant.
3. Rack unit numbers.
4. Equipment name.
5. Equipment role.
6. Power feed: A, B, or single.
7. Approximate weight class: light, medium, heavy.
8. Airflow direction.
9. Notes about maintenance access.
10. Warnings for questionable placements.

Use warnings when the layout violates or may violate good practice:

```text
WARNING: UPS is placed too high. Move to lower rack units.
WARNING: KVM console is too low for comfortable human access.
WARNING: Switch airflow direction is unknown. Verify fan module orientation.
WARNING: Redundant devices share the same rack and power path.
WARNING: Empty rack spaces should use blanking panels.
```

---

## 12. Decision rules

Use these decision rules when there is uncertainty:

```text
If it is heavy -> move it down.
If it has batteries -> move it down.
If a human operates it often -> move it to ergonomic height.
If it needs many network cables -> move it near patching/switching.
If it generates heat -> preserve correct airflow path.
If it is redundant -> avoid sharing the same failure domain.
If airflow is unknown -> flag it instead of assuming it is correct.
If cable entry is unknown -> state the assumption explicitly.
If power topology is unknown -> do not claim A/B redundancy.
```

---

## 13. Bad layout patterns to avoid

Avoid these common mistakes:

```text
- UPS units in the top third of the rack.
- Battery banks above servers.
- KVM console at U1/U2.
- ToR switch at the bottom when cable trays enter from above.
- Patch panels far from cable entry.
- Network core primary and secondary sharing all the same dependencies.
- Open empty rack units without blanking panels.
- Power and data cables mixed without organization.
- Switches installed against their required airflow direction.
- Diagrams that show equipment placement but ignore power, airflow, and maintenance.
```

---

## 14. Preferred reasoning summary

A correct rack architecture should be reasoned like this:

```text
First: make the rack physically safe.
Second: make the power design correct.
Third: make the cooling path valid.
Fourth: make cabling clean and serviceable.
Fifth: make human access practical.
Sixth: separate redundancy across real failure domains.
Finally: make the diagram visually clear.
```

Do not optimize the drawing before validating the architecture.

**Strong rule for university/datacenter layouts:** never place UPS or battery banks in high rack units for visual balance. UPS and batteries must be treated as heavy infrastructure, not as ordinary IT appliances.

## Rack Size Selection

Rack `height` must match the user's actual hardware and use case:

| Use Case | Rack Height | Example |
|----------|------------|---------|
| Homelab / desktop | `6` (6U) | Half-width devices, Raspberry Pi, small NAS |
| Small office | `18` to `24` | 1U servers, patch panels |
| Datacenter | `42` | Full racks with UPS, multiple servers |

**A homelab is NOT a 42U rack.** Using `height: 42` for a "small" layout breaks the web interface. Always ask the user about their hardware scope and choose `height` accordingly.

## File Structure

```
SKILL.md                    # This file — workflow and key rules
examples/                   # Valid YAML examples for different use cases
  homelab-small.rackula.yaml
  homelab-router-switch.rackula.yaml
  datacenter-42u.rackula.yaml
references/
  schema.md                 # Top-level YAML structure, metadata, rack, placed device
  position-system.md        # 1/6U conversion and fit check
  device-types.md           # Device type definitions, interfaces, power ports, templates
  container-blade.md        # Container/slot model for blade devices
  connections.md            # Connections and rack groups
  enums.md                  # All allowed enum values
  collision.md              # Collision detection rules
  rack-layout-architecture.md  # Rack placement rules, weight, power, airflow, cabling
  troubleshooting.md        # Common mistakes and fixes
scripts/
  zip-yaml.js               # Packager script (built from src/)
evals/
  evals.json                # Test cases
```

## Schema Reference

For the complete schema details, read the relevant reference file:

| Task | Reference |
|------|-----------|
| Top-level structure, metadata, rack, placed device | `references/schema.md` |
| Position conversion (U → internal units) | `references/position-system.md` |
| Device types, interfaces, power ports | `references/device-types.md` |
| Blade chassis and container children | `references/container-blade.md` |
| Port-to-port connections, rack groups | `references/connections.md` |
| All enum values | `references/enums.md` |
| Collision rules | `references/collision.md` |
| Rack placement, weight, power, airflow, cabling | `references/rack-layout-architecture.md` |
| Common mistakes | `references/troubleshooting.md` |

## Packaging

When the user wants an importable `.Rackula.zip`:

```bash
pnpm run build
pnpm run zip-yaml -- --input ./input --output ./output
```

Report both paths: `input/<file>.rackula.yaml` and `output/<name>.Rackula.zip`.

**Important:** pnpm does not pass positional args — always use `--` before flags:

```bash
# WRONG
pnpm run zip-yaml -- ./input ./output

# CORRECT
pnpm run zip-yaml -- --input ./input --output ./output
```