# ТЗ: Доработка LarunaMave.com — SEO adult-сайт с видео-страницами

## Текущее состояние
- **Домен:** larunamave.com (Netlify)
- **Стек:** Статический сайт (предположительно Hugo/Jekyll или plain HTML+Markdown), Netlify хостинг
- **Контент:** 1 страница-визитка с bio, ссылками на платформы, статистикой, галереей (6 фото)
- **Нет:** блога, видео-embed, sitemap.xml, отдельных страниц
- **GSC за 3 месяца:** 757 кликов, 17.3K показов, CTR 4.4%, позиция 5.2
- **Топ запросы:** "laruna mave" (229 кликов), "larunamave" (79), брендовые запросы — 100% трафика

## Страницы модели на платформах
- PornHub: https://www.pornhub.com/pornstar/larunamave (132M views, 130K subs)
- XVideos: https://www.xv-ru.com/channels/myschoollife (200M views, 135K subs)  
- XHamster: https://xhamster.com/users/larunamave (~250M views, 100K subs)
- OnlyFans: https://onlyfans.com/myschoollife/c14

## Цели
1. Увеличить органический трафик из Google с 8 кликов/день до 100+ кликов/день
2. Ловить трафик не только по бренду, но и по нишевым adult-запросам
3. Каждая видео-страница с PH embed → потенциально бустит просмотры на PH
4. Автоматический сбор статистики с 3 платформ раз в месяц
5. **Главная цель конверсии:** каждый посетитель сайта видит и кликает на последнее видео → буст просмотров на PH

---

## Блок 0: Главная (визитка) + кнопка буста (приоритет 0)

### Концепция
Главная страница остаётся ВИЗИТКОЙ — как сейчас (bio, платформы, статистика, галерея).
Но добавляется одна крупная CTA-кнопка для буста последнего видео.

### Структура главной (сверху вниз)
```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo  |  Videos  |  Blog  |  About     │
├─────────────────────────────────────────────────┤
│                                                  │
│  Laruna Mave                                     │
│  Independent Russian Creator · 582M+ views       │
│                                                  │
│  ┌───────────────────────────────────────────┐   │
│  │  🔥 ▶  WATCH MY LATEST VIDEO ON PORNHUB  │   │ ← КРУПНАЯ КНОПКА
│  └───────────────────────────────────────────┘   │   оранжевая, на всю ширину
│                                                  │   ведёт прямо на PH видео
│  "Real Amateur Stepsister Rides Me..." · 12:34   │   (название + длительность)
│                                                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [ ВИЗИТКА КАК СЕЙЧАС ]                         │
│  · Bio / About                                   │
│  · Platforms (PH, XV, XH, OF)                    │
│  · Stats (582M views, 365K subs, 98%)            │
│  · Gallery                                       │
│  · Links                                         │
│                                                  │
├─────────────────────────────────────────────────┤
│  FOOTER                                          │
└─────────────────────────────────────────────────┘
```

