# aimusic.justout.today Migration Playbook

This package stages the Suno Music#2 channel for its long-term home at
`aimusic.justout.today`, served via `hub.justout.today/aimusic/` (the same
redirect pattern established for `dashboard.justout.today` on 5/02).

Run from a local Claude Code session with write access to:
- `marshalldanman/justout-hub` (assumed repo name — adjust if different)
- Cloudflare DNS + Redirect Rules for `justout.today`
- Firebase console for project `fpcs-dashboard-63b25`

All file paths below are absolute from each repo root. Run commands from a
parent directory that contains both `fpcs-dashboard/` and `justout-hub/`
clones side-by-side (adjust paths if your layout differs).

---

## Step 1 — Move files into `justout-hub`

```bash
# 1a. The staged channel package (index.html + this file) -> aimusic/
mkdir -p justout-hub/aimusic
cp -r fpcs-dashboard/aimusic-channel/* justout-hub/aimusic/

# 1b. Skill goes at the monorepo root (skills are per-repo, not per-channel)
mkdir -p justout-hub/.claude/skills
cp -r fpcs-dashboard/.claude/skills/suno-production justout-hub/.claude/skills/

# 1c. Docs, JS, CSS go under aimusic/
mkdir -p justout-hub/aimusic/docs justout-hub/aimusic/js justout-hub/aimusic/css
cp -r fpcs-dashboard/docs/suno/* justout-hub/aimusic/docs/
cp    fpcs-dashboard/js/suno-radio.js  justout-hub/aimusic/js/suno-radio.js
cp    fpcs-dashboard/css/suno-radio.css justout-hub/aimusic/css/suno-radio.css
```

Commit & push to `justout-hub` on a feature branch, open PR, merge to `main`,
let GitHub Pages publish the hub.

Verify the published paths resolve:
- `https://hub.justout.today/aimusic/` (index.html)
- `https://hub.justout.today/aimusic/js/suno-radio.js`
- `https://hub.justout.today/aimusic/css/suno-radio.css`
- `https://hub.justout.today/aimusic/docs/README.md`

---

## Step 2 — Cloudflare DNS

In the Cloudflare dashboard for `justout.today`:

1. DNS -> Records -> Add record
2. Type: `CNAME`
3. Name: `aimusic`
4. Target: `marshalldanman.github.io`
5. Proxy status: **Proxied** (orange cloud) — required for the redirect rule
   in Step 3 to apply.
6. TTL: Auto
7. Save

DNS-only (gray cloud) will skip the redirect rule and try to serve a Pages
site directly from this CNAME — that is **not** what we want, since the
content lives under `hub.justout.today/aimusic/`.

---

## Step 3 — Cloudflare Redirect Rule

In the Cloudflare dashboard:

1. Rules -> Redirect Rules -> Create rule
2. Name: `aimusic -> hub/aimusic`
3. When incoming requests match: **Custom filter expression**
   - Field: `Hostname`
   - Operator: `equals`
   - Value: `aimusic.justout.today`
4. Then:
   - Type: `Dynamic`
   - Expression: `concat("https://hub.justout.today/aimusic", http.request.uri.path)`
     - (Path-preserving — matches the dashboard/helpdesk pattern from the
       5/02 handoff. If the existing dashboard rule uses a slightly
       different expression, mirror it exactly for consistency.)
   - Status code: `301`
   - Preserve query string: **on**
5. Save and deploy.

Test:
```bash
curl -sI https://aimusic.justout.today/    # expect 301 -> hub.justout.today/aimusic/
curl -sI https://aimusic.justout.today/docs/README.md
```

---

## Step 4 — Firebase authorized domains

Auth flows through the dashboard's existing Firebase project.

1. Open https://console.firebase.google.com/project/fpcs-dashboard-63b25/authentication/settings
2. Authorized domains -> Add domain
3. Enter: `aimusic.justout.today`
4. Save
5. While here, confirm `hub.justout.today` is already authorized (it should be
   from the 5/02 dashboard migration). Add it if missing.

Without this step, Google sign-in popups will fail on the new origin with
`auth/unauthorized-domain`.

---

## Step 5 — Clean up `fpcs-dashboard`

**Do this only after Steps 1-4 are verified working.** These deletions remove
the live Suno content from the dashboard repo.

```bash
cd fpcs-dashboard

# Remove the now-migrated artifacts
git rm suno.html
git rm -r docs/suno
git rm js/suno-radio.js css/suno-radio.css
git rm -r .claude/skills/suno-production
```

