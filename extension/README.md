# LarunaMave Video Watcher — Chrome extension

Runs in your own Chrome, under your own browsing session — **manual trigger
only, no automatic schedule**. Click "Проверить сейчас" in the popup when you
want it to check: it reloads the two PornHub pages you already use (`?o=mr`
recent, `?o=mv` most-viewed — the second one only once a month), finds
new/changed videos, and pushes updated `videos.json` / `tags_overrides.json`
straight to GitHub. A separate workflow (`rebuild-on-data-change.yml`) then
regenerates the site automatically. No proxy, no spoofing, nothing
server-side ever talks to PornHub.

**Why manual only:** PH appears to rate-limit or flag repeated automated
requests — it started redirecting the list-page fetch to `rt.pornhub.com`,
which has no CORS headers and makes the fetch fail with a CORS error. A
daily timer made the request pattern look like a bot polling on a fixed
schedule; a person clicking a button occasionally does not. If a check still
fails with a CORS error mentioning `rt.pornhub.com`, that's PH's own
rate-limit kicking in — wait a while before clicking again rather than
retrying repeatedly.

## Setup (once)

1. **Create a GitHub token** (fine-grained, scoped to just this repo):
   - github.com → your avatar → **Settings** → **Developer settings** →
     **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
   - Repository access: **Only select repositories** → `runamave_site`
   - Permissions → **Contents**: **Read and write**
   - Generate, copy the token (starts with `github_pat_...`)

2. **Load the extension**:
   - Chrome → `chrome://extensions`
   - Toggle **Developer mode** (top right)
   - **Load unpacked** → select this `extension/` folder

3. **Configure**: click the extension icon → **Настройки**, fill in:
   - owner: `claveshnek`
   - repo: `runamave_site`
   - branch: `main`
   - token: the one from step 1
   - **Сохранить**, then **Проверить подключение** to confirm it's wired up right.

4. Click **Проверить сейчас** whenever you want to check for new videos —
   there's no automatic schedule, so this is the only way it runs.

## Writing a blog post from the extension

Click the extension icon → **✎ Новый пост в блог**. Fill in title, date,
excerpt and body (plain text / light Markdown), optionally upload a photo
(inserted at the cursor), then **Опубликовать**. It commits a new
`blog-posts/<slug>.md` (and any uploaded image under `blog-posts/images/`)
straight to GitHub — same mechanism as the video-watching feature, same
token. `rebuild-on-data-change.yml` publishes it automatically.

## What it does each run

- Fetches the recent-videos list and, at most once a month, the most-viewed list.
- Compares against what's already in `videos.json` on GitHub.
- For any published video (latest 5 + top 20) missing real tags, fetches its own
  page and pulls them.
- For any published video whose thumbnail is still a live PH CDN link, downloads
  it once and stores a permanent copy at `assets/thumbs/<vkey>.jpg` in the repo —
  PH's thumbnail links are signed and expire after ~24h, which is what caused
  thumbnail grids to go blank whenever a rebuild didn't happen the same day.
- If anything changed, commits `videos.json` / `tags_overrides.json` (and any new
  thumbnail files) to GitHub.
- Shows a Chrome notification when a brand-new video is found.

## Notes

- No automatic/background requests — only runs when you click the button.
- The token lives only in this browser's local extension storage; it is never
  sent anywhere except `api.github.com`.
- If PH changes its page markup, parsing may need updating in `parse.js`
  (mirrors `lib/ph_parse.mjs` in the repo root).
