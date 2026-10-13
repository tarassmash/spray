# Spray Orihuela — сайт с админ-панелью

Двуязычный сайт (EN/ES) с полной админкой, аналитикой, Facebook Pixel, продвинутым SEO и оптимизацией под AI-поиск (ChatGPT, Gemini, Perplexity, Claude).

**Что внутри**

- Сайт `/en` и `/es` — серверный рендер (Google и AI-боты видят весь текст сразу), быстрый, адаптивный.
- Админка `/admin` — меняется всё: тексты на обоих языках, цены, услуги, фото, отзывы, FAQ, города, цвета и шрифты, видимость секций, доп. страницы, SEO, интеграции.
- Заявки с формы сохраняются в админке (статусы, заметки, выгрузка в CSV/Excel) + уведомления в Telegram и Webhook (Make/Zapier/n8n).
- Загрузка фото с автосжатием в WebP, адаптивные размеры и JPG 1200×630 для соцсетей.
- Резервная копия при каждом сохранении (последние 20), экспорт/импорт всего контента.

---

## 1. Загрузить на GitHub

1. Создайте пустой репозиторий на github.com (например `spray-orihuela-site`, можно Private).
2. Распакуйте архив и выполните в папке проекта:

```bash
git init
git add .
git commit -m "Spray Orihuela site"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/spray-orihuela-site.git
git push -u origin main
```

Без терминала: на странице нового репозитория нажмите **uploading an existing file** и перетащите все файлы (кроме `node_modules` и `data`).

## 2. Развернуть на Railway

1. railway.com → **New Project → Deploy from GitHub repo** → выберите репозиторий. Railway сам найдёт `Dockerfile`.
2. **Variables** → добавьте:
   - `ADMIN_PASSWORD` — пароль для админки (длинный!)
   - `DATA_DIR` = `/data`
3. **Обязательно: Volume.** В сервисе → **Settings → Volumes → Add Volume**, Mount path: `/data`.
   Без Volume все правки из админки, заявки и фото будут стираться при каждом обновлении.
4. **Settings → Networking → Generate Domain** — получите адрес `*.up.railway.app`.
5. Свой домен: **Custom Domain** → `spray-orihuela.com`, у регистратора добавьте CNAME, который покажет Railway.
6. Откройте `https://ваш-домен/admin`, войдите с паролем.
7. В админке → **Компания и контакты** → «Основной домен сайта» — впишите итоговый домен (на нём строятся canonical, sitemap, hreflang).

Обновления: любое изменение кода, отправленное в GitHub, Railway разворачивает автоматически. Контент из админки при этом сохраняется (он в Volume).

## 3. Первые шаги в админке

1. **Медиатека** — загрузите оригинальные фото (кухня, двери, шкаф, мастерская, до/после). Сейчас фото подгружаются со старого сайта на Netlify — если его удалить, фото пропадут. Затем в каждом разделе нажмите «Медиатека» у поля фото и выберите новое.
2. **Обзор** — чек-лист SEO показывает, что ещё не настроено.

## 4. Подключение сервисов

| Сервис | Где взять | Куда вставить в админке |
|---|---|---|
| **Google Analytics 4** | analytics.google.com → Администратор → Потоки данных → Measurement ID `G-…` | Аналитика и пиксели → GA4 |
| **Google Search Console** | search.google.com/search-console → Добавить ресурс → «Префикс URL» → метод «HTML-тег», скопируйте только значение `content="…"` | Аналитика → Search Console. Сохраните, подтвердите, затем отправьте `sitemap.xml` |
| **Bing Webmaster** | bing.com/webmasters → можно импортировать из Search Console, или мета-тег `msvalidate.01` | Аналитика → Bing. **Важно для ChatGPT**: его поиск работает на индексе Bing |
| **Facebook Pixel** | business.facebook.com → Events Manager → Источники данных → Pixel ID (цифры) | Аналитика → Pixel ID |
| **Meta Conversions API** (по желанию) | Events Manager → ваш пиксель → Настройки → «Создать маркер доступа» | Аналитика → токен CAPI |
| **Подтверждение домена Meta** | Business Settings → Brand Safety → Domains | Аналитика → код подтверждения |
| **Telegram-уведомления** | @BotFather → `/newbot` → токен; напишите своему боту, chat ID — через @userinfobot | Уведомления → кнопка «Отправить тест» |