Then edit by hand:

**`js/nav.js`** — remove the `suno` entry:
```js
// DELETE this line (currently ~line 34):
{ key: 'suno', icon: '\u{1F3B6}', label: 'Suno Music#2', href: href('suno', 'suno.html') },
```

**`index.html`** — remove the Suno Music#2 Quick Action card (around line
222, the `<a class="quick-link" href="suno.html">` block).

**`docs/specs/JUSTOUT_HUB_SPEC.md`** §2.2 — remove the interim-tooling note
(currently line 84, the blockquote starting `> **Interim note (Suno
channel):**`) and flip the `aimusic.justout.today` row status from
"PLANNED" to "Live" (section "Phase 1: Core Channels", line ~215 mentions
`justout-aimusic/` — update the planned-emoji to live).

**Cross-loaded widget tags** — every other dashboard page currently loads the
floating player by relative path. After the migration those files will 404.
Two options:

**Option A (recommended): keep the widget cross-loaded from the hub.**
In each page below, change the two tags from relative to absolute URLs:
```html
<!-- before -->
<link rel="stylesheet" href="css/suno-radio.css">
<script src="js/suno-radio.js"></script>

<!-- after -->
<link rel="stylesheet" href="https://hub.justout.today/aimusic/css/suno-radio.css">
<script src="https://hub.justout.today/aimusic/js/suno-radio.js"></script>
```
This requires also adding `https://hub.justout.today` to the `style-src`
and `script-src` directives of each page's Content-Security-Policy meta tag.

**Option B: drop the widget from the dashboard entirely.** Remove both
`<link>` and `<script>` tags from each file (and only those tags).

Affected files (search-and-replace target):
- `admin.html`
- `bots.html`
- `deductions.html`
- `helpdesk.html`
- `income.html`
- `japster.html`
- `library.html`
- `memory.html`
- `stats-board.html`
- `token-master.html`

(`suno.html` itself is being deleted, so it doesn't need the edit.)

Commit on `fpcs-dashboard` with something like:
```
chore(suno): remove migrated assets — channel now at aimusic.justout.today
```

---

## Step 6 — Record migration completion

In `justout-hub/aimusic/docs/ROADMAP.md` (formerly `docs/suno/ROADMAP.md`),
add a dated entry to the top:

```md
## 2026-05-?? — MIGRATION COMPLETE
Channel migrated from `fpcs-dashboard/docs/suno/` and `suno.html` to
`justout-hub/aimusic/`. Live at https://aimusic.justout.today (redirects
to https://hub.justout.today/aimusic/). Firebase domain authorized.
Widget served from hub for cross-channel embedding.
```

Commit that to `justout-hub`.

---

## Step 7 — Smoke test

1. `https://aimusic.justout.today/` should 301 to `hub.justout.today/aimusic/`
   and load the channel page.
2. Google sign-in popup should complete without `auth/unauthorized-domain`.
3. Both **Copy Style** and **Copy Lyrics** buttons should put text on the
   clipboard and show the green "Copied to clipboard" toast.
4. The **Copy Instructions** button on the Project Instructions block should
   also work.
5. On a dashboard page (e.g. `dashboard.justout.today/admin`), the floating
   radio widget should still render (only relevant if you chose Option A in
   Step 5).
6. All GitHub source links on the page should resolve in `justout-hub`
   (404 on any of them means a path was missed — search & fix).

---

## Not covered by this playbook

These remain open after migration:

1. **Constellation hub at `justout.today` apex.** Per spec §6 and the 5/02
   handoff item #4, the root domain should land on a constellation page that
   surfaces all subdomains. Still pending — no work staged for it here.
2. **`justout-aimusic` standalone repo.** Spec §2.2 originally envisioned a
   dedicated `justout-aimusic` repo. This migration instead lands the channel
   inside `justout-hub` as a subfolder, matching the consolidation pattern the
   hub is already using. If a dedicated repo is later desired, the
   `aimusic/` folder is structured to git-mv cleanly into one.
3. **Other channels still living in `fpcs-dashboard`.** Helpdesk, deductions,
   income, etc. are out of scope for this PR. Their migration follows the
   same pattern when ready.
4. **CNAME file inside the channel folder.** None included — the subdomain
   works via Cloudflare 301, not a dedicated Pages site, so `aimusic/CNAME`
   would be wrong here.
