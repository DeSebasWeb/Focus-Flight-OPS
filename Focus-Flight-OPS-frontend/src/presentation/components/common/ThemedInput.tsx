import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { useStyles, StyleTheme } from '../../hooks/useStyles';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function ThemedInput({ label, error, style, ...props }: ThemedInputProps) {
  const s = useStyles(createStyles);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={s.wrapper}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput
        style={[
          s.input,
          isFocused && s.inputFocused,
          error && s.inputError,
          style,
        ]}
        placeholderTextColor={s.placeholder.color}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={s.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = ({ colors, typography, spacing, borderRadius }: StyleTheme) => ({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface2,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  placeholder: {
    color: colors.textDisabled,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
