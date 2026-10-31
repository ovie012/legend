// Search, social and AI-answer metadata for every page: titles, descriptions, canonical URLs, Open Graph and the
// schema.org graph (Person, WebSite, the page). Used at build time by scripts/prerender.mjs (static HTML per page)
// and in the browser by App.jsx (kept in sync while you move between pages). Facts come from the CV and the site copy.
export const SITE = 'https://legenddev-phi.vercel.app';
export const OG_IMAGE = `${SITE}/og-image.jpg`;

const PERSON_ID = `${SITE}/#person`;
const WEBSITE_ID = `${SITE}/#website`;

export const SOCIALS = [
  'https://www.linkedin.com/in/ovieemonefe/',
  'https://github.com/ovie012',
  'https://x.com/legend_devv',
  'https://www.tiktok.com/@legenddev_softwaredev',
  'https://www.instagram.com/legendd.devv',
];

// path -> page metadata (paths as the site links them; React Router ignores case)
export const PAGES = {
  '/': {
    title: 'Emonefe Ovie · AI Engineer & Software Developer | Legend.dev',
    description: 'Emonefe Ovie (Legend.dev) is an AI Engineer and Software Developer in Lagos, Nigeria, building fast, intelligent web and mobile apps with React, React Native, Next.js, TypeScript, Python and modern AI tooling.',
    type: 'WebPage',
  },
  '/About': {
    title: 'About · Emonefe Ovie | Legend.dev',
    description: 'About Emonefe Ovie Ezekiel, known as Legend: a Lagos-born AI Engineer and Software Developer, frontend lead at Scrybe and University of Lagos Mathematics Education graduate, building web, mobile and AI products since 2022.',
    type: 'ProfilePage',
  },
  '/Projects': {
    title: 'Projects · Emonefe Ovie | Legend.dev',
    description: 'Projects by Emonefe Ovie (Legend.dev): the Scrybe school management platform, the Silvermanns headless Shopify store, Agri Command, Estate IQ, Tenant Hub, Prompt Architect and more React, React Native and AI builds.',
    type: 'CollectionPage',
  },
  '/Contact': {
    title: 'Contact · Emonefe Ovie | Legend.dev',
    description: 'Contact Emonefe Ovie (Legend.dev), AI Engineer and Software Developer in Lagos, Nigeria, about web apps, mobile apps, dashboards, e-commerce and AI features. Email ovieemonefe012@gmail.com.',
    type: 'ContactPage',
  },
  '/Privacy': {
    title: 'Privacy Policy · Emonefe Ovie | Legend.dev',
    description: 'How Legend.dev (Emonefe Ovie) handles personal data from the contact form: what is collected, why, who processes it, how long it is kept and your rights under the Nigeria Data Protection Act.',
    type: 'WebPage',
  },
};
export const NOT_FOUND = {
  title: 'Page not found · Emonefe Ovie | Legend.dev',
  description: 'This page does not exist on Legend.dev, the portfolio of Emonefe Ovie, AI Engineer and Software Developer.',
};

// The About page's FAQ: shown on the page (About.jsx) and given to search engines / AI answers as FAQPage data, so
// both always say the same thing. `link` = an optional follow-up link under the answer.
export const FAQ = [
  {
    q: 'Who is Emonefe Ovie?',
    a: 'I’m Emonefe Ovie Ezekiel, an AI Engineer and Software Developer born and based in Lagos, Nigeria, with roots in Delta State. I build fast, intelligent web and mobile apps with React, React Native, Next.js, TypeScript and Python, and I lead the frontend team at Scrybe.',
  },
  {
    q: 'Are Legend and Legend.dev the same person as Emonefe Ovie?',
    a: 'Yes. Legend is the name I build under, and Legend.dev is my portfolio and brand. Emonefe Ovie, Ovie Emonefe, Legend and Legend.dev all refer to me.',
  },
  {
    q: 'What do you build?',
    a: 'Web apps and dashboards, mobile apps with React Native, e-commerce (including headless Shopify stores), landing pages, and AI features such as streaming chat, content tools and smart automation. Recent work includes the Scrybe school management platform, the Silvermanns store, Agri Command, Estate IQ, Tenant Hub and Prompt Architect.',
    link: { to: '/Projects', label: 'See the projects' },
  },
  {
    q: 'Which technologies do you work with?',
    a: 'HTML, CSS, JavaScript, TypeScript and Python; React, Next.js and React Native; Tailwind CSS, Styled Components, Framer Motion and Three.js for interfaces and motion; Redux and Zustand for state; Git, GitHub and Figma every day.',
  },
  {
    q: 'What is your background?',
    a: 'I studied Mathematics Education at the University of Lagos (B.Sc & B.Ed) and started coding in 2022. I hold certificates from Codecademy (Front-End Engineer and React Native tracks) and Microsoft Learn Student Ambassadors (React), my final-year research explored how OpenAI technologies can improve mathematics learning, and I’m now studying AI engineering. At Scrybe I grew from intern to frontend lead.',
  },
  {
    q: 'Where are you based?',
    a: 'Lagos, Nigeria, on West Africa Time (UTC+1). Wherever you are, you can reach me by email or through the contact form.',
  },
  {
    q: 'Are you available for work, and how do I contact you?',
    a: 'Yes. I’m open to full-time roles and to client projects. Tell me about your idea through the contact form, or email me at ovieemonefe012@gmail.com.',
    link: { to: '/Contact', label: 'Get in touch' },
  },
];

