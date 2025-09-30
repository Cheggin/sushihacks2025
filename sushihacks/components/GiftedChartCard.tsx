import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { Card } from './Card';
import { Colors, Spacing } from '../constants/colors';

const screenWidth = Dimensions.get('window').width;

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar';
  data: any;
  width?: number;
  height?: number;
  showValues?: boolean;
}

export const GiftedChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  width = screenWidth - 48,
  height = 200,
  showValues = false,
}) => {
  const actualWidth = Math.min(width, screenWidth - 48);

  const lineChartData = data.datasets?.[0]?.data?.map((value: number, index: number) => ({
    value,
    label: data.labels?.[index] || '',
    dataPointColor: Colors.primary,
    dataPointRadius: 4,
    dataPointStrokeWidth: 2,
    dataPointStrokeColor: Colors.white,
  })) || [];

  const barChartData = data.datasets?.[0]?.data?.map((value: number, index: number) => ({
    value,
    label: data.labels?.[index] || '',
    frontColor: Colors.primary,
    topLabelComponent: showValues ? () => (
      <Text style={styles.barValue}>{value}</Text>
    ) : undefined,
  })) || [];

  const maxDataValue = Math.max(...(data.datasets?.[0]?.data || [0]));
  const yAxisMax = Math.ceil(maxDataValue / 10) * 10 + 10;

  const commonProps = {
    width: actualWidth - 30,
    height: height,
    color: Colors.primary,
    thickness: 2,
    spacing: type === 'bar' ?
      Math.max(6, (actualWidth - 80) / (barChartData.length * 2)) :
      Math.max(20, (actualWidth - 40) / lineChartData.length),
    initialSpacing: type === 'bar' ? 8 : 5,
    endSpacing: type === 'bar' ? 5 : 5,
    noOfSections: 4,
    maxValue: yAxisMax,
    yAxisColor: Colors.chart.grid,
    xAxisColor: Colors.chart.grid,
    yAxisTextStyle: {
      color: Colors.text.secondary,
      fontSize: 8,
    },
    xAxisLabelTextStyle: {
      color: Colors.text.secondary,
      fontSize: 8,
      textAlign: 'center' as const,
    },
    rulesType: 'solid' as const,
    rulesColor: Colors.chart.grid,
    yAxisThickness: 1,
    xAxisThickness: 1,
    yAxisLabelWidth: 22,
    hideYAxisText: false,
    yAxisSide: 'left' as const,
    yAxisOffset: 0,
  };

  return (
    <Card style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.chartWrapper}>
        {type === 'line' ? (
          <LineChart
            data={lineChartData}
            {...commonProps}
            areaChart
            curved
            startFillColor={Colors.chart.teal}
            endFillColor={Colors.white}
            startOpacity={0.3}
            endOpacity={0.1}
            dataPointsColor={Colors.primary}
            hideDataPoints={false}
            isAnimated
            animationDuration={1000}
          />
        ) : (
          <BarChart
            data={barChartData}
            {...commonProps}
            barWidth={Math.min(12, (actualWidth - 90) / (barChartData.length * 2))}
            roundedTop
            roundedBottom
            barBorderRadius={4}
            frontColor={Colors.primary}
            showGradient={false}
            isAnimated
            animationDuration={800}
            yAxisLabelPrefix=""
            yAxisLabelSuffix=""
            xAxisLabelsVerticalShift={2}
            disableScroll
            hideRules={false}
            showYAxisIndices
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    color: Colors.text.primary,
  },
  chartWrapper: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barValue: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
});