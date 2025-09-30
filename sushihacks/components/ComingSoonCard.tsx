import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors, Typography, Spacing } from '../constants/colors';

interface ComingSoonCardProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ComingSoonCard: React.FC<ComingSoonCardProps> = ({
  title = 'Coming Soon',
  icon = 'time-outline',
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <Ionicons name={icon} size={48} color={Colors.text.light} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>New features on the way</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 180,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.subheading,
    color: Colors.text.light,
    marginTop: Spacing.md,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.text.light,
    marginTop: Spacing.xs,
  },
});