// '/about/' -> '/About'; unknown -> null
export function pageKey(pathname) {
  const p = pathname.toLowerCase().replace(/(.)\/$/, '$1');
  return Object.keys(PAGES).find((k) => k.toLowerCase() === p) ?? null;
}
export const urlOf = (key) => (key === '/' ? `${SITE}/` : `${SITE}${key}`);

const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Emonefe Ovie Ezekiel',
  alternateName: ['Emonefe Ovie', 'Ovie Emonefe', 'Legend', 'Legend.dev', 'Legend Dev', 'Ovie', 'Emonefe'],
  jobTitle: 'AI Engineer & Software Developer',
  description: 'AI Engineer and Software Developer from Lagos, Nigeria (roots in Delta State) who builds fast, intelligent web and mobile apps with React, React Native, Next.js, TypeScript, Python and modern AI tooling. Frontend lead at Scrybe.',
  url: `${SITE}/`,
  image: `${SITE}/Legend-himself.webp`,
  email: 'mailto:ovieemonefe012@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressRegion: 'Lagos', addressCountry: 'NG' },
  homeLocation: { '@type': 'Place', name: 'Lagos, Nigeria' },
  nationality: { '@type': 'Country', name: 'Nigeria' },
  worksFor: { '@type': 'Organization', name: 'Scrybe', url: 'https://scrybehub.ng' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'University of Lagos', sameAs: 'https://unilag.edu.ng' },
    { '@type': 'Organization', name: 'Microsoft Learn Student Ambassadors' },
  ],
  hasCredential: [
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'B.Sc & B.Ed in Mathematics Education', recognizedBy: { '@type': 'CollegeOrUniversity', name: 'University of Lagos' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certificate', name: 'Front-End Engineer Track', recognizedBy: { '@type': 'Organization', name: 'Codecademy' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certificate', name: 'Mobile Development – React Native Track', recognizedBy: { '@type': 'Organization', name: 'Codecademy' } },
    { '@type': 'EducationalOccupationalCredential', credentialCategory: 'certificate', name: 'Software Development – React Track', recognizedBy: { '@type': 'Organization', name: 'Microsoft Learn Student Ambassadors, University of Lagos' } },
  ],
  knowsAbout: ['AI engineering', 'Software development', 'Frontend development', 'Mobile app development', 'React', 'React Native',
    'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Tailwind CSS', 'Styled Components', 'Framer Motion', 'Redux', 'Zustand',
    'Three.js', 'Shopify Storefront API', 'Headless e-commerce', 'Responsive design', 'UI/UX', 'Git', 'Figma'],
  knowsLanguage: ['English'],
  sameAs: SOCIALS,
};

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE}/`,
  name: 'Legend.dev',
  alternateName: ['Legend dev', 'Emonefe Ovie portfolio', 'Legend.dev portfolio'],
  description: PAGES['/'].description,
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
  author: { '@id': PERSON_ID },
};

// projects (from AppProvider's projectsData) -> an ItemList of creative works on the Projects page
function projectList(projectsData = []) {
  const items = projectsData.flatMap((group) => group.projects.map((p) => ({ ...p, group: group.projectType })));
  return {
    '@type': 'ItemList',
    name: 'Projects by Emonefe Ovie (Legend.dev)',
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'CreativeWork',
        name: p.title,
        description: p.description,
        url: p.link,
        image: p.src?.desktop ? `${SITE}${p.src.desktop}` : undefined,
        genre: p.group,
        creator: { '@id': PERSON_ID },
      },
    })),
  };
}

// the schema.org graph for a page (key = PAGES key, or null for the 404)
export function jsonLd(key, data = {}) {
  const page = PAGES[key];
  if (!page) return null;
  const url = urlOf(key);
  const webpage = {
    '@type': page.type,
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE },
    ...(page.type === 'ProfilePage' ? { mainEntity: { '@id': PERSON_ID } } : {}),
    ...(page.type === 'CollectionPage' ? { mainEntity: projectList(data.projectsData) } : {}),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        ...(key === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: page.title.split(' · ')[0], item: url }]),
      ],
    },
  };
  const faq = key === '/About' ? [{
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    isPartOf: { '@id': `${url}#webpage` },
    about: { '@id': PERSON_ID },
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }] : [];
  return { '@context': 'https://schema.org', '@graph': [person, website, webpage, ...faq] };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// the <head> tags for a page, as HTML (build time)
export function headTags(key, data) {
  const page = PAGES[key] ?? NOT_FOUND;
  const url = key ? urlOf(key) : null;
  const ld = key ? jsonLd(key, data) : null;
  return [
    `<meta name="robots" content="${key ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow'}" />`,
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    key ? `<link rel="canonical" href="${url}" />` : '',
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    url ? `<meta property="og:url" content="${url}" />` : '',
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    // (</ escaped so the JSON can never close the script tag)
    ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n    ');
}
