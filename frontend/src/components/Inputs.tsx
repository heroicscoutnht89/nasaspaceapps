import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Scale({ value, onChange, low, high }: {
  value: number | null; onChange: (n: number) => void; low: string; high: string;
}) {
  return (
    <View>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value === n;
          return (
            <Pressable key={n} onPress={() => onChange(n)} accessibilityRole="button"
              accessibilityState={{ selected: on }} style={[styles.pill, on && styles.pillOn]}>
              <Text style={styles.pillText}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.scaleLabels}>
        <Text style={styles.muted}>{low}</Text>
        <Text style={styles.muted}>{high}</Text>
      </View>
    </View>
  );
}

export function YesNoRow({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.yesNoRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.row}>
        <Pressable onPress={() => onChange(false)} accessibilityRole="button"
          accessibilityState={{ selected: !value }} style={[styles.small, !value && styles.smallNo]}>
          <Text style={styles.smallText}>No</Text>
        </Pressable>
        <Pressable onPress={() => onChange(true)} accessibilityRole="button"
          accessibilityState={{ selected: value }} style={[styles.small, value && styles.smallYes]}>
          <Text style={[styles.smallText, value && { color: theme.colors.watch, fontWeight: '700' }]}>Yes</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Chips({ options, selected, onPick }: {
  options: string[]; selected: string[]; onPick: (o: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <Pressable key={o} onPress={() => onPick(o)} accessibilityRole="button"
            accessibilityState={{ selected: on }} style={[styles.chip, on && styles.pillOn]}>
            <Text style={styles.pillText}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TextField({ label, hint, unit, value, onChangeText, placeholder, numeric = true }: {
  label: string; hint?: string; unit?: string; value: string;
  onChangeText: (t: string) => void; placeholder?: string; numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          accessibilityLabel={label}
          style={styles.input}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: theme.radius,
    backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border,
  },
  pillOn: { borderColor: theme.colors.text },
  pillText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  muted: { color: theme.colors.textMuted, fontSize: 12 },
  yesNoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  rowLabel: { color: theme.colors.text, fontSize: 15, flex: 1, paddingRight: 8 },
  small: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: theme.radius,
    borderWidth: 2, borderColor: theme.colors.border,
  },
  smallNo: { borderColor: theme.colors.textMuted },
  smallYes: { borderColor: theme.colors.watch },
  smallText: { color: theme.colors.textMuted, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: theme.radius,
    backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border,
  },
  field: { gap: 4 },
  fieldLabel: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  hint: { color: theme.colors.textMuted, fontSize: 12, lineHeight: 17 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, paddingHorizontal: 12,
  },
  input: { flex: 1, color: theme.colors.text, fontSize: 18, paddingVertical: 12 },
  unit: { color: theme.colors.textMuted, fontSize: 13, marginLeft: 8 },
});