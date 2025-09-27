import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(wave2Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const wave1Transform = wave1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const wave2Transform = wave2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <LinearGradient
      colors={[Colors.background, Colors.white]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.waveContainer,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.15],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              styles.wave,
              { transform: [{ translateY: wave1Transform }] },
            ]}
          >
            <Ionicons
              name="water"
              size={width * 1.5}
              color={Colors.primary}
              style={{ opacity: 0.1 }}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.wave,
              styles.wave2,
              { transform: [{ translateY: wave2Transform }] },
            ]}
          >
            <Ionicons
              name="water"
              size={width * 1.2}
              color={Colors.chart.lightTeal}
              style={{ opacity: 0.1 }}
            />
          </Animated.View>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={[Colors.gradient.start, Colors.gradient.end]}
                style={styles.iconGradient}
              >
                <Ionicons name="hand-left" size={60} color={Colors.white} />
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Carp</Text>
            <Text style={styles.subtitle}>Monitor Your Grip, Protect Your Future</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Button
              title="Start Monitoring"
              onPress={() => navigation.navigate('Dashboard')}
              size="large"
              style={styles.button}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.trustContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
              <Text style={styles.trustText}>Trusted by 10,000+ fishermen</Text>
            </View>
            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="analytics" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Real-time tracking</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="notifications" size={16} color={Colors.primary} />
                <Text style={styles.featureText}>Smart alerts</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
  },
  wave2: {
    top: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.xxl,
  },
  button: {
    width: '100%',
  },
  trustContainer: {
    position: 'absolute',
    bottom: Spacing.xxl,
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  trustText: {
    ...Typography.caption,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    ...Typography.small,
  },
});