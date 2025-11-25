import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ThemeView, ThemeText } from '../../components/Theme';
import ThemeInput from '../../components/ThemeInput';
import { useAuth } from '../../context/AuthContext';
import { getInstruments, setInstruments, getProfile, setProfile } from '../../utils/profileStore';
import { usePracticeStore } from '../../store/usePracticeStore';

const WIND_INSTRUMENTS = ['Flauta', 'Clarinete', 'Saxofón', 'Trompeta', 'Trombón', 'Tuba', 'Ocarina', 'Zampoña', 'Quena'];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [instruments, setInstrumentsState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { logs } = usePracticeStore();
  const [username, setUsername] = useState<string | null>(null);
  const [principalInstrument, setPrincipalInstrument] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const profile = await getProfile(user?.id);
        if (profile) {
          setUsername(profile.username ?? null);
          setPrincipalInstrument(profile.principal_instrument ?? null);
          if (Array.isArray(profile.instruments)) {
            setInstrumentsState(profile.instruments as string[]);
          }
        } else {
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

  const addInstrument = async (name: string) => {
    if (!name.trim()) return;
    const updated = [name, ...instruments.filter(i => i !== name)];
    setInstrumentsState(updated);
    try {
      await setInstruments(updated, user?.id);
    } catch (err) {
      // error saving instruments
    }
  };

  const removeInstrument = async (name: string) => {
    const updated = instruments.filter(i => i !== name);
    setInstrumentsState(updated);
    try {
      await setInstruments(updated, user?.id);
    } catch (err) {
      // error removing instrument
    }
  };

  const handleSaveProfile = async () => {
    setSyncing(true);
    try {
      await setInstruments(instruments, user?.id);
      await setProfile({ id: user!.id, instruments, principal_instrument: principalInstrument, is_dark_mode: false, username });
      Alert.alert('Éxito', 'Perfil guardado correctamente');
    } catch (err) {
      Alert.alert('Error', 'Error al guardar perfil');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          await signOut();
        },
        style: 'destructive',
      },
    ]);
  };

  const totalSessions = logs.length;

  return (
    <ThemeView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 24 }} showsVerticalScrollIndicator={false}>
        <ThemeText style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>Perfil</ThemeText>
        <ThemeText style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>Gestiona tu cuenta e instrumentos</ThemeText>

        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <ActivityIndicator size="large" color="#84FFC6" />
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 24 }}>
              <ThemeText style={{ fontSize: 14, fontWeight: '700', marginBottom: 12, color: '#84FFC6' }}>CUENTA</ThemeText>
              <View style={{ backgroundColor: '#1A2E33', borderRadius: 12, padding: 16 }}>
                <ThemeText style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Email</ThemeText>
                <ThemeText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#FFF' }}>
                  {user?.email ?? '–'}
                </ThemeText>
                <ThemeText style={{ fontSize: 12, color: '#999' }}>Sesiones: {totalSessions}</ThemeText>
              </View>
            </View>

            
            <View style={{ marginBottom: 24 }}>
              <ThemeText style={{ fontSize: 14, fontWeight: '700', marginBottom: 12, color: '#84FFC6' }}>INFORMACIÓN</ThemeText>
              <ThemeInput value={username ?? ''} onChangeText={setUsername as any} placeholder="Nombre de usuario" style={{ marginBottom: 10 }} />
              <ThemeInput value={principalInstrument ?? ''} onChangeText={setPrincipalInstrument as any} placeholder="Instrumento principal" />
            </View>

            
            <View style={{ marginBottom: 24 }}>
              <ThemeText style={{ fontSize: 14, fontWeight: '700', marginBottom: 12, color: '#84FFC6' }}>MIS INSTRUMENTOS</ThemeText>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {WIND_INSTRUMENTS.map(inst => {
                  const selected = instruments.includes(inst);
                  return (
                    <Pressable 
                      key={inst} 
                      onPress={() => selected ? removeInstrument(inst) : addInstrument(inst)} 
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: selected ? '#84FFC6' : '#2A3E43',
                      }}
                    >
                      <ThemeText style={{ fontSize: 12, color: selected ? '#132E32' : '#FFF', fontWeight: '600' }}>
                        {inst}
                      </ThemeText>
                    </Pressable>
                  );
                })}
              </View>

              {instruments.length > 0 && (
                <View style={{ backgroundColor: '#1A2E33', borderRadius: 12, padding: 12 }}>
                  <ThemeText style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Seleccionados ({instruments.length})</ThemeText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {instruments.map(inst => (
                      <View 
                        key={inst}
                        style={{
                          backgroundColor: '#84FFC6',
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <ThemeText style={{ fontSize: 12, color: '#132E32', fontWeight: '600' }}>{inst}</ThemeText>
                        <Pressable onPress={() => removeInstrument(inst)}>
                          <ThemeText style={{ fontSize: 14, color: '#132E32' }}>X</ThemeText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            
            <View style={{ gap: 12 }}>
              <Pressable 
                onPress={handleSaveProfile}
                disabled={syncing}
                style={{
                  backgroundColor: '#84FFC6',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: syncing ? 0.6 : 1,
                }}
              >
                {syncing ? (
                  <ActivityIndicator color="#132E32" />
                ) : (
                  <ThemeText style={{ fontSize: 16, fontWeight: '700', color: '#132E32' }}>Guardar Perfil</ThemeText>
                )}
              </Pressable>

              <Pressable 
                onPress={handleLogout}
                style={{
                  backgroundColor: '#EF4444',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <ThemeText style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Cerrar Sesión</ThemeText>
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </ThemeView>
  );
}
