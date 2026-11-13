export const theme = {
  colors: {
    background: '#0A0C10',
    surface: '#14181F',
    border: '#2A303B',
    text: '#F2F4F7',
    textMuted: '#A8B0BD',
    action: '#D92B12',
    link: '#0B3D91',
    nominal: '#4ADE80',
    watch: '#FBBF24',
    alert: '#FF6B5E',
  },
  spacing: { s: 8, m: 16, l: 24 },
  radius: 6,
};

export type Status = 'nominal' | 'watch' | 'alert';

export const statusLabel: Record<Status, string> = {
  nominal: 'Nominal',
  watch: 'Watch',
  alert: 'Action',
};