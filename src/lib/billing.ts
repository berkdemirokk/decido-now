import { ProductSubscription } from 'expo-iap';
import { PlanTier } from '../types';

export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'decido.pro.monthly',
  yearly: 'decido.pro.yearly',
} as const;

export const ONE_TIME_PRODUCT_IDS = {
  founding: 'decido.pro.founding',
} as const;

export const SUBSCRIPTION_IDS = [
  SUBSCRIPTION_PRODUCT_IDS.monthly,
  SUBSCRIPTION_PRODUCT_IDS.yearly,
] as const;

export const ONE_TIME_IDS = [ONE_TIME_PRODUCT_IDS.founding] as const;

export const ALL_STORE_PRODUCT_IDS = [...SUBSCRIPTION_IDS, ...ONE_TIME_IDS] as const;

export function getPlanFromProductId(productId: string | null | undefined): PlanTier {
  if (productId === SUBSCRIPTION_PRODUCT_IDS.yearly) {
    return 'pro-yearly';
  }
  if (productId === SUBSCRIPTION_PRODUCT_IDS.monthly) {
    return 'pro-monthly';
  }
  if (productId === ONE_TIME_PRODUCT_IDS.founding) {
    return 'founding';
  }
  return 'free';
}

export function getProductIdFromPlan(plan: Exclude<PlanTier, 'free'>) {
  if (plan === 'pro-yearly') return SUBSCRIPTION_PRODUCT_IDS.yearly;
  if (plan === 'founding') return ONE_TIME_PRODUCT_IDS.founding;
  return SUBSCRIPTION_PRODUCT_IDS.monthly;
}

export function getSubscriptionLabel(plan: Exclude<PlanTier, 'free'>) {
  if (plan === 'pro-yearly') return 'Decido Pro Yearly';
  if (plan === 'founding') return 'Decido Founding Member';
  return 'Decido Pro Monthly';
}

export function getPrimarySubscriptionOfferToken(
  product: ProductSubscription | undefined
) {
  if (!product || product.platform !== 'android') {
    return undefined;
  }

  return product.subscriptionOfferDetailsAndroid?.[0]?.offerToken;
}
