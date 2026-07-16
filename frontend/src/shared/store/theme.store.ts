import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  destroy: () => void;
}

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') return getSystemTheme();
  return mode;
};

const applyTheme = (resolved: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('sgp-theme') as ThemeMode | null;
  if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
  return 'system';
};

const initialMode = getInitialMode();
const initialResolved = resolveTheme(initialMode);
applyTheme(initialResolved);

const listeners: Array<() => void> = [];

export const useThemeStore = create<ThemeState>((set, get) => {
  const onSystemChange = () => {
    const { mode } = get();
    if (mode === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      set({ resolved });
    }
  };

  const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (mq) {
    mq.addEventListener('change', onSystemChange);
    listeners.push(() => mq.removeEventListener('change', onSystemChange));
  }

  return {
    mode: initialMode,
    resolved: initialResolved,
    setMode: (mode) => {
      localStorage.setItem('sgp-theme', mode);
      const resolved = resolveTheme(mode);
      applyTheme(resolved);
      set({ mode, resolved });
    },
    destroy: () => {
      listeners.forEach((fn) => fn());
      listeners.length = 0;
    },
  };
});
