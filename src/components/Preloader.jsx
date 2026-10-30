import React, { useContext } from 'react'
import { AppContext } from '../AppProvider';
import Logo3D from './Logo3D';

// Ellipse of the brand orbit; the progress arc and the star travel along it.
const RX = 150;
const RY = 52;

function Preloader() {
    const { lightMode, loadingPercentage, fadeAway } = useContext(AppContext);
    const angle = (loadingPercentage / 100) * Math.PI * 2;
    const star = { x: RX * Math.cos(angle), y: RY * Math.sin(angle) };

  return (
    <>
        <div
            className={`preloader ${lightMode ? 'light-mode' : ''} ${fadeAway ? 'fade-away' : ''}`}
            role="progressbar"
            aria-label="Loading Legend.dev"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(loadingPercentage)}
        >
            <span className="preloader-glow" aria-hidden="true"></span>
            <div className="preloader-stage">
                <svg className="preloader-orbit" viewBox="-170 -70 340 140" aria-hidden="true">
                    <g transform="rotate(-10)">
                        <ellipse className="preloader-track" rx={RX} ry={RY} />
                        <ellipse
                            className="preloader-arc"
                            rx={RX}
                            ry={RY}
                            pathLength="100"
                            strokeDasharray={`${loadingPercentage} 100`}
                        />
                        <path
                            className="preloader-star"
                            transform={`translate(${star.x} ${star.y}) scale(0.42) translate(-20 -20.4)`}
                            d="M20 0.41626L25.4018 15.0144L40 20.4163L25.4018 25.8181L20 40.4163L14.5982 25.8181L0 20.4163L14.5982 15.0144L20 0.41626Z"
                        />
                    </g>
                </svg>
                <Logo3D spin="always" className="preloader-logo" />
            </div>
            <p className="preloader-name">Legend<span>.dev</span></p>
            <p className="preloader-role">AI Engineer · Software Developer</p>
            <p className="preloader-count">{Math.round(loadingPercentage)}%</p>
        </div>
    </>
  )
}

export default Preloader;
