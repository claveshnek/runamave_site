import { ghGetFile, ghPutFile, ghPutText } from './github.js';

const $ = (id) => document.getElementById(id);
$('date').value = new Date().toISOString().slice(0, 10);

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'post';
}

function setStatus(msg, cls) {
  $('status').textContent = msg;
  $('status').className = cls || '';
}

async function getConfig() {
  const { config } = await chrome.storage.local.get('config');
  if (!config?.pat) throw new Error('Расширение не настроено — открой Настройки и сохрани GitHub owner/repo/токен.');
  return config;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // strip "data:...;base64,"
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

$('uploadPhoto').addEventListener('click', async () => {
  const file = $('photo').files[0];
  if (!file) { setStatus('Сначала выбери файл.', 'err'); return; }
  $('uploadPhoto').disabled = true;
  setStatus('Загружаю фото...', 'muted');
  try {
    const cfg = await getConfig();
    const base64 = await fileToBase64(file);
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    const path = `blog-posts/images/${Date.now()}-${safeName}`;
    await ghPutFile(cfg, path, base64, null, `Blog image: ${file.name}`);
    const markdown = `\n![](/${path})\n`;
    const textarea = $('body');
    const pos = textarea.selectionStart ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, pos) + markdown + textarea.value.slice(pos);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = pos + markdown.length;
    setStatus(`Фото загружено и вставлено (/${path}).`, 'ok');
    $('photo').value = '';
  } catch (e) {
    setStatus(`Ошибка загрузки фото: ${e.message}`, 'err');
  } finally {
    $('uploadPhoto').disabled = false;
  }
});

$('publish').addEventListener('click', async () => {
  const title = $('title').value.trim();
  const date = $('date').value;
  const excerpt = $('excerpt').value.trim();
  const body = $('body').value.trim();

  if (!title || !date || !body) {
    setStatus('Заполни заголовок, дату и текст.', 'err');
    return;
  }

  $('publish').disabled = true;
  setStatus('Публикую...', 'muted');
  try {
    const cfg = await getConfig();
    const slug = slugify(title);
    const path = `blog-posts/${slug}.md`;

    const { sha } = await ghGetFile(cfg, path);
    if (sha) {
      const overwrite = confirm(`Пост "${slug}" уже существует. Перезаписать?`);
      if (!overwrite) { setStatus('Отменено.', 'muted'); $('publish').disabled = false; return; }
    }

    const frontmatter = `---\ntitle: ${title}\ndate: ${date}\nexcerpt: ${excerpt.replace(/\n/g, ' ')}\n---\n\n`;
    await ghPutText(cfg, path, frontmatter + body + '\n', sha, `Blog: ${title}`);

    setStatus(`Опубликовано: blog-posts/${slug}.md — появится на /blog/${slug}.html через ~1 минуту.`, 'ok');
    $('title').value = '';
    $('excerpt').value = '';
    $('body').value = '';
  } catch (e) {
    setStatus(`Ошибка публикации: ${e.message}`, 'err');
  } finally {
    $('publish').disabled = false;
  }
});
