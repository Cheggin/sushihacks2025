import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/colors';

interface InputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  unit?: string;
  helper?: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  unit,
  helper,
  error,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.light}
          keyboardType={keyboardType}
          {...props}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {helper && !error && <Text style={styles.helper}>{helper}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    height: '100%',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  unit: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  helper: {
    ...Typography.caption,
    color: Colors.text.light,
    marginTop: Spacing.xs,
  },
  error: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});