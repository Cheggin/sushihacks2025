import { GripStrengthReading, WeeklyData, RiskLevel } from '../types';

export const generateDailyReadings = (): GripStrengthReading[] => {
  const readings: GripStrengthReading[] = [];
  const hoursToShow = 12;
  const now = new Date();

  for (let i = 0; i < hoursToShow; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - (hoursToShow - i - 1));

    const baseValue = 50;
    const variation = Math.sin(i * 0.5) * 10 + Math.random() * 5;

    readings.push({
      timestamp: time,
      value: Math.max(30, Math.min(70, baseValue + variation)),
    });
  }

  return readings;
};

export const generateWeeklyData = (): WeeklyData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [45, 52, 48, 55, 51, 47, 49];

  return days.map((day, index) => ({
    day,
    value: values[index],
  }));
};

export const calculateRiskLevel = (averageStrength: number): RiskLevel => {
  if (averageStrength >= 50) return 'LOW';
  if (averageStrength >= 40) return 'MODERATE';
  return 'HIGH';
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
};

export const getCurrentGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};