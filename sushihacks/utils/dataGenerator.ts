import { GripStrengthReading, WeeklyData, RiskLevel } from '../types';

export const generateDailyReadings = (): GripStrengthReading[] => {
  const readings: GripStrengthReading[] = [];
  const hoursToShow = 6;
  const now = new Date();

  for (let i = 0; i < hoursToShow; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - (hoursToShow - i - 1) * 2);

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
  const days = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'S'];
  const values = [45, 52, 48, 55, 51, 47, 49];

  return days.map((day, index) => ({
    day,
    value: values[index],
  }));
};

export const generateMonthlyData = () => {
  // temporary filler data
  return Array.from({ length: 6 }, (_, i) => ({
    day: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 60) + 20,
  }));
};

export const calculateRiskLevel = (averageStrength: number): RiskLevel => {
  if (averageStrength >= 50) return 'LOW';
  if (averageStrength >= 40) return 'MODERATE';
  return 'HIGH';
};

export const formatTime = (date: Date): string => {
  const hour = date.getHours();
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${period}`;
};

export const getCurrentGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};