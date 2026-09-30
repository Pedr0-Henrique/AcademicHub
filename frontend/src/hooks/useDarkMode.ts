import { createContext, createElement, useContext, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface DarkModeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === null ? true : saved === 'true';
  });

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark((value) => !value);

  return createElement(DarkModeContext.Provider, { value: { isDark, toggle } }, children);
}

export function useDarkMode(): DarkModeContextValue {
  const context = useContext(DarkModeContext);
  if (!context) throw new Error('useDarkMode deve ser usado dentro de DarkModeProvider.');
  return context;
}
