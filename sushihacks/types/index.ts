export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  data: number[];
  color?: (opacity?: number) => string;
  strokeWidth?: number;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface RiskAssessment {
  level: RiskLevel;
  message: string;
  color: string;
  icon: string;
}

export interface GripStrengthReading {
  timestamp: Date;
  value: number;
}

export interface WeeklyData {
  day: string;
  value: number;
}

export interface User {
  name: string;
  profileImage?: string;
}