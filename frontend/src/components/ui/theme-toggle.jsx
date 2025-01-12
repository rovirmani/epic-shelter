import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Dark Mode
        </>
      )}
    </button>
  );
}