### Детали кнопки "WATCH MY LATEST VIDEO"
- **Расположение:** сразу под заголовком, ПЕРЕД основным контентом визитки
- **Размер:** крупная, высота 56-64px, на всю ширину контейнера (max-width ~700px)
- **Стиль:** оранжевая (#ff9800), жирный текст, иконка ▶
- **Текст:** "▶ WATCH MY LATEST VIDEO ON PORNHUB"
- **Подпись под кнопкой:** название видео + длительность (мелким шрифтом, серый)
- **Действие:** target="_blank" → открывает последнее видео прямо на PH
- **Ссылка:** прямая на PH видео `https://www.pornhub.com/view_video.php?viewkey=XXXXX`
- **Автообновление:** при загрузке нового видео на PH → кнопка ведёт на новое видео
- Это единственное изменение визитки — всё остальное остаётся как есть

### Страница /videos/ — тут уже полноценный видео-контент
```
┌─────────────────────────────────────────────────┐
│  HEADER: Logo  |  Videos  |  Blog  |  About     │
├─────────────────────────────────────────────────┤
│                                                  │
│  🔥 LATEST VIDEO                                 │
│  ┌───────────────────────────────────────────┐   │
│  │         БОЛЬШОЙ THUMBNAIL / EMBED         │   │
│  │         (16:9, на всю ширину)             │   │
│  └───────────────────────────────────────────┘   │
│  Title + крупная кнопка "WATCH ON PORNHUB"       │
│                                                  │
│  RECENT (ещё 4 последних видео в ряд)            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│  │ vid2│ │ vid3│ │ vid4│ │ vid5│               │
│  └─────┘ └─────┘ └─────┘ └─────┘               │
│                                                  │
│  TOP VIDEOS (by views)                           │
│  grid с топ-20                                   │
│                                                  │
├─────────────────────────────────────────────────┤
│  FOOTER                                          │
└─────────────────────────────────────────────────┘
```

На странице /videos/ последнее видео — крупно наверху с embed/thumbnail + кнопка.
Ниже — ещё 4 последних. Ниже — топ-20 по просмотрам.
Каждое видео кликабельно → своя SEO-страница `/videos/[slug].html`

### Навигация — "Очевидная простая ориентация"
- Максимум 4-5 пунктов в шапке
- Крупные, читаемые
- На мобиле: hamburger-меню НЕ нужно при 4 пунктах — все влезают в ряд
- Порядок приоритета:
  1. **Videos** (главный контент)
  2. **Categories** (навигация по тегам)
  3. **Blog** (SEO)
  4. **About** (bio + ссылки)
- Logo кликабельный → возврат на главную
- Footer: все платформы + "18+ disclaimer"

---

## Блок 1: Видео-страницы (приоритет 1)

### 1.1 Топ-20 видео по просмотрам
- Отдельная HTML-страница для каждого из 20 самых просматриваемых видео
- URL формат: `/videos/[slug].html` (slug = SEO-friendly название видео)
- Каждая страница содержит:
  - **Title tag:** `[Название видео] - Laruna Mave` (50-60 символов)
  - **Meta description:** уникальное, с ключевыми словами (150-160 символов)
  - **H1:** название видео
  - **PH Embed iframe:** `https://www.pornhub.com/embed/[viewkey]`
  - **Fallback:** если embed не грузится — кнопка "Watch on PornHub"
  - **CTA кнопки:** "Watch on PornHub", "All Videos"
  - **Карточка модели:** аватар, имя, статистика, кнопка subscribe
  - **Текстовое описание:** 200-300 слов уникального текста (НЕ copy-paste)
  - **Теги:** из PH тегов видео, кликабельные
  - **Schema.org VideoObject:** JSON-LD разметка
  - **Open Graph мета-теги:** для расшаривания
  - **Canonical URL**
  - **Ссылки на другие видео:** "Related Videos" секция (3-4 видео)
- Дизайн: тёмная тема, responsive, быстрая загрузка

### 1.2 Последние 5 видео (блок "NEW")
- Раздел в верхней части главной страницы или отдельная секция
- Должны автоматически обновляться при появлении нового видео на PH
- **Автообновление:**
  - Вариант А: Cron job / GitHub Actions / Netlify scheduled function — раз в сутки парсит PH модельную страницу и обновляет список
  - Вариант Б: Netlify Edge Function или serverless function при каждом запросе (дороже но real-time)
  - Вариант В: Ручное обновление (добавлять вручную viewkey нового видео)
  - **Рекомендация:** Вариант А — GitHub Actions раз в день, пуш изменений → Netlify auto-deploy
- Каждое "новое" видео также получает свою полноценную SEO-страницу

### 1.3 Данные для страниц — автоматический сбор (Claude делает сам)

Claude сам вытаскивает данные всех видео с PH модельной страницы.
Для каждого видео собираются:
- `viewkey` (ID видео на PH)
- `title` (название)
- `tags` (теги)
- `views` (кол-во просмотров)
- `rating` (рейтинг)
- `duration` (длительность)
- `upload_date` (дата загрузки)
- `thumbnail_url` (превью)

**URL-ы для парсинга:**
- Последние видео: `https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mr` (most recent)
- Топ-20 по просмотрам: `https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mv` (сортировка most viewed)

**Способ получения (в порядке приоритета):**
1. Через Chrome extension (mcp__claude-in-chrome) — зайти на PH, спарсить JS-ом
2. Через headless browser (Puppeteer/Playwright) в контейнере
3. Через PH API (если доступен)
4. Fallback: пользователь даёт доступ к Chrome или скрин

### 1.4 Автообновление видео на сайте

**Что обновляется автоматически:**
- Последние 5 видео (1 крупное + 4 в ряд) — при появлении нового видео на PH старые смещаются вниз
- Кнопка "WATCH MY LATEST VIDEO" на главной — всегда ведёт на самое свежее видео
- Топ-20 по просмотрам — обновляются при пересчёте (реже, раз в неделю/месяц)

**Как реализовать автообновление:**
- **Рекомендация:** GitHub Actions cron (раз в сутки)
  1. GitHub Actions запускает скрипт (Python + Playwright headless)
  2. Скрипт заходит на PH модельную страницу, парсит список видео
  3. Сравнивает с текущим `videos.json` в репо
  4. Если появилось новое видео:
     - Генерирует новую SEO-страницу `/videos/[slug].html`
     - Обновляет `videos.json` (последние 5, топ-20)
     - Обновляет главную страницу (кнопка → новый viewkey)
     - Обновляет `/videos/` index (порядок)
     - Обновляет sitemap.xml
  5. Коммитит и пушит → Netlify auto-deploy
  
- **Структура данных `videos.json`:**
```json
{
  "last_updated": "2026-10-30T22:00:00Z",
  "latest": [
    {
      "viewkey": "6ae3793de6b34",
      "title": "Real Amateur Stepsister...",
      "views": "1.2M",
      "duration": "12:34",
      "rating": "98%",
      "tags": ["amateur", "pov", "stepsister"],
      "thumbnail": "https://...",
      "upload_date": "2026-10-25",
      "slug": "real-amateur-stepsister-rides-me"
    }
  ],
  "top20_by_views": [ ... ],
  "all_videos": [ ... ]
}
```

- **Логика смещения:**
  - `latest[]` — всегда 5 самых новых, отсортированы по upload_date DESC
  - При появлении нового: оно становится [0], остальные сдвигаются, [4] уходит
  - `latest[0]` = то что на главной в кнопке "WATCH MY LATEST VIDEO"
  - `latest[0]` = то что крупно наверху на /videos/

---

## Блок 2: Структура сайта и навигация

### 2.1 Новые разделы (вкладки/страницы)
- **Home** — текущая визитка (обновлённая, с блоком "Latest Videos" наверху)
- **Videos** — каталог всех видео (grid/list с превью, сортировка по просмотрам/дате)
- **Categories** — страницы по категориям/тегам:
  - `/categories/amateur.html`
  - `/categories/pov.html`  
  - `/categories/stepsister.html`
  - `/categories/homemade.html`
  - и т.д.
  - Каждая категория = подборка видео с этим тегом + уникальный текст
  - Цель: ранкирование по 2-3 словным запросам ("amateur pov", "homemade stepsister")
- **Blog** — для SEO контента (см. Блок 3)
- **About** — расширенная био + платформы + статистика
- **Links** — все ссылки (замена LinkTree)

### 2.2 Навигация
- Шапка: Logo | Home | Videos | Categories | Blog | About
- Футер: ссылки на платформы, правовая информация, "18+ все исполнители совершеннолетние"

---

## Блок 3: Блог для SEO-ранжирования

### Зачем
- Добавляет уникальный текстовый контент → Google считает сайт более авторитетным
- Ловит informational-запросы ("how to start amateur porn", "best camera for homemade videos")
- Внутренние ссылки на видео-страницы улучшают их ранкирование

### Контент-план (стартовые посты)
1. "About Laruna Mave — From Amateur to 500M+ Views" (история, E-E-A-T)
2. "Top 10 Most Popular Videos by Laruna Mave" (ссылки на видео-страницы)
3. "Behind the Scenes: How We Create Our Content" (уникальный контент)
4. "Best Amateur Content on PornHub 2025-2026" (ловит поисковые запросы)
5. "Laruna Mave Across Platforms: PornHub vs XVideos vs XHamster" (сравнение, статистика)

### Формат
- 500-1000 слов на пост
- SEO-оптимизированные title/description
- Ссылки на видео-страницы внутри постов
- Schema.org Article/BlogPosting разметка
- Публикация: 1-2 раза в месяц

---

## Блок 4: Автоматический сбор статистики

### Что собирать
С каждой из 3 платформ раз в месяц:
| Метрика | PornHub | XVideos | XHamster |
|---------|---------|---------|----------|
| Total Views | ✅ | ✅ | ✅ |
| Subscribers | ✅ | ✅ | ✅ |
| Video Count | ✅ | ✅ | ✅ |
| Rating | ✅ | — | — |
| Rank | ✅ | — | ✅ |

### URL страниц
- PH: https://www.pornhub.com/pornstar/larunamave
- XV: https://www.xv-ru.com/channels/myschoollife
- XH: https://xhamster.com/users/larunamave

### Техническая реализация
- **Вариант А (рекомендуемый):** Cloudflare Worker / Netlify Function
  - Scheduled function раз в месяц
  - Парсит HTML страниц через fetch (без headless browser)
  - Сохраняет в JSON файл или KV storage
  - Сайт отображает актуальные цифры
  
- **Вариант Б:** GitHub Actions
  - Cron workflow раз в месяц
  - Python скрипт парсит страницы
  - Коммитит обновлённый data.json в репо
  - Netlify auto-deploy
  
- **Вариант В:** Ручное обновление
  - Пользователь раз в месяц вводит цифры в config файл
  
- **Сложности:**
  - PH может блокировать серверные запросы (требовать cookies/JS)
  - XV/XH — аналогично
  - Может потребоваться headless browser (Puppeteer) → дороже
  - Fallback: ручной ввод + форма в admin-панели

### Отображение на сайте
- Блок "Platform Stats" на главной и About страницах
- График роста (опционально)
- Дата последнего обновления
- Формат: "132M views · 130K subscribers · Updated Oct 2026"

---

## Блок 5: Техническая SEO инфраструктура

### 5.1 Обязательно
- `sitemap.xml` — все страницы + video sitemap
- `robots.txt` — разрешить индексацию, указать sitemap
- Canonical URLs на всех страницах
- Schema.org разметка: VideoObject, Person, WebSite, BreadcrumbList
- Open Graph + Twitter Card мета-теги
- Mobile-first responsive дизайн
- Быстрая загрузка (< 3 сек, Core Web Vitals в зелёной зоне)
- HTTPS (Netlify даёт автоматически)
- Hreflang для мультиязычности (EN основной, RU вторичный)

### 5.2 Внутренняя перелинковка
- Каждая видео-страница ссылается на 3-4 "Related Videos"
- Категорийные страницы ссылаются на все видео в категории
- Блог-посты ссылаются на видео-страницы
- Breadcrumbs: Home > Videos > [Video Title]

### 5.3 SEO-оптимизация под общие порно-запросы (привлечение трафика извне бренда)

**Цель:** ранкироваться не только по "laruna mave", а по запросам типа "amateur pov", "homemade stepsister", "real couple sex" — миллионы поисков в месяц.

**Стратегия long-tail ключевых слов:**
Крупные запросы ("porn", "xxx") — нереально, конкуренция от PH/XV/XH. Но 3-5 словные комбинации имеют низкую конкуренцию:
- "amateur redhead stepsister pov homemade" 
- "real couple romantic sex video"
- "natural tattoo girl cowgirl orgasm"
- "hermanastra casero amateur real"
- "madrastra amateur video casero"

**Реализация — каждая видео-страница таргетит свой кластер:**
- Title: `[Ключевая фраза из 3-5 слов] - Laruna Mave` (50-60 символов)
- H1: полное название видео с ключевыми словами
- Meta description: уникальное, 150-160 символов, с ключевыми словами
- Текст 200-300 слов: описание с естественным включением ключевых слов, НЕ keyword stuffing
- Alt-текст thumbnail: ключевые слова
- URL slug: ключевые слова через дефис

**Категорийные страницы — ранкирование по 2-словным запросам:**
- `/categories/amateur-pov.html` → таргетит "amateur pov videos"
- `/categories/stepsister-homemade.html` → таргетит "stepsister homemade"
- `/categories/real-couple.html` → таргетит "real couple sex"
- `/categories/cowgirl-orgasm.html` → таргетит "cowgirl orgasm"
- Каждая категория: H1 + описание 100-200 слов + grid видео с этим тегом

**Мультиязычное SEO (испанский — огромный рынок):**
- Испаноязычные запросы: "hermanastra", "madrastra", "casero", "amateur real"
- Для топовых видео создать испаноязычные версии страниц
- URL: `/es/videos/[slug].html`
- Title/description/текст на испанском
- Hreflang тег связывает EN и ES версии
- Латинская Америка — огромный рынок PH, низкая конкуренция в Google ES

**Блог-посты для informational-запросов:**
- "Best amateur creators on PornHub 2026" — ловит "best amateur pornhub"
- "How to find real homemade videos" — ловит "real homemade videos"
- "Amateur vs Professional porn — what viewers prefer" — ловит "amateur porn"
- "Top stepsister videos on PornHub" — ловит "stepsister videos pornhub"
- Каждый пост 500-1000 слов, ссылки на видео-страницы внутри

**Backlinks (органические):**
- Submit сайт в adult-директории (порно-каталоги, adult website lists)
- Reddit посты в NSFW сабреддитах со ссылкой на сайт
- Профили на adult-форумах со ссылкой в подписи
- Cross-ссылки между XV/XH профилями и сайтом (в bio)

### 5.4 Структура URL
```
larunamave.com/                          — главная
larunamave.com/videos/                   — каталог видео
larunamave.com/videos/[slug].html        — страница видео
larunamave.com/categories/               — все категории
larunamave.com/categories/[tag].html     — категория
larunamave.com/blog/                     — блог
larunamave.com/blog/[slug].html          — пост
larunamave.com/about.html                — о модели
larunamave.com/links.html                — все ссылки
larunamave.com/sitemap.xml               — карта сайта
larunamave.com/robots.txt                — для ботов
```

---

## Блок 6: Дизайн

### Стиль
- Тёмная тема (bg: #0a0a0a, cards: #1a1a1a, accent: #ff9800)
- Минималистичный, быстрый
- Responsive: mobile-first
- Шрифт: system fonts (быстрая загрузка)
- Без тяжёлых фреймворков — plain HTML/CSS/JS или минимальный SSG

### Референсы
- Стиль текущего сайта (тёмный, оранжевый accent)
- PornHub UI (знакомый пользователям)

---

## Приоритеты и порядок работы

### Фаза 1 (MVP — следующая сессия)
1. Claude сам парсит PH модельную страницу → собирает данные всех видео
2. Сгенерировать 20 видео-страниц (топ по просмотрам) + 5 последних
3. Создать страницу каталога /videos/ (последнее крупно + 4 в ряд + топ-20 grid)
4. Обновить главную — добавить кнопку "WATCH MY LATEST VIDEO ON PORNHUB"
5. Добавить навигацию (Videos | Categories | Blog | About)
6. Добавить sitemap.xml и robots.txt
7. Залить на Netlify и проверить embed

### Фаза 2 (SEO усиление)
8. Создать 3-5 категорийных страниц
9. Написать 2-3 блог-поста
10. Добавить Schema.org разметку на все страницы
11. Submit sitemap в Google Search Console

### Фаза 3 (автоматизация)
12. GitHub Actions cron — ежедневная проверка новых видео на PH (последние 5)
13. GitHub Actions cron — раз в месяц пересчёт топ-20 по просмотрам
14. Автогенерация страниц новых видео + смещение "последних 5"
15. Автообновление кнопки на главной
16. Скрипт сбора статистики с 3 платформ (views, subs) раз в месяц
17. Автодеплой через Netlify при каждом пуше

---

## Что нужно от пользователя перед началом Фазы 1
1. **Разрешить Claude зайти на PH через Chrome** — Claude сам спарсит все видео (viewkey, title, tags, views, duration). Или альтернативно: скриншоты списка видео с PH модельной страницы
2. **Текущие исходники сайта** — HTML/CSS файлы текущей визитки (прикрепить в чат или дать доступ к GitHub репо)
3. **Доступ к Netlify** — или ручная загрузка файлов, или Netlify API token для автодеплоя
4. **Доступ к GitHub репо** (если есть) — для CI/CD и автообновления через GitHub Actions
5. **Подтверждение структуры URL** — согласование предложенной структуры
