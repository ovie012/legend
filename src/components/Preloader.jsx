import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../AppProvider';

function Preloader() {
    const { preloader, animationStart, loadingPercentage, fadeAway, setFadeAway } = useContext(AppContext);

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
                    <div>
                        <img src="/LegenddevRound-light.webp" alt="logo" />
                    </div>
                    <p>Software Developer</p>
                </div>
                <p className={`preloader-fun-facts ${animationStart ? '' : 'display'}`}>{Math.round(loadingPercentage)}%</p>
            </section>
        </div>
    </>
  )
}

export default Preloader;