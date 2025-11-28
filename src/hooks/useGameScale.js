import { useState, useEffect } from 'react';

const useGameScale = (containerRef, gameWidth, gameHeight) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                // Calculate scale to fit, with a small buffer (0.95) to avoid edge clipping
                const scaleX = width / gameWidth;
                const scaleY = height / gameHeight;
                const newScale = Math.min(scaleX, scaleY) * 0.95;
                setScale(newScale);
            }
        };

        // Initial calculation
        updateScale();

        // Observer for resize
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        window.addEventListener('resize', updateScale);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, [containerRef, gameWidth, gameHeight]);

    return scale;
};

export default useGameScale;
