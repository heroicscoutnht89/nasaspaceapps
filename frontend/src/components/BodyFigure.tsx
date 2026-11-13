import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme';
import type { BodyArea } from '../data/body';

type Props = {
  areas: BodyArea[];
  selectedId: string;
  onSelect: (id: string) => void;
  width?: number;
};

export function BodyFigure({ areas, selectedId, onSelect, width = 240 }: Props) {
  const height = (width * 330) / 280;
  return (
    <Svg width={width} height={height} viewBox="-30 0 280 330" accessibilityLabel="Human figure with tappable body areas">
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
          <G key={a.id} onPress={() => onSelect(a.id)}>
            <Circle cx={a.x} cy={a.y} r={on ? 16 : 12} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={on ? 4 : 2} />
            <Circle cx={a.x} cy={a.y} r={24} fill="transparent" />
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
  );
}