const STORAGE_KEY = 'user_credits';
const WELCOME_BONUS_KEY = 'welcome_bonus_claimed';
const WELCOME_BONUS_CREDITS = 15;

export const getCredits = (): number => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }
  
  // Check if welcome bonus has been claimed
  const bonusClaimed = localStorage.getItem(WELCOME_BONUS_KEY);
  if (!bonusClaimed) {
    // First time user - give welcome bonus
    localStorage.setItem(WELCOME_BONUS_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, WELCOME_BONUS_CREDITS.toString());
    return WELCOME_BONUS_CREDITS;
  }
  
  return 0;
};

export const setCredits = (credits: number): void => {
  localStorage.setItem(STORAGE_KEY, credits.toString());
};

export const addCredits = (amount: number): number => {
  const current = getCredits();
  const newTotal = current + amount;
  setCredits(newTotal);
  return newTotal;
};

export const deductCredits = (amount: number): boolean => {
  const current = getCredits();
  if (current >= amount) {
    setCredits(current - amount);
    return true;
  }
  return false;
};

export const hasEnoughCredits = (required: number): boolean => {
  return getCredits() >= required;
};
