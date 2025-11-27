import React, { useEffect, useState, useRef } from 'react';

const LiquidCursor = () => {
    const cursorRef = useRef(null);
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        let animationFrameId;
        let mouseX = -100;
        let mouseY = -100;
        let currentX = -100;
        let currentY = -100;

        const updateMousePosition = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a') || e.target.classList.contains('card')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        const animate = () => {
            // Smooth follow
            const ease = 0.15;
            currentX += (mouseX - currentX) * ease;
            currentY += (mouseY - currentY) * ease;

            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.8 : isHovering ? 1.5 : 1})`;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <style>{`
        body {
          cursor: none !important;
        }
        a, button, .btn, .card, input {
          cursor: none !important;
        }
      `}</style>
            <div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    transition: 'width 0.3s, height 0.3s, background 0.3s',
                    mixBlendMode: 'difference'
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'white',
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    display: 'none' // Hidden for now, main cursor is enough
                }}
            />
        </>
    );
};

export default LiquidCursor;
