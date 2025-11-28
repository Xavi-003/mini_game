import React, { useEffect, useRef } from 'react';

const BackgroundParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const SHAPES = ['square', 'triangle', 'circle', 'cross', 'pacman'];

        // Helper to get current theme colors
        const getThemeColors = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                particleBase: isDark ? 255 : 0, // White in dark mode, Black in light mode
                particleAlpha: isDark ? 0.05 : 0.03 // Slightly more transparent in light mode
            };
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 15 + 5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                this.updateColor();
            }

            updateColor() {
                const { particleBase, particleAlpha } = getThemeColors();
                this.color = `rgba(${particleBase}, ${particleBase}, ${particleBase}, ${Math.random() * particleAlpha + 0.02})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                if (this.x > canvas.width + 50) this.x = -50;
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.y > canvas.height + 50) this.y = -50;
                if (this.y < -50) this.y = canvas.height + 50;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.fillStyle = this.color;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;

                switch (this.shape) {
                    case 'square':
                        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                        break;
                    case 'triangle':
                        ctx.beginPath();
                        ctx.moveTo(0, -this.size / 2);
                        ctx.lineTo(this.size / 2, this.size / 2);
                        ctx.lineTo(-this.size / 2, this.size / 2);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case 'circle':
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    case 'cross':
                        ctx.beginPath();
                        ctx.moveTo(-this.size / 2, 0);
                        ctx.lineTo(this.size / 2, 0);
                        ctx.moveTo(0, -this.size / 2);
                        ctx.lineTo(0, this.size / 2);
                        ctx.stroke();
                        break;
                    case 'pacman':
                        ctx.beginPath();
                        ctx.arc(0, 0, this.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
                        ctx.lineTo(0, 0);
                        ctx.fill();
                        break;
                    default:
                        break;
                }

                ctx.restore();
            }
        }

        const init = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        // Observer for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    particles.forEach(p => p.updateColor());
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: 'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                pointerEvents: 'none',
                transition: 'background 0.3s ease'
            }}
        />
    );
};

export default BackgroundParticles;
