import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList, ActivityIndicator, ScrollView } from 'react-native'; // <-- Aseguramos la importación de ScrollView
import { ThemeView, ThemeText } from '../../components/Theme';
import ThemeInput from '../../components/ThemeInput';
import { useAuth } from '../../context/AuthContext';
import { getInstruments, setInstruments, getProfile, setProfile } from '../../utils/profileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePracticeStore } from '../../store/usePracticeStore';

const recommendations: Record<string, Record<string, string>> = {
  Respiración: {    
    Básico: 'Respira de manera lenta y profunda: inhala 4s, mantén 4s, exhala 6s. Practica 5 minutos diarios.',
    Intermedio: 'Aumenta a 6/6/8, añade consciencia sobre el diafragma. Practica 10 minutos.',
    Avanzado: 'Integra control de ritmo y resistencia: series de 2–3 repeticiones con pausas activas.',
    'Super Avanzado': 'Realiza sesiones estructuradas con biofeedback y progresión de tiempos; combina con ejercicios físicos ligeros.'
  },
  Lectura: {
    Básico: 'Empieza identificando notas en el pentagrama lentamente. Usa flashcards 5 min diarios.',
    Intermedio: 'Reduce tiempo de respuesta a 2s, practica con variaciones de clave y octava.',
    Avanzado: 'Practica lecturas prolongadas y reconocimiento por timbre; añade ejercicios de intervalos.',
    'Super Avanzado': 'Entrena reconocimiento instantáneo y transposición en diferentes tonalidades.'
  },
  Práctica: {
    Básico: 'Define objetivos pequeños y medibles (5–10 min por día). Enfócate en una técnica a la vez.',
    Intermedio: 'Estructura sesiones: calentamiento, técnica, repertorio y repaso. Lleva registro de progresos.',
    Avanzado: 'Incorpora grabaciones, autoevaluación y metas semanales. Trabaja control dinámico.',
    'Super Avanzado': 'Planificación a largo plazo con ciclo de entrenamiento: intensidad, recuperación y rendimiento.'
  }
};

