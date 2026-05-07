# Collision Model

How Rackula determines if two devices conflict in the same rack.

## Rack-Level Collision

Two rack-level devices collide when:
1. Their vertical ranges overlap
2. Their faces collide
3. Their slot positions overlap

| Face A | Face B | Collision? |
|--------|--------|------------|
| `both` | any | yes |
| `front` | `front` | yes |
| `rear` | `rear` | yes |
| `front` | `rear` | no |

`face` is authoritative for collision. `is_full_depth` only influences default placement face; a user can override `face`.

## Half-Width Devices

- `slot_width: 1` device types are half-width
- Use placement `slot_position: left` or `right`
- Full-width devices should use or imply `slot_position: full`
- Left and right half-width placements can share the same U and face

## Container Collision

- Rack-level devices collide only with other rack-level devices
- Children with `container_id` collide only with siblings in the same container
- Children in different containers do not collide