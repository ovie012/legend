import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

function BannerIntro() {
    const { lightMode, setLightMode } = useContext(AppContext);

  return (
    <>
        <div className="banner-intro">
            <span className="eclipse"></span>
            <span className="blur"></span>
            <img src="/icon-Star.svg" alt="star" className="star" />
            <img src="/icon-Star.svg" alt="star" className="star" />
            <section className="banner-info">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <h2>Hello, I’m Emonefe Ovie and I’m a Software Developer.</h2>
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                >
                <p>A passionate Software Developer dedicated to crafting
                    visually stunning and responsive websites.
                    I blend creativity with clean code to deliver exceptional user experiences.
                    Let's collaborate to bring your vision to life!
                </p>
                </motion.div>
            </motion.div>
            <Link to='/Contact'>
                <button className='contact-me-button'>contact me</button>
            </Link>
            <Link to='/Projects'>
                <button className='explore-projects-button'>explore projects</button>
            </Link>
            </section>
            <img src="/icon-swirl-pointer.svg" alt="swirly pointer" className="pointer" />
            <figure className="banner-images">
                <img src={`/Legend-himself${lightMode ? '-lightt' : ''}.webp`} alt="ovie picture" className="legend-banner-image" />
                <img src="/icon-Star.svg" alt="star" className="legend-banner-star" />
            </figure>
        </div>
    </>
  )
}

export default BannerIntro;