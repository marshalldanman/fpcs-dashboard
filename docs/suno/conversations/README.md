# Conversations Drop Zone

Place exported Claude.ai chats / Project conversations about Suno here so they survive the session and can be folded into the skill or research.

## Why this exists

Claude (running inside Claude Code on this repo) **cannot read your live Claude.ai conversations or Projects** — they're a separate surface with no API access from here. If a conversation contains:

- Refinements to the production framework
- Useful prompt patterns
- Model behaviors / quirks worth documenting
- Research links and sources

…it has to be exported and dropped here, otherwise it's invisible to this workspace.

## Workflow

1. In Claude.ai, open the conversation or Project you want to preserve.
2. Copy the relevant turn(s) — or use the share/export feature.
3. Save into this folder as `<short-topic>-<YYYYMMDD>.md`. Examples:
   - `prompt-tuning-discussion-20260415.md`
   - `gemini-vs-claude-comparison-20260420.md`
   - `meditation-track-experiments-20260424.md`
4. At the top of the file, include:
   ```markdown
   # <Topic>

   **Source:** Claude.ai conversation, <date>
   **Project:** <project name if applicable>
   **Why preserved:** <one-line reason this is worth keeping>

   ---

   <conversation body>
   ```
5. If the conversation suggests changes to the skill, open a follow-up: edit `SKILL.md` or its references and link back to the conversation file in your commit message.

## What lives here vs. elsewhere

| Content type | Goes in |
|---|---|
| Raw conversation export | `docs/suno/conversations/` (here) |
| A working prompt extracted from a conversation | `docs/suno/prompts/` |
| Research / scientific source extracted from a conversation | `docs/suno/research/` |
| Behavior change to the framework | `.claude/skills/suno-production/SKILL.md` (and reference the conversation file) |

## Index

_(Add entries here as files land. Empty for now.)_

| File | Topic | Date | Folded into framework? |
|---|---|---|---|
| — | — | — | — |
