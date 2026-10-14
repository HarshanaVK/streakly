'use client';

import React, { useEffect, useRef } from 'react';

export function triggerGlobalParticleBurst(
  x: number,
  y: number,
  preset: 'celebrate' | 'hearts' = 'celebrate'
) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('novaos-particles', {
      detail: { x, y, preset },
    })
  );
}

export function ParticleFXOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchGlowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      shape: 'heart' | 'star' | 'circle';
      rotation: number;
      vRot: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const spawnParticles = (
      x: number,
      y: number,
      preset: 'celebrate' | 'hearts'
    ) => {
      const count = preset === 'hearts' ? 16 : 28;
      const colors =
        preset === 'hearts'
          ? ['#fb7185', '#f43f5e', '#fda4af', '#fde047', '#ff6b81']
          : ['#38bdf8', '#34d399', '#fde047', '#f472b6', '#a78bfa', '#60a5fa'];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 2.5 + Math.random() * 5.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: 5 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          shape:
            preset === 'hearts'
              ? 'heart'
              : Math.random() > 0.5
              ? 'star'
              : 'circle',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const handleCustomBurst = (e: Event) => {
      const customEvent = e as CustomEvent<{
        x: number;
        y: number;
        preset: 'celebrate' | 'hearts';
      }>;
      if (customEvent.detail) {
        spawnParticles(
          customEvent.detail.x,
          customEvent.detail.y,
          customEvent.detail.preset
        );
      }
    };
    window.addEventListener('novaos-particles', handleCustomBurst);

    // Mouse / Touch Follower Glow
    let glowTimer: NodeJS.Timeout | null = null;
    const handlePointer = (clientX: number, clientY: number, isTouch = false) => {
      const glow = touchGlowRef.current;
      if (glow) {
        glow.style.left = `${clientX}px`;
        glow.style.top = `${clientY}px`;
        if (isTouch) {
          glow.classList.add('active');
          if (glowTimer) clearTimeout(glowTimer);
          glowTimer = setTimeout(() => glow.classList.remove('active'), 500);
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => handlePointer(e.clientX, e.clientY, false);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY, true);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointer(e.touches[0].clientX, e.touches[0].clientY, true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.alpha -= 0.018;
        p.rotation += p.vRot;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'heart') {
          const s = p.size * 0.13;
          ctx.beginPath();
          ctx.moveTo(0, 3 * s);
          ctx.bezierCurveTo(0, 0, -5 * s, 0, -5 * s, 3 * s);
          ctx.bezierCurveTo(-5 * s, 6 * s, 0, 8 * s, 0, 10 * s);
          ctx.bezierCurveTo(0, 8 * s, 5 * s, 6 * s, 5 * s, 3 * s);
          ctx.bezierCurveTo(5 * s, 0, 0, 0, 0, 3 * s);
          ctx.fill();
        } else if (p.shape === 'star') {
          const r = p.size * 0.6;
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(
              Math.cos(((18 + s * 72) * Math.PI) / 180) * r,
              -Math.sin(((18 + s * 72) * Math.PI) / 180) * r
            );
            ctx.lineTo(
              Math.cos(((54 + s * 72) * Math.PI) / 180) * (r * 0.5),
              -Math.sin(((54 + s * 72) * Math.PI) / 180) * (r * 0.5)
            );
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('novaos-particles', handleCustomBurst);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      if (glowTimer) clearTimeout(glowTimer);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 select-none"
        aria-hidden="true"
      />
      <div
        ref={touchGlowRef}
        id="touchGlow"
        className="fixed w-11 h-11 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
