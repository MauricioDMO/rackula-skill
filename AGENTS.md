# Repository Instructions

## Scope

- This repo is an OpenCode skill workspace for the `rackula` skill, not a Bun app; follow `package.json` and use `pnpm@10.33.2` here.
- The skill source is `.agents/skills/rackula-skill/SKILL.md`; update it when changing Rackula behavior or schema guidance.
- Eval prompts live in `.agents/skills/rackula-skill/evals/evals.json`; keep them aligned with any schema or workflow changes in the skill.

## Commands

- Install deps only if needed: `pnpm install`.
- Package all Rackula YAML fixtures: `pnpm run zip-yaml`.
- Package custom folders: `pnpm run zip-yaml -- ./input ./output`.
- There is no test/lint/typecheck script in `package.json`; use `pnpm run zip-yaml` as the focused verification for YAML packaging changes.

## Rackula Layout Workflow

- Create or edit generated layouts under `input/` with `*.rackula.yaml` filenames.
- Include `metadata.id` and `metadata.name`; `scripts/zip-yaml.js` fails without both and uses them for `output/<name>-<id>.Rackula.zip`.
- After creating or updating input YAML for an importable artifact, run `pnpm run zip-yaml` and report both the YAML path and ZIP path.
- The ZIP script stores the YAML file at the ZIP root; it does not add assets or nested folders.

## Rackula YAML Rules Agents Commonly Miss

- Generate modern files with top-level `racks: [...]`; `rack:` is legacy input only.
- Rack-level device `position` uses internal `1/6U` units: U25 is `position: 150`; never use `position: 0` except container children.
- Keep top-level order: `metadata`, `version`, `name`, `racks`, `device_types`, `settings`, then optional `rack_groups`, `connections`, `cables`.
- Always define every placed `device_type` slug in `device_types`; keep slugs unique and kebab-case.
- Use `u_height >= 0.5`, hex colors as `#RRGGBB`, rack widths `10`, `19`, `21`, or `23`, and categories from the skill including `chassis`.
- Use `connections` for new port-to-port links; use deprecated `cables` only when preserving an existing cable-based file.
- For blade/container layouts, prefer `slots` on the container device type plus child placements with `container_id` and `slot_id`; child `position: 0` is valid only in that model.
- Quote numeric-looking `device_bays[].position` values, e.g. `position: "1"`.
- Do not use `management` as an interface `type`; use accepted types such as `1000base-t`, `10gbase-x-sfpp`, `console`, `virtual`, or `other`.
- Preserve unknown fields when editing legacy Rackula YAML; the app parser is lenient and may round-trip data this repo does not document.
