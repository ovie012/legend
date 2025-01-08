import React, { useContext, useEffect } from 'react';
import './App.css';
import { AppProvider, AppContext } from './AppProvider';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import About from './pages/About';
import Preloader from './components/Preloader';

function InnerApp () {
  const { lightMode, preloader, setLoadingPercentage, setAnimationStart, setPreloader, fadeAway, setFadeAway } = useContext(AppContext);

  useEffect(() => {
    let startTimestamp = null;

    const animateProgress = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      const progress = Math.min((elapsed / 6000) * 100, 100);
      setLoadingPercentage(progress);

      if (elapsed < 6000) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);

        setTimeout(() => {
          setAnimationStart(false);
      }, 1000);

      setTimeout(() => {
          setAnimationStart(true);
      }, 6300);

      setTimeout(() => {
        setFadeAway(true);
      }, 7300);

      setTimeout(() => {
        setPreloader(false);
      }, 7700);
  }, []);
  
  return (
    <>
      {preloader && <Preloader />}
      <div className={`container ${lightMode ? 'light-mode' : ''}`}>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Projects' element={<Projects />} />
          <Route path='/Contact' element={<Contact />} />
          <Route path='/About' element={<About />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
};

function App() {

  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
};

export default App


// LEGEND.DEV CODED THIS 