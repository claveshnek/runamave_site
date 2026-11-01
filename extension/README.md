# LarunaMave Video Watcher — Chrome extension

Runs in your own Chrome, under your own browsing session — **manual trigger
only, no automatic schedule**. Click "Проверить сейчас" in the popup when you
want it to check: it reloads the two PornHub pages you already use (`?o=mr`
recent, `?o=mv` most-viewed — the second one only once a month), finds
new/changed videos, and pushes updated `videos.json` / `tags_overrides.json`
straight to GitHub. A separate workflow (`rebuild-on-data-change.yml`) then
regenerates the site automatically. No proxy, no spoofing, nothing
server-side ever talks to PornHub.

**Why manual only:** keeps the request pattern as "a person checking
occasionally", not a bot polling a fixed schedule — simple and safe
regardless of what's behind the `rt.pornhub.com` redirect below.

**About the `rt.pornhub.com` redirect:** PH sometimes redirects these pages
to `rt.pornhub.com` (reportedly account-region-related — doesn't really
matter why), and that target serves no CORS headers, so a plain background
`fetch()` to it fails outright. Real browser navigation isn't subject to
CORS at all, so every PH page read here opens an actual background tab and
reads the rendered HTML via `chrome.scripting` instead of fetching it —
same as a person opening the link and the page loading normally.

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
