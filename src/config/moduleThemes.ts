// ─────────────────────────────────────────────────────────────────────────────
// Module Theme Config — Per-module color palette
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuleTheme {
  /** Sidebar background (darker base) */
  primary: string;
  /** Darker variant for hover / dark mode sidebar */
  dark: string;
  /** Accent used for active tabs, icons, highlights */
  accent: string;
  /** Lighter accent for hover states */
  accentHover: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  cablefill: {
    primary:     '#401318',
    dark:        '#2E0E11',
    accent:      '#81292C',
    accentHover: '#6A2023',
  },
  capitolato: {
    primary:     '#1A2B4A',
    dark:        '#0F1A2E',
    accent:      '#2B4A81',
    accentHover: '#1E3566',
  },
  'cabine-mt': {
    primary:     '#1A4A35',
    dark:        '#0F2E20',
    accent:      '#2A7A55',
    accentHover: '#1E5C3E',
  },
  'project-management': {
    primary:     '#78350F', // amber-900
    dark:        '#451A03', // amber-950
    accent:      '#F59E0B', // amber-500
    accentHover: '#D97706', // amber-600
  },
};

export const DEFAULT_THEME: ModuleTheme = MODULE_THEMES['cablefill'];

export function getModuleTheme(moduleId: string | null): ModuleTheme {
  if (!moduleId) return DEFAULT_THEME;
  return MODULE_THEMES[moduleId] ?? DEFAULT_THEME;
}
