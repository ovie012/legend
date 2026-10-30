import React from 'react';

// 3D Legend.dev mark, rendered in Blender as a 24-frame turntable sprite (public/logo/).
// Gold in dark mode, espresso in light mode (set in App.css). spin: 'hover' | 'always' | 'none'.
function Logo3D({ spin = 'hover', className = '' }) {
  return <span className={`logo3d logo3d-${spin} ${className}`} aria-hidden="true"></span>;
}

export default Logo3D;
