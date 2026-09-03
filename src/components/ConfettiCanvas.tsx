import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  isActive?: boolean;
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = ['#00685f', '#6bd8cb', '#dc2c4f', '#a36700', '#89f5e7', '#ffb2b7', '#f59e0b'];
    const particleCount = 60;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.45) - 20,
      size: Math.random() * 7 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      velX: (Math.random() - 0.5) * 3,
      velY: Math.random() * 2.5 + 1.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: 1,
    }));

    let animationFrameId: number;
    let elapsed = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      elapsed++;

      particles.forEach((p) => {
        p.x += p.velX;
        p.y += p.velY;
        p.rotation += p.rotSpeed;

        if (elapsed > 120) {
          p.opacity -= 0.007;
        }

        if (p.opacity > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (elapsed < 280) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 w-full h-full"
    />
  );
};
