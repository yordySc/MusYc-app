import React, { useState, useRef, useEffect } from 'react';
import { ThemeView, ThemeText, useTheme } from '../../../components/Theme';
import { View, Pressable, ScrollView } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { getBestLungCapacityRecord, setBestLungCapacityRecord } from '../../../utils/lungCapacityRecord';

const LungCapacityTest: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [bestRecord, setBestRecord] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Cargar récord al iniciar
  useEffect(() => {
    const loadRecord = async () => {
      if (user?.id) {
        const record = await getBestLungCapacityRecord(user.id);
        setBestRecord(record);
      }
    };
    loadRecord();
  }, [user?.id]);

  const handlePressIn = () => {
    startRef.current = Date.now();
    setRunning(true);
    setResult(null);
  };

  const handlePressOut = async () => {
    if (!startRef.current) return;
    const delta = Date.now() - startRef.current;
    const seconds = Math.round(delta / 100) / 10; // décimas
    setResult(seconds);
    setRunning(false);
    startRef.current = null;

    // Guardar récord si es mejor
    if (user?.id && seconds > bestRecord) {
      await setBestLungCapacityRecord(user.id, seconds);
      setBestRecord(seconds);
    }
  };

  const colors = {
    bgCard: isDark ? '#1A2E33' : '#FFFFFF',
    border: isDark ? '#374151' : '#E5E7EB',
    text: isDark ? '#F0F9FF' : '#132E32',
    textSecondary: isDark ? '#D1D5DB' : '#6B7280',
  };

  return (
    <ThemeView style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <ThemeText style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: colors.text }}>
            Test de Capacidad
          </ThemeText>

          {/* Tarjeta de instrucciones */}
          <View style={{ 
            width: '100%', 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            borderRadius: 12, 
            backgroundColor: colors.bgCard, 
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <ThemeText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center', color: colors.text }}>
              Mantén pulsado mientras soplas
            </ThemeText>
            <ThemeText style={{ fontSize: 14, fontStyle: 'italic', textAlign: 'center', color: colors.textSecondary }}>
              Presiona y mantén para iniciar la medición, suelta cuando termines.
            </ThemeText>
          </View>

          {/* Botón principal */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
              width: 224,
              height: 224,
              borderRadius: 112,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: running ? '#EF4444' : '#84FFC6',
              marginBottom: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: running ? 0.3 : 0.15,
              shadowRadius: 12,
              elevation: 6
            }}
          >
            <ThemeText style={{ fontSize: 20, fontWeight: 'bold', color: '#132E32' }}>
              {running ? 'Sopla...' : 'Presiona'}
            </ThemeText>
          </Pressable>

          {/* Resultado actual y récord */}
          {result !== null && (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ 
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: colors.bgCard,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
                width: '100%'
              }}>
                <ThemeText style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 }}>
                  Tiempo de soplo
                </ThemeText>
                <ThemeText style={{ fontSize: 36, fontWeight: 'bold', color: '#FFD015', textAlign: 'center' }}>
                  {result}s
                </ThemeText>
              </View>

              {/* Mostrar si es nuevo récord */}
              {result > bestRecord && result > 0 && (
                <View style={{ 
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#10B981',
                  borderWidth: 1,
                  borderColor: '#059669',
                  marginBottom: 16,
                  width: '100%'
                }}>
                  <ThemeText style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF', textAlign: 'center' }}>
                    🎉 ¡Nuevo Récord!
                  </ThemeText>
                </View>
              )}

              {/* Récord anterior */}
              {bestRecord > 0 && (
                <View style={{ 
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  borderRadius: 12,
                  backgroundColor: colors.bgCard,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: '100%'
                }}>
                  <ThemeText style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 }}>
                    Tu Récord
                  </ThemeText>
                  <ThemeText style={{ fontSize: 32, fontWeight: 'bold', color: '#84FFC6', textAlign: 'center' }}>
                    {bestRecord}s
                  </ThemeText>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemeView>
  );
};

export default LungCapacityTest;