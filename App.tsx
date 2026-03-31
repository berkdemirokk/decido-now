import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedAuraBackground } from './src/components/AnimatedAuraBackground';
import { AppTabBar } from './src/components/AppTabBar';
import { RewardOverlay } from './src/components/RewardOverlay';
import { ShareCard } from './src/components/ShareCard';
import { useDecidoApp } from './src/hooks/useDecidoApp';
import { theme } from './src/theme';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { GuidanceSheet } from './src/screens/GuidanceSheet';
import { FocusRunScreen } from './src/screens/FocusRunScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SystemsScreen } from './src/screens/SystemsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';

export default function App() {
  const app = useDecidoApp();
  const shellOpacity = useSharedValue(1);

  const shareHeadline = app.copy.helpers.shareHeadline(app.shareVariant);
  const shareResult = app.copy.helpers.shareResult(app.shareVariant);

  useEffect(() => {
    shellOpacity.value = withTiming(app.focusRunView.visible ? 0 : 1, {
      duration: app.focusRunView.visible ? 180 : 220,
      easing: Easing.inOut(Easing.quad),
    });
  }, [app.focusRunView.visible, shellOpacity]);

  const shellAnimatedStyle = useAnimatedStyle(() => ({
    opacity: shellOpacity.value,
    transform: [{ scale: 0.985 + shellOpacity.value * 0.015 }],
  }));

  if (!app.loaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  if (!app.appData.onboardingDone) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <LinearGradient colors={['#090b11', '#04060a']} style={styles.gradient}>
          <OnboardingScreen
            copy={app.copy}
            step={app.onboardingStep}
            selectedGoal={app.onboardingGoal}
            selectedFriction={app.onboardingFriction}
            selectedMinutes={app.onboardingMinutes}
            selectedEnergy={app.onboardingEnergy}
            previewTitle={app.selectedMove?.title}
            onGoal={app.setOnboardingGoal}
            onFriction={app.setOnboardingFriction}
            onMinutes={app.setOnboardingMinutes}
            onEnergy={app.setOnboardingEnergy}
            onContinue={() => {
              app.trackCtaTap('onboarding', 'continue', { step: app.onboardingStep });
              if (app.onboardingStep === 0 && !app.onboardingGoal) return;
              if (app.onboardingStep === 1 && !app.onboardingFriction) return;
              if (app.onboardingStep === 2 && !app.onboardingMinutes) return;
              if (app.onboardingStep === 3 && !app.onboardingEnergy) return;
              app.setOnboardingStep((current) => Math.min(current + 1, 4));
            }}
            onStart={() => {
              app.trackCtaTap('onboarding', 'take_move');
              app.completeOnboarding(true, false);
            }}
            onWhy={() => {
              app.trackCtaTap('onboarding', 'see_reasoning');
              app.completeOnboarding(false, true);
            }}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <LinearGradient colors={['#090b11', '#04060a']} style={styles.gradient}>
        <Animated.View style={[styles.shell, shellAnimatedStyle]}>
          <View style={styles.content}>
            {app.tab === 'today' ? (
              <View style={styles.todayStage}>
                <AnimatedAuraBackground systemId={app.appData.currentSystem} />
                <TodayScreen
                  copy={app.copy}
                  move={app.selectedMove}
                  contextLabel={app.contextWindowLabel}
                  personaTitle={app.personaTitle}
                  personaAuditLine={app.personaAuditLine}
                  phaseLabel={app.phaseLabel}
                  movesLeftLabel={app.movesLeftLabel}
                  swapsLeftLabel={app.swapsLeftLabel}
                  premiumTease={app.premiumTease}
                  reason={app.guidance?.whyFits ?? ''}
                  todayGain={app.todayGain}
                  tomorrowGain={app.tomorrowGain}
                  tonightLine={app.tonightLine}
                  streakLabel={`${app.streak} ${app.copy.states.streak}`}
                  levelLabel={`${app.rewardProfile.level}`}
                  executionScore={app.behaviorProfile.executionScore}
                  stabilityScore={app.behaviorProfile.stabilityScore}
                  driftScore={app.behaviorProfile.driftScore}
                  momentumTitle={app.behaviorProfile.momentumTitle}
                  momentumBody={app.behaviorProfile.momentumBody}
                  lossLine={app.behaviorProfile.lossLine}
                  returnPull={app.behaviorProfile.returnPull}
                  recoveryPrompt={app.recoveryPrompt}
                  onStart={() => {
                    app.trackCtaTap('today', 'start_now', { system: app.appData.currentSystem });
                    app.startFocusRun();
                  }}
                  onWhy={() => {
                    app.trackCtaTap('today', 'why_this_move', { system: app.appData.currentSystem });
                    app.setGuidanceVisible(true);
                  }}
                  onSwap={() => {
                    app.trackCtaTap('today', 'try_another', { system: app.appData.currentSystem });
                    app.swapMove();
                  }}
                  onRefine={() => {
                    app.trackCtaTap('today', 'tune_system');
                    app.setTab('systems');
                  }}
                  onShare={() => {
                    app.trackCtaTap('today', 'share_move');
                    app.openShare();
                  }}
                  onRecovery={() => {
                    app.trackCtaTap('today', 'recovery_move', { source: app.recoveryPrompt?.source ?? 'abandon' });
                    app.startRecoveryMove(app.recoveryPrompt?.source ?? 'abandon');
                  }}
                  streakSaverEligible={app.streakSaverEligible}
                  streakFreezeCredits={app.streakFreezeCredits}
                  onStreakSaver={() => {
                    app.trackCtaTap('today', 'streak_saver');
                    app.startStreakSaverReset();
                  }}
                />
              </View>
            ) : null}

            {app.tab === 'systems' ? (
              <SystemsScreen
                copy={app.copy}
                cards={app.trackCards}
                activeSystem={app.appData.currentSystem}
                onSelect={app.selectSystem}
              />
            ) : null}

            {app.tab === 'progress' ? (
              <ProgressScreen
                copy={app.copy}
                streak={app.streak}
                level={app.rewardProfile.level}
                xp={app.rewardProfile.xp}
                momentumLine={app.rewardProfile.momentumLine}
                weeklySummaryTitle={app.weeklySummary.title}
                weeklySummaryBody={app.weeklySummary.body}
                dnaCards={app.dnaCards}
                dnaLockedCount={app.appData.subscription.plan === 'free' ? 1 : 0}
                pending={app.pending}
                recent={app.recent}
                analyticsSummary={app.analyticsSummary}
                progressSummary={app.progressSummary}
                behaviorProfile={app.behaviorProfile}
                onPaywall={() => app.openPaywall('hard-access', 'progress-insight')}
                onShare={app.openShare}
              />
            ) : null}

            {app.tab === 'settings' ? (
              <SettingsScreen
                copy={app.copy}
                language={app.appData.language}
                plan={app.appData.subscription.plan}
                currentSystem={app.appData.currentSystem}
                currentMoveTitle={app.currentMoveTitle}
                onOpenPaywall={() => app.openPaywall('soft-success', 'settings-upgrade')}
                onRestore={app.restoreMockPurchase}
                onManage={app.manageSubscription}
                onLanguage={app.toggleLanguage}
                onGiftMove={() => app.openShare()}
              />
            ) : null}
          </View>

          {!app.focusRunView.visible ? (
            <AppTabBar
              current={app.tab}
              items={[
                { key: 'today', label: app.copy.tabs.today },
                { key: 'systems', label: app.copy.tabs.systems },
                { key: 'progress', label: app.copy.tabs.progress },
                { key: 'settings', label: app.copy.tabs.settings },
              ]}
              onChange={app.setTab}
            />
          ) : null}
        </Animated.View>
      </LinearGradient>

      <GuidanceSheet
        visible={app.guidanceVisible}
        copy={app.copy}
        title={app.selectedMove?.title ?? app.copy.guidance.title}
        guidance={app.guidance}
        projection={app.projection}
        guidanceTier={app.entitlements.guidanceTier}
        lockedProjection={app.appData.subscription.plan === 'free'}
        onClose={() => {
          app.trackCtaTap('guidance', 'close');
          app.setGuidanceVisible(false);
        }}
        onStart={() => {
          app.trackCtaTap('guidance', 'run_this_move', { tier: app.entitlements.guidanceTier });
          app.setGuidanceVisible(false);
          app.startFocusRun(true);
        }}
        onUpgrade={() => {
          app.trackCtaTap('guidance', 'unlock_full_guidance');
          app.openPaywall('hard-access', 'guidance-depth');
        }}
      />

      <FocusRunScreen
        copy={app.copy}
        state={app.focusRunView}
        onStart={() => {
          app.trackCtaTap('focus_run', 'lock_it_in');
          app.beginFocusRun();
        }}
        onNext={() => {
          app.trackCtaTap('focus_run', 'next_step');
          app.nextFocusStep();
        }}
        onMakeEasier={() => {
          app.trackCtaTap('focus_run', 'trim_it_down');
          app.makeFocusRunEasier();
        }}
        onAskLeave={() => {
          app.trackCtaTap('focus_run', 'exit_run');
          app.askLeaveFocusRun();
        }}
        onResume={() => {
          app.trackCtaTap('focus_run', 'stay_in');
          app.resumeFocusRun();
        }}
        onLeaveAnyway={() => {
          app.trackCtaTap('focus_run', 'leave_anyway');
          app.leaveFocusRunAnyway();
        }}
        onScore={app.scoreFocusRun}
      />

      <RewardOverlay
        visible={Boolean(app.reward)}
        xpGain={app.reward?.xpGain ?? 0}
        levelBefore={app.reward?.levelBefore ?? app.rewardProfile.level}
        levelAfter={app.reward?.levelAfter ?? app.rewardProfile.level}
        title={app.copy.reward.momentumTitle}
        message={app.reward?.message ?? app.copy.reward.momentumSaved}
        detail={
          app.behaviorProfile.returnPull
        }
        buttonLabel={app.copy.reward.continue}
        onContinue={app.closeReward}
      />

      <PaywallScreen
        visible={app.paywallVisible}
        copy={app.copy}
        mode={app.paywallMode}
        body={app.paywallBody}
        prices={app.paywallPriceLabels}
        storeConnected={app.storeConnected}
        storeCatalogLoaded={app.storeCatalogLoaded}
        storeError={app.storeError}
        onAnnual={() => {
          app.trackCtaTap('paywall', 'start_yearly_trial', { source: app.paywallSource ?? 'unknown', mode: app.paywallMode });
          app.mockPurchase('pro-yearly');
        }}
        onMonthly={() => {
          app.trackCtaTap('paywall', 'choose_monthly', { source: app.paywallSource ?? 'unknown', mode: app.paywallMode });
          app.mockPurchase('pro-monthly');
        }}
        onFounding={() => {
          app.trackCtaTap('paywall', 'choose_founding', { source: app.paywallSource ?? 'unknown', mode: app.paywallMode });
          app.mockPurchase('founding');
        }}
        onRestore={() => {
          app.trackCtaTap('paywall', 'restore');
          app.restoreMockPurchase();
        }}
        onClose={() => {
          app.trackCtaTap('paywall', 'continue_free', { source: app.paywallSource ?? 'unknown', mode: app.paywallMode });
          app.setPaywallVisible(false);
        }}
      />

      <Modal
        animationType="slide"
        transparent
        visible={Boolean(app.shareRecord)}
        onRequestClose={() => app.setShareRecord(null)}
      >
        <View style={styles.shareBackdrop}>
          <View style={styles.shareSheet}>
            <ShareCard
              variant={app.shareVariant}
              headline={shareHeadline}
              moveTitle={app.shareRecord?.selectedSuggestion.title ?? ''}
              resultLine={shareResult}
              streakLine={`${app.streak} ${app.copy.states.streak}`}
              personaLine={app.sharePersonaLabel}
              badge={app.appData.subscription.plan === 'founding' ? 'FOUNDING' : null}
              deepLink={app.shareGiftPreview?.deepLink ?? null}
            />
            <View style={styles.shareActions}>
              <Pressable
                onPress={() => {
                  app.trackCtaTap('share', 'share_card', { variant: app.shareVariant });
                  app.performShare();
                }}
                style={styles.sharePrimary}
              >
                <Text style={styles.sharePrimaryText}>{app.copy.today.share}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  app.trackCtaTap('share', 'close');
                  app.setShareRecord(null);
                }}
                style={styles.shareSecondary}
              >
                <Text style={styles.shareSecondaryText}>{app.copy.guidance.close}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  todayStage: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  shareSheet: {
    backgroundColor: theme.colors.surfaceMuted,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  shareActions: {
    gap: theme.spacing.sm,
  },
  sharePrimary: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sharePrimaryText: {
    color: '#1b1202',
    fontSize: theme.typography.body,
    fontWeight: '800',
  },
  shareSecondary: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareSecondaryText: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
