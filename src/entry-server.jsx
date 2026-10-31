// Build-time rendering (scripts/prerender.mjs): each page's HTML, so search engines, AI crawlers and link previews
// read the real content without running JavaScript. The browser still starts the app from main.jsx as before.
import React, { useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';
import { AppContext, AppProvider } from './AppProvider';

export { PAGES, SITE, headTags, urlOf } from './seo';

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}

// the app's shared data (projects ...) for the structured data
export function appData() {
  let data = {};
  function Capture() { data = useContext(AppContext); return null; }
  renderToString(<AppProvider><Capture /></AppProvider>);
  return data;
}
