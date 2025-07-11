import { useEffect } from 'react';
import { useTheme } from './dashboard/theme-provider';

export function ThemeOverride() {
  const { theme } = useTheme();

  useEffect(() => {
    // Force Apple colors on root element
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('theme-blue-green', 'theme-yellow', 'theme-amber');
    
    // Apply Apple theme colors directly with !important
    const applyStyle = (property: string, value: string) => {
      root.style.setProperty(property, value, 'important');
    };
    
    if (theme === 'dark') {
      // Apple Dark Theme
      applyStyle('--background', '0 0 0'); // Pure black
      applyStyle('--foreground', '255 255 255'); // Pure white
      applyStyle('--card', '28 28 30'); // Apple gray 6
      applyStyle('--card-foreground', '255 255 255'); // Pure white
      applyStyle('--popover', '28 28 30'); // Apple gray 6
      applyStyle('--popover-foreground', '255 255 255'); // Pure white
      applyStyle('--primary', '10 132 255'); // Apple blue dark
      applyStyle('--primary-foreground', '255 255 255'); // White
      applyStyle('--secondary', '44 44 46'); // Apple gray 5
      applyStyle('--secondary-foreground', '255 255 255'); // Pure white
      applyStyle('--muted', '44 44 46'); // Apple gray 5
      applyStyle('--muted-foreground', '174 174 178'); // Apple gray 3
      applyStyle('--accent', '44 44 46'); // Apple gray 5
      applyStyle('--accent-foreground', '255 255 255'); // Pure white
      applyStyle('--border', '58 58 60'); // Apple separator dark
      applyStyle('--input', '44 44 46'); // Apple gray 5
      applyStyle('--ring', '10 132 255'); // Apple blue dark
    } else {
      // Apple Light Theme
      applyStyle('--background', '255 255 255'); // Pure white
      applyStyle('--foreground', '28 28 30'); // Apple gray 6
      applyStyle('--card', '255 255 255'); // Pure white
      applyStyle('--card-foreground', '28 28 30'); // Apple gray 6
      applyStyle('--popover', '255 255 255'); // Pure white
      applyStyle('--popover-foreground', '28 28 30'); // Apple gray 6
      applyStyle('--primary', '0 122 255'); // Apple blue
      applyStyle('--primary-foreground', '255 255 255'); // White
      applyStyle('--secondary', '246 246 246'); // Apple gray
      applyStyle('--secondary-foreground', '28 28 30'); // Apple gray 6
      applyStyle('--muted', '246 246 246'); // Apple gray
      applyStyle('--muted-foreground', '142 142 147'); // Apple gray 2
      applyStyle('--accent', '246 246 246'); // Apple gray
      applyStyle('--accent-foreground', '28 28 30'); // Apple gray 6
      applyStyle('--border', '229 229 234'); // Apple separator light
      applyStyle('--input', '242 242 247'); // Apple gray light
      applyStyle('--ring', '0 122 255'); // Apple blue
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
    
    // Force override any existing styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        --background: ${theme === 'dark' ? '0 0 0' : '255 255 255'} !important;
        --foreground: ${theme === 'dark' ? '255 255 255' : '28 28 30'} !important;
        --primary: ${theme === 'dark' ? '10 132 255' : '0 122 255'} !important;
        --card: ${theme === 'dark' ? '28 28 30' : '255 255 255'} !important;
        --border: ${theme === 'dark' ? '58 58 60' : '229 229 234'} !important;
      }
      
      body, #root {
        background-color: ${theme === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)'} !important;
        color: ${theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 30)'} !important;
      }
      
      .header-container {
        background-color: ${theme === 'dark' ? 'rgb(28, 28, 30)' : 'rgb(255, 255, 255)'} !important;
        color: ${theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(28, 28, 30)'} !important;
      }
      
      .bg-card {
        background-color: ${theme === 'dark' ? 'rgb(28, 28, 30)' : 'rgb(255, 255, 255)'} !important;
      }
      
      .text-primary {
        color: ${theme === 'dark' ? 'rgb(10, 132, 255)' : 'rgb(0, 122, 255)'} !important;
      }
      
      .bg-primary {
        background-color: ${theme === 'dark' ? 'rgb(10, 132, 255)' : 'rgb(0, 122, 255)'} !important;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return null;
}