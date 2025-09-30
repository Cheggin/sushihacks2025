  // Weather icon helper
  const getWeatherIcon = (weatherCode: number | null) => {
    if (weatherCode === null) return null;
    switch (weatherCode) {
      case 0: return <Ionicons name="sunny" size={48} color={Colors.primary} />;
      case 1: return <Ionicons name="partly-sunny" size={48} color={Colors.primary} />;
      case 2: return <Ionicons name="cloudy" size={48} color={Colors.primary} />;
      case 3: return <Ionicons name="rainy" size={48} color={Colors.primary} />;
      case 4: return <Ionicons name="thunderstorm" size={48} color={Colors.primary} />;
      case 5: return <Ionicons name="snow" size={48} color={Colors.primary} />;
      default: return <Ionicons name="cloud-outline" size={48} color={Colors.primary} />;
    }
  };
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card } from "../components/Card";
import { GiftedChartCard } from "../components/GiftedChartCard";
import { RiskIndicator } from "../components/RiskIndicator";
import { Button } from "../components/Button";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from "../constants/colors";
import {
  generateDailyReadings,
  generateWeeklyData,
  generateMonthlyData,
  formatTime,
  getCurrentGreeting,
} from "../utils/dataGenerator";
import { RiskLevel } from "../types";

const { width } = Dimensions.get("window");

interface DashboardScreenProps {
  navigation?: any;
}

