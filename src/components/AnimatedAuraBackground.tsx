import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { SystemId } from '../types';

const systemIndex: Record<SystemId, number> = {
  decide: 0,
  learn: 1,
  earn: 2,
  move: 3,
  reset: 4,
};

const colors = ['#d6a94f', '#2e8b57', '#4fb0ff', '#55c7d9', '#7f74ff'];

export function AnimatedAuraBackground({ systemId }: { systemId: SystemId }) {
  const colorProgress = useSharedValue(systemIndex[systemId]);
  const drift = useSharedValue(0);

  useEffect(() => {
    colorProgress.value = withTiming(systemIndex[systemId], {
      duration: 2000,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [colorProgress, systemId]);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [drift]);

  const auraPrimary = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4],
      colors
    );

    return {
      backgroundColor,
      transform: [
        { translateX: drift.value * 16 },
        { translateY: drift.value * -12 },
        { scale: 1 + drift.value * 0.04 },
      ],
    };
  });

  const auraSecondary = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4],
      ['#e8c47b', '#57c994', '#9bd1ff', '#8fe0ec', '#b0a7ff']
    );

    return {
      backgroundColor,
      transform: [
        { translateX: drift.value * -14 },
        { translateY: drift.value * 18 },
        { scale: 1.02 + drift.value * 0.03 },
      ],
    };
  });

  return (
    <>
      <Animated.View style={[styles.primaryAura, auraPrimary]} />
      <Animated.View style={[styles.secondaryAura, auraSecondary]} />
    </>
  );
}

const styles = StyleSheet.create({
  primaryAura: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.18,
  },
  secondaryAura: {
    position: 'absolute',
    top: 140,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 280,
    opacity: 0.12,
  },
});
