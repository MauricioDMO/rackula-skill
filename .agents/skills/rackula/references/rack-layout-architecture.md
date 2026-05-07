# Rack Layout Architecture Reference

Rules and guidelines for correct rack equipment placement in Rackula diagrams. Use this reference when the user asks for a realistic rack layout, datacenter/server-room architecture, physical placement advice, or a generated rack diagram that should be operationally credible.

## Core Reasoning Order

Before assigning rack units, reason through the layout in this order:

1. Mechanical safety and weight distribution.
2. Power architecture and redundancy.
3. Cooling and airflow.
4. Network/data cabling paths.
5. Human operation and maintenance access.
6. Logical grouping and failure-domain separation.
7. Expansion space and documentation clarity.

A rack layout is invalid if it looks organized but violates safety, power, cooling, or maintenance principles. Do not optimize the drawing before validating the architecture.

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

U1 is at the bottom of the rack. Heavy equipment goes in low U numbers.

Formula: `yaml_position = human_u * 6`.

## 1. Mechanical Safety And Weight Distribution

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

## 2. UPS And Power Placement

UPS equipment should normally be placed at the bottom of the rack or in a dedicated power rack.

Avoid placing UPS units:

- Above servers.
- Above storage.
- In the top third of the rack.
- Where battery replacement becomes unsafe or difficult.

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

## 3. KVM, Console, And Human Access

Distinguish between:

- A KVM switch without screen.
- A rack console with keyboard/monitor.
- A serial console server.
- A crash cart connection point.

A rack console with keyboard and monitor should be placed at a comfortable human operating height, usually around the middle of the rack.

Avoid placing an interactive KVM console at the very bottom or very top of the rack.

Use this placement logic:

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

## 4. Cooling And Airflow

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

All unused rack spaces should be covered with explicit blanking-panel devices unless intentionally reserved and documented. Use gray blanks (`category: blank`, preferably `colour: "#44475A"`) so airflow containment is visible in both the YAML and rendered rack.

Use `face: both` for rack-mounted servers, storage, UPS, firewalls, and other full-depth devices that should appear from the rear. Otherwise the rear view can incorrectly omit installed equipment. Use `face: front` only for truly front-only/passive items such as patch panels or front-only blanks.

## 5. Cable Management And Patching

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

Avoid crossing power and data cables unnecessarily. Use cable managers between dense patching zones and switches.

## 6. Network Rack Placement

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

For redundant core equipment, consider whether both primary and secondary devices should be in the same rack. In a basic lab diagram this may be acceptable, but in a stronger architecture, redundant devices should be separated by rack, power feed, PDU, cable path, cooling dependency, and maintenance zone.

Do not mark a design as highly available if both HA members share the same physical failure domain.

## 7. Server Rack Placement

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

Do not place a local UPS above compute, storage, or blade chassis. If a rack uses centralized UPS from a power rack, avoid duplicating local UPS units unless there is a clear reason.

## 8. Energy Rack Placement

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

## 9. Blank Spaces And Expansion

Do not leave empty rack units visually open in production diagrams.

When generating YAML, represent unused units with explicit blank devices. Do not rely on empty space to imply blanking panels.

Blank device type rule:

```yaml
- slug: 1u-blank
  model: Blank Panel
  u_height: 1
  is_full_depth: false
  colour: "#44475A"
  category: blank
```

If a rack has unused space, label it as one of:

- Blanking panel.
- Reserved expansion.
- Future server space.
- Cable management.
- Airflow containment.

Empty space must not imply an open airflow gap. Blank panels should always be gray; prefer `#44475A`.

## 10. Required Validation Checklist

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
[ ] Are blanking panels represented as explicit gray `category: blank` devices?
[ ] Are full-depth servers/storage/UPS devices mounted with `face: both` so the rear view is populated?
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

## 11. Output Requirements For Generated Rack Diagrams

When generating a rack layout, include or preserve enough data to explain:

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
WARNING: Full-depth devices should use face: both when rear rendering is required.
```

## 12. Decision Rules

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
If it is a full-depth rack device -> use face: both unless it is truly front-only.
If a rack unit is unused -> add a gray category: blank device.
```

## 13. Bad Layout Patterns To Avoid

Avoid these common mistakes:

- UPS units in the top third of the rack.
- Battery banks above servers.
- KVM console at U1/U2.
- ToR switch at the bottom when cable trays enter from above.
- Patch panels far from cable entry.
- Network core primary and secondary sharing all the same dependencies.
- Open empty rack units without blanking panels.
- Blank rack units implied by whitespace instead of explicit gray `category: blank` devices.
- Full-depth servers, storage, UPS, or firewalls using `face: front` and disappearing from the rear view.
- Power and data cables mixed without organization.
- Switches installed against their required airflow direction.
- Diagrams that show equipment placement but ignore power, airflow, and maintenance.

## 14. Preferred Reasoning Summary

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

Strong rule for university/datacenter layouts: never place UPS or battery banks in high rack units for visual balance. UPS and batteries must be treated as heavy infrastructure, not as ordinary IT appliances.
