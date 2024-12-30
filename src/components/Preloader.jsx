import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../AppProvider';

function Preloader() {
    const { preloader, animationStart, setPreloader, fadeAway, setFadeAway } = useContext(AppContext);

    const [loadingPercentage, setLoadingPercentage] = useState(0);
  
    useEffect(() => {
      const updateProgress = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledHeight = window.scrollY;
        const progress = (scrolledHeight / totalHeight) * 100;
        setLoadingPercentage(Math.min(Math.max(progress, 0), 100));
      };
  
      window.addEventListener("scroll", updateProgress);
  
      return () => window.removeEventListener("scroll", updateProgress); // Cleanup on unmount
    }, []);


  return (
    <>
        <div className={`preloader ${fadeAway ? 'fade-away' : ''}`}>
            <section className="preloader-blur">
                <span className="eclipse"></span>
                <span className="blur"></span>
                <img src="/icon-Star.svg" alt="star" className="star" />
                <img src="/icon-Star.svg" alt="star" className="star" />
            </section>
            <section className="preloader-display">
                <div className={`preloader-entry-text ${animationStart ? 'display' : ''}`}>
                    <p>Legend.dev</p>
                    <img src="/LegenddevRound-light.png" alt="logo" />
                    <p>Software Developer</p>
                </div>
                <p className={`preloader-fun-facts ${animationStart ? '' : 'display'}`}>{Math.round(loadingPercentage)}%</p>
            </section>
        </div>
    </>
  )
}

export default Preloader;