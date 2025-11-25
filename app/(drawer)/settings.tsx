// app/(drawer)/settings.tsx
import React from 'react';
import { View, Pressable, Alert, Switch, StyleSheet, ScrollView } from 'react-native';
import { ThemeView, ThemeText, ThemeSwitch, useTheme } from '../../components/Theme';
import { LogOut, Music, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getInstruments } from '../../utils/profileStore';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleSignOut = async () => {
    try {
      const res = await signOut();
      if (res?.error) {
        console.log('Error during signOut:', res.error);
        Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
      } else {
        Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      }
    } catch (err) {
      console.log('Exception during signOut:', err);
      Alert.alert('Error', 'Ocurrió un error inesperado al cerrar sesión.');
    }
  };

  const [instruments, setInstruments] = useState<string[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      if (!isFocused) return;
      const list = await getInstruments(user?.id);
      setInstruments(list || []);
    })();
  }, [user?.id, isFocused]);

  const bgColor = isDark ? '#07181a' : '#F5F7FA';
  const cardBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)';
  const textColor = isDark ? '#FFFFFF' : '#132E32';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)';

  return (
    <ThemeView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: bgColor, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24, flexGrow: 1 }}
      >
        <ThemeText style={{ fontSize: 36, fontWeight: '700', marginBottom: 24, color: textColor }}>
          Ajustes
        </ThemeText>

        <View style={{ gap: 24 }}>
        {/* Instrumentos */}
        <View style={{
          backgroundColor: cardBgColor,
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: borderColor
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Music size={32} color="#84FFC6" />
            <ThemeText style={{ fontSize: 24, fontWeight: '700', color: textColor }}>
              Instrumento(s)
            </ThemeText>
          </View>
          {instruments.length === 0 ? (
            <ThemeText style={{ fontSize: 14, color: isDark ? '#999999' : '#666666' }}>
              No has seleccionado instrumentos en tu perfil.
            </ThemeText>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {instruments.map(i => (
                <View 
                  key={i} 
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20
                  }}
                >
                  <ThemeText style={{ fontSize: 14, color: textColor }}>{i}</ThemeText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notificaciones */}
        <View style={{
          backgroundColor: cardBgColor,
          borderRadius: 24,
          padding: 24,
          borderWidth: 1,
          borderColor: borderColor
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Bell size={28} color="#84FFC6" />
              <ThemeText style={{ fontSize: 18, fontWeight: '600', color: textColor }}>
                Notificaciones
              </ThemeText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#84FFC6', true: '#132E32' }}
              thumbColor={notificationsEnabled ? '#FFD015' : '#132E32'}
            />
          </View>
        </View>

        {/* Modo Oscuro */}
        <ThemeSwitch />

        {/* Cerrar Sesión */}
        <Pressable
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderRadius: 24,
            padding: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.4)'
          }}
          onPress={handleSignOut}
        >
          <LogOut size={28} color="#ef4444" />
          <ThemeText style={{ fontSize: 18, fontWeight: '700', color: '#ef4444' }}>
            Cerrar Sesión
          </ThemeText>
        </Pressable>
      </View>
      </ScrollView>
    </ThemeView>
  );
}