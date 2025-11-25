// components/Theme.tsx
import React, { createContext, useContext, useState, useMemo, PropsWithChildren, useEffect, useCallback } from 'react';
import { View, Text, Switch, ViewProps, TextProps, useColorScheme } from 'react-native';
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
  const systemColorScheme = useColorScheme();

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
        if (stored !== null) {
          setIsDark(stored === 'true');
        } else {
          // Si no hay preferencia guardada, usar tema del sistema
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (err) {
        // Failed to read theme from storage
      }
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'true' : 'false').catch(() => {/* set theme err */});
      return next;
    });
  }, []);

  if (!fontsLoaded) return null;

  const bgColor = isDark ? '#07181a' : '#F5F7FA';
  const textColor = isDark ? '#FFFFFF' : '#132E32';

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* Añadir la clase `dark` cuando isDark=true para que NativeWind aplique las clases `dark:` */}
      <View style={{ flex: 1, backgroundColor: bgColor }} className={isDark ? 'dark' : ''}>
        <View style={{ flex: 1, backgroundColor: bgColor }}>
          {children}
        </View>
      </View>
    </ThemeContext.Provider>
  );
};

// Componentes con Poppins y colores nuevos
export const ThemeView: React.FC<PropsWithChildren<ViewProps & { className?: string }>> = ({ className = '', style, children, ...props }) => {
  const { isDark } = useTheme();
  return (
    <View 
      style={[
        { 
          backgroundColor: isDark ? '#0D1B1F' : '#F5F7FA' 
        },
        style
      ]} 
      className={className}
      {...props}
    >
      {children}
    </View>
  );
};

export const ThemeText: React.FC<PropsWithChildren<TextProps & { className?: string }>> = ({ className = '', children, ...props }) => {
  const { isDark } = useTheme();
  return (
    <Text 
      style={{ 
        color: isDark ? '#F0F9FF' : '#132E32',
        fontFamily: 'Poppins'
      }} 
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
};

export const ThemeSwitch: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1A2E33' : '#FFFFFF',
      marginVertical: 16,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#E5E7EB'
    }}>
      <Text style={{ 
        fontSize: 16, 
        color: isDark ? '#F0F9FF' : '#132E32',
        fontFamily: 'Poppins-SemiBold'
      }}>
        Modo Oscuro
      </Text>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#84FFC6', true: '#132E32' }}
        thumbColor={isDark ? '#FFD015' : '#132E32'}
      />
    </View>
  );
};