import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  // Background colors
  background: '#ffffff',
  surface: '#f9fafb',
  card: '#ffffff',
  
  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Primary colors
  primary: '#3b82f6',
  primaryLight: '#dbeafe',
  
  // Category colors
  categoryFood: '#ef4444',
  categoryTransport: '#3b82f6',
  categoryShopping: '#8b5cf6',
  categoryOthers: '#6b7280',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

const darkColors = {
  // Background colors
  background: '#111827',
  surface: '#1f2937',
  card: '#374151',
  
  // Text colors
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  
  // Border colors
  border: '#4b5563',
  borderLight: '#374151',
  
  // Primary colors
  primary: '#60a5fa',
  primaryLight: '#1e3a8a',
  
  // Category colors
  categoryFood: '#f87171',
  categoryTransport: '#60a5fa',
  categoryShopping: '#a78bfa',
  categoryOthers: '#9ca3af',
  
  // Status colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
};
