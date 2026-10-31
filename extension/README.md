# LarunaMave Video Watcher — Chrome extension

Runs in your own Chrome, under your own browsing session. On a timer (default
daily), it reloads the two PornHub pages you already use (`?o=mr` recent,
`?o=mv` most-viewed — the second one only once a month), finds new/changed
videos, and pushes updated `videos.json` / `tags_overrides.json` straight to
GitHub. A separate workflow (`rebuild-on-data-change.yml`) then regenerates the
site automatically. No proxy, no spoofing, nothing server-side ever talks to
PornHub — only runs while this Chrome profile is open.

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
   - interval: how often to check (hours, default 24)
   - **Сохранить**, then **Проверить подключение** to confirm it's wired up right.

4. Click **Проверить сейчас** once to run a first check immediately.

## Writing a blog post from the extension

Click the extension icon → **✎ Новый пост в блог**. Fill in title, date,
excerpt and body (plain text / light Markdown), optionally upload a photo
(inserted at the cursor), then **Опубликовать**. It commits a new
`blog-posts/<slug>.md` (and any uploaded image under `blog-posts/images/`)
straight to GitHub — same mechanism as the video-watching feature, same
token. `rebuild-on-data-change.yml` publishes it automatically.

## What it does each run

- Fetches the recent-videos list (daily) and, once a month, the most-viewed list.
- Compares against what's already in `videos.json` on GitHub.
- For any published video (latest 5 + top 20) missing real tags, fetches its own
  page and pulls them.
- If anything changed, commits `videos.json` / `tags_overrides.json` to GitHub.
- Shows a Chrome notification when a brand-new video is found.

## Notes

- Only runs while Chrome is open on this machine — not 24/7 like a server cron.
- The token lives only in this browser's local extension storage; it is never
  sent anywhere except `api.github.com`.
- If PH changes its page markup, parsing may need updating in `parse.js`
  (mirrors `lib/ph_parse.mjs` in the repo root).
