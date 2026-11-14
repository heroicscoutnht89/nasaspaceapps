import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme';

type Props = {
  startLabel?: string;
  endLabel?: string;
  values: number[];
  lastDay: number;
  min: number;
  max: number;
  baseline: { low: number; high: number } | null;
  flag: number | null;
  color: string;
  summary: string;
  height?: number;
};

export function LineChart({ startLabel, endLabel, values, lastDay, min, max, baseline, flag, color, summary, height = 220 }: Props) {
  const [w, setW] = useState(0);
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const innerW = Math.max(w - padL - padR, 1);
  const innerH = height - padT - padB;
  const n = values.length;

  const x = (i: number) => padL + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * innerH;
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  const ticks = [min, (min + max) / 2, max];
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const startDay = lastDay - n + 1;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
      {w > 0 ? (
        <Svg width={w} height={height} accessibilityLabel={summary}>
          {baseline ? (
            <Rect
              x={padL} y={y(baseline.high)} width={innerW}
              height={y(baseline.low) - y(baseline.high)} fill="#4C8DFF" fillOpacity={0.15}
            />
          ) : null}
          {ticks.map((t) => (
            <G key={t}>
              <Line x1={padL} x2={padL + innerW} y1={y(t)} y2={y(t)} stroke={theme.colors.border} strokeWidth={1} />
              <SvgText x={0} y={y(t) + 4} fontSize={11} fill={theme.colors.textMuted}>{fmt(t)}</SvgText>
            </G>
          ))}
          {flag !== null ? (
            <Line
              x1={padL} x2={padL + innerW} y1={y(flag)} y2={y(flag)}
              stroke={theme.colors.alert} strokeWidth={1} strokeDasharray="4 4"
            />
          ) : null}
          <Polyline
            points={points} fill="none" stroke={theme.colors.text} strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round"
          />
          <Circle cx={x(n - 1)} cy={y(values[n - 1])} r={5} fill={color} />
          <SvgText x={padL} y={height - 6} fontSize={11} fill={theme.colors.textMuted} textAnchor="start">
            {startLabel ?? `Day ${startDay}`}
          </SvgText>
          <SvgText x={padL + innerW} y={height - 6} fontSize={11} fill={theme.colors.textMuted} textAnchor="end">
            {endLabel ?? `Day ${lastDay}`}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
