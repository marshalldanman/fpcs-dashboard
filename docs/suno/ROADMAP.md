# Suno Channel Roadmap

This folder is **interim**. The end-state per `docs/specs/JUSTOUT_HUB_SPEC.md` § 2.2 is a dedicated repo `justout-aimusic/` deployed at `aimusic.justout.today` (pink-crystal orb on the constellation hub).

## Why interim
- `fpcs-dashboard` is "Tax HQ" — Suno belongs in its own channel per the spec.
- The radio widget (`js/suno-radio.js`) was embedded across all dashboard pages for early access while the AI Music subdomain doesn't exist yet.
- The skill (`.claude/skills/suno-production/`) was added here because this is the active branch and the active workspace.

## Migration path

When `justout-aimusic` repo is created:

1. **Move `docs/suno/` → `justout-aimusic/docs/`** (or to root as `README.md` + subfolders). Whole tree is portable.
2. **Move `.claude/skills/suno-production/` → `justout-aimusic/.claude/skills/suno-production/`.** Skill is self-contained.
3. **Move `js/suno-radio.js` + `css/suno-radio.css` → `justout-aimusic/`.** Update the dashboard pages to either:
   - **Option A (preferred):** drop the widget from `fpcs-dashboard` entirely. Tax HQ shouldn't carry the music player. The orb-hub provides cross-channel navigation.
   - **Option B (fallback):** keep loading the widget from the new subdomain via `<script src="https://aimusic.justout.today/suno-radio.js"></script>` — works only if CORS allows.
4. **Delete from `fpcs-dashboard`:** all 10 `<link>`/`<script>` references to suno-radio in the HTML pages, plus the files themselves.
5. **Update `docs/specs/JUSTOUT_HUB_SPEC.md` § 2.2** to flip AI Music from "Phase 1 Planned" to "Live."
6. **Update this `ROADMAP.md`** to mark the migration complete and remove the "interim" framing.

## Pre-migration TODO (while still here)

- Keep all new Suno artifacts under `docs/suno/`, `.claude/skills/suno-production/`, or `js/css` (the widget). Do not scatter.
- Tag any new file with a header pointer to `docs/suno/README.md` so future-you (or the migration script) finds it.
- Don't add `fpcs-dashboard`–specific dependencies into the skill or research files. Keep them framework/repo agnostic.

## Out of scope here
- Spinning up the `justout-aimusic` repo.
- Setting up `aimusic.justout.today` CNAME / Pages.
- Building the orb design + hub constellation.

Those are tracked in `docs/specs/JUSTOUT_HUB_SPEC.md` § 6.
