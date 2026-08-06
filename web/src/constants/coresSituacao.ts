export const CORES_SITUACAO: Record<string, { bg: string; text: string }> = {
   gray:   { bg: '#F3F4F6', text: '#4B5563' },
   blue:   { bg: '#DBEAFE', text: '#1E40AF' },
   green:  { bg: '#DCFCE7', text: '#166534' },
   red:    { bg: '#FEE2E2', text: '#991B1B' },
   yellow: { bg: '#FEF9C3', text: '#854D0E' },
   purple: { bg: '#F3E8FF', text: '#6B21A8' },
   orange: { bg: '#FFEDD5', text: '#9A3412' },
   pink:   { bg: '#FCE7F3', text: '#9D174D' },
   cyan:   { bg: '#CFFAFE', text: '#155E75' },
   indigo: { bg: '#E0E7FF', text: '#3730A3' },
};

export const OPCOES_CORES = Object.keys(CORES_SITUACAO).map((cor) => ({
  value: cor,
  label: cor.charAt(0).toUpperCase() + cor.slice(1),
  bg: CORES_SITUACAO[cor].bg,
}));
