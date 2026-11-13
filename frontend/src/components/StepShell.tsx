import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { TopStrip } from './TopStrip';

type Props = {
  step: number;
  total: number;
  label: string;
  title: string;
  subtitle?: string;
  nextLabel?: string;
  onBack?: () => void;
  onNext: () => void;
  children?: ReactNode;
};

export function StepShell({ step, total, label, title, subtitle, nextLabel = 'Next', onBack, onNext, children }: Props) {
  const pct = ((step + 1) / total) * 100;
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TopStrip />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <Text style={styles.kicker}>Step {step + 1} of {total} · {label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.body}>{children}</View>
          <View style={styles.footer}>
            {onBack ? (
              <Pressable onPress={onBack} style={styles.back}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={onNext} style={styles.next}>
              <Text style={styles.nextText}>{nextLabel}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20 },
  inner: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 8 },
  kicker: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  track: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2 },
  fill: { height: 4, backgroundColor: theme.colors.action, borderRadius: 2 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '700', marginTop: 8 },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  body: { marginTop: 8 },
  footer: { flexDirection: 'row', gap: 12, marginTop: 24 },
  back: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: theme.radius,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  backText: { color: theme.colors.text, fontSize: 15 },
  next: { flex: 2, alignItems: 'center', paddingVertical: 16, borderRadius: theme.radius, backgroundColor: theme.colors.action },
  nextText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});