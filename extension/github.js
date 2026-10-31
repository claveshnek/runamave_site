// Minimal GitHub Contents API client — get/put a JSON file in the repo.
// Auth token (PAT) lives only in chrome.storage.local, entered via options.html.
// It is never sent anywhere except api.github.com.

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(str) {
  return decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
}

export async function ghGetJson(cfg, path) {
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return { sha: null, json: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { sha: data.sha, json: JSON.parse(b64decode(data.content)) };
}

export async function ghPutJson(cfg, path, obj, sha, message) {
  const body = { message, content: b64encode(JSON.stringify(obj, null, 2)), branch: cfg.branch };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function ghCheckAuth(cfg) {
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`Repo check failed: ${res.status} — check owner/repo/token/permissions.`);
  return res.json();
}
