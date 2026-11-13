import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius,
    padding: theme.spacing.m,
  },
});