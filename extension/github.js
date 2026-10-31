// Minimal GitHub Contents API client. Auth token (PAT) lives only in
// chrome.storage.local, entered via options.html. Never sent anywhere except
// api.github.com.

function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(str) {
  return decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
}

/** Raw get: returns {sha, base64} (base64 content exactly as GitHub stores it —
 *  binary-safe, use for images) or {sha:null, base64:null} if the file doesn't exist. */
export async function ghGetFile(cfg, path) {
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json' },
  });
  if (res.status === 404) return { sha: null, base64: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { sha: data.sha, base64: data.content.replace(/\n/g, '') };
}

/** Raw put: content must already be base64 (binary-safe, use for images). */
export async function ghPutFile(cfg, path, base64Content, sha, message) {
  const body = { message, content: base64Content, branch: cfg.branch };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function ghGetJson(cfg, path) {
  const { sha, base64 } = await ghGetFile(cfg, path);
  return { sha, json: base64 ? JSON.parse(b64decode(base64)) : null };
}

export async function ghPutJson(cfg, path, obj, sha, message) {
  return ghPutFile(cfg, path, b64encode(JSON.stringify(obj, null, 2)), sha, message);
}

/** Puts plain text (markdown, etc.) — handles UTF-8 -> base64 itself. */
export async function ghPutText(cfg, path, text, sha, message) {
  return ghPutFile(cfg, path, b64encode(text), sha, message);
}

export async function ghCheckAuth(cfg) {
  const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
    headers: { Authorization: `Bearer ${cfg.pat}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`Repo check failed: ${res.status} — check owner/repo/token/permissions.`);
  return res.json();
}
