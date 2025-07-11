import { useEffect } from 'react';
import { useTheme } from './dashboard/theme-provider';

export function ThemeOverride() {
  const { theme } = useTheme();

  useEffect(() => {
    // Force Apple colors on root element
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('theme-blue-green', 'theme-yellow', 'theme-amber');
    
    // Apply Apple theme colors directly
    if (theme === 'dark') {
      root.style.setProperty('--background', '0 0 0'); // Pure black
      root.style.setProperty('--foreground', '255 255 255'); // Pure white
      root.style.setProperty('--card', '28 28 30'); // Apple gray 6
      root.style.setProperty('--primary', '10 132 255'); // Apple blue dark
    } else {
      root.style.setProperty('--background', '255 255 255'); // Pure white
      root.style.setProperty('--foreground', '28 28 30'); // Apple gray 6
      root.style.setProperty('--card', '255 255 255'); // Pure white
      root.style.setProperty('--primary', '0 122 255'); // Apple blue
    }
    
    // Force body background
    document.body.style.backgroundColor = `hsl(var(--background))`;
    document.body.style.color = `hsl(var(--foreground))`;
    
    // Apply to root div
    const rootDiv = document.getElementById('root');
    if (rootDiv) {
      rootDiv.style.backgroundColor = `hsl(var(--background))`;
      rootDiv.style.color = `hsl(var(--foreground))`;
    }
  }, [theme]);

  return null;
}