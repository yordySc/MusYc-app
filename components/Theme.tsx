import React, { createContext, useContext, useState, useMemo, PropsWithChildren } from 'react';
import { View, Text, useColorScheme, Switch, ViewProps, TextProps, StyleProp, ViewStyle } from 'react-native';

interface ThemeContextProps { theme: 'light' | 'dark'; isDark: boolean; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) { throw new Error('useTheme debe ser usado dentro de un ThemeProvider'); }
  return context;
};

export const ThemeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light'; 
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme);
  const isDark = theme === 'dark';

  const toggleTheme = () => { setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light')); };
  const contextValue: ThemeContextProps = useMemo(() => ({ theme, isDark, toggleTheme }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <View key={theme} className={isDark ? 'dark' : ''} style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  );
};

interface ThemeViewProps extends ViewProps { className?: string; style?: StyleProp<ViewStyle>; }
export const ThemeView: React.FC<PropsWithChildren<ThemeViewProps>> = ({ className = '', children, ...props }) => {
  const defaultClasses = 'flex-1 bg-background-light dark:bg-background-dark';
  return (<View className={`${defaultClasses} ${className}`} {...props}>{children}</View>);
};

interface ThemeTextProps extends TextProps { className?: string; }
export const ThemeText: React.FC<PropsWithChildren<ThemeTextProps>> = ({ className = '', children, ...props }) => {
  const defaultClasses = 'text-text-light dark:text-text-dark';
  return (<Text className={`${defaultClasses} ${className}`} {...props}>{children}</Text>);
};

export const ThemeSwitch: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <View className="flex-row items-center justify-between p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-md">
        <ThemeText className="text-lg font-semibold"> Modo Oscuro </ThemeText>
        <Switch onValueChange={toggleTheme} value={isDark} trackColor={{ false: "#d1d5db", true: "#374151" }} thumbColor={isDark ? "#93c5fd" : "#5bbf96"} />
    </View>
  );
};