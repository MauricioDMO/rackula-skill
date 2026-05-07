# Rack Layout Architecture Reference

Rules and guidelines for correct rack equipment placement in datacenter diagrams.

## Core Reasoning Order

1. Mechanical safety and weight distribution.
2. Power architecture and redundancy.
3. Cooling and airflow.
4. Network/data cabling paths.
5. Human operation and maintenance access.
6. Logical grouping and failure-domain separation.
7. Expansion space and documentation clarity.

A rack layout is invalid if it looks organized but violates safety, power, cooling, or maintenance principles.

## Position System

Modern Rackula v0.7.0+ uses internal units where `6 units = 1U`.

| Human U | YAML `position` |
|---------|-----------------|
| U1 | 6 |
| U2 | 12 |
| U25 | 150 |

U1 is at the bottom of the rack; U42 is at the top. Heavy equipment goes in low U numbers.

**Formula:** `yaml_position = human_u * 6`

## 1. Mechanical Safety and Weight Distribution

Heavy equipment must be placed in the lower part of the rack.

Place near the bottom:
- UPS units.
- External battery packs.
- Large storage systems.
- NAS/SAN equipment.
- Blade chassis.
- Heavy servers.
- Large power modules.

Preferred bottom-up order:
```text
Bottom: battery banks, UPS modules, heavy storage, blade chassis
Middle: standard servers, lighter appliances
Top: patch panels, cable managers, lightweight network gear
```

## 2. UPS and Power Placement

- Place UPS at the bottom or in a dedicated power rack.
- Never place UPS above servers, storage, or in the top third of a rack.
- Use A/B power design for critical systems.
- Do not claim redundancy if both paths share the same UPS, PDU, or breaker.
- Use vertical 0U PDUs at rear/side to save front rack units.

## 3. KVM and Human Access

- Rack consoles with keyboard/monitor: place at ergonomic height (middle of rack).
- KVM switches without display: place near server management cabling.
- Serial console servers: place near network management gear.
- Never place an interactive KVM console at U1/U2 or at the very top.

## 4. Cooling and Airflow

Assume front = cold aisle (intake), rear = hot aisle (exhaust).

- Verify or assume airflow direction for each device.
- Orient switches according to their fan modules, not cable convenience.
- Fill all empty rack spaces with blanking panels.
- Keep cable bundles away from fan exhaust paths.

## 5. Cable Management

- Place patch panels near the real cable entry path (top or bottom).
- Separate power and data cables.
- Use cable managers between dense patching zones and switches.

## 6. Network Rack Placement

```text
Top: fiber/copper patch panels, cable managers
Upper-middle: distribution switches, WiFi controllers, NAC
Middle: core switches, routers, firewalls, load balancers
Ergonomic zone: KVM console (if interactive)
Rear/side: PDUs A/B, vertical cable managers
```

Separate redundant devices across real failure domains (different rack, power feed, PDU, cable path).

## 7. Server Rack Placement

```text
Top: patch panels, ToR switches, cable managers
Upper/middle: 1U/2U application servers
Middle/lower: database servers, storage-heavy servers, backup servers
Lower: NAS/SAN, tape library, blade chassis, local UPS
Bottom: UPS / battery / heaviest equipment
```

Never place a local UPS above compute, storage, or blade chassis.

## 8. Energy Rack Placement

```text
Bottom: battery banks, heaviest UPS modules
Lower/middle: UPS main units, power modules
Middle: ATS, bypass units, power distribution modules
Upper/middle: energy monitoring, network management cards
Top: cable management, blanking panels, future expansion
```

## 9. Bad Layout Patterns

- UPS units in the top third of the rack.
- Battery banks above servers.
- KVM console at U1/U2.
- ToR switch at the bottom when cable trays enter from above.
- Patch panels far from cable entry.
- Redundant devices sharing all same dependencies.
- Open empty rack units without blanking panels.
- Switches installed against required airflow direction.

## Decision Rules

- If it is heavy -> move it down.
- If it has batteries -> move it down.
- If a human operates it often -> move it to ergonomic height.
- If it needs many network cables -> move it near patching/switching.
- If it generates heat -> preserve correct airflow path.
- If it is redundant -> avoid sharing the same failure domain.
- If airflow is unknown -> flag it instead of assuming it is correct.
- If power topology is unknown -> do not claim A/B redundancy.