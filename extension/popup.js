async function render() {
  const { status, lastRun, logs = [], config } = await chrome.storage.local.get(['status', 'lastRun', 'logs', 'config']);
  const statusEl = document.getElementById('status');
  if (!config?.pat) {
    statusEl.innerHTML = '<span class="err">Не настроено — открой «Настройки».</span>';
  } else {
    const cls = status === 'ok' ? 'ok' : status === 'error' ? 'err' : 'muted';
    statusEl.innerHTML = `<span class="${cls}">${status || 'ещё не проверялось'}</span>` + (lastRun ? `<br><span class="muted">${new Date(lastRun).toLocaleString()}</span>` : '');
  }
  document.getElementById('logs').textContent = logs.slice(0, 15).join('\n');
}

document.getElementById('checkNow').addEventListener('click', async () => {
  const btn = document.getElementById('checkNow');
  btn.disabled = true;
  btn.textContent = 'Проверяю...';
  await chrome.runtime.sendMessage({ type: 'check-now', force: false });
  btn.disabled = false;
  btn.textContent = 'Проверить сейчас';
  render();
});

render();
