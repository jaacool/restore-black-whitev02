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
    price: 4.99,
    pricePerImage: 0.10,
    images: 50,
    savings: 33,
    badge: 'popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 600,
    price: 16.99,
    pricePerImage: 0.08,
    images: 200,
    savings: 47,
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 1500,
    price: 37.99,
    pricePerImage: 0.076,
    images: 500,
    savings: 49,
    badge: 'best-value',
    bonusPercent: 15,
  },
];
