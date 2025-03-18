
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use localStorage to persist theme preference
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('scriptEditor-theme');
    return (savedTheme as Theme) || 'light';
  });

  // Apply theme to document when theme changes
  useEffect(() => {
    localStorage.setItem('scriptEditor-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Update body background and text color
    document.body.style.backgroundColor = theme === 'dark' ? '#1A1F2C' : '';
    document.body.style.color = theme === 'dark' ? '#F6F6F7' : '';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
