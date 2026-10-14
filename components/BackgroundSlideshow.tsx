'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const NOVA_WALLPAPERS = [
  {
    id: 'alpine',
    title: 'Alpine Twilight',
    emoji: '🏔️',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
    fallbackGrad: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #070913 100%)',
  },
  {
    id: 'aurora',
    title: 'Aurora Borealis',
    emoji: '🌌',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80',
    fallbackGrad: 'linear-gradient(180deg, #064e3b 0%, #0f172a 50%, #030712 100%)',
  },
  {
    id: 'dunes',
    title: 'Golden Dunes',
    emoji: '🏜️',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80',
    fallbackGrad: 'linear-gradient(180deg, #451a03 0%, #1c1917 50%, #09090b 100%)',
  },
  {
    id: 'zen',
    title: 'Zen Sanctuary',
    emoji: '🏛️',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    fallbackGrad: 'linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
  },
  {
    id: 'cyber',
    title: 'Cyber Rain',
    emoji: '🌧️',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    fallbackGrad: 'linear-gradient(180deg, #1e1b4b 0%, #31102f 50%, #05050d 100%)',
  },
];

export function BackgroundSlideshow() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoSlideshow, setAutoSlideshow] = useState(true);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});

  // Auto slideshow every 12 seconds if enabled
  useEffect(() => {
    if (!autoSlideshow) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % NOVA_WALLPAPERS.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [autoSlideshow]);

  const activeWall = NOVA_WALLPAPERS[activeIdx];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Underlying Base Gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{ background: activeWall.fallbackGrad, opacity: 0.9 }}
      />

      {/* 2. Unsplash Wallpapers with Ken Burns motion */}
      {NOVA_WALLPAPERS.map((wall, idx) => {
        const isCurrent = idx === activeIdx;
        if (hasError[idx]) return null;

        return (
          <div
            key={wall.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-35 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ willChange: 'opacity, transform' }}
          >
            <div className="relative w-full h-full animate-kenburns">
              <Image
                src={wall.url}
                alt={wall.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-center"
                onError={() => setHasError((p) => ({ ...p, [idx]: true }))}
              />
            </div>
          </div>
        );
      })}

      {/* 3. Ambient Vignette & Contrast Overlay */}
      <div
        className="absolute inset-0 transition-colors duration-700 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(15, 23, 42, 0.25) 0%, rgba(6, 8, 15, 0.78) 75%, rgba(5, 6, 11, 0.92) 100%)',
        }}
      />

      {/* 4. Ambient Mood Switcher Pill (Floating in bottom-right, hidden on mobile to avoid overlapping navigation dock) */}
      <div className="hidden md:flex absolute bottom-4 right-4 pointer-events-auto z-10 items-center gap-1 bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-2xl shadow-2xl">
        {NOVA_WALLPAPERS.map((wall, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={wall.id}
              onClick={() => setActiveIdx(idx)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                isSelected
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={wall.title}
            >
              <span>{wall.emoji}</span>
              <span className="hidden md:inline">{wall.title.split(' ')[0]}</span>
            </button>
          );
        })}

        <button
          onClick={() => setAutoSlideshow(!autoSlideshow)}
          className={`px-2 py-1 rounded-full text-xs font-bold transition-all ml-0.5 flex items-center gap-1 ${
            autoSlideshow
              ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30'
              : 'text-slate-400 bg-white/5 border border-white/10'
          }`}
          title="Toggle Auto Slideshow"
        >
          <span>{autoSlideshow ? '▶ Auto' : '⏸ Paused'}</span>
        </button>
      </div>
    </div>
  );
}
