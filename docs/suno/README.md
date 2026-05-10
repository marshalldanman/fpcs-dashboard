# Suno Channel — Canonical Registry

> **Status:** Single source of truth for all Suno-related work in this repo.
> **Long-term home:** `justout-aimusic/` repo @ `aimusic.justout.today` (per `docs/specs/JUSTOUT_HUB_SPEC.md` § 2.2). This folder is the **interim canonical channel** while that subdomain is unbuilt. See `ROADMAP.md` for the migration path.

Anything Suno-shaped — generation framework, research, conversations, ready-to-paste prompts, the radio widget — has a designated home below. If you find Suno-related material somewhere not on this map, it belongs here. Open a PR to consolidate.

---

## 1. The Skill (the brain)

`.claude/skills/suno-production/`

Triggered Claude Code skill that produces a triple-tap copyable Suno style + lyrics package. Council-of-roles approach, distinct rhyme footprints per section, transformative arc, filter-safe (no real artist names).

| File | Role |
|---|---|
| `SKILL.md` | Skill entrypoint. Loaded automatically by Claude Code when Suno-shaped requests appear. |
| `references/rhyme-toolkit.md` | Multi-syllable, internal, mosaic, compound, assonance — anti-AABB floor constraint. |
| `references/suno-tags.md` | `[Verse 1]` / `[Chorus]` etc., inline cues, structural templates per genre. |
| `references/neuro-acoustic-matrix.md` | **Therapeutic Mode override** — engaged only on healing/frequency/entrainment requests. |

**Invocation:** `/suno-production <concept>`, or just describe what you want in natural language ("write me a Suno song about…"). The skill auto-engages.

**Cross-device access:** This skill only loads inside a Claude Code session in this repo. For phone/casual use, paste `SKILL.md` content into a Claude.ai Project (see `conversations/README.md`).

---

## 2. The Widget (the player)

`js/suno-radio.js` + `css/suno-radio.css`

Floating bottom-right Suno-channel player loaded across **all 10 pages** of the dashboard. Hardcoded to channel `DanM` with 8 default tracks. Pure client-side, localStorage-backed.

This is the **delivery surface** users experience on https://dashboard.justout.today. The skill produces songs *for* Suno; the widget *plays back* completed Suno tracks.

---

## 3. Research (the science)

`docs/suno/research/`

| File | Source | Use |
|---|---|---|
| `gemini-neuro-acoustic-matrix.md` | Gemini Deep Research, 2026-04-25 | Underpins Therapeutic Mode in the skill. Read for citations and depth. |

The skill's `references/neuro-acoustic-matrix.md` is the **operating distillation** of this research. Updates to the research should propagate into the skill reference when actionable.

---

## 4. Conversations (the inbox)

`docs/suno/conversations/`

Drop zone for Claude.ai chat / Project exports about Suno. Anything you want preserved or folded into the skill goes here first. See `conversations/README.md` for the export-and-paste workflow.

I (Claude in this repo) **cannot read your live Claude.ai conversations** — they live on a different surface and there's no API access from here. You have to paste them in.

---

## 5. Prompts (ready-to-paste)

`docs/suno/prompts/`

| File | What it is |
|---|---|
| `vagal-lydian-entrainment.md` | Gemini's master example. Full Style + Lyrics for a Vagal-Lydian therapeutic track. Triple-tap copyable. |

When you have a working prompt that produced a great Suno track, save it here as `<theme>-<date>.md` so it can be reused or remixed.

---

## 6. The Map

```
fpcs-dashboard/
├── .claude/skills/suno-production/   ← THE SKILL (lives here, can't move)
│   ├── SKILL.md
│   └── references/
│       ├── rhyme-toolkit.md
│       ├── suno-tags.md
│       └── neuro-acoustic-matrix.md
│
├── js/suno-radio.js                  ← THE WIDGET (loaded by all dashboard pages)
├── css/suno-radio.css
│
└── docs/suno/                        ← THE CHANNEL (this folder)
    ├── README.md                     ← you are here
    ├── ROADMAP.md
    ├── research/
    │   └── gemini-neuro-acoustic-matrix.md
    ├── conversations/
    │   └── README.md
    └── prompts/
        └── vagal-lydian-entrainment.md
```

---

## Operating Rule

**One channel. One folder.** Anything Suno-related that lands in this repo gets indexed from here or moved here. If you can't find a sensible home for a new Suno artifact under this README, the README is wrong — update it.
