# Neuro-Acoustic Matrix (Therapeutic Mode)

**Engaged only via the Neuro-Acoustic / Therapeutic edge case in `SKILL.md` § 7.** Do not apply to ordinary song requests.

Distilled from `docs/suno/research/gemini-neuro-acoustic-matrix.md`. Read that file when you need depth or citations; this file is the operating reference.

---

## When to engage

Trigger words / intents that flip the skill into Neuro-Acoustic Mode:

- healing, therapeutic, meditation, sleep, relaxation, anxiety relief, stress relief
- frequency-targeted, binaural, isochronic, brainwave entrainment, Solfeggio
- 432Hz, 528Hz, 396Hz, 639Hz, 741Hz, 852Hz, 963Hz, 174Hz
- vagal / vagus stimulation, parasympathetic, cortisol reduction
- frisson engineering, chills, dopamine surge
- gamma / alpha / theta / delta entrainment
- "neuro-acoustic," "psychoacoustic," "biofield," "Tesla 369"

If only some of these appear inside an otherwise normal song request (e.g. "a sad love song with 432Hz tuning"), apply the **frequency/tuning hint** but keep the standard arc and craft. Full mode-override is reserved for tracks whose *purpose* is biological modulation, not narrative.

---

## The Four-Layer Construction

Build the Style line in this strict order. Top-loaded technical anchors prevent the model from collapsing into pop defaults.

```
Layer 1 — Carrier:       core acoustic identity, tempo, tuning, mode, intonation, exclusions
Layer 2 — Entrainment:   bass-register target Hz, overtone target Hz, isochronic pulse Hz
Layer 3 — Trajectory:    structural meta-tags inside the lyrics box (dynamic curve)
Layer 4 — Environment:   spatial mix, reverb, density, dynamic range
```

Layers 1+2+4 land in the **Style** block. Layer 3 lives in the **Lyrics** block.

---

## Frequency → Outcome Quick Table

| Hz | Family | Primary effect | Place it where |
|---|---|---|---|
| 30 | Sub-bass | Vagal nerve stimulation, parasympathetic dominance, lower HR | Continuous sub-bass bed |
| 40 | Gamma isochronic | Memory / cognitive enhancement; GENUS protocol | Embedded rhythmic pulse, low-volume pad |
| 174 | Solfeggio | Grounding, pain relief, safety | Foundational drone tone |
| 396 | Solfeggio | Release of fear / guilt | Bass-register sustain |
| 417 | Solfeggio | Clearing trauma, facilitating change | Mid drone |
| 432 | Tuning | Lower HR (-4.79bpm), alpha boost, "natural" feel | Tuning reference for the whole track |
| 528 | Solfeggio | Cortisol ↓, oxytocin ↑, ANS balance, "transformation" | Crystal-bowl / sine overtones in the high-mid |
| 639 | Solfeggio | Connection, mood elevation | Harmonic pad |
| 741 | Solfeggio | Mental clarity, problem-solving | Mid-high lead |
| 852 | Solfeggio | Spiritual order, alignment | High shimmer |
| 963 | Solfeggio | Pineal activation, transcendence | Top-end bell tone |

Default tuning when therapeutic is requested but no Hz is specified: **A=432Hz**. Default isochronic: **40Hz Gamma**. Default sub-bass: **30Hz**.

---

## Mode → Feel Quick Table

AI defaults to Ionian/Aeolian. Override to escape the Pop Gravity Well.

| Mode | Feel | Use for |
|---|---|---|
| Lydian | Dreamy, ethereal, hopeful, cosmic | Healing, transcendence, spiritual seeking |
| Dorian | Melancholic-but-optimistic, sophisticated | Reflective meditation, balanced rest |
| Phrygian | Exotic, dark, introspective | Shadow work, deep emotional processing |
| Pentatonic | Universal, grounded, ancient | Grief work, cultural-rooted healing |
| Mixolydian | Warm, slightly bittersweet, communal | Connection, gentle social warmth |

---

## Brainwave Targeting

| Band | Hz | State | Pulse rate to embed |
|---|---|---|---|
| Delta | 1–4 | Deep sleep, restoration | 2–3Hz isochronic |
| Theta | 4–8 | Deep meditation, creativity | 6Hz |
| Alpha | 8–13 | Relaxed alertness, internal focus | 10Hz |
| Beta | 14–30 | Active concentration | 18–22Hz |
| Gamma | 30–100 | Peak cognition, memory | **40Hz** (GENUS-validated default) |

---

## Frisson Engineering Recipe

Mathematical trigger for aesthetic chills (~2s lag from acoustic event to skin response):

1. Drop low-frequency masking elements for **exactly one bar** → acoustic vacuum.
2. Hit an **unpredicted modal modulation** (e.g. shift Aeolian → Lydian).
3. **Massive instantaneous expansion** of stereo width + high-frequency saturation.
4. Re-introduce the bass on the next downbeat.

Encode this as inline tags at the frisson moment:

```
[Acoustic Vacuum, drop sub-bass, 1 bar]
[Modal Shift to Lydian]
[Stereo Bloom, high-frequency expansion]
[Sub-bass returns, downbeat]
```

---

## Anti-Pop Exclusion List

Always include in the Style line when in Neuro-Acoustic Mode:

```
Exclude: pop structure, 4/4 drums, 440Hz, aggressive transients, autotune, synthetic vocal, harsh percussion, EDM drops, trap hi-hats, modern compression sidechain
```

This is the explicit countermeasure to the Pop Gravity Well documented in Gemini's research.

---

## Style Line Template (Neuro-Acoustic)

Fill the slots; preserve the order:

```
<core acoustic identity>, <BPM 50-80>, A=<tuning>Hz <natural|standard> tuning, <Mode> Mode, <intonation>. Continuous sub-bass at <bass Hz>Hz. <overtone source> tuned to <overtone Hz>Hz. <pulse rate>Hz <band> isochronic pulse embedded in <element>. <production texture>, <dynamic range>, <spatial>, <reverb>. Exclude: pop structure, 4/4 drums, <tuning to exclude>Hz, aggressive transients, autotune, harsh percussion.
```

---

## Lyrics Trajectory Template (Neuro-Acoustic)

Use bracket tags to drive the autonomic curve. Lines should be sparse, breath-paced, and avoid narrative complication.

```
[Intro: Minimalist <bass Hz>Hz rumble, dry spatial width, zero reverb]

[Verse: Intimate, breathy, close-mic, slow deliberate phrasing]
<3–5 short lines, present tense, body-based imagery>

[Pre-Chorus: Build, stereo width opens, vocal layering begins]
<2 lines of arrival>

[Chorus: Acoustic Vacuum 1 bar — Modal Shift to Lydian — Stereo Bloom]
<3 lines, open vowels, repeating phrase>

[Bridge: Solfeggio overtone bath at <overtone Hz>Hz, vocal recedes]
<spoken-word or wordless>

[Final Chorus: Same words, mix density doubled, cathedral reverb tail]

[Outro: Gradual low-pass, slow fade to <bass Hz>Hz baseline, return to parasympathetic baseline]
```

---

## Master Example (Vagal-Lydian Entrainment Protocol)

Pre-built reference example. See `docs/suno/prompts/vagal-lydian-entrainment.md` for the ready-to-paste version.

This is the canonical illustration of all four layers stacked correctly. When the user asks for a "neuro-acoustic example" or "show me the full protocol," output that file's content using the standard two-fenced-block contract.
