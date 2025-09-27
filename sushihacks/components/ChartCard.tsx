import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Card } from './Card';
import { Colors, Typography, Spacing } from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar';
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  width?: number;
  height?: number;
  showValues?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  width = screenWidth - 48,
  height = 200,
  showValues = false,
}) => {
  const chartConfig = {
    backgroundColor: Colors.cardBackground,
    backgroundGradientFrom: Colors.cardBackground,
    backgroundGradientTo: Colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(94, 205, 191, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(99, 110, 114, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.chart.grid,
      strokeWidth: 1,
    },
    fillShadowGradient: Colors.chart.teal,
    fillShadowGradientOpacity: 0.2,
  };

  const Chart = type === 'line' ? LineChart : BarChart;

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        <Chart
          data={data}
          width={width}
          height={height}
          chartConfig={chartConfig}
          bezier={type === 'line'}
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
          segments={4}
          yAxisSuffix=""
          yAxisInterval={1}
          showValuesOnTopOfBars={showValues && type === 'bar'}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },
  chartWrapper: {
    marginHorizontal: -Spacing.lg,
    marginBottom: -Spacing.sm,
  },
  chart: {
    borderRadius: 16,
  },
});