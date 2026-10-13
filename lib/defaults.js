// Default content of the site. Everything here can be edited in /admin.
// Bilingual fields are objects: { en: '...', es: '...' }.
// Lists inside text fields (bullets, towns, options) are one item per line.

const IMG = 'https://jade-sherbet-38c58f.netlify.app/img/';

module.exports = {
  site: {
    name: 'Spray Orihuela',
    legalName: 'Tony Spray Master',
    url: 'https://spray-orihuela.com',
    defaultLang: 'en',
    phone: '+34 611 22 32 02',
    whatsapp: '34611223202',
    email: '',
    facebook: 'https://www.facebook.com/spraykitchenorihuelacosta',
    instagram: '',
    googleBusiness: '',
    street: '',
    locality: 'Orihuela Costa',
    region: 'Alicante',
    postalCode: '03189',
    country: 'ES',
    lat: '37.9368',
    lng: '-0.7397',
    serviceRadiusKm: '50',
    openingHours: 'Mo-Fr 08:00-18:00\nSa 09:00-13:00',
    priceRange: '€€',
    logo: '',
    favicon: '',
    whatsappText: { en: 'Hello, quote please…', es: 'Hola, quisiera un presupuesto para lacar…' }
  },

  theme: {
    primary: '#24324d',
    accent: '#7d8f6e',
    accentSoft: '#e7ebe1',
    bg: '#f8f6f1',
    surface: '#ffffff',
    text: '#1d2433',
    muted: '#5d6575',
    fontHeading: 'Fraunces',
    fontBody: 'Inter',
    radius: '14'
  },

  seo: {
    en: {
      title: 'Kitchen & Door Spraying in Orihuela Costa | Spray Orihuela',
      description: 'Professional kitchen cabinet, door and wardrobe spraying in Orihuela Costa, Torrevieja and Alicante (±50 km). We pick up, spray and return. Kitchens from €550, doors from €130. Free quote.',
      keywords: 'kitchen spraying Orihuela Costa, kitchen cabinet respray Spain, pine door spraying Torrevieja, spray painting Alicante, wardrobe refinishing, kitchen makeover Costa Blanca'
    },
    es: {
      title: 'Lacado de cocinas y puertas a pistola en Orihuela Costa | Spray Orihuela',
      description: 'Lacamos y pintamos a pistola muebles de cocina, puertas y armarios en Orihuela Costa, Torrevieja y Alicante (±50 km). Recogemos, pintamos y devolvemos. Cocinas desde 550 €, puertas desde 130 €. Presupuesto gratis.',
      keywords: 'lacado de cocinas Orihuela Costa, pintar muebles de cocina, lacar puertas Torrevieja, pintura a pistola Alicante, lacado de armarios, renovar cocina sin obras'
    },
    ogImage: IMG + 'hero-kitchen.jpg',
    indexing: true,
    allowAiSearch: true,
    allowAiTraining: true,
    extraRobots: '',
    aiSummary: {
      en: 'Spray Orihuela (Tony Spray Master) is a spray-painting workshop in Orihuela Costa, Alicante, Spain. It resprays kitchen cabinets, interior pine/wood doors and fitted wardrobes for homes within about 50 km of Alicante. The team collects the doors, sprays them in a booth and returns them fitted. Kitchens from €550, doors from €130, wardrobes from €290. Turnaround 5–10 working days. English and Spanish spoken. Free quotes on WhatsApp +34 611 22 32 02.',
      es: 'Spray Orihuela (Tony Spray Master) es un taller de lacado a pistola en Orihuela Costa, Alicante. Laca muebles de cocina, puertas de paso de pino o madera y armarios empotrados en un radio de unos 50 km de Alicante. Recoge las piezas, las laca en cabina y las devuelve montadas. Cocinas desde 550 €, puertas desde 130 €, armarios desde 290 €. Plazo 5–10 días laborables. Se habla español e inglés. Presupuesto gratis por WhatsApp +34 611 22 32 02.'
    }
  },

  integrations: {
    ga4Id: '',
    gtmId: '',
    gscVerification: '',
    bingVerification: '',
    yandexVerification: '',
    fbPixelId: '',
    fbCapiToken: '',
    fbTestEventCode: '',
    fbDomainVerification: '',
    indexNowKey: '',
    consentBanner: true,
    headCode: '',
    bodyCode: ''
  },

  notifications: {
    telegramBotToken: '',
    telegramChatId: '',
    webhookUrl: ''
  },

  sections: {
    services: true, process: true, compare: true, gallery: true,
    reviews: true, about: true, area: true, faq: true, quote: true
  },

  ui: {
    navServices: { en: 'Services', es: 'Servicios' },
    navProcess: { en: 'How it works', es: 'Cómo trabajamos' },
    navGallery: { en: 'Our work', es: 'Trabajos' },
    navReviews: { en: 'Reviews', es: 'Opiniones' },
    navFaq: { en: 'FAQ', es: 'Preguntas' },
    ctaQuote: { en: 'Request a free quote', es: 'Pedir presupuesto gratis' },
    ctaWhatsapp: { en: 'Get a quote on WhatsApp', es: 'Presupuesto por WhatsApp' },
    from: { en: 'from', es: 'desde' },
    callUs: { en: 'Call us', es: 'Llámenos' },
    formName: { en: 'Name', es: 'Nombre' },
    formPhone: { en: 'Phone', es: 'Teléfono' },
    formEmail: { en: 'Email (optional)', es: 'Email (opcional)' },
    formTown: { en: 'Town', es: 'Localidad' },
    formService: { en: 'Service', es: 'Servicio' },
    formMessage: { en: 'Message', es: 'Mensaje' },
    formSend: { en: 'Send request', es: 'Enviar solicitud' },
    formSuccess: { en: 'Thank you! We will reply within 24 hours.', es: '¡Gracias! Le respondemos en menos de 24 horas.' },
    formError: { en: 'Something went wrong. Please call or message us on WhatsApp.', es: 'Algo ha fallado. Llámenos o escríbanos por WhatsApp.' },
    cookieText: { en: 'We use cookies for analytics and advertising to improve our service. You can accept or reject them.', es: 'Usamos cookies de analítica y publicidad para mejorar nuestro servicio. Puede aceptarlas o rechazarlas.' },
    cookieAccept: { en: 'Accept', es: 'Aceptar' },
    cookieReject: { en: 'Reject', es: 'Rechazar' },
    cookieMore: { en: 'Cookie policy', es: 'Política de cookies' },
    rights: { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
    home: { en: 'Home', es: 'Inicio' }
  },

  hero: {
    eyebrow: { en: 'Professional spraying · Orihuela Costa & Alicante', es: 'Lacado a pistola · Orihuela Costa y Alicante' },
    title: { en: 'A brand-new kitchen look,', es: 'Su cocina como nueva,' },
    titleAccent: { en: 'without a new kitchen.', es: 'sin obras ni cambiar muebles.' },
    text: {
      en: 'We pick up your kitchen doors, interior doors and wardrobes, spray them in our workshop and bring them back fitted. A smooth factory finish with no brush marks — anywhere within 50 km of Alicante.',
      es: 'Recogemos sus puertas de cocina, puertas de paso y armarios, los lacamos a pistola en nuestro taller y se los devolvemos montados. Acabado liso de fábrica, sin marcas de brocha, en un radio de 50 km de Alicante.'
    },
    badges: {
      en: 'Free quote\nPick up & return\nNo brush marks',
      es: 'Presupuesto gratuito\nRecogida y entrega\nAcabado sin marcas'
    },
    image: IMG + 'hero-kitchen.jpg',
    alt: { en: 'Sage green sprayed kitchen cabinets in an Orihuela Costa villa', es: 'Cocina lacada en verde salvia en una villa de Orihuela Costa' },
    priceLabel: { en: 'Kitchens from', es: 'Cocinas desde' },
    priceValue: '550 €'
  },

  services: {
    eyebrow: { en: 'Services & prices', es: 'Servicios y precios' },
    title: { en: 'Professional spraying for every room', es: 'Lacado profesional para cada mueble de la casa' },
    text: { en: 'Guide prices. You get a fixed, free quote once we have seen photos or measurements.', es: 'Precios orientativos. Le damos un presupuesto cerrado y gratuito tras ver fotos o medidas.' },
    note: { en: 'Kitchen price depends on the number of doors and fronts. VAT and travel within our area confirmed in your quote.', es: 'Precio de cocina según número de frentes. IVA y desplazamiento dentro de la zona consultados en el presupuesto.' },
    items: [
      {
        title: { en: 'Kitchen cabinet spraying', es: 'Lacado de muebles de cocina' },
        price: '550',
        text: { en: 'We respray your kitchen doors, drawer fronts and panels with tough paints that resist stains, moisture and everyday wear.', es: 'Renovamos frentes, puertas y cajones de su cocina con pintura de poliuretano resistente a manchas, humedad y uso diario.' },
        bullets: { en: 'Cleaning, degreasing and sanding\nPriming and spray finish\nAny RAL colour — matt, satin or gloss', es: 'Limpieza, lijado y desengrasado\nImprimación y lacado a pistola\nCualquier color RAL, mate, satinado o brillo' },
        image: IMG + 'hero-kitchen.jpg',
        alt: { en: 'Sage green sprayed kitchen cabinets in an Orihuela Costa villa', es: 'Cocina lacada en verde salvia en una villa de Orihuela Costa' }
      },
      {
        title: { en: 'Pine & wood door spraying', es: 'Lacado de puertas de pino y madera' },
        price: '130',
        text: { en: 'We turn dated orange pine doors into crisp white or coloured doors with an even, hard-wearing finish.', es: 'Transformamos puertas de pino barnizado en puertas blancas o de color con un acabado uniforme y duradero.' },
        bullets: { en: 'Stripping and sanding old varnish\nPriming, staining or painting\nProtective topcoat', es: 'Decapado y lijado del barniz\nImprimación, tinte o laca\nCapa protectora final' },
        image: IMG + 'doors.jpg',
        alt: { en: 'Interior doors sprayed in satin white in the workshop', es: 'Puertas de paso lacadas en blanco satinado en el taller' }
      },
      {
        title: { en: 'Wardrobe refinishing', es: 'Lacado de armarios empotrados' },
        price: '290',
        text: { en: 'Refresh your fitted wardrobes so they match the new style of your home.', es: 'Actualizamos las puertas de sus armarios para que combinen con el nuevo estilo de su vivienda.' },
        bullets: { en: 'Premium materials\nOptional new handles and hinges\nMinimal time without wardrobe doors', es: 'Materiales de primera calidad\nHerrajes y tiradores nuevos opcionales\nMínimo tiempo sin armario' },
        image: IMG + 'wardrobe.jpg',
        alt: { en: 'Fitted wardrobe sprayed off-white in a Mediterranean bedroom', es: 'Armario empotrado lacado en blanco roto en un dormitorio mediterráneo' }
      }
    ]
  },

  process: {
    eyebrow: { en: 'How it works', es: 'Cómo trabajamos' },
    title: { en: 'We pick up, spray & return — so easy!', es: 'Recogemos, lacamos y devolvemos. Así de fácil.' },
    text: { en: 'You keep living in your home while we do the work in our workshop.', es: 'Usted sigue usando su casa mientras nosotros trabajamos en el taller.' },
    image: IMG + 'workshop.jpg',
    alt: { en: 'Spray gun finishing a kitchen door in a spray booth', es: 'Lacado a pistola de una puerta de cocina en cabina de pintura' },
    steps: [
      { title: { en: 'Free quote', es: 'Presupuesto gratis' }, text: { en: 'Send us photos on WhatsApp or fill in the form. We reply with a price and timeframe.', es: 'Envíenos fotos por WhatsApp o rellene el formulario. Respondemos con precio y plazo.' } },
      { title: { en: 'Pick up', es: 'Recogida' }, text: { en: 'We remove and collect your doors and fronts from your home, anywhere within 50 km.', es: 'Desmontamos y recogemos las puertas y frentes en su domicilio, en un radio de 50 km.' } },
      { title: { en: 'Workshop spraying', es: 'Lacado en taller' }, text: { en: 'Sanding, priming and spray finishing in a booth, with controlled drying.', es: 'Lijado, imprimación y lacado a pistola en cabina, con secado controlado.' } },
      { title: { en: 'Return & refit', es: 'Entrega y montaje' }, text: { en: 'We bring everything back and refit it, adjusted and clean. No fumes or dust at home.', es: 'Devolvemos y montamos todo, ajustado y limpio. Sin olores ni polvo en su casa.' } }
    ]
  },

  compare: {
    eyebrow: { en: 'Spray vs. brush', es: 'Pistola vs. brocha' },
    title: { en: 'Why spray instead of brush?', es: '¿Por qué lacar a pistola?' },
    colA: { en: 'Spray finish', es: 'Lacado a pistola' },
    colB: { en: 'Brush & roller', es: 'Pintado a brocha' },
    rows: [
      { label: { en: 'Finish', es: 'Acabado' }, a: { en: 'Sleek, even, factory-like', es: 'Liso, uniforme, como de fábrica' }, b: { en: 'Brush marks and streaks', es: 'Marcas de brocha y rodillo' } },
      { label: { en: 'Durability', es: 'Durabilidad' }, a: { en: 'Resists stains, moisture and wear', es: 'Resiste manchas, humedad y desgaste' }, b: { en: 'Chips with daily use', es: 'Se desconcha con el uso' } },
      { label: { en: 'Disruption', es: 'Molestias' }, a: { en: 'Done in our workshop', es: 'Trabajo en taller, casa limpia' }, b: { en: 'Mess and fumes at home', es: 'Olor y desorden en casa' } },
      { label: { en: 'Drying', es: 'Secado' }, a: { en: 'Fast and controlled', es: 'Rápido y controlado' }, b: { en: 'Slow — days of waiting', es: 'Lento, días de espera' } }
    ]
  },

  gallery: {
    eyebrow: { en: 'Before & after', es: 'Antes y después' },
    title: { en: 'What your home could look like', es: 'Así puede quedar su casa' },
    text: { en: 'Pine kitchens, varnished doors and wardrobes that look brand new after a professional spray.', es: 'Cocinas de pino, puertas barnizadas y armarios que vuelven a parecer nuevos con un buen lacado.' },
    items: [
      { image: IMG + 'before-after.jpg', caption: { en: 'Pine kitchen · before & after', es: 'Cocina de pino · antes y después' }, alt: { en: 'Before and after: varnished pine kitchen sprayed warm grey', es: 'Antes y después: cocina de pino barnizado lacada en gris cálido' } },
      { image: IMG + 'workshop.jpg', caption: { en: 'Spraying in our booth', es: 'Lacado en cabina de pintura' }, alt: { en: 'Spray gun finishing a kitchen door in a spray booth', es: 'Lacado a pistola de una puerta de cocina en cabina de pintura' } },
      { image: IMG + 'doors.jpg', caption: { en: 'Pine doors sprayed white', es: 'Puertas de pino lacadas en blanco' }, alt: { en: 'Pine doors resprayed in white', es: 'Puertas de pino lacadas en blanco' } },
      { image: IMG + 'hero-kitchen.jpg', caption: { en: 'Kitchen sprayed sage green', es: 'Cocina lacada en verde salvia' }, alt: { en: 'Sage green sprayed kitchen with white worktop', es: 'Cocina lacada en verde salvia con encimera blanca' } }
    ]
  },

  reviews: {
    eyebrow: { en: 'Reviews', es: 'Opiniones' },
    title: { en: 'Happy customers along the coast', es: 'Clientes satisfechos en toda la costa' },
    text: { en: 'Verified reviews from our customers on Facebook.', es: 'Reseñas verificadas de nuestros clientes en Facebook.' },
    linkLabel: { en: 'Read all reviews on Facebook', es: 'Leer todas las opiniones en Facebook' },
    linkUrl: 'https://www.facebook.com/spraykitchenorihuelacosta/reviews',
    items: [
      { name: 'Barry Gaffney', town: 'Orihuela Costa', rating: '5', service: { en: 'Kitchen respray', es: 'Lacado de cocina' }, text: { en: '', es: '' } },
      { name: 'Louise Commins', town: 'Los Montesinos', rating: '5', service: { en: 'Kitchen respray', es: 'Lacado de cocina' }, text: { en: '', es: '' } },
      { name: 'Mark Newall', town: 'Orihuela Costa', rating: '5', service: { en: 'Kitchen cupboard doors', es: 'Puertas de armarios de cocina' }, text: { en: '', es: '' } },
      { name: 'Julia Margaret Clarke', town: 'Torrevieja', rating: '5', service: { en: 'Interior doors', es: 'Puertas de paso' }, text: { en: '', es: '' } },
      { name: 'Yvonne Colclough', town: 'Los Montesinos', rating: '5', service: { en: 'Kitchen respray', es: 'Lacado de cocina' }, text: { en: '', es: '' } },
      { name: 'Kevin Carthy', town: 'Torrevieja', rating: '5', service: { en: 'Bedroom doors & wardrobes', es: 'Puertas y armarios de dormitorio' }, text: { en: '', es: '' } }
    ]
  },

  about: {
    eyebrow: { en: 'At a glance', es: 'En resumen' },
    title: { en: 'Spray Orihuela in a nutshell', es: 'Spray Orihuela en pocas palabras' },
    text: {
      en: 'Spray Orihuela (Tony Spray Master) is a spray-painting workshop in Orihuela Costa, Alicante, Spain. We refresh kitchen cabinets, interior doors and fitted wardrobes without a renovation: we collect the doors, spray them in our booth and bring them back fitted.',
      es: 'Spray Orihuela (Tony Spray Master) es un taller de lacado y pintura a pistola en Orihuela Costa, Alicante. Renovamos muebles de cocina, puertas de paso y armarios empotrados sin obras: recogemos las piezas, las lacamos en nuestra cabina de pintura y las devolvemos montadas.'
    },
    facts: [
      { label: { en: 'Speciality', es: 'Especialidad' }, value: { en: 'Spray painting kitchen cabinets, pine doors and wardrobes', es: 'Lacado a pistola de cocinas, puertas de pino y armarios' } },
      { label: { en: 'Area', es: 'Zona' }, value: { en: 'Orihuela Costa, Torrevieja and up to 50 km from Alicante', es: 'Orihuela Costa, Torrevieja y hasta 50 km de Alicante' } },
      { label: { en: 'Prices', es: 'Precios' }, value: { en: 'Kitchens from €550, doors from €130, wardrobes from €290', es: 'Cocinas desde 550 €, puertas desde 130 €, armarios desde 290 €' } },
      { label: { en: 'Turnaround', es: 'Plazo' }, value: { en: 'Usually 5–10 working days', es: 'Normalmente 5–10 días laborables' } },
      { label: { en: 'Languages', es: 'Idiomas' }, value: { en: 'English and Spanish', es: 'Español e inglés' } },
      { label: { en: 'Quote', es: 'Presupuesto' }, value: { en: 'Free on WhatsApp — just send photos', es: 'Gratis por WhatsApp con fotos' } }
    ]
  },

  area: {
    eyebrow: { en: 'Service area', es: 'Zona de servicio' },
    title: { en: 'Kitchen & door spraying in Orihuela Costa, Torrevieja and nearby', es: 'Lacado de muebles en Orihuela Costa, Torrevieja y alrededores' },
    text: { en: 'We cover roughly 50 km around Alicante, with pick-up and return from your door in:', es: 'Trabajamos en un radio de unos 50 km de Alicante, con recogida y entrega a domicilio en:' },
    towns: 'Orihuela Costa\nOrihuela\nTorrevieja\nLos Montesinos\nPlaya Flamenca\nLa Zenia\nCabo Roig\nVillamartín\nCampoamor\nPilar de la Horadada\nGuardamar del Segura\nRojales\nCiudad Quesada\nSan Miguel de Salinas\nAlgorfa\nBenijófar\nAlmoradí\nSanta Pola\nElche\nAlicante\nMurcia\nSan Pedro del Pinatar'
  },

  faq: {
    eyebrow: { en: 'FAQ', es: 'Preguntas frecuentes' },
    title: { en: 'Questions we get asked', es: 'Lo que más nos preguntan' },
    items: [
      { q: { en: 'How much does it cost to spray a kitchen?', es: '¿Cuánto cuesta lacar una cocina?' }, a: { en: 'Kitchen cabinet spraying starts from €550, depending on the number of doors and drawer fronts. Send us photos and we will give you a fixed, free quote.', es: 'El lacado de muebles de cocina empieza desde 550 €, según el número de puertas y frentes. Le damos un presupuesto cerrado y gratuito tras ver fotos.' } },
      { q: { en: 'How long will I be without my kitchen doors?', es: '¿Cuánto tiempo estaré sin puertas de cocina?' }, a: { en: 'Usually 5 to 10 working days. We collect and return on agreed dates and your kitchen stays usable in the meantime.', es: 'Normalmente entre 5 y 10 días laborables. Recogemos y devolvemos en la fecha acordada, y la cocina sigue siendo utilizable mientras tanto.' } },
      { q: { en: 'Can you spray orange pine doors white?', es: '¿Se pueden lacar puertas de pino barnizadas?' }, a: { en: 'Yes. We sand back the varnish, apply a knot-blocking primer so the wood does not bleed through, then spray your chosen colour. From €130 per door.', es: 'Sí. Lijamos el barniz, aplicamos imprimación especial para que no salgan los nudos de la madera y lacamos en el color que elija. Desde 130 € por puerta.' } },
      { q: { en: 'Which colours can I choose?', es: '¿Qué colores puedo elegir?' }, a: { en: 'Any RAL or NCS colour, in matt, satin or gloss. We can show you samples before we start.', es: 'Cualquier color de la carta RAL o NCS, en acabado mate, satinado o brillo. Podemos enseñarle muestras antes de empezar.' } },
      { q: { en: 'Which areas do you cover?', es: '¿En qué zonas trabajan?' }, a: { en: 'Orihuela Costa, Torrevieja, Los Montesinos, Pilar de la Horadada, Guardamar, Ciudad Quesada and anywhere within about 50 km of Alicante.', es: 'En Orihuela Costa, Torrevieja, Los Montesinos, Pilar de la Horadada, Guardamar, Ciudad Quesada y cualquier localidad a unos 50 km de Alicante.' } }
    ]
  },

  quote: {
    eyebrow: { en: 'Free quote', es: 'Presupuesto gratis' },
    title: { en: 'Tell us what you want to refresh', es: 'Cuéntenos qué quiere renovar' },
    text: { en: 'We reply within 24 hours. For the fastest quote, send us photos on WhatsApp.', es: 'Le respondemos en menos de 24 horas. Para ir más rápido, envíenos fotos por WhatsApp.' },
    options: { en: 'Kitchen spraying\nDoor spraying\nWardrobe refinishing\nOther furniture', es: 'Lacado de cocina\nLacado de puertas\nLacado de armarios\nOtros muebles' },
    privacy: { en: 'We only use your details to reply to your request.', es: 'Solo usamos sus datos para responder a su solicitud.' }
  },

  footer: {
    tagline: { en: 'Spray painting for kitchens, doors and wardrobes.', es: 'Lacado y pintura a pistola de cocinas, puertas y armarios.' },
    area: { en: 'Orihuela Costa · Alicante ±50 km', es: 'Orihuela Costa · Alicante ±50 km' }
  },

  pages: [
    {
      slug: 'privacy',
      inFooter: true,
      title: { en: 'Privacy policy', es: 'Política de privacidad' },
      description: { en: 'How Spray Orihuela handles your personal data.', es: 'Cómo trata Spray Orihuela sus datos personales.' },
      body: {
        en: '## Who we are\nSpray Orihuela (Tony Spray Master), Orihuela Costa, Alicante, Spain. Contact: +34 611 22 32 02.\n\n## What data we collect\nWhen you send the quote form we store your name, phone, optional email, town and message, only to reply to your request and prepare a quote.\n\n## Legal basis and retention\nYour consent and pre-contractual measures (GDPR art. 6.1.a and 6.1.b). We keep the data while needed to handle your request and then delete it.\n\n## Your rights\nYou can request access, correction or deletion of your data at any time by contacting us. You can also complain to the Spanish Data Protection Agency (aepd.es).',
        es: '## Quiénes somos\nSpray Orihuela (Tony Spray Master), Orihuela Costa, Alicante, España. Contacto: +34 611 22 32 02.\n\n## Qué datos recogemos\nCuando envía el formulario guardamos su nombre, teléfono, email opcional, localidad y mensaje, solo para responder a su solicitud y preparar el presupuesto.\n\n## Base legal y conservación\nSu consentimiento y medidas precontractuales (RGPD art. 6.1.a y 6.1.b). Conservamos los datos mientras sea necesario para gestionar su solicitud y después los eliminamos.\n\n## Sus derechos\nPuede solicitar el acceso, rectificación o supresión de sus datos en cualquier momento contactándonos. También puede reclamar ante la Agencia Española de Protección de Datos (aepd.es).'
      }
    },
    {
      slug: 'cookies',
      inFooter: true,
      title: { en: 'Cookie policy', es: 'Política de cookies' },
      description: { en: 'Which cookies this website uses.', es: 'Qué cookies utiliza este sitio web.' },
      body: {
        en: '## Cookies we use\n- **Necessary**: remember your cookie choice.\n- **Analytics** (Google Analytics): anonymous statistics about visits. Only after you accept.\n- **Advertising** (Meta Pixel): measure our Facebook ads. Only after you accept.\n\n## Change your choice\nClear the cookies of this site in your browser and the banner will appear again.',
        es: '## Cookies que usamos\n- **Necesarias**: recordar su elección sobre cookies.\n- **Analítica** (Google Analytics): estadísticas anónimas de visitas. Solo si acepta.\n- **Publicidad** (Meta Pixel): medir nuestros anuncios de Facebook. Solo si acepta.\n\n## Cambiar su elección\nBorre las cookies de este sitio en su navegador y el aviso volverá a aparecer.'
      }
    }
  ]
};
