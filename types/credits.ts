export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerImage: number;
  images: number;
  savings?: number;
  badge?: 'popular' | 'best-value';
  bonusPercent?: number;
}

export const CREDITS_PER_IMAGE = 3;
export const CREDITS_PER_SUPER_RESOLUTION = 6;

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 30,
    price: 1.49,
    pricePerImage: 0.15,
    images: 10,
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 150,
    price: 5.99,
    pricePerImage: 0.12,
    images: 50,
    savings: 20,
    badge: 'popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 600,
    price: 20.99,
    pricePerImage: 0.105,
    images: 200,
    savings: 30,
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 1500,
    price: 48.49,
    pricePerImage: 0.097,
    images: 500,
    savings: 35,
    badge: 'best-value',
  },
];
