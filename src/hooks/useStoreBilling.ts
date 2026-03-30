import Constants from 'expo-constants';
import {
  Product,
  ProductSubscription,
  deepLinkToSubscriptions,
  useIAP,
} from 'expo-iap';
import { Platform } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ALL_STORE_PRODUCT_IDS,
  ONE_TIME_PRODUCT_IDS,
  SUBSCRIPTION_IDS,
  getPlanFromProductId,
  getPrimarySubscriptionOfferToken,
  getProductIdFromPlan,
} from '../lib/billing';
import { PlanTier } from '../types';

type StoreCatalog = {
  monthly?: ProductSubscription;
  yearly?: ProductSubscription;
  founding?: Product;
};

type StorePriceLabels = {
  monthly: string;
  yearly: string;
  founding: string;
};

export function useStoreBilling() {
  const [storeError, setStoreError] = useState<string | null>(null);
  const [purchasePending, setPurchasePending] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const finishTransactionRef = useRef<null | ((args: { purchase: any; isConsumable?: boolean }) => Promise<void>)>(null);

  const iap = useIAP({
    onPurchaseError: (error) => {
      setStoreError(error.message ?? 'Purchase failed');
      setPurchasePending(false);
    },
    onError: (error) => {
      setStoreError(error.message);
      setPurchasePending(false);
    },
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransactionRef.current?.({ purchase, isConsumable: false });
      } finally {
        setPurchasePending(false);
      }
    },
  });

  finishTransactionRef.current = iap.finishTransaction;

  useEffect(() => {
    if (Platform.OS === 'web' || !iap.connected) return;

    let cancelled = false;
    void (async () => {
      try {
        await iap.fetchProducts({ skus: [...ALL_STORE_PRODUCT_IDS], type: 'all' });
        await Promise.all([
          iap.getActiveSubscriptions([...SUBSCRIPTION_IDS]),
          iap.getAvailablePurchases(),
        ]);
        if (!cancelled) {
          setCatalogLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          setStoreError(error instanceof Error ? error.message : 'Store unavailable');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [iap.connected]);

  const catalog = useMemo<StoreCatalog>(() => {
    const map: StoreCatalog = {};

    for (const subscription of iap.subscriptions) {
      if (subscription.id === getProductIdFromPlan('pro-monthly')) {
        map.monthly = subscription;
      }
      if (subscription.id === getProductIdFromPlan('pro-yearly')) {
        map.yearly = subscription;
      }
    }

    for (const product of iap.products) {
      if (product.id === ONE_TIME_PRODUCT_IDS.founding) {
        map.founding = product;
      }
    }

    return map;
  }, [iap.products, iap.subscriptions]);

  const priceLabels = useMemo<StorePriceLabels>(
    () => ({
      monthly: catalog.monthly?.displayPrice ?? '$8.99 / month',
      yearly: catalog.yearly?.displayPrice ?? '$69.99 / year',
      founding: catalog.founding?.displayPrice ?? '$199 one-time',
    }),
    [catalog.founding?.displayPrice, catalog.monthly?.displayPrice, catalog.yearly?.displayPrice]
  );

  const currentPlan = useMemo<PlanTier>(() => {
    const activeSub = iap.activeSubscriptions.find((sub) => sub.isActive);
    if (activeSub?.productId) {
      return getPlanFromProductId(activeSub.productId);
    }

    const foundingPurchase = iap.availablePurchases.find(
      (purchase) => purchase.productId === ONE_TIME_PRODUCT_IDS.founding
    );
    if (foundingPurchase) {
      return 'founding';
    }

    return 'free';
  }, [iap.activeSubscriptions, iap.availablePurchases]);

  const hasLiveStore = Platform.OS !== 'web' && iap.connected;

  async function purchasePlan(plan: Exclude<PlanTier, 'free'>) {
    if (Platform.OS === 'web') {
      throw new Error('Purchases are available in native builds only.');
    }

    setPurchasePending(true);
    setStoreError(null);

    if (plan === 'founding') {
      await iap.requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: ONE_TIME_PRODUCT_IDS.founding },
          google: { skus: [ONE_TIME_PRODUCT_IDS.founding] },
        },
      });
      return;
    }

    const sku = getProductIdFromPlan(plan);
    const product = plan === 'pro-yearly' ? catalog.yearly : catalog.monthly;
    const offerToken = getPrimarySubscriptionOfferToken(product);

    await iap.requestPurchase({
      type: 'subs',
      request: {
        apple: { sku },
        google: {
          skus: [sku],
          subscriptionOffers: offerToken ? [{ sku, offerToken }] : undefined,
        },
      },
    });
  }

  async function restore() {
    if (Platform.OS === 'web') {
      return;
    }
    setStoreError(null);
    await iap.restorePurchases();
    await Promise.all([iap.getAvailablePurchases(), iap.getActiveSubscriptions([...SUBSCRIPTION_IDS])]);
  }

  async function manage(currentProductId?: string | null) {
    if (Platform.OS === 'web') {
      throw new Error('Subscription management opens only in native builds.');
    }

    const expoConfig = Constants.expoConfig;
    await deepLinkToSubscriptions({
      skuAndroid: currentProductId ?? catalog.yearly?.id ?? catalog.monthly?.id ?? SUBSCRIPTION_IDS[0],
      packageNameAndroid: expoConfig?.android?.package ?? undefined,
    });
  }

  return {
    hasLiveStore,
    connected: iap.connected,
    catalogLoaded,
    purchasePending,
    storeError,
    catalog,
    priceLabels,
    currentPlan,
    activeSubscriptions: iap.activeSubscriptions,
    availablePurchases: iap.availablePurchases,
    purchasePlan,
    restore,
    manage,
  };
}
