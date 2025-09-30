import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../constants/colors';
import { RiskLevel } from '../types';

interface RiskIndicatorProps {
  level: RiskLevel;
  subtitle?: string;
  riskLevel?: RiskLevel;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  subtitle = 'Based on your recent activity',
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 5,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const getRiskConfig = () => {
    switch (level) {
      case 'LOW':
        return {
          color: Colors.risk.low,
          icon: 'checkmark-circle' as const,
          text: 'LOW RISK',
        };
      case 'MODERATE':
        return {
          color: Colors.risk.moderate,
          icon: 'warning' as const,
          text: 'MODERATE RISK',
        };
      case 'HIGH':
        return {
          color: Colors.risk.high,
          icon: 'alert-circle' as const,
          text: 'HIGH RISK',
        };
    }
  };

  const config = getRiskConfig();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: config.color, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons name={config.icon} size={28} color={Colors.white} />
        <Text style={styles.text}>{config.text}</Text>
      </Animated.View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.pill,
    ...Shadows.lg,
    gap: Spacing.md,
  },
  text: {
    ...Typography.subheading,
    color: Colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});