export const CATEGORY_THEMES = {
  fruits: {
    gradient: 'linear-gradient(160deg, #FFF5F2 0%, #FFE8E2 100%)',
    cardBg: '#FFE4DC',
    accent: '#FF7A5C',
    dark: '#B83020',
    shadow: '#CC5040',
    progressFill: '#FF8B6B',
  },
  vegetables: {
    gradient: 'linear-gradient(160deg, #F2FBF6 0%, #D8F8E8 100%)',
    cardBg: '#CDFAE0',
    accent: '#3DBF7A',
    dark: '#1A6A40',
    shadow: '#2A8A58',
    progressFill: '#4DCF88',
  },
  vehicles: {
    gradient: 'linear-gradient(160deg, #F0F4FF 0%, #D8E6FF 100%)',
    cardBg: '#D8E8FF',
    accent: '#5B82E8',
    dark: '#1A38A8',
    shadow: '#3A58C8',
    progressFill: '#6B92F0',
  },
  brands: {
    gradient: 'linear-gradient(160deg, #FDF8FF 0%, #F0E8FF 100%)',
    cardBg: '#EAD8FF',
    accent: '#8B40E8',
    dark: '#4A1890',
    shadow: '#6A28C8',
    progressFill: '#9B58F0',
  },
  tayo: {
    gradient: 'linear-gradient(160deg, #EFF8FF 0%, #CCEEFF 100%)',
    cardBg: '#C0E8FF',
    accent: '#1A8FD8',
    dark: '#0A4A80',
    shadow: '#1068A8',
    progressFill: '#3AA8F0',
  },
} as const;

export type ThemeKey = keyof typeof CATEGORY_THEMES;

export function getTheme(categoryId: string) {
  return CATEGORY_THEMES[categoryId as ThemeKey] ?? CATEGORY_THEMES.vehicles;
}
