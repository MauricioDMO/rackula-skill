# Rack Layout Architecture Reference

Rules for credible Rackula rack diagrams. Use when generating or reviewing realistic rack layouts, datacenter/server-room architecture, physical placement, power, airflow, cabling, maintenance, or failure-domain decisions.

## Core Reasoning Order

Before assigning rack units, validate the architecture in this order:

1. Mechanical safety and weight distribution.
2. Power architecture and redundancy.
3. Cooling and airflow.
4. Network/data cabling paths.
5. Human operation and maintenance access.
6. Logical grouping and failure-domain separation.
7. Expansion space and documentation clarity.

A rack layout is invalid if it looks organized but violates safety, power, cooling, cabling, or maintenance principles. Do not optimize the drawing before validating the architecture.

## Position System

Modern Rackula v0.7.0+ uses internal units where `6 units = 1U`.

| Human U | YAML `position` | Location |
|---------|-----------------|----------|
| U1 | 6 | Bottom |
| U2 | 12 | Bottom |
| U10 | 60 | Lower-middle |
| U25 | 150 | Upper-middle |
| U40 | 240 | Near top |
| U42 | 252 | Top of 42U rack |

Formula: `yaml_position = human_u * 6`. U1 is the bottom of the rack; heavy equipment belongs in low U numbers.

## Mechanical Safety And Weight

Place heavy equipment low to keep the rack stable and serviceable:

- Battery banks and external battery modules.
- UPS modules and large power modules.
- Large storage, NAS, SAN, and tape libraries.
- Blade chassis and dense compute.
- Heavy servers.

Preferred bottom-to-top order:

```text
Battery banks -> UPS/power modules -> heavy storage -> blade/dense compute -> standard servers -> light appliances -> patching/cable management/network gear -> intentional reserved space
```

Do not place UPS units or battery banks high in the rack unless there is explicit engineering justification, rack anchoring, manufacturer approval, and load calculation. When in doubt, move heavier equipment lower.

## Power Architecture

UPS equipment normally belongs at the bottom of the rack or in a dedicated power rack. Avoid placing UPS units above servers/storage, in the top third, or where battery replacement is unsafe.

For critical systems, prefer true A/B power:

```text
Server PSU 1 -> PDU A -> UPS/feed A
Server PSU 2 -> PDU B -> UPS/feed B
```

Do not claim redundancy if both paths share the same UPS, PDU, breaker, feed, rack, or other physical failure point. For single-PSU equipment, consider ATS, redundant upstream power, a separate backup strategy, or clear labeling as a single-power dependency. Prefer rear/side vertical 0U PDUs to avoid wasting front rack units.

Dedicated UPS/power rack order:

```text
Bottom: battery banks, external battery modules, heaviest UPS modules
Lower/middle: UPS main units, power modules
Middle: ATS, bypass units, power distribution modules
Upper/middle: energy monitoring, network management cards, lightweight controls
Top: cable management and intentional future expansion
```

## Cooling And Airflow

Every layout must state or assume an airflow model. Typical model:

```text
Front = cold aisle / intake
Rear  = hot aisle / exhaust
```

For each device, verify or flag airflow direction: front-to-back, back-to-front, side-to-side, port-side intake, or port-side exhaust. Network switches must match their fan-module airflow, not just cable convenience.

Avoid these thermal failures:

- Switch intake facing hot aisle or exhaust blowing into cold aisle.
- Mixed airflow devices without ducting or containment.
- Large unexplained empty rack gaps in layouts that claim reserved capacity or airflow control.
- Cable bundles blocking exhaust.

Do not auto-fill every unused U with a blank device. Use explicit gray blanking-panel devices only for physical panels, reserved expansion, future equipment space, or other documented placeholders. Use `category: blank`, preferably `colour: "#44475A"`.

Full-depth rack devices such as servers, storage, UPS, and firewalls should use `face: both` so the rear view is populated. Use `face: front` only for truly front-only/passive items such as patch panels or front-only blanks.

## Human Access

Distinguish interactive equipment from passive/remote equipment:

- Rack console or drawer KVM with keyboard/monitor: middle ergonomic section.
- KVM switch only: near servers or management cabling.
- Serial console server: near network management gear.
- Crash cart point: accessible and labeled.

Avoid placing interactive consoles at the very bottom, very top, or anywhere requiring unsafe posture. Ensure service clearance for batteries, PSUs, fans, disks, and cable work.

## Cable Management And Patching

Place patch panels, switches, and managers according to the real cable entry path.

If cabling enters from above:

```text
Top: fiber patch panels, copper patch panels, horizontal cable managers, ToR switches
```

If cabling enters from below:

```text
Bottom/low: patch panels, cable managers, network equipment when justified
```

Do not place Top-of-Rack switches at the bottom unless the cabling path or design explicitly justifies it. Separate cable paths:

```text
Power: rear/one side
Data: rear or opposite side
Fiber: protected path with bend-radius control
Copper: horizontal/vertical organizers
Console/OOB: separated and labeled
```

