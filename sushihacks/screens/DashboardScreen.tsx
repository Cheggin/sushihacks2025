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
import { ChartCard } from '../components/ChartCard';
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
    labels: dailyReadings.map(r => formatTime(r.timestamp)),
    datasets: [
      {
        data: dailyReadings.map(r => r.value),
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

  const currentStrength = dailyReadings[dailyReadings.length - 1]?.value || 0;
  const trend = currentStrength > dailyReadings[0]?.value;

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
              <ChartCard
                title="Weekly Average"
                type="bar"
                data={weeklyChartData}
                width={width / 2 - 36}
                height={160}
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
            <Card style={styles.mainChart}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Today's Grip Strength</Text>
                <View style={styles.currentValue}>
                  <Text style={styles.currentValueNumber}>{currentStrength}</Text>
                  <Ionicons
                    name={trend ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={trend ? Colors.success : Colors.warning}
                  />
                </View>
              </View>
              <ChartCard
                title=""
                type="line"
                data={dailyChartData}
                width={width - 48}
                height={180}
              />
            </Card>
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

          <Animated.View
            style={[
              styles.bottomNav,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.navItem}>
              <Ionicons name="home" size={24} color={Colors.primary} />
              <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="bar-chart-outline" size={24} color={Colors.text.light} />
              <Text style={styles.navText}>History</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="bulb-outline" size={24} color={Colors.text.light} />
              <Text style={styles.navText}>Insights</Text>
            </View>
            <View style={styles.navItem}>
              <Ionicons name="settings-outline" size={24} color={Colors.text.light} />
              <Text style={styles.navText}>Settings</Text>
            </View>
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
    paddingBottom: 100,
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
    paddingHorizontal: Spacing.lg,
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
  },
  chartTitle: {
    ...Typography.heading,
  },
  currentValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currentValueNumber: {
    fontSize: 28,
    fontWeight: '700',
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.md,
  },
  navItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navText: {
    ...Typography.small,
    color: Colors.text.light,
  },
  navTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});