Автоматические события:
- GA4: `generate_lead` (отправка формы), `click_whatsapp`, `click_call` — отметьте `generate_lead` как ключевое событие (конверсию) в GA4.
- Pixel: `PageView`, `Lead` (форма, с дедупликацией через Conversions API), `Contact` (WhatsApp/звонок).
- Cookie-баннер по GDPR с Google Consent Mode v2: до согласия аналитика и пиксель не ставят cookies.

## 5. SEO и AI-оптимизация — что сделано

**Классическое SEO**
- Отдельные URL для языков `/en`, `/es` + `hreflang` и `x-default`, canonical, корректный редирект с `/` по языку браузера.
- Title, description, keywords, Open Graph, Twitter Cards, geo-метатеги — редактируются в админке.
- `sitemap.xml` с языковыми альтернативами и датой изменения, `robots.txt`.
- Быстрая загрузка: серверный рендер, сжатие, WebP, `srcset`, lazy-load, preload главного фото.

**Structured data (Schema.org JSON-LD)** — генерируется из контента автоматически:
- `HousePainter / LocalBusiness`: адрес, координаты, телефон, часы, радиус и список городов (`areaServed`), цены услуг (`OfferCatalog`), языки, соцсети.
- `FAQPage`, `HowTo` (шаги работы), `WebSite`, `WebPage`, `BreadcrumbList`.
- `Review` и `AggregateRating` — появляются, когда в отзывах заполнен текст и оценка.

**AI-поиск (ChatGPT, Gemini, Perplexity, Claude, Copilot)**
- `/llms.txt` и `/llms-full.txt` — стандарт для языковых моделей: краткая фактическая сводка, цены, зона, ссылки.
- `/en.md` и `/es.md` — вся страница в Markdown (AI читают её легче HTML).
- `robots.txt` явно разрешает AI-ботов: OAI-SearchBot / ChatGPT-User / GPTBot (OpenAI), Google-Extended (Gemini), PerplexityBot, ClaudeBot, Applebot-Extended и др. — переключатели в админке.
- **IndexNow**: при каждом сохранении сайт сам сообщает Bing и Yandex о новых данных → ChatGPT Search и Copilot быстрее видят изменения.
- Блок «В двух словах» и FAQ написаны фактами — именно такой формат AI-ассистенты цитируют.

**Что сделать самому для максимальной видимости в AI** (влияет сильнее кода):
1. Google Business Profile с адресом, фото и отзывами — Gemini и Google AI Overviews берут данные оттуда. Ссылку добавьте в «Компания и контакты».
2. Подключить Bing Webmaster и отправить sitemap.
3. Вписать тексты реальных отзывов в раздел «Отзывы».
4. Добавить доп. страницы под запросы, например «Kitchen spraying Torrevieja» (раздел «Доп. страницы») — с уникальным текстом, а не копией главной.

## Локальный запуск

```bash
npm install
cp .env.example .env   # укажите ADMIN_PASSWORD
npm start              # http://localhost:3000, админка — /admin
```

## Структура

```
server.js          сервер, маршруты, API админки
lib/defaults.js    исходный контент сайта
lib/render.js      HTML-шаблон сайта
lib/seo.js         JSON-LD, sitemap, robots, llms.txt, IndexNow
lib/notify.js      Telegram, webhook, Meta Conversions API
lib/schema.js      описание полей админки
admin/             админ-панель
public/            стили и скрипты сайта
data/              (создаётся) контент, заявки, фото — на Railway это Volume /data
```
