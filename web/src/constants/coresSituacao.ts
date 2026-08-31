export const CORES_SITUACAO: Record<string, { bg: string; text: string }> = {
   gray:   { bg: '#9CA3AF6a', text: '#111827' },
   blue:   { bg: '#60A5FA6a', text: '#1E3A8A' },
   green:  { bg: '#4ADE806a', text: '#14532D' },
   red:    { bg: '#F871716a', text: '#7F1D1D' },
   yellow: { bg: '#FACC156a', text: '#713F12' },
   purple: { bg: '#C084FC6a', text: '#581C87' },
   orange: { bg: '#FB923C6a', text: '#7C2D12' },
   pink:   { bg: '#F472B66a', text: '#831843' },
   cyan:   { bg: '#22D3EE6a', text: '#164E63' },
   indigo: { bg: '#818CF86a', text: '#312E81' },
};

export const OPCOES_CORES = Object.keys(CORES_SITUACAO).map((cor) => ({
  value: cor,
  label: cor.charAt(0).toUpperCase() + cor.slice(1),
  bg: CORES_SITUACAO[cor].bg,
}));
