import Constants from 'expo-constants';
import {
  Product,
  ProductSubscription,
  deepLinkToSubscriptions,
  useIAP,
} from 'expo-iap';
import { Platform } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const [restorePending, setRestorePending] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const finishTransactionRef = useRef<null | ((args: { purchase: any; isConsumable?: boolean }) => Promise<void>)>(null);

  const iap = useIAP({
    onPurchaseError: (error) => {
      setStoreError(error.message ?? 'Purchase failed');
      setPurchasePending(false);
      setRestorePending(false);
    },
    onError: (error) => {
      setStoreError(error.message);
      setPurchasePending(false);
      setRestorePending(false);
    },
    onPurchaseSuccess: async (purchase) => {
      try {
        await finishTransactionRef.current?.({ purchase, isConsumable: false });
        setStoreError(null);
        await Promise.all([
          iap.getActiveSubscriptions([...SUBSCRIPTION_IDS]),
          iap.getAvailablePurchases(),
        ]);
      } finally {
        setPurchasePending(false);
      }
    },
  });

  finishTransactionRef.current = iap.finishTransaction;

  const refreshStoreState = useCallback(async () => {
    await Promise.all([
      iap.getActiveSubscriptions([...SUBSCRIPTION_IDS]),
      iap.getAvailablePurchases(),
    ]);
  }, [iap]);

  const loadCatalog = useCallback(async () => {
    if (Platform.OS === 'web') {
      throw new Error('Store is available in native builds only.');
    }

    if (!iap.connected) {
      throw new Error('Store connection is not ready yet.');
    }

    await iap.fetchProducts({ skus: [...ALL_STORE_PRODUCT_IDS], type: 'all' });
    await refreshStoreState();
  }, [iap, refreshStoreState]);

  useEffect(() => {
    if (Platform.OS === 'web' || !iap.connected) return;

    let cancelled = false;
    void (async () => {
      try {
        await loadCatalog();
        if (!cancelled) {
          setCatalogLoaded(true);
          setStoreError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setCatalogLoaded(false);
          setStoreError(error instanceof Error ? error.message : 'Store unavailable');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [iap.connected, loadCatalog]);

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
    try {
      if (!iap.connected) {
        throw new Error('Store connection is not ready yet.');
      }

      if (!catalogLoaded) {
        await loadCatalog();
        setCatalogLoaded(true);
        setStoreError(null);

        if (iap.products.length === 0 && iap.subscriptions.length === 0) {
          throw new Error('Store refreshed. Try again.');
        }
      }

      if (plan === 'founding') {
        if (!catalog.founding) {
          await loadCatalog();
          setCatalogLoaded(true);
          setStoreError(null);
          throw new Error('Store refreshed. Try again.');
        }

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

      if (!product) {
        await loadCatalog();
        setCatalogLoaded(true);
        setStoreError(null);
        throw new Error('Store refreshed. Try again.');
      }

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      setStoreError(message);
      setPurchasePending(false);
      throw error;
    }
  }

  async function restore() {
    if (Platform.OS === 'web') {
      throw new Error('Restore is available in native builds only.');
    }
    setRestorePending(true);
    setStoreError(null);
    try {
      if (!iap.connected) {
        throw new Error('Store connection is not ready yet.');
      }

      await iap.restorePurchases();
      await refreshStoreState();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed';
      setStoreError(message);
      throw error;
    } finally {
      setRestorePending(false);
    }
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
    restorePending,
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
