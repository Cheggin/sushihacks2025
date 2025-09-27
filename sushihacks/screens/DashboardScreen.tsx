import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components/Card';
import { GiftedChartCard } from '../components/GiftedChartCard';
import { ComingSoonCard } from '../components/ComingSoonCard';
import { RiskIndicator } from '../components/RiskIndicator';
import { Button } from '../components/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/colors';
import {
  generateDailyReadings,
  generateWeeklyData,
  calculateRiskLevel,
  formatTime,
  getCurrentGreeting,
} from '../utils/dataGenerator';
import { RiskLevel } from '../types';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [dailyReadings] = useState(generateDailyReadings());
  const [weeklyData] = useState(generateWeeklyData());
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MODERATE');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const averageStrength =
      dailyReadings.reduce((acc, reading) => acc + reading.value, 0) /
      dailyReadings.length;
    setRiskLevel(calculateRiskLevel(averageStrength));
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const dailyChartData = {
    labels: dailyReadings.slice(0, 6).map(r => formatTime(r.timestamp)),
    datasets: [
      {
        data: dailyReadings.slice(0, 6).map(r => r.value),
      },
    ],
  };

  const weeklyChartData = {
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        data: weeklyData.map(d => d.value),
      },
    ],
  };

  const currentStrengthValue = dailyReadings[dailyReadings.length - 1]?.value || 0;
  const currentStrength = currentStrengthValue.toFixed(2);
  const trend = currentStrengthValue > dailyReadings[0]?.value;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.white]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.greeting}>{getCurrentGreeting()}</Text>
                <Text style={styles.userName}>Captain Fisher</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.notificationBadge}>
                <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
                <View style={styles.notificationDot} />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.dateContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.chartsRow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.halfCard}>
              <ComingSoonCard title="Monthly Trends" icon="trending-up" />
            </View>
            <View style={styles.halfCard}>
              <GiftedChartCard
                title="Weekly"
                type="bar"
                data={weeklyChartData}
                width={(width - 48 - 16) / 2}
                height={140}
                showValues={true}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.mainChartContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Today's Grip Strength</Text>
                </View>
                <View style={styles.currentValue}>
                  <Text style={styles.currentValueNumber}>{currentStrength}</Text>
                  <Ionicons
                    name={trend ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={trend ? Colors.success : Colors.warning}
                  />
                </View>
              </View>
            </Card>
            <GiftedChartCard
              title=""
              type="line"
              data={dailyChartData}
              width={width - 32}
              height={160}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.riskContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card>
              <Text style={styles.riskTitle}>Carpal Tunnel Risk Assessment</Text>
              <RiskIndicator level={riskLevel} />
              <View style={styles.actionButtons}>
                <Button
                  title="View Details"
                  onPress={() => {}}
                  variant="outline"
                  size="medium"
                  style={styles.actionButton}
                />
                <Button
                  title="Get Tips"
                  onPress={() => {}}
                  variant="primary"
                  size="medium"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </Animated.View>

        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  greeting: {
    ...Typography.caption,
  },
  userName: {
    ...Typography.subheading,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  dateContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dateText: {
    ...Typography.caption,
  },
  chartsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  mainChartContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mainChart: {
    paddingTop: Spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentValueNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  riskContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  riskTitle: {
    ...Typography.subheading,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});