interface ProfileData {
  name: string;
  age: string;
  sex: string;
  bmi: string;
  nrs: string;
  palmarBowing: string;
  crossSectionalArea: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [dailyReadings] = useState(generateDailyReadings());
  const [weeklyData] = useState(generateWeeklyData());
  const [monthlyData] = useState(generateMonthlyData());
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MODERATE");
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "User",
    age: "",
    sex: "",
    bmi: "",
    nrs: "",
    palmarBowing: "",
    crossSectionalArea: "",
  });

  const [weather, setWeather] = useState<{
    temperature: number | null;
    weatherCode: number | null;
  }>({
    temperature: null,
    weatherCode: null,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const loadProfileData = async () => {
    try {
      const savedData = await AsyncStorage.getItem("userProfile");
      if (savedData) {
        const data = JSON.parse(savedData);
        setProfileData(data);
        setRiskLevel(calculateUserRisk(data));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const calculateUserRisk = (profile: ProfileData): RiskLevel => {
    let riskScore = 0;
    const bmi = parseFloat(profile.bmi);
    if (bmi && (bmi < 18.5 || bmi > 30)) riskScore += 2;
    else if (bmi && bmi > 24.9) riskScore += 1;

    const nrs = parseFloat(profile.nrs);
    if (nrs >= 7) riskScore += 3;
    else if (nrs >= 4) riskScore += 2;
    else if (nrs >= 1) riskScore += 1;

    const pb = parseFloat(profile.palmarBowing);
    if (pb > 3) riskScore += 2;
    else if (pb > 2) riskScore += 1;

    const csa = parseFloat(profile.crossSectionalArea);
    if (csa > 15) riskScore += 3;
    else if (csa > 12) riskScore += 2;
    else if (csa > 10) riskScore += 1;

    const age = parseInt(profile.age);
    if (age > 50) riskScore += 1;

    const averageStrength =
      dailyReadings.reduce((acc, reading) => acc + reading.value, 0) /
      dailyReadings.length;
    if (averageStrength < 40) riskScore += 2;
    else if (averageStrength < 50) riskScore += 1;

    if (riskScore <= 3) return "LOW";
    if (riskScore <= 7) return "MODERATE";
    return "HIGH";
  };

  const fetchWeatherJMA = async () => {
    try {
      const lat = 35.68;
      const lon = 139.77;
      // Pick which variables you want. At minimum: temperature (2 m), weather code, etc.
      // The “current” parameter gives you instantaneous current values.
      const url = `https://api.open-meteo.com/v1/jma?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&hourly=temperature_2m,weathercode&timezone=auto`;

      const resp = await axios.get(url);
      const data = resp.data;

      // current conditions object is in data.current
      const current = data.current;

      setWeather({
        temperature: current.temperature_2m,
        weatherCode: current.weathercode,
      });
    } catch (error) {
      console.error("Error fetching JMA weather:", error);
    }
  };

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

    loadProfileData();
    fetchWeatherJMA();
  }, []);

  useEffect(() => {
    if (refreshing) {
      loadProfileData();
      fetchWeatherJMA();
    }
  }, [refreshing]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const dailyChartData = {
    labels: dailyReadings.slice(0, 6).map((r) => formatTime(r.timestamp)),
    datasets: [{ data: dailyReadings.slice(0, 6).map((r) => r.value) }],
  };

  const weeklyChartData = {
    labels: weeklyData.map((d) => d.day),
    datasets: [{ data: weeklyData.map((d) => d.value) }],
  };

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.day),
    datasets: [{ data: monthlyData.map((d) => d.value) }],
  };

  const currentStrengthValue =
    dailyReadings[dailyReadings.length - 1]?.value || 0;
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
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.headerLeft}
              onPress={() => navigation?.navigate("profile")}
              activeOpacity={0.7}
            >
              <View style={styles.profileImage}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.greeting}>{getCurrentGreeting()}</Text>
                <Text style={styles.userName}>
                  {profileData.name || "User"}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <View style={styles.notificationBadge}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={Colors.text.primary}
                />
                <View style={styles.notificationDot} />
              </View>
            </View>
          </Animated.View>

          {/* Date inside weather card below */}
          <View style={styles.cardsSection}>
            <View style={styles.cardsRow}>
              <Card style={styles.weatherCard}>
                <View style={styles.weatherDateRow}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dayNumber}>
                      {new Date().getDate()}
                    </Text>
                    <Text style={styles.dayName}>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </Text>
                  </View>
                  <View style={styles.weatherInfo}>
                    {getWeatherIcon(weather.weatherCode)}
                    {weather.temperature !== null ? (
                      <>
                        <Text style={styles.tempText}>
                          {weather.temperature}°C
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.weatherText}>Loading...</Text>
                    )}
                  </View>
                </View>
              </Card>

              <Card style={styles.fishCard}>
                <Text style={styles.cardTitle}>Top Fish to Fish</Text>
                <Text style={styles.cardPlaceholder}>
                  Fish data coming soon...
                </Text>
              </Card>
            </View>
            <Card style={styles.mapCardFullWidth}>
              <Text style={styles.cardTitle}>Map</Text>
              <Text style={styles.cardPlaceholder}>
                Map will be added here later.
              </Text>
            </Card>
          </View>

          {/* rest of your UI below */}
          <Animated.View
            style={[
              styles.topRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Card style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Latest Grip</Text>
                <Text style={styles.statValue}>{currentStrength}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>CTS Risk</Text>
                <Text style={styles.statValue}>{riskLevel}</Text>
              </View>
            </Card>
            <View style={styles.trendsCardContainer}>
              <Card style={styles.trendsCard}>
                <GiftedChartCard
                  title={showMonthly ? "Monthly Trends" : "Weekly Trends"}
                  type="bar"
                  data={showMonthly ? monthlyChartData : weeklyChartData}
                  width={width / 2 - 32}
                  height={140}
                  showValues
                />
              </Card>
              <TouchableOpacity
                style={styles.arrowButton}
                onPress={() => setShowMonthly((prev) => !prev)}
              >
                <Ionicons
                  name={showMonthly ? "arrow-back" : "arrow-forward"}
                  size={28}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.mainChartContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Card>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Today's Grip Strength</Text>
                <View style={styles.currentValue}>
                  <Text style={styles.currentValueNumber}>
                    {currentStrength}
                  </Text>
                  <Ionicons
                    name={trend ? "trending-up" : "trending-down"}
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Card>
              <View style={styles.testSection}>
                <Ionicons
                  name="fitness-outline"
                  size={48}
                  color={Colors.primary}
                />
                <Text style={styles.testTitle}>Carpal Tunnel Risk Test</Text>
                <Text style={styles.testDescription}>
                  Measure your pinch strength and get an instant risk assessment
                </Text>
                <Button
                  title="Take Test"
                  onPress={() => navigation?.navigate("test")}
                  variant="primary"
                  size="large"
                  style={styles.testButton}
                />
                {profileData.nrs && (
                  <View style={styles.lastTestInfo}>
                    <Text style={styles.lastTestLabel}>
                      Current Pain Level: {profileData.nrs}/10
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  cardsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  weatherCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  fishCard: {
    flex: 1,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 16,
  },
  mapCardFullWidth: {
    width: "100%",
    minHeight: 180,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.primary,
  },
  cardPlaceholder: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  greeting: { ...Typography.caption },
  userName: { ...Typography.subheading, fontWeight: "600" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  notificationBadge: { position: "relative" },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  // --- New/weather layout styles ---
  weatherDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  dateBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.primary,
  },
  dayName: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  weatherInfo: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  tempText: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.primary,
  },
  weatherText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  topRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statsCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center", marginBottom: Spacing.sm },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.subheading,
    fontWeight: "700",
    color: Colors.primary,
  },
  trendsCardContainer: {
    width: width / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  trendsCard: { padding: 0, width: "100%" },
  arrowButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  mainChartContainer: { paddingHorizontal: Spacing.md, marginBottom: Spacing.lg },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  chartTitle: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  currentValue: { flexDirection: "row", alignItems: "center", gap: 4 },
  currentValueNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  riskContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  testSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  testTitle: {
    ...Typography.heading,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  testDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  metricItem: { alignItems: "center" },
  metricLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.subheading,
    fontWeight: "600",
    color: Colors.primary,
  },
  testButton: {
    minWidth: 200,
  },
  lastTestInfo: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  lastTestLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});

export default DashboardScreen;