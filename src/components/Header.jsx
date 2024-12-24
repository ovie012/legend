import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../AppProvider';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaSun, FaMoon } from "react-icons/fa";

function Header() {
    const { lightMode, setLightMode, scrollToTop, mobileNav, setMobileNav } = useContext(AppContext);
    const [isScrolled, setIsScrolled] = useState(false);


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

  return (
    <>
        <header className={`${isScrolled ? 'scrolled' : ''}`}>
            <Link to='/' onClick={scrollToTop} >
                <img src="/legend-logo.jpg" alt="logo" className="logo" />
            </Link>
            <span className={`click ${mobileNav ? 'close' : ''}`} onClick={() => { setMobileNav(!mobileNav); }}></span>
            <div className={`mobile-nav-container ${mobileNav ? 'open' : ''}`}>
                <nav className='mobile-nav'>
                    <h3>
                        <NavLink to='/' onClick={() => { scrollToTop(); setMobileNav(false); }} >home</NavLink>
                    </h3>
                    <h3>
                        <NavLink to='/About' onClick={() => { scrollToTop(); setMobileNav(false); }} >about</NavLink>
                    </h3>
                    <h3>
                        <NavLink to='/Projects' onClick={() => { scrollToTop(); setMobileNav(false); }} >projects</NavLink>
                    </h3>
                    <h3>
                        <NavLink to='/Contact' onClick={() => { scrollToTop(); setMobileNav(false); }} >contact</NavLink>
                    </h3>
                    <div onClick={() => {setLightMode(!lightMode)}} className="change-mode">
                        <FaMoon className={`fa-icon ${lightMode ? '' : 'changed-mode-move'}`} />
                        <span></span>
                        <FaSun className={`fa-icon ${lightMode ?'changed-mode-move' : ''}`} />
                    </div>
                </nav>
            </div>
            <nav className='desktop-nav'>
                <h3>
                    <NavLink to='/' onClick={scrollToTop} >home</NavLink>
                </h3>
                <h3>
                    <NavLink to='/About' onClick={scrollToTop} >about</NavLink>
                </h3>
                <h3>
                    <NavLink to='/Projects' onClick={scrollToTop} >projects</NavLink>
                </h3>
                <h3>
                    <NavLink to='/Contact' onClick={scrollToTop} >contact</NavLink>
                </h3>
            </nav>
            {!lightMode ? 
                <FaSun className='light-dark-mode' onClick={() => {setLightMode(!lightMode)}} />
            :
                <FaMoon className='light-dark-mode' onClick={() => {setLightMode(!lightMode)}} />
            }
        </header>
    </>
  )
}

export default Header