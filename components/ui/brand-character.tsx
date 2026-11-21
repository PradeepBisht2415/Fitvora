import Image from 'next/image';
import { cn } from '@/lib/utils';

export type CharacterVariant =
  | 'hero'
  | 'nutrition-guide'
  | 'thali'
  | 'weight-gain'
  | 'weight-loss'
  | 'coach'
  | 'celebration'
  | 'phone'
  | 'dal-bowl'
  | 'thali-moment'
  | 'salad'
  | 'clipboard'
  | 'shaker'
  | 'analytics'
  | 'feast'
  | 'nourished'
  | 'salad-lemon';

interface VariantMeta {
  src: string;
  alt: string;
  aspectRatio: string;
}

const VARIANT_MAP: Record<CharacterVariant, VariantMeta> = {
  hero: {
    src: '/images/character/hero-ambassador.png',
    alt: 'Fitvora wellness ambassador with warm smile in forest green attire',
    aspectRatio: 'aspect-[3/4]',
  },
  'nutrition-guide': {
    src: '/images/character/nutrition-guide.png',
    alt: 'Ambassador explaining healthy Indian home cooking principles',
    aspectRatio: 'aspect-[4/3]',
  },
  thali: {
    src: '/images/character/thali-wellness.png',
    alt: 'Ambassador holding a fresh and balanced Indian thali meal',
    aspectRatio: 'aspect-[4/3]',
  },
  'weight-gain': {
    src: '/images/character/weight-gain.png',
    alt: 'Nutrient-dense Indian meal spread for healthy, steady weight gain',
    aspectRatio: 'aspect-[4/3]',
  },
  'weight-loss': {
    src: '/images/character/weight-loss.png',
    alt: 'Portion-controlled Indian meal spread for sustainable weight loss',
    aspectRatio: 'aspect-[4/3]',
  },
  coach: {
    src: '/images/character/coach-review.png',
    alt: 'Founder coach reviewing assessment details with a clipboard',
    aspectRatio: 'aspect-[4/3]',
  },
  celebration: {
    src: '/images/character/celebration.png',
    alt: 'Ambassador celebrating a healthy lifestyle and sustainable progress',
    aspectRatio: 'aspect-[3/4]',
  },
  phone: {
    src: '/images/character/phone-usage.png',
    alt: 'Member tracking daily meal times and progress on a smartphone',
    aspectRatio: 'aspect-[3/4]',
  },
  'dal-bowl': {
    src: '/images/character/dal-bowl.png',
    alt: 'Ambassador enjoying a bowl of protein-rich homemade dal',
    aspectRatio: 'aspect-[3/4]',
  },
  'thali-moment': {
    src: '/images/character/thali-moment.png',
    alt: 'Wholesome home-cooked Indian meal with roti, dal, and fresh vegetables',
    aspectRatio: 'aspect-[4/3]',
  },
  salad: {
    src: '/images/character/salad-moment.png',
    alt: 'Fresh salad with greens, cucumber, and lemon dressing',
    aspectRatio: 'aspect-[4/3]',
  },
  clipboard: {
    src: '/images/character/clipboard-coach.png',
    alt: 'Coach with clipboard ready to review routine and food preferences',
    aspectRatio: 'aspect-[3/4]',
  },
  shaker: {
    src: '/images/character/shaker-bottle.png',
    alt: 'Ambassador encouraging consistent hydration and wholesome routines',
    aspectRatio: 'aspect-[3/4]',
  },
  analytics: {
    src: '/images/character/analytics-workspace.png',
    alt: 'Fitvora wellness analytics and meal planning workspace',
    aspectRatio: 'aspect-[16/10]',
  },
  feast: {
    src: '/images/character/healthy-feast.png',
    alt: 'Nourishing Indian home-food spread for the entire family',
    aspectRatio: 'aspect-[4/3]',
  },
  nourished: {
    src: '/images/character/nourished-meal.png',
    alt: 'Balanced plate featuring grains, lentils, fresh sabzi, and curd',
    aspectRatio: 'aspect-[4/3]',
  },
  'salad-lemon': {
    src: '/images/character/salad-lemon-water.png',
    alt: 'Fresh wellness spread with crunchy salad and refreshing lemon water',
    aspectRatio: 'aspect-[4/3]',
  },
};

export interface BrandCharacterProps {
  variant: CharacterVariant;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function BrandCharacter({
  variant,
  className,
  imageClassName,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw',
  width = 800,
  height = 800,
}: BrandCharacterProps) {
  const meta = VARIANT_MAP[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-pale-green/40',
        meta.aspectRatio,
        className
      )}
    >
      <Image
        src={meta.src}
        alt={meta.alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn(
          'h-full w-full object-cover transition-transform duration-300',
          imageClassName
        )}
      />
    </div>
  );
}
