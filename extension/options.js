import { ghCheckAuth } from './github.js';

const $ = (id) => document.getElementById(id);

async function load() {
  const { config } = await chrome.storage.local.get('config');
  if (!config) return;
  // Only overwrite the HTML defaults when storage actually has something — an
  // earlier save with blank fields must not blank out the pre-filled values.
  if (config.owner) $('owner').value = config.owner;
  if (config.repo) $('repo').value = config.repo;
  if (config.branch) $('branch').value = config.branch;
  if (config.pat) $('pat').value = config.pat;
}

function readForm() {
  return {
    owner: $('owner').value.trim(),
    repo: $('repo').value.trim(),
    branch: $('branch').value.trim() || 'main',
    pat: $('pat').value.trim(),
  };
}

$('save').addEventListener('click', async () => {
  const config = readForm();
  if (!config.owner || !config.repo || !config.pat) {
    $('status').innerHTML = '<span class="err">Заполни owner, репозиторий и токен перед сохранением.</span>';
    return;
  }
  await chrome.storage.local.set({ config });
  $('status').innerHTML = '<span class="ok">Сохранено.</span>';
});

$('test').addEventListener('click', async () => {
  $('status').textContent = 'Проверка...';
  try {
    const cfg = readForm();
    if (!cfg.owner || !cfg.repo || !cfg.pat) {
      $('status').innerHTML = '<span class="err">Заполни owner, репозиторий и токен — одно из полей пустое.</span>';
      return;
    }
    const repo = await ghCheckAuth(cfg);
    $('status').innerHTML = `<span class="ok">OK — доступ к ${repo.full_name} есть.</span>`;
  } catch (e) {
    $('status').innerHTML = `<span class="err">${e.message}</span>`;
  }
});

load();