export default function ProfileScreen() {
  const { user } = useAuth();
  const [instruments, setInstrumentsState] = useState<string[]>([]);
  const [newInstrument, setNewInstrument] = useState('');
  const [level, setLevel] = useState<'Básico'|'Intermedio'|'Avanzado'|'Super Avanzado'>('Básico');
  const { logs } = usePracticeStore();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [username, setUsername] = useState<string | null>(null);
  const [principalInstrument, setPrincipalInstrument] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const profile = await getProfile(user?.id);
        if (profile) {
          setUsername(profile.username ?? null);
          setPrincipalInstrument(profile.principal_instrument ?? null);
          setIsDarkMode(!!profile.is_dark_mode);
          if (Array.isArray(profile.instruments)) {
            setInstrumentsState(profile.instruments as string[]);
          }
        } else {
          // fallback to instruments-only cache
          const list = await getInstruments(user?.id);
          setInstrumentsState(list || []);
        }
      } catch (err) {
        const list = await getInstruments(user?.id);
        setInstrumentsState(list || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const addInstrument = async (val?: string) => {
    const name = (val ?? newInstrument).trim();
    if (!name) return;
    const updated = [name, ...instruments.filter(i => i !== name)];
    setInstrumentsState(updated);
    setNewInstrument('');
    try {
      await setInstruments(updated, user?.id);
    } catch (err) {
      console.warn('Error saving instruments', err);
    }
  };

  const removeInstrument = async (name: string) => {
    const updated = instruments.filter(i => i !== name);
    setInstrumentsState(updated);
    try {
      await setInstruments(updated, user?.id);
    } catch (err) {
      console.warn('Error removing instrument', err);
    }
  };

  // Local profile cache key (meta info)
  const PROFILE_META_KEY = (id?: string) => `musyc_profile_meta_${id ?? 'anon'}`;

  const saveLocalMeta = async (id: string | undefined, meta: { username?: string | null; principal_instrument?: string | null; is_dark_mode?: boolean }) => {
    if (!id) return;
    try {
      const key = PROFILE_META_KEY(id);
      const raw = await AsyncStorage.getItem(key);
      const prev = raw ? JSON.parse(raw) : {};
      const merged = { ...prev, ...meta, updated_at: new Date().toISOString() };
      await AsyncStorage.setItem(key, JSON.stringify(merged));
    } catch (err) {
      console.warn('saveLocalMeta error', err);
    }
  };

  const loadLocalMeta = async (id: string | undefined) => {
    if (!id) return null;
    try {
      const raw = await AsyncStorage.getItem(PROFILE_META_KEY(id));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('loadLocalMeta error', err);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      // save instruments (local + remote via profileStore)
      await setInstruments(instruments, user?.id);

      // try to upsert profile remotely (if supabase available). If it fails, fallback to local cache.
      try {
        await setProfile({ id: user!.id, instruments, principal_instrument: principalInstrument, is_dark_mode: isDarkMode, username });
      } catch (err) {
        console.warn('setProfile failed, saving local meta instead', err);
        await saveLocalMeta(user?.id, { username, principal_instrument: principalInstrument, is_dark_mode: isDarkMode });
        setSyncError('Guardado local (no se pudo sincronizar remoto)');
      }
    } catch (err) {
      console.warn('handleSaveProfile error', err);
      setSyncError('Error al guardar perfil');
    } finally {
      setSyncing(false);
    }
  };

  // simple stats
  const totalSessions = logs.length;

  const WIND_INSTRUMENTS = ['Flauta', 'Clarinete', 'Saxofón', 'Trompeta', 'Trombón', 'Tuba', 'Ocarina', 'Zampoña', 'Quena'];

  return (
    <ThemeView className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ThemeText className="text-3xl font-poppins-bold text-[#132E32] dark:text-white mb-2">Perfil</ThemeText>
        <ThemeText className="text-sm text-gray-600 dark:text-gray-300 mb-6">Gestiona tu perfil y preferencias</ThemeText>

        {loading ? (
            <View className="flex-1 justify-center items-center h-40">
                <ActivityIndicator size="large" color="#5bbf96" />
            </View>
        ) : (
            <View>
                <View className="mb-6">
                    <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white">Cuenta</ThemeText>
                    <ThemeText className="text-base mt-2 text-[#132E32] dark:text-white">{user?.email ?? '–'}</ThemeText>
                    <ThemeText className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sesiones registradas: {totalSessions}</ThemeText>
                </View>

                <View className="mb-6">
                    <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">Instrumentos (viento)</ThemeText>

                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {WIND_INSTRUMENTS.map(inst => {
                            const selected = instruments.includes(inst);
                            return (
                                <Pressable 
                                    key={inst} 
                                    onPress={() => selected ? removeInstrument(inst) : addInstrument(inst)} 
                                    className={`px-3 py-2 rounded-full ${selected ? 'bg-primary' : 'bg-white/10 dark:bg-card-dark'}`}
                                >
                                    <ThemeText className={`${selected ? 'text-white' : 'text-[#132E32] dark:text-white'}`}>{inst}</ThemeText>
                                </Pressable>
                            );
                        })}
                    </View>

                    <View className="mb-4 mt-6">
                        <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">Tus instrumentos</ThemeText>
                        {instruments.length === 0 ? (
                            <ThemeText className="text-sm text-gray-500 dark:text-gray-400">Aún no has seleccionado instrumentos.</ThemeText>
                        ) : (
                            instruments.map(i => (
                                <View key={i} className="flex-row items-center justify-between py-2 border-b border-gray-200 dark:border-border-dark">
                                    <ThemeText className="text-base text-[#132E32] dark:text-white">{i}</ThemeText>
                                    <Pressable onPress={() => removeInstrument(i)} className="px-3 py-1 rounded-md bg-red-500">
                                        <ThemeText className="text-sm text-white">Eliminar</ThemeText>
                                    </Pressable>
                                </View>
                            ))
                        )}
                    </View>

                    <View className="mb-4">
                        <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">Perfil</ThemeText>
                        <ThemeInput value={username ?? ''} onChangeText={setUsername as any} placeholder="Nombre de usuario (opcional)" />
                        <ThemeInput value={principalInstrument ?? ''} onChangeText={setPrincipalInstrument as any} placeholder="Instrumento principal (opcional)" className="mt-2" />

                        <View className="flex-row items-center justify-between mt-3">
                            <ThemeText className="text-sm text-[#132E32] dark:text-white">Modo oscuro</ThemeText>
                            <Pressable onPress={() => setIsDarkMode(!isDarkMode)} className="px-3 py-2 rounded-full bg-white/10 dark:bg-card-dark border border-gray-300 dark:border-border-dark">
                                <ThemeText className="text-sm text-[#132E32] dark:text-white">{isDarkMode ? 'Activado' : 'Desactivado'}</ThemeText>
                            </Pressable>
                        </View>

                        <View className="mt-6 flex-row items-center gap-3">
                            <Pressable onPress={handleSaveProfile} className="bg-primary px-4 py-3 rounded-xl flex-row items-center justify-center">
                                {syncing ? <ActivityIndicator color="#132E32" /> : <ThemeText className="text-text-light font-semibold">Guardar perfil</ThemeText>}
                            </Pressable>
                            {syncError ? <ThemeText className="text-sm text-red-400">{syncError}</ThemeText> : null}
                        </View>
                    </View>

                </View>

                <View className="mb-6">
                    <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">Nivel de recomendaciones</ThemeText>
                    <View className="flex-row gap-2 mb-4 flex-wrap">
                        {(['Básico','Intermedio','Avanzado','Super Avanzado'] as const).map(l => (
                            <Pressable 
                                key={l} 
                                onPress={() => setLevel(l)} 
                                className={`px-3 py-2 rounded-full border border-primary/50 ${level===l ? 'bg-primary' : 'bg-white/10 dark:bg-card-dark'}`}
                            >
                                <ThemeText className={`text-sm ${level===l ? 'text-text-light' : 'text-[#132E32] dark:text-white'}`}>{l}</ThemeText>
                            </Pressable>
                        ))}
                    </View>

                    <View className="rounded-xl bg-white/95 dark:bg-card-dark p-4 border border-border-dark">
                        <ThemeText className="text-sm font-poppins-semibold text-primary dark:text-primary mb-2">Respiración</ThemeText>
                        <ThemeText className="text-sm text-gray-700 dark:text-gray-300 mb-3">{recommendations.Respiración[level]}</ThemeText>

                        <ThemeText className="text-sm font-poppins-semibold text-primary dark:text-primary mb-2">Lectura</ThemeText>
                        <ThemeText className="text-sm text-gray-700 dark:text-gray-300 mb-3">{recommendations.Lectura[level]}</ThemeText>

                        <ThemeText className="text-sm font-poppins-semibold text-primary dark:text-primary mb-2">Práctica</ThemeText>
                        <ThemeText className="text-sm text-gray-700 dark:text-gray-300">{recommendations.Práctica[level]}</ThemeText>
                    </View>
                </View>
            </View>
        )}
      </ScrollView>
    </ThemeView>
  );
}