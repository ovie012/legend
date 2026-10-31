import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import App from './App.jsx';
// Plus Jakarta Sans served from this site (not Google Fonts), so visitors' IPs never go to Google
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css';
import './index.css';

// the page arrives with pre-rendered HTML (for crawlers), hidden while JavaScript starts; the app replaces it and is
// shown in the same frame (index.html: app-pending)
function Reveal() {
  useLayoutEffect(() => { document.documentElement.classList.remove('app-pending'); }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Reveal />
      <ScrollToTop />
      <App />
    </Router>
  </React.StrictMode>,
)
