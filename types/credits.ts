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
    id: 'mini',
    name: 'Mini',
    credits: 15,
    price: 0.99,
    pricePerImage: 0.20,
    images: 5,
  },
  {
    id: 'starter',
    name: 'Starter',
    credits: 30,
    price: 1.49,
    pricePerImage: 0.15,
    images: 10,
    savings: 25,
  },
  {
    id: 'basic',
    name: 'Basic',
    credits: 60,
    price: 2.49,
    pricePerImage: 0.12,
    images: 20,
    savings: 40,
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 150,
    price: 4.99,
    pricePerImage: 0.10,
    images: 50,
    savings: 50,
    badge: 'popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 300,
    price: 8.99,
    pricePerImage: 0.09,
    images: 100,
    savings: 55,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 600,
    price: 16.99,
    pricePerImage: 0.08,
    images: 200,
    savings: 60,
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 1500,
    price: 37.99,
    pricePerImage: 0.076,
    images: 500,
    savings: 62,
    badge: 'best-value',
    bonusPercent: 15,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 3000,
    price: 69.99,
    pricePerImage: 0.070,
    images: 1000,
    savings: 65,
    bonusPercent: 20,
  },
];
