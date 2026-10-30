import React from 'react';

// Pure-CSS 3D carousel: GPU-composited transforms only, no WebGL bundle.
function ProjectOrbit({ items, onSelect }) {
  const step = 360 / items.length;

  return (
    <div className="pj-orbit" aria-hidden="true">
      <div className="pj-orbit-ring" style={{ '--count': items.length }}>
        {items.map((item, i) => (
          <button
            type="button"
            tabIndex={-1}
            key={item.link}
            className="pj-orbit-card"
            style={{ '--angle': `${i * step}deg` }}
            onClick={() => onSelect(item)}
          >
            <img src={item.src.desktop} alt="" loading="eager" decoding="async" width="240" height="135" />
          </button>
        ))}
      </div>
      <div className="pj-orbit-floor"></div>
    </div>
  );
}

export default ProjectOrbit;
