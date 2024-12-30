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
  const { lightMode, preloader, animationStart, setAnimationStart, setPreloader, fadeAway, setFadeAway } = useContext(AppContext);

  // useEffect(() => {
  //   const handleLoad = () => {
  //     setAnimationStart(false);
  //     setTimeout(() => {
  //         setAnimationStart(true);
  //     }, 5300);

  //     setTimeout(() => {
  //       setFadeAway(true);
  //     }, 6300);

  //     setTimeout(() => {
  //       setPreloader(false);
  //     }, 7000);
  //   };

  //   window.addEventListener("load", handleLoad);

  //   return () => window.removeEventListener("load", handleLoad);
  // }, []);

  // useEffect(() => {
  //   const checkProgress = () => {
  //     const performanceTiming = window.performance.timing;
  //     const now = Date.now();

  //     const totalTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
  //     const elapsedTime = now - performanceTiming.navigationStart;

  //     const progress = (elapsedTime / totalTime) * 100;

  //     if (progress >= 90) {
  //       setAnimationStart(true);
  //     }

  //     if (progress >= 100) {
  //       setFadeAway(true);
  //       setTimeout(() => {
  //         setPreloader(false);
  //       }, 500);
  //       clearInterval(progressInterval);
  //     }
  //   };

  //   const progressInterval = setInterval(() => {
  //     if (window.performance.timing.loadEventEnd > 0) {
  //       checkProgress();
  //     }
  //   }, 100);

  //   return () => clearInterval(progressInterval);
  // }, []);

  useEffect(() => {
    let progressInterval;
    let animationTimeout;
    let fallbackTimeout;

    const handleLoad = () => {
      const performanceTiming = window.performance.timing;
      const totalLoadTime =
        performanceTiming.loadEventEnd > 0
          ? performanceTiming.loadEventEnd - performanceTiming.navigationStart
          : 7000;

      const checkProgress = () => {
        setAnimationStart(false)
        const now = Date.now();
        const elapsedTime = now - performanceTiming.navigationStart;
        const progress = (elapsedTime / totalLoadTime) * 100;

        if (progress >= 90 && !animationStart) {
          setAnimationStart(true);
        }

        if (elapsedTime >= totalLoadTime - 2000 && !animationStart) {
          setAnimationStart(true);
        }
      };

      progressInterval = setInterval(checkProgress, 100);

     
      animationTimeout = setTimeout(() => {
        setFadeAway(true);
        setTimeout(() => setPreloader(false), 1000); 
        clearInterval(progressInterval);
      }, 7000);

      fallbackTimeout = setTimeout(() => {
        if (!animationStart) {
          setAnimationStart(true);
        }
      }, 6000);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(animationTimeout);
      window.removeEventListener("load", handleLoad);
    };
  }, []);
  
  return (
    <>
      <div className={`container ${lightMode ? 'light-mode' : ''}`}>
        {preloader && <Preloader />}
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