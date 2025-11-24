// app/(drawer)/settings.tsx
import React from 'react';
import { View, Pressable, Alert } from 'react-native';
import { ThemeView, ThemeText, ThemeSwitch } from '../../components/Theme';
import { LogOut, Music, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getInstruments } from '../../utils/profileStore';
import { useEffect, useState } from 'react';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

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
  useEffect(() => {
    (async () => {
      const list = await getInstruments(user?.id);
      setInstruments(list || []);
    })();
  }, [user?.id]);

  return (
    <ThemeView className="px-6 pt-4">
      <ThemeText className="text-4xl font-poppins-bold text-[#132E32] dark:text-white mb-10">Ajustes</ThemeText>

      <View className="space-y-6">
        <View className="bg-white/25 backdrop-blur-2xl rounded-3xl p-6 border border-white/30">
          <View className="flex-row items-center gap-4 mb-4">
            <Music size={32} color="#84FFC6" />
            <ThemeText className="text-2xl font-poppins-bold text-[#132E32] dark:text-white">Instrumento(s)</ThemeText>
          </View>
          {instruments.length === 0 ? (
            <ThemeText className="text-sm text-gray-500 dark:text-gray-400">No has seleccionado instrumentos en tu perfil.</ThemeText>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {instruments.map(i => (
                <View key={i} className="bg-white/10 px-3 py-1 rounded-full">
                  <ThemeText className="text-sm text-[#132E32] dark:text-white">{i}</ThemeText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="bg-white/25 backdrop-blur-2xl rounded-3xl p-6 border border-white/30">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Bell size={28} color="#84FFC6" />
              <ThemeText className="text-xl font-poppins-semibold text-[#132E32] dark:text-white">Notificaciones</ThemeText>
            </View>
            <ThemeSwitch />
          </View>
        </View>

        <Pressable
          className="bg-red-500/20 backdrop-blur-2xl rounded-3xl p-6 border border-red-500/40 flex-row items-center justify-center gap-4"
          onPress={handleSignOut}
        >
          <LogOut size={28} color="#ef4444" />
          <ThemeText className="text-xl font-poppins-bold text-red-500">Cerrar Sesión</ThemeText>
        </Pressable>
      </View>
    </ThemeView>
  );
}