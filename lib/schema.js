// Admin form schema. Labels are in Russian (admin language); site content is EN/ES.
// Types: text, textarea, i18n (EN/ES line), i18nArea (EN/ES multiline), image, bool, color, number, secret, code, list.
const i18n = (k, label, help) => ({ k, type: 'i18n', label, help });
const i18nArea = (k, label, help) => ({ k, type: 'i18nArea', label, help });
const text = (k, label, help, extra = {}) => ({ k, type: 'text', label, help, ...extra });
const head = [i18n('eyebrow', 'Надзаголовок'), i18n('title', 'Заголовок секции (H2)')];

module.exports = [
  { id: 'dashboard', label: 'Обзор', icon: '◎', custom: 'dashboard' },
  { id: 'leads', label: 'Заявки', icon: '✉', custom: 'leads' },

  { group: 'Контент сайта' },
  {
    id: 'site', label: 'Компания и контакты', icon: '⌂', path: 'site', fields: [
      text('name', 'Название компании'),
      text('legalName', 'Юр. / альтернативное название', 'Попадает в Schema.org и AI-сводку'),
      text('url', 'Основной домен сайта', 'Например https://spray-orihuela.com — используется для canonical, sitemap, hreflang, Open Graph. Без слэша в конце.'),
      { k: 'defaultLang', type: 'select', label: 'Язык по умолчанию', options: ['en', 'es'] },
      text('phone', 'Телефон', 'В международном формате: +34 611 22 32 02'),
      text('whatsapp', 'WhatsApp номер (только цифры)', '34611223202'),
      i18n('whatsappText', 'Текст, который подставляется в WhatsApp'),
      text('email', 'Email'),
      text('facebook', 'Facebook URL'),
      text('instagram', 'Instagram URL'),
      text('googleBusiness', 'Google Business Profile / Maps URL', 'Сильно помогает локальному SEO и ответам Gemini'),
      text('street', 'Улица и дом'),
      text('locality', 'Город / район'),
      text('region', 'Провинция'),
      text('postalCode', 'Индекс'),
      text('country', 'Код страны', 'ES'),
      text('lat', 'Широта'), text('lng', 'Долгота'),
      text('serviceRadiusKm', 'Радиус обслуживания, км'),
      { k: 'openingHours', type: 'textarea', label: 'Часы работы (schema.org)', help: 'Одна строка — один интервал: Mo-Fr 08:00-18:00' },
      text('priceRange', 'Ценовой диапазон', '€, €€ или €€€'),
      { k: 'logo', type: 'image', label: 'Логотип (необязательно)', help: 'Если пусто — показывается название' },
      { k: 'favicon', type: 'image', label: 'Favicon (SVG/PNG)' }
    ]
  },
  {
    id: 'hero', label: 'Главный экран', icon: '★', path: 'hero', fields: [
      i18n('eyebrow', 'Надзаголовок'),
      i18n('title', 'Заголовок H1 — первая часть'),
      i18n('titleAccent', 'Заголовок H1 — выделенная курсивом часть'),
      i18nArea('text', 'Описание'),
      i18nArea('badges', 'Преимущества (по одному в строке)'),
      { k: 'image', type: 'image', label: 'Главное фото' },
      i18n('alt', 'ALT-текст фото (SEO)'),
      i18n('priceLabel', 'Плашка цены — подпись'),
      text('priceValue', 'Плашка цены — значение', 'Оставьте пустым, чтобы скрыть')
    ]
  },
  {
    id: 'services', label: 'Услуги и цены', icon: '◆', path: 'services', fields: [
      ...head, i18nArea('text', 'Подзаголовок'), i18nArea('note', 'Примечание под карточками'),
      {
        k: 'items', type: 'list', label: 'Услуги', titleKey: 'title', item: [
          i18n('title', 'Название'), text('price', 'Цена «от», €', 'Только число'),
          i18nArea('text', 'Описание'), i18nArea('bullets', 'Пункты (по одному в строке)'),
          { k: 'image', type: 'image', label: 'Фото' }, i18n('alt', 'ALT-текст фото')
        ]
      }
    ]
  },
  {
    id: 'process', label: 'Как мы работаем', icon: '→', path: 'process', fields: [
      ...head, i18nArea('text', 'Подзаголовок'),
      { k: 'image', type: 'image', label: 'Фото' }, i18n('alt', 'ALT-текст фото'),
      { k: 'steps', type: 'list', label: 'Шаги', titleKey: 'title', item: [i18n('title', 'Шаг'), i18nArea('text', 'Описание')] }
    ]
  },
  {
    id: 'compare', label: 'Сравнение', icon: '⇄', path: 'compare', fields: [
      ...head, i18n('colA', 'Колонка «наш способ»'), i18n('colB', 'Колонка «другой способ»'),
      { k: 'rows', type: 'list', label: 'Строки таблицы', titleKey: 'label', item: [i18n('label', 'Параметр'), i18n('a', 'Наш способ'), i18n('b', 'Другой способ')] }
    ]
  },
  {
    id: 'gallery', label: 'Галерея работ', icon: '▦', path: 'gallery', fields: [
      ...head, i18nArea('text', 'Подзаголовок'),
      { k: 'items', type: 'list', label: 'Фото (первое — большое)', titleKey: 'caption', item: [{ k: 'image', type: 'image', label: 'Фото' }, i18n('caption', 'Подпись'), i18n('alt', 'ALT-текст (SEO)')] }
    ]
  },
  {
    id: 'reviews', label: 'Отзывы', icon: '❝', path: 'reviews', fields: [
      ...head, i18nArea('text', 'Подзаголовок'), i18n('linkLabel', 'Текст кнопки «все отзывы»'), text('linkUrl', 'Ссылка на все отзывы'),
      {
        k: 'items', type: 'list', label: 'Отзывы', titleKey: 'name', item: [
          text('name', 'Имя'), text('town', 'Город'), { k: 'rating', type: 'number', label: 'Оценка 1–5' },
          i18n('service', 'Услуга'), i18nArea('text', 'Текст отзыва', 'Отзывы с текстом и оценкой попадают в разметку Review/AggregateRating')
        ]
      }
    ]
  },
  {
    id: 'about', label: 'О компании (кратко)', icon: 'ℹ', path: 'about', fields: [
      ...head, i18nArea('text', 'Описание', 'Этот блок — главный источник для AI-ответов: пишите фактами, кто, что, где, сколько стоит'),
      { k: 'facts', type: 'list', label: 'Факты', titleKey: 'label', item: [i18n('label', 'Название'), i18n('value', 'Значение')] }
    ]
  },
  {
    id: 'area', label: 'Зона обслуживания', icon: '⌖', path: 'area', fields: [
      ...head, i18nArea('text', 'Подзаголовок'),
      { k: 'towns', type: 'textarea', label: 'Города (по одному в строке)', help: 'Используются в schema.org areaServed, автоподсказках формы и llms.txt' }
    ]
  },
  {
    id: 'faq', label: 'Вопросы и ответы', icon: '?', path: 'faq', fields: [
      ...head,
      { k: 'items', type: 'list', label: 'Вопросы', titleKey: 'q', item: [i18n('q', 'Вопрос'), i18nArea('a', 'Ответ')] }
    ]
  },
  {
    id: 'quote', label: 'Форма заявки и подвал', icon: '✎', path: 'quote', fields: [
      ...head, i18nArea('text', 'Подзаголовок'),
      i18nArea('options', 'Варианты услуг в форме (по одному в строке)'),
      i18n('privacy', 'Текст о конфиденциальности под формой'),
      { k: '__footer', type: 'sub', path: 'footer', label: 'Подвал сайта', fields: [i18n('tagline', 'Описание в подвале'), i18n('area', 'Зона в подвале')] }
    ]
  },
  {
    id: 'pages', label: 'Доп. страницы', icon: '❐', path: '', fields: [
      {
        k: 'pages', type: 'list', label: 'Страницы (адрес: /en/p/slug и /es/p/slug)', titleKey: 'title', item: [
          text('slug', 'Адрес (slug)', 'латиница и дефис, например kitchen-spraying-torrevieja'),
          { k: 'inFooter', type: 'bool', label: 'Показывать ссылку в подвале' },
          i18n('title', 'Заголовок (H1 и title)'), i18n('description', 'Meta description'),
          i18nArea('body', 'Текст страницы', 'Поддерживается: ## Заголовок, - список, **жирный**, [ссылка](https://...)')
        ]
      }
    ]
  },
  {
    id: 'ui', label: 'Тексты интерфейса', icon: 'Aa', path: 'ui', auto: 'i18n',
    help: 'Пункты меню, кнопки, подписи формы, cookie-баннер.'
  },

  { group: 'Настройки' },
  {
    id: 'sections', label: 'Секции на странице', icon: '☰', path: 'sections', fields: [
      { k: 'services', type: 'bool', label: 'Услуги и цены' }, { k: 'process', type: 'bool', label: 'Как мы работаем' },
      { k: 'compare', type: 'bool', label: 'Сравнение' }, { k: 'gallery', type: 'bool', label: 'Галерея' },
      { k: 'reviews', type: 'bool', label: 'Отзывы' }, { k: 'about', type: 'bool', label: 'О компании' },
      { k: 'area', type: 'bool', label: 'Зона обслуживания' }, { k: 'faq', type: 'bool', label: 'FAQ' },
      { k: 'quote', type: 'bool', label: 'Форма заявки' }
    ]
  },
  {
    id: 'theme', label: 'Дизайн', icon: '◐', path: 'theme', fields: [
      { k: 'primary', type: 'color', label: 'Основной цвет' }, { k: 'accent', type: 'color', label: 'Акцентный цвет' },
      { k: 'accentSoft', type: 'color', label: 'Светлый акцент (фоны значков)' }, { k: 'bg', type: 'color', label: 'Фон страницы' },
      { k: 'surface', type: 'color', label: 'Фон карточек' }, { k: 'text', type: 'color', label: 'Цвет текста' },
      { k: 'muted', type: 'color', label: 'Второстепенный текст' },
      text('fontHeading', 'Шрифт заголовков (Google Fonts)', 'Например Fraunces, Playfair Display, Lora'),
      text('fontBody', 'Шрифт текста (Google Fonts)', 'Например Inter, Manrope, Open Sans'),
      { k: 'radius', type: 'number', label: 'Скругление углов, px' }
    ]
  },
  {
    id: 'seo', label: 'SEO и AI-поиск', icon: '⌕', path: 'seo', fields: [
      { k: 'en', type: 'sub', path: 'seo.en', label: 'English', fields: [text('title', 'Title (до ~60 символов)', '', { counter: 60 }), { k: 'description', type: 'textarea', label: 'Meta description (до ~155 символов)', counter: 155 }, { k: 'keywords', type: 'textarea', label: 'Ключевые слова' }] },
      { k: 'es', type: 'sub', path: 'seo.es', label: 'Español', fields: [text('title', 'Title (до ~60 символов)', '', { counter: 60 }), { k: 'description', type: 'textarea', label: 'Meta description (до ~155 символов)', counter: 155 }, { k: 'keywords', type: 'textarea', label: 'Ключевые слова' }] },
      { k: 'ogImage', type: 'image', label: 'Картинка для соцсетей (Open Graph)', help: 'При загрузке автоматически создаётся JPG 1200×630' },
      i18nArea('aiSummary', 'AI-сводка о компании', 'Короткий фактический абзац для ChatGPT, Gemini, Perplexity: используется в llms.txt, Schema.org и /en.md'),
      { k: 'indexing', type: 'bool', label: 'Разрешить индексацию сайта', help: 'Выключите только для тестового сайта' },
      { k: 'allowAiSearch', type: 'bool', label: 'Разрешить AI-поисковикам (ChatGPT Search, Perplexity, Claude)', help: 'OAI-SearchBot, ChatGPT-User, PerplexityBot и др. — нужны, чтобы сайт цитировали в AI-ответах' },
      { k: 'allowAiTraining', type: 'bool', label: 'Разрешить AI-моделям (Gemini / Google-Extended, GPTBot, ClaudeBot)', help: 'Google-Extended влияет на использование сайта в Gemini. Для максимальной видимости в AI — оставьте включённым' },
      { k: 'extraRobots', type: 'code', label: 'Дополнительные правила robots.txt' }
    ]
  },
  {
    id: 'integrations', label: 'Аналитика и пиксели', icon: '◔', path: 'integrations', fields: [
      text('ga4Id', 'Google Analytics 4 — Measurement ID', 'Формат G-XXXXXXXXXX. События: generate_lead, click_whatsapp, click_call'),
      text('gtmId', 'Google Tag Manager — ID (необязательно)', 'GTM-XXXXXXX. Если используете GTM, GA4 можно настроить внутри него'),
      text('gscVerification', 'Google Search Console — код подтверждения', 'Только значение content из мета-тега google-site-verification'),
      text('bingVerification', 'Bing Webmaster Tools — код (msvalidate.01)', 'Важно: поиск ChatGPT опирается на индекс Bing'),
      text('yandexVerification', 'Яндекс Вебмастер — код'),
      text('fbPixelId', 'Facebook (Meta) Pixel ID', 'Только цифры. События: PageView, Lead, Contact'),
      { k: 'fbCapiToken', type: 'secret', label: 'Meta Conversions API — токен доступа', help: 'Необязательно. Дублирует событие Lead с сервера (точнее учёт при блокировщиках и iOS)' },
      text('fbTestEventCode', 'Meta — Test Event Code', 'Для проверки в Events Manager, потом очистите'),
      text('fbDomainVerification', 'Meta — код подтверждения домена'),
      text('indexNowKey', 'IndexNow ключ (Bing/Yandex)', 'Создан автоматически. При сохранении сайт сам сообщает Bing об изменениях'),
      { k: 'consentBanner', type: 'bool', label: 'Cookie-баннер (GDPR) + Google Consent Mode v2', help: 'В ЕС обязательно при использовании GA и Pixel' },
      { k: 'headCode', type: 'code', label: 'Свой код в <head>', help: 'Любые сторонние скрипты: Hotjar, Clarity, TikTok Pixel и т.д.' },
      { k: 'bodyCode', type: 'code', label: 'Свой код в конце <body>' }
    ]
  },
  {
    id: 'notifications', label: 'Уведомления о заявках', icon: '✆', path: 'notifications', fields: [
      { k: 'telegramBotToken', type: 'secret', label: 'Telegram — токен бота', help: 'Создайте бота у @BotFather' },
      text('telegramChatId', 'Telegram — chat ID', 'Напишите боту, затем узнайте ID через @userinfobot'),
      text('webhookUrl', 'Webhook URL (Make / Zapier / n8n)', 'Каждая заявка отправляется POST-запросом в JSON')
    ],
    actions: [{ id: 'test-telegram', label: 'Отправить тест в Telegram' }]
  },
  { id: 'media', label: 'Медиатека', icon: '▣', custom: 'media' },
  { id: 'backups', label: 'Резервные копии', icon: '↺', custom: 'backups' }
];
