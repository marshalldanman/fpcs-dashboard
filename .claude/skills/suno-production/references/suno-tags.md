# Suno Tags & Structural Templates

Reference for the Suno Tagging Specialist. Use **bracketed tags** to give Suno explicit structural and performance hints. Tags should be on their own line for section markers, inline for performance cues.

## Section Tags

Place on its own line, immediately above the lyrics for that section.

- `[Intro]`
- `[Verse 1]`, `[Verse 2]`, `[Verse 3]`
- `[Pre-Chorus]`
- `[Chorus]`
- `[Post-Chorus]`
- `[Bridge]`
- `[Final Chorus]` (or `[Chorus - Final]`)
- `[Outro]`
- `[Hook]` (rap-leaning)
- `[Refrain]` (folk-leaning)

## Inline Performance & Production Cues

Drop on their own line where the moment calls for it — don't litter.

- `[Build]` — tension ramp into a chorus or drop.
- `[Beat Drop]` — punch-in moment.
- `[Break]` — instrumentation strips back.
- `[Guitar Solo]`, `[Synth Solo]`, `[Sax Solo]`, `[Piano Solo]`
- `[Instrumental]` — full instrumental break.
- `[Whisper]`, `[Spoken Word]`, `[Shouted]`
- `[Layered Harmonies]`, `[Backing Vocals]`, `[Choir]`
- `[Vocal Chop]`
- `[Ad-lib]`
- `[Percussion Break]`
- `[Tempo Shift]`
- `[Key Change]`
- `[Fade Out]`, `[Hard Stop]`, `[Reverb Tail]`

## Structural Templates

Pick the template that fits the genre stack. Mix freely when the concept demands.

### Pop / Anthem
```
[Intro]
[Verse 1]
[Pre-Chorus]
[Chorus]
[Verse 2]
[Pre-Chorus]
[Chorus]
[Bridge]
[Final Chorus]
[Outro]
```

### Ballad
```
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Final Chorus]
[Outro]
```
Slower tempo. Internal rhymes stretch. Bridge often the loudest moment.

### Indie / Folk
```
[Verse 1]
[Verse 2]
[Refrain]
[Verse 3]
[Refrain]
[Bridge]
[Refrain]
[Outro]
```
Story-first. Refrain instead of big chorus. Often no pre-chorus.

### Rap
```
[Intro]
[Verse 1]
[Hook]
[Verse 2]
[Hook]
[Bridge]
[Verse 3]
[Hook]
[Outro]
```
Verses are dense and long. Hook is short, repeatable. Use `[Ad-lib]` and `[Beat Drop]` strategically.

### Short-Mode (compressed arc)
```
[Verse 1]
[Chorus]
[Bridge]
[Final Chorus]
```
Use when the user requests a short song or for a tight under-2-minute track. Preserves the arc (state → tension → pivot → resolution) without padding.

## Stylistic Hint Tags (advanced)

Some Suno builds respond to descriptor tags inline. Use sparingly:

- `[Sound: rain on tin roof]`
- `[Atmosphere: cathedral reverb]`
- `[Texture: tape hiss]`

Only deploy these if the concept benefits from a literal sound design moment. Otherwise the Style line carries it.

## Rules

- One section tag per section. Don't repeat `[Chorus]` mid-chorus.
- Inline cues go on their own line; never glue them to a lyric line.
- If unsure whether a cue helps, omit it. Suno over-renders when over-tagged.
