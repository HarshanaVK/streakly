import { BackgroundCategory } from '@/lib/types';

export interface BackgroundSlide {
  id: string;
  category: Exclude<BackgroundCategory, 'auto'>;
  title: string;
  subtitle: string;
  imageUrl: string;
  fallbackGradient: string;
  meshColors: [string, string, string];
}

export const BACKGROUND_SLIDES: BackgroundSlide[] = [
  // Sunrise & Morning Light
  {
    id: 'sunrise-1',
    category: 'sunrise',
    title: 'Golden Horizon',
    subtitle: 'First light over misted peaks',
    imageUrl:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.35), transparent 55%), radial-gradient(circle at 80% 70%, rgba(244, 63, 94, 0.3), transparent 60%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #31102f 100%)',
    meshColors: ['#fb923c', '#f43f5e', '#31102f'],
  },
  {
    id: 'sunrise-2',
    category: 'sunrise',
    title: 'Amber Dawn',
    subtitle: 'Calm morning glow through clouds',
    imageUrl:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 75% 25%, rgba(245, 158, 11, 0.32), transparent 55%), radial-gradient(circle at 25% 80%, rgba(139, 92, 246, 0.28), transparent 60%), linear-gradient(160deg, #090d16 0%, #1e1b4b 100%)',
    meshColors: ['#f59e0b', '#ec4899', '#1e1b4b'],
  },

  // Focused Desk / Study
  {
    id: 'study-1',
    category: 'study',
    title: 'Deep Focus Studio',
    subtitle: 'Minimalist workspace in warm light',
    imageUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.28), transparent 55%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.22), transparent 55%), linear-gradient(135deg, #050814 0%, #0f172a 100%)',
    meshColors: ['#3b82f6', '#10b981', '#0f172a'],
  },
  {
    id: 'study-2',
    category: 'study',
    title: 'Quiet Library Glow',
    subtitle: 'Crafted for uninterrupted flow',
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 70% 25%, rgba(99, 102, 241, 0.3), transparent 55%), radial-gradient(circle at 20% 70%, rgba(236, 72, 153, 0.22), transparent 55%), linear-gradient(135deg, #070913 0%, #17153b 100%)',
    meshColors: ['#6366f1', '#ec4899', '#17153b'],
  },

  // Mountains & Forest
  {
    id: 'mountains-1',
    category: 'mountains',
    title: 'Alpine Serenity',
    subtitle: 'High altitude clarity and pine valleys',
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.3), transparent 55%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.28), transparent 60%), linear-gradient(135deg, #041014 0%, #0f172a 100%)',
    meshColors: ['#10b981', '#3b82f6', '#041014'],
  },
  {
    id: 'mountains-2',
    category: 'mountains',
    title: 'Emerald Ridge',
    subtitle: 'Misty forest canopy at dusk',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 75% 30%, rgba(6, 182, 212, 0.3), transparent 55%), radial-gradient(circle at 20% 75%, rgba(16, 185, 129, 0.25), transparent 55%), linear-gradient(135deg, #06121c 0%, #111827 100%)',
    meshColors: ['#06b6d4', '#10b981', '#06121c'],
  },

  // Calm Ocean
  {
    id: 'ocean-1',
    category: 'ocean',
    title: 'Pacific Glass',
    subtitle: 'Rhythmic tides and endless horizon',
    imageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.32), transparent 55%), radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.28), transparent 60%), linear-gradient(135deg, #040d1a 0%, #0c192c 100%)',
    meshColors: ['#0ea5e9', '#6366f1', '#040d1a'],
  },
  {
    id: 'ocean-2',
    category: 'ocean',
    title: 'Sapphire Cove',
    subtitle: 'Deep blue calm beneath twilight skies',
    imageUrl:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 70% 20%, rgba(56, 189, 248, 0.3), transparent 55%), radial-gradient(circle at 30% 80%, rgba(59, 130, 246, 0.3), transparent 60%), linear-gradient(135deg, #030712 0%, #0f172a 100%)',
    meshColors: ['#38bdf8', '#3b82f6', '#030712'],
  },

  // Night Sky & City Lights
  {
    id: 'night-1',
    category: 'night',
    title: 'Starlight Observatory',
    subtitle: 'Milky Way arch above still waters',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.34), transparent 55%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.28), transparent 60%), linear-gradient(135deg, #03040b 0%, #0f1026 100%)',
    meshColors: ['#8b5cf6', '#3b82f6', '#03040b'],
  },
  {
    id: 'night-2',
    category: 'night',
    title: 'Neon Metropolis',
    subtitle: 'Midnight skyline reflections',
    imageUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    fallbackGradient:
      'radial-gradient(circle at 75% 25%, rgba(236, 72, 153, 0.3), transparent 55%), radial-gradient(circle at 25% 75%, rgba(99, 102, 241, 0.3), transparent 60%), linear-gradient(135deg, #05050d 0%, #131129 100%)',
    meshColors: ['#ec4899', '#6366f1', '#05050d'],
  },
];

export const BACKGROUND_CATEGORIES: {
  id: BackgroundCategory;
  label: string;
  emoji: string;
}[] = [
  { id: 'auto', label: 'Time of Day (Auto)', emoji: '✨' },
  { id: 'sunrise', label: 'Sunrise & Dawn', emoji: '🌅' },
  { id: 'study', label: 'Focused Study', emoji: '📚' },
  { id: 'mountains', label: 'Mountains & Forest', emoji: '🏔️' },
  { id: 'ocean', label: 'Calm Ocean', emoji: '🌊' },
  { id: 'night', label: 'Night & Cosmos', emoji: '🌌' },
];

export function getSlidesForCategory(
  category: BackgroundCategory,
  hourOfDay: number
): BackgroundSlide[] {
  let resolvedCategory: Exclude<BackgroundCategory, 'auto'> = 'night';

  if (category === 'auto') {
    if (hourOfDay >= 5 && hourOfDay < 10) {
      resolvedCategory = 'sunrise';
    } else if (hourOfDay >= 10 && hourOfDay < 16) {
      resolvedCategory = 'study';
    } else if (hourOfDay >= 16 && hourOfDay < 19) {
      resolvedCategory = 'ocean';
    } else if (hourOfDay >= 19 && hourOfDay < 21) {
      resolvedCategory = 'mountains';
    } else {
      resolvedCategory = 'night';
    }
  } else {
    resolvedCategory = category;
  }

  const primary = BACKGROUND_SLIDES.filter((s) => s.category === resolvedCategory);
  const others = BACKGROUND_SLIDES.filter((s) => s.category !== resolvedCategory);
  return [...primary, ...others];
}
