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

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 15 + 5; // Larger particles
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.02;
                this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.05 + 0.02})`; // Very subtle
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
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000); // Density based on screen size
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

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
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
                background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)', // Deep indigo to dark slate
                pointerEvents: 'none'
            }}
        />
    );
};

export default BackgroundParticles;
