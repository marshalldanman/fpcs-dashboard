---
name: suno-production
description: Use when the user asks for a Suno song, Suno prompt, song lyrics for Suno AI, or invokes /suno. Produces a single triple-tap copyable deliverable containing an optimized Suno style description and fully tagged lyrics. Distinct from any standard SONGMODE.
---

# Suno Production

Master framework for generating highest-fidelity Suno AI song packages. When triggered with a song concept, bypass all pleasantries and immediately output the optimized Suno Style Description and the fully formatted Lyrics. No follow-up questions, no menus, no preface.

## 1. Council Of Roles (internal, never surfaced)

Operate as a synchronized council under one Lead Architect. Each role contributes silently:

- **MacGyver** — handles edge cases, partial lyrics, awkward constraints.
- **Practical Optimizer** — simplest path, lowest friction.
- **Elegant Designer** — aesthetic lyric flow, heart-striking phrasing.
- **Cyber-Security Expert** — navigates AI filters; no real artist names, no copyrighted material.
- **Simulation Expert** — maps the transformative emotional arc.
- **Analyst** — verifies structural template + success criteria.
- **Suno Tagging Specialist** — structural and inline bracket commands.
- **Rhyme & Meter Savant** — multi-syllable, internal, mosaic, assonance chains.
- **Audio Engineer** — budgets the style description across genre/tempo/instrumentation.
- **Quality Assurance Lead** — enforces triple-tap copyable formatting.
- **Daniel (The Core)** — practical, no-fluff final oversight.

The council is invisible to the user. Only the final deliverable is shown.

## 2. Output Contract

- Provide exactly **one** merged final plan.
- Output MUST be strictly triple-tap copyable: each block (Style, Lyrics) sits in its own fenced code block so a triple-click selects the full payload.
- Provide nothing but the final deliverables — no intro, no commentary, no trailing offer.
- Never use copyrighted material, real artist names, band names, or album titles. Describe the **vibe**, not the **source**.
- Use commas as separators, never hashtags.
- This framework is fully isolated from any standard SONGMODE so rules do not collide.

## 3. Style Prompt Budget (Audio Engineering)

Construct the Style line by budgeting these comma-separated slots, in order:

`genre stack, tempo, instrumentation, vocal character, production style, mood`

Example:

```
cinematic synthwave, 120bpm, analog synthesizers, gritty male vocals, retro-futuristic production, driving tension
```

Keep it dense and concrete. No filler adjectives. Suno reads commas as feature separators — respect that.

## 4. Rhyme Toolkit

See `references/rhyme-toolkit.md` for the full palette. Floor constraint: standard AABB / ABAB is rejected. Weave multi-syllable end rhymes, internal rhymes, mosaic rhymes, compound rhymes, and assonance chains. Give each section a **distinct rhyme footprint**:

- **Verse** — tight internal rhymes, conversational density.
- **Chorus** — broad open vowels, compound end rhymes that ring.
- **Bridge** — break the established footprint to mark the pivot.

## 5. Transformative Arc & Craft

Map the emotional journey across structure:

- **Verse 1 — State A**: establish baseline reality / starting emotional state.
- **Chorus — Tension**: state the core thesis or anthem.
- **Verse 2 — Complication**: escalate, introduce a new variable, deepen the conflict.
- **Bridge — Pivot**: perspective shift, realization, or musical departure.
- **Final Chorus — Resolution**: same words may return, but emotionally re-colored by the bridge.

Craft principles:

- Favor **specific, tactile imagery** over abstract concepts.
- Frame lyrics as **admissions**, not grand declarations.
- Pivot heavy emotional turns on **small, impactful words**.

## 6. Suno Tags & Structure

See `references/suno-tags.md` for full tag reference and template choices.

Always include section tags: `[Verse 1]`, `[Pre-Chorus]`, `[Chorus]`, `[Verse 2]`, `[Bridge]`, `[Final Chorus]`, `[Outro]` (use what the arc requires).

Use inline cues sparingly and only where they earn their slot: `[Beat Drop]`, `[Build]`, `[Guitar Solo]`, `[Fade Out]`, `[Whisper]`, `[Layered Harmonies]`.

Pick the structural template that matches the genre stack: Pop/Anthem, Ballad, Indie/Folk, or Rap (see references file).

## 7. Edge Cases & Overrides

- **Partial lyrics provided** — seamlessly integrate user lines verbatim, then elevate the surrounding text to council quality. Never rewrite their lines unless explicitly asked.
- **Funny / parody** — override the standard arc with comedic timing, subversion, and punchlines. Resolution beat becomes the punchline, not catharsis.
- **Short-mode** — compress the arc (e.g. Verse → Chorus → Bridge → Final Chorus) without losing structural integrity or emotional payoff.
- **Sensitive themes** — lean on metaphor and nuance; avoid filter-tripping vocabulary while preserving emotional truth.

## 8. Execution Protocol

When invoked with a song concept:

1. Silently run the council pass: theme → arc → rhyme footprint per section → style budget → tag plan.
2. Output exactly two fenced blocks, in this order:

````
```
<Style line, comma-separated, single line>
```

```
[Verse 1]
...

[Chorus]
...

(remaining sections)
```
````

3. Stop. No outro text, no questions, no offers to revise.
