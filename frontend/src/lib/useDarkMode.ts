import { useState, useEffect } from 'react';

export function useDarkMode() {
    const [dark, setDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const obs = new MutationObserver(() =>
            setDark(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const toggle = () => {
        const next = !document.documentElement.classList.contains('dark');
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('hp_theme', next ? 'dark' : 'light');
    };

    return { dark, toggle };
}
