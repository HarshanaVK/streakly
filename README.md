# ⚡ Streakly — Interactive Habit Tracking & Productivity Companion

<div align="center">
  <img src="./public/cover.png" alt="Streakly Banner" width="100%" style="border-radius: 16px; max-height: 480px; object-fit: contain; background: #ffffff;" />

  <br />
  <br />

  [![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-FF0055?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
  [![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-00E699?style=for-the-badge&logo=redis)](https://upstash.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

  <p align="center">
    <strong>An Apple-inspired, mobile-first habit tracking dashboard featuring Bloop—a living virtual companion that evolves with your daily consistency.</strong>
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-mobile-first-ergonomics">Mobile Ergonomics</a> •
    <a href="#-virtual-companion-bloop">Virtual Pet</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-local-setup">Local Setup</a>
  </p>
</div>

---

## 📱 About Streakly

**Streakly** combines gamified habit rituals, timezone-aware streak mathematics, milestone countdown timers, and an interactive virtual pet into a fluid, glassmorphic dashboard optimized specifically for mobile smartphones (with dedicated safe-area ergonomics for **iPhone 14 Plus** and **iPhone 8 Plus**).

Designed to be hosted entirely on the **Vercel Free Tier**, Streakly features an **offline-first local cache engine** with background debounced synchronization to **Upstash Redis**, synthesized Web Audio (zero-asset audio downloads), and Apple-grade spring physics.

---

## ✨ Key Features

### 🐾 1. Living Virtual Companion ("Bloop / Nova")
- **Real-Time Gaze & Touch Tracking**: Bloop's pupils and ears follow your touch coordinates across the screen with trigonometric angle tracking.
- **Sleep & Nap Engine**: Enters gentle slumber with soft breathing keyframes and floating `Z z z` bubbles after 22 seconds of inactivity; awakens immediately on touch.
- **Super Reaction Suite**:
  - 🤸 **Acrobatic 360° Starflip**: Double-tap backflip vault with sparkle particle bursts.
  - 🍓 **Chewing & Munching Cheeks**: Cheeks puff and animate in a rhythmic chew cycle when fed cosmic treats.
  - 🌀 **Dizzy Tickle Combo**: Swirling spiral eyes (`@ _ @`) and blushing hearts on rapid 4-tap combos.
  - ✨ **Winking Eyes**: Dynamic 10% winking chance during purring pets.
- **Companion Resonance XP Engine**:
  - `+25 XP` per habit ritual completed.
  - `+15 XP` per to-do task checked off.
  - `+20 XP` per treat fed.
  - `+10 XP` per acrobatic star-jump.
  - Automatic level rollover with full-screen **Breakthrough Celebration Modal** featuring confetti bursts and 7-note ascending audio fanfare.

### ⭕ 2. Concentric Apple Activity Telemetry Rings
- **Concentric Dual-Track Geometry**:
  - **Outer Ring (Rose)**: Daily Habit Rituals completion percentage.
  - **Middle Ring (Emerald)**: Daily Action To-Dos completion percentage.
  - **Inner Ring (Cyan)**: 7-Day Weekly Momentum Average.
- **Generous Center Aperture**: Re-engineered 61px clear diameter ensuring the sync percentage and label remain crisp, unobstructed, and legible on all mobile displays.

### ⏱️ 3. Milestone & Exam Countdown Timers
- **Independent High-Contrast Monospace Digit Blocks**: Dedicated, generously spaced blocks for **Days**, **Hours**, **Mins**, and pulsing **Secs**.
- **Prep Runway Bar**: Visual progress runway indicating percentage elapsed and remaining time.
- **Deep Focus Visor**: Tapping focus locks Bloop into deep study mode equipped with his dark cyberpunk visor gear.

### 🔒 4. Dual Profiles & Master Security
- **Visal ⚡ (Master Profile)**: Protected with a glassmorphic 4-digit PIN pad (`1234`), full administrative control, data export/import, and master audit logs.
- **Pooja 🌸 (Member Profile)**: 1-tap instant switch to a cherry-blossom themed workspace with independent habit routines, to-dos, and pet levels.

### 🎵 5. Zero-Asset Web Audio Synthesis
- 100% synthesized in real time via the browser's `AudioContext` with **0 KB external MP3/WAV download overhead**.
- Dual-hit sub-bass impact layered with an 8-note D-Major orchestral chord shimmer, level-up fanfares, tactile purr pulses, and eating crunch chimes.

---

## 📲 Mobile-First Ergonomics

Streakly is tailored to fit modern and classic mobile form factors:

| Device | Dimensions | Adaptive Behavior |
| :--- | :--- | :--- |
| **iPhone 14 Plus** | `428 × 926 px` (~19.5:9) | `pt-safe` buffers camera notch; `bottom-safe-tab` floats above the home indicator bar. |
| **iPhone 8 Plus** | `414 × 736 px` (16:9) | Compact card paddings and auto-overflow scroll locks prevent button clipping on 736px viewports. |
| **PWA Full-Screen** | Standalone mode | Configured with `apple-mobile-web-app-capable: yes` and `statusBarStyle: black-translucent` for an app-store native feel. |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict type checking)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with customized glassmorphic design tokens
- **Animations**: [Framer Motion 11](https://www.framer.com/motion/) (Spring layout transitions & AnimatePresence)
- **Database / Cache**: [Upstash Redis](https://upstash.com/) (Serverless REST KV) with automatic local-storage fallback
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Haptics**: Native Web Audio API (`AudioContext`) & Navigator Vibration API

---

## 🚀 Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/HarshanaVK/streakly.git
cd streakly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (or use mobile responsive mode).

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🌐 Environment Variables (Optional)

Streakly works 100% offline out-of-the-box. To enable cross-device cloud synchronization via Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

---

## 📄 License

This project is licensed under the MIT License — feel free to use, modify, and distribute.
