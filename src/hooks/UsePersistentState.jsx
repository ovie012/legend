import { useState, useEffect} from 'react';
import { getItem, setItem } from '../utils/LocalStorage';

export function usePersistentState(key, initialValue) {
    const [state, setState] = useState(() => {
        const storedValue = getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : initialValue;
    });

    useEffect(() => {
        setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}