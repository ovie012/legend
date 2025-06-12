export function setItem(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error setting item in localStorage", error);
    } 
}

export function getItem(key) {
    try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error("Error getting item from localStorage", error);
        return null;
    }
}
export function removeItem(key) {
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing item from localStorage", error);
    }
}
export function clearStorage() {
    try {
        window.localStorage.clear();
    } catch (error) {
        console.error("Error clearing localStorage", error);
    }
}
export function isLocalStorageAvailable() {
    try {
        const testKey = '__test__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}
export function getLocalStorageKeys() {
    try {
        return Object.keys(window.localStorage);
    } catch (error) {
        console.error("Error getting localStorage keys", error);
        return [];
    }
}
export function getLocalStorageValues() {
    try {
        const values = [];
        const keys = getLocalStorageKeys();
        for (const key of keys) {
            values.push(getItem(key));
        }
        return values;
    } catch (error) {
        console.error("Error getting localStorage values", error);
        return [];
    }
}
export function getLocalStorageEntries() {
    try {
        const entries = [];
        const keys = getLocalStorageKeys();
        for (const key of keys) {
            entries.push([key, getItem(key)]);
        }
        return entries;
    } catch (error) {
        console.error("Error getting localStorage entries", error);
        return [];
    }
}
export function localStorageSize() {
    try {
        let total = 0;
        const keys = getLocalStorageKeys();
        for (const key of keys) {
            const value = getItem(key);
            total += key.length + (value ? JSON.stringify(value).length : 0);
        }
        return total;
    } catch (error) {
        console.error("Error calculating localStorage size", error);
        return 0;
    }
}
export function isLocalStorageEmpty() {
    try {
        return getLocalStorageKeys().length === 0;
    } catch (error) {
        console.error("Error checking if localStorage is empty", error);
        return true;
    }
}
export function getLocalStorageUsage() {
    try {
        const total = localStorageSize();
        const keys = getLocalStorageKeys();
        return {
            total,
            keys,
            values: getLocalStorageValues(),
            entries: getLocalStorageEntries()
        };
    } catch (error) {
        console.error("Error getting localStorage usage", error);
        return null;
    }
}
export function getLocalStorageUsageSummary() {
    try {
        const usage = getLocalStorageUsage();
        return {
            total: usage.total,
            keysCount: usage.keys.length,
            valuesCount: usage.values.length,
            entriesCount: usage.entries.length
        };
    } catch (error) {
        console.error("Error getting localStorage usage summary", error);
        return null;
    }
}
export function getLocalStorageInfo() {
    try {
        const usage = getLocalStorageUsage();
        return {
            totalSize: usage.total,
            keys: usage.keys,
            values: usage.values,
            entries: usage.entries
        };
    } catch (error) {
        console.error("Error getting localStorage info", error);
        return null;
    }
}
export function getLocalStorageInfoSummary() {
    try {
        const info = getLocalStorageInfo();
        return {
            totalSize: info.totalSize,
            keysCount: info.keys.length,
            valuesCount: info.values.length,
            entriesCount: info.entries.length
        };
    } catch (error) {
        console.error("Error getting localStorage info summary", error);
        return null;
    }
}
export function localStorageToObject() {
    try {
        const obj = {};
        const keys = getLocalStorageKeys();
        for (const key of keys) {
            obj[key] = getItem(key);
        }
        return obj;
    } catch (error) {
        console.error("Error converting localStorage to object", error);
        return {};
    }
}
export function objectToLocalStorage(obj) {
    try {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                setItem(key, obj[key]);
            }
        }
    } catch (error) {
        console.error("Error converting object to localStorage", error);
    }
}
export function localStorageToJSON() {
    try {
        const obj = localStorageToObject();
        return JSON.stringify(obj, null, 2);
    } catch (error) {
        console.error("Error converting localStorage to JSON", error);
        return '{}';
    }
}
export function jsonToLocalStorage(json) {
    try {
        const obj = JSON.parse(json);
        objectToLocalStorage(obj);
    } catch (error) {
        console.error("Error converting JSON to localStorage", error);
    }
}
export function localStorageToCSV() {
    try {
        const keys = getLocalStorageKeys();
        const values = getLocalStorageValues();
        let csv = keys.join(',') + '\n';
        csv += values.map(value => JSON.stringify(value)).join(',') + '\n';
        return csv;
    } catch (error) {
        console.error("Error converting localStorage to CSV", error);
        return '';
    }
}
export function csvToLocalStorage(csv) {
    try {
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        const keys = lines[0].split(',');
        const values = lines[1].split(',').map(value => JSON.parse(value));
        for (let i = 0; i < keys.length; i++) {
            setItem(keys[i], values[i]);
        }
    } catch (error) {
        console.error("Error converting CSV to localStorage", error);
    }
}