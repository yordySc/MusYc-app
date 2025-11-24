// components/Theme.tsx
import React, { createContext, useContext, useState, useMemo, PropsWithChildren, useEffect, useCallback } from 'react';
import { View, Text, Switch, ViewProps, TextProps } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const THEME_KEY = 'theme:isDark';

interface ThemeContextProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored !== null) setIsDark(stored === 'true');
      } catch (err) {
        console.log('Failed to read theme from storage', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Definir toggleTheme antes de cualquier retorno condicional para mantener
  // el orden de hooks consistente entre renders (evita "Rendered more hooks...").
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'true' : 'false').catch(e => console.log('set theme err', e));
      return next;
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <View className={isDark ? 'dark flex-1' : 'flex-1'}>
        <View className="flex-1 bg-background dark:bg-[#07181a]">{children}</View>
      </View>
    </ThemeContext.Provider>
  );
};

// Componentes con Poppins y colores nuevos
export const ThemeView: React.FC<PropsWithChildren<ViewProps & { className?: string }>> = ({ className = '', children, ...props }) => (
  <View className={`flex-1 bg-background dark:bg-[#07181a] ${className}`} {...props}>{children}</View>
);

export const ThemeText: React.FC<PropsWithChildren<TextProps & { className?: string }>> = ({ className = '', children, ...props }) => (
  <Text className={`font-poppins text-[#132E32] dark:text-white ${className}`} {...props}>{children}</Text>
);

export const ThemeSwitch: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <View className="flex-row items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-black/30 my-4 border border-white/20">
      <ThemeText className="text-lg font-poppins-semibold">Modo Oscuro</ThemeText>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#84FFC6', true: '#132E32' }}
        thumbColor={isDark ? '#FFD015' : '#132E32'}
      />
    </View>
  );
};