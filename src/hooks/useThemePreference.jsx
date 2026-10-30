import { useCallback, useEffect, useState } from 'react';
import { getItem, setItem } from '../utils/LocalStorage';

const KEY = 'themeChoice';
const query = '(prefers-color-scheme: light)';
const systemPrefersLight = () => typeof window !== 'undefined' && window.matchMedia(query).matches;

// Follows the device's light/dark setting until the visitor picks a theme with the toggle;
// from then on their choice is remembered on this machine.
export function useThemePreference() {
    const [choice, setChoice] = useState(() => getItem(KEY));
    const [systemLight, setSystemLight] = useState(systemPrefersLight);

    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = () => setSystemLight(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const lightMode = choice ?? systemLight;

    const setLightMode = useCallback((value) => {
        const next = typeof value === 'function' ? value(lightMode) : value;
        setItem(KEY, next);
        setChoice(next);
    }, [lightMode]);

    return [lightMode, setLightMode];
}
