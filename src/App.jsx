import React, { useContext } from 'react';
import './App.css';
import { AppProvider, AppContext } from './AppProvider';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import About from './pages/About';

function InnerApp () {
  const { lightMode } = useContext(AppContext);
  
  return (
    <>
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