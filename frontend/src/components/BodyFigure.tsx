import { Platform, Pressable, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { statusLabel, theme } from '../theme';
import type { BodyArea } from '../data/body';

type Props = {
  areas: BodyArea[];
  selectedId: string;
  onSelect: (id: string) => void;
  width?: number;
};

export function BodyFigure({ areas, selectedId, onSelect, width = 240 }: Props) {
  const scale = width / 280; // the drawing is 280 units wide
  const height = 330 * scale;
  const hit = 48 * scale; // tap target size in pixels

  return (
    <View style={{ width, height }}>
      <Svg width={width}
        height={height}
        viewBox="-30 0 280 330"
        {...(Platform.OS === 'ios'
          ? { accessibilityElementsHidden: true }
          : Platform.OS === 'android'
            ? { importantForAccessibility: 'no-hide-descendants' as const }
            : {})}
        >
        <G fill="none" stroke={theme.colors.border} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={110} cy={40} r={26} />
          <Path d="M84 78 H136 L150 190 H70 Z" />
          <Path d="M84 84 L44 170" />
          <Path d="M136 84 L176 170" />
          <Path d="M86 190 L80 310" />
          <Path d="M134 190 L140 310" />
        </G>
        {areas.map((a) => {
          const color = theme.colors[a.status];
          const on = a.id === selectedId;
          return (
            <G key={a.id}>
              <Circle cx={a.x} cy={a.y} r={on ? 16 : 12} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={on ? 4 : 2} />
              <SvgText
                x={a.labelX} y={a.y + 4} fontSize={11} textAnchor={a.labelAnchor}
                fill={on ? theme.colors.text : theme.colors.textMuted} fontWeight={on ? '700' : '400'}
              >
                {a.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {areas.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => onSelect(a.id)}
          accessibilityRole="button"
          accessibilityLabel={`${a.name}, ${statusLabel[a.status]}`}
          accessibilityState={{ selected: a.id === selectedId }}
          style={{
            position: 'absolute',
            left: (a.x + 30) * scale - hit / 2,
            top: a.y * scale - hit / 2,
            width: hit,
            height: hit,
            borderRadius: hit / 2,
          }}
        />
      ))}
    </View>
  );
}