Avoid unnecessary power/data crossings. Use cable managers between dense patching zones and switches.

## Rack Type Patterns

Network rack typical order:

```text
Top: fiber/copper patch panels, cable managers
Upper-middle: distribution/access switches, WiFi controllers, NAC/RADIUS
Middle/lower-middle: core switches, routers, firewalls, load balancers
Middle ergonomic zone: interactive KVM console if present
Rear/side: PDU A/B, vertical cable managers
```

Server rack typical order:

```text
Top: patch panels, ToR switches, cable managers
Upper/middle: 1U/2U application servers, lightweight compute
Middle/lower: database, storage-heavy, and backup servers
Lower: NAS/SAN, tape library, blade chassis, local UPS only if required
Bottom: UPS, batteries, heaviest equipment
```

If centralized UPS exists in a power rack, do not add local rack UPS units unless there is a clear reason.

## Redundancy And Failure Domains

Group equipment by function, but do not create false high availability. Redundant primary/secondary devices should ideally be separated by rack, power feed, PDU, cable path, cooling dependency, and maintenance zone. A basic lab may share a rack, but do not mark the design highly available if HA members share the same physical failure domain.

## Blank Spaces And Expansion

Production diagrams may leave ordinary unused U space empty. Represent space with explicit blank or reserved devices only when it communicates a real physical panel, reserved capacity, future equipment, cable-management clearance, or airflow containment intent.

Blank device type example:

```yaml
- slug: 1u-blank
  model: Blank Panel
  u_height: 1
  is_full_depth: false
  colour: "#44475A"
  category: blank
```

Reserved space labels may be: blanking panel, reserved expansion, future server space, cable management, or airflow containment.

## Validation Checklist

Before finalizing a rack diagram, confirm:

```text
[ ] Heavy devices are low; UPS and batteries are bottom/dedicated power rack.
[ ] The rack is stable and not top-heavy.
[ ] A/B power paths, if claimed, do not share a failure point.
[ ] Single-power dependencies are labeled or mitigated.
[ ] PDUs are logical, preferably rear/side 0U.
[ ] Airflow model is clear; switch intake/exhaust orientation is valid.
[ ] Intentional reserved spaces use explicit gray blanks/placeholders; ordinary unused U space is not auto-filled.
[ ] Full-depth devices use face: both when rear rendering is required.
[ ] Patch panels and ToR switches follow the cable entry path.
[ ] Power, data, fiber, and OOB paths are separated and managed.
[ ] Interactive consoles are at ergonomic height.
[ ] Service clearance supports batteries, PSUs, fans, disks, and cabling.
[ ] Redundant systems are separated by real failure domains or flagged.
```

If any answer is no, revise the layout before outputting the final diagram.

## Output Requirements

Generated rack layouts should include or preserve enough data to explain:

1. Rack name and purpose.
2. Front and rear view if relevant.
3. Rack unit numbers.
4. Equipment name and role.
5. Power feed: A, B, or single.
6. Approximate weight class: light, medium, heavy.
7. Airflow direction.
8. Maintenance access notes.
9. Warnings for questionable placements.

Use warnings for violations or unknowns:

```text
WARNING: UPS is placed too high. Move to lower rack units.
WARNING: KVM console is too low/high for comfortable human access.
WARNING: Switch airflow direction is unknown. Verify fan module orientation.
WARNING: Redundant devices share the same physical failure domain.
WARNING: Reserved or airflow-critical empty rack spaces should be documented with blanking panels/placeholders.
WARNING: Full-depth devices should use face: both when rear rendering is required.
```

## Decision Rules

```text
If it is heavy or has batteries -> move it down.
If a human operates it often -> place it at ergonomic height.
If it needs many network cables -> place it near patching/switching.
If it generates heat -> preserve the correct airflow path.
If it is redundant -> avoid shared failure domains.
If airflow, cable entry, or power topology is unknown -> state the assumption or warn; do not claim correctness.
If it is full-depth -> use face: both unless truly front-only.
If a rack unit is intentionally reserved or physically blanked -> add a gray `category: blank` device; otherwise leave ordinary unused space empty.
```

## Bad Patterns To Avoid

- UPS units or battery banks in the top third or above servers/storage.
- KVM console at U1/U2 or the very top.
- ToR switches far from cable entry without justification.
- Patch panels far from cable entry.
- HA/core primary and secondary sharing all dependencies while labeled highly available.
- Explicit gray blanks used as automatic filler with no reserved, physical, or documentation purpose.
- Full-depth servers, storage, UPS, or firewalls using `face: front` and disappearing from rear view.
- Power and data cables mixed without organization.
- Switches installed against required airflow direction.
- Diagrams that show placement but ignore power, airflow, cabling, and maintenance.

Strong rule for university/datacenter layouts: never place UPS or battery banks high for visual balance. Treat UPS and batteries as heavy infrastructure, not ordinary IT appliances.
