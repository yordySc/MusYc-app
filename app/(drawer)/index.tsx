  // app/(drawer)/index.tsx  ← TU DIARIO DE PRÁCTICA FINAL
  import React, { useEffect, useState } from 'react';
  import { ScrollView, View, ActivityIndicator } from 'react-native';
  import { getBestScore, subscribeBestScore } from '../../utils/bestScore';
  import { ThemeView, ThemeText } from '../../components/Theme';
  import { usePracticeStore, PracticeLog } from '../../store/usePracticeStore';
  import { useAuth } from '../../context/AuthContext';
  import { Calendar, Clock, Edit3 } from 'lucide-react-native'; // opcional: íconos más bonitos

  const PracticeDiary: React.FC = () => {
    const { logs, loadLogs, isLogsLoading } = usePracticeStore();
    const { user } = useAuth();
    const [bestScore, setBestScoreState] = useState<number | null>(null);

    useEffect(() => {
      if (user?.id) loadLogs(user.id);
      (async () => {
        const b = await getBestScore(user?.id);
        setBestScoreState(b);
      })();

      const unsub = subscribeBestScore((uid, s) => {
        if (!user?.id && !uid) setBestScoreState(s);
        if (user?.id && uid === user.id) setBestScoreState(s);
      });
      return () => unsub();
    }, [user?.id]);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    // Estadísticas derivadas
    const sessionDays = React.useMemo(() => {
      const days = new Set(logs.map(l => l.practice_date));
      return days.size;
    }, [logs]);

    const breathingSessions = React.useMemo(() => logs.filter(l => /respir/i.test(l.description || '')), [logs]);
    const breathingAvg = React.useMemo(() => {
      if (breathingSessions.length === 0) return null;
      const sum = breathingSessions.reduce((s, l) => s + (l.duration_minutes || 0), 0);
      return Math.round((sum / breathingSessions.length) * 10) / 10;
    }, [breathingSessions]);

    const lastBreathing = React.useMemo(() => {
      if (breathingSessions.length === 0) return null;
      const sorted = [...breathingSessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return sorted[0] ?? null;
    }, [breathingSessions]);

    // Configuración del objetivo de lectura (puede hacerse dinámico)
    const READING_GOAL = 20;
    const readingPercent = Math.round(Math.min(100, ((bestScore ?? 0) / READING_GOAL) * 100));

    return (
      <ThemeView className="px-5 pt-6 bg-background-light dark:bg-background-dark flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="pb-12">

          {/* TÍTULO HERO */}
          <View className="mb-6">
            <ThemeText className="text-4xl font-poppins-bold text-[#132E32] dark:text-white tracking-tight">Mi Diario</ThemeText>
            <ThemeText className="text-sm font-poppins-medium text-[#84FFC6] mt-1 opacity-95">Registro de práctica musical — sigue tu progreso</ThemeText>

            {/* Tarjeta grande de Récord (progreso) */}
            <View className="mt-4 bg-white/95 dark:bg-black/40 rounded-2xl p-4 shadow-md flex-row items-center justify-between">
              <View>
                <ThemeText className="text-sm text-gray-500">Récord de Lectura</ThemeText>
                <ThemeText className="text-4xl font-poppins-bold text-[#132E32] dark:text-white">{bestScore ?? 0}</ThemeText>
              </View>

              <View style={{ width: 160 }}>
                <View style={{ height: 12, backgroundColor: '#E6E6E6', borderRadius: 999, overflow: 'hidden' }}>
                  <View style={{ height: '100%', backgroundColor: '#84FFC6', width: `${readingPercent}%` }} />
                </View>
                <ThemeText className="text-xs text-right mt-2 text-gray-500">{readingPercent}% del objetivo ({READING_GOAL})</ThemeText>
              </View>
            </View>
            {/* Última sesión de respiración */}
            {lastBreathing && (
              <View className="mt-4 bg-white/90 dark:bg-card-dark rounded-2xl p-4 shadow-sm">
                <ThemeText className="text-sm text-gray-500">Última respiración</ThemeText>
                <View className="flex-row items-center justify-between mt-2">
                  <ThemeText className="text-lg font-poppins-bold text-[#132E32] dark:text-white">{lastBreathing.duration_minutes} min</ThemeText>
                  <ThemeText className="text-sm text-gray-500">{formatDate(lastBreathing.practice_date)}</ThemeText>
                </View>
              </View>
            )}
          </View>

          {/* CARD DE PROGRESO MENSUAL */}
          <View className="mb-8">
            <View className="bg-white/90 dark:bg-black/40 rounded-3xl p-6 border border-white/10 shadow-md">
              <View className="flex-row items-center justify-between mb-4">
                <ThemeText className="text-2xl font-poppins-semibold text-[#132E32] dark:text-white">Progreso del Mes</ThemeText>
                <ThemeText className="text-lg font-poppins-medium text-[#FFD015]">{logs.length} sesiones</ThemeText>
              </View>

              <View className="h-44 rounded-2xl overflow-hidden flex-row items-center">
                <View className="flex-1 bg-gradient-to-br from-[#84FFC6]/40 to-[#FFD015]/25 items-center justify-center">
                  {isLogsLoading ? (
                    <ActivityIndicator size="large" color="#84FFC6" />
                  ) : logs.length === 0 ? (
                          <ThemeText className="text-[#132E32]/70 dark:text-white/70 font-poppins-medium text-lg text-center px-6">Aún no tienes sesiones este mes. ¡Empieza a practicar!</ThemeText>
                  ) : (
                    <View className="items-center">
                      <ThemeText className="text-[#132E32] dark:text-white font-poppins-bold text-5xl">{logs.reduce((acc, log) => acc + log.duration_minutes, 0)}′</ThemeText>
                      <View className="flex-row gap-4 mt-3">
                        <View className="items-center">
                          <ThemeText className="text-sm font-poppins-medium text-[#132E32] dark:text-white">Días</ThemeText>
                          <ThemeText className="text-xl font-poppins-bold text-[#132E32] dark:text-white">{sessionDays}</ThemeText>
                        </View>
                        <View className="items-center">
                          <ThemeText className="text-sm font-poppins-medium text-[#132E32] dark:text-white">Lectura (récord)</ThemeText>
                          <ThemeText className="text-xl font-poppins-bold text-[#132E32] dark:text-white">{bestScore ?? 0}</ThemeText>
                        </View>
                        <View className="items-center">
                          <ThemeText className="text-sm font-poppins-medium text-[#132E32] dark:text-white">Respiración (avg)</ThemeText>
                          <ThemeText className="text-xl font-poppins-bold text-[#132E32] dark:text-white">{breathingAvg ?? '-'}</ThemeText>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                <View className="w-24 items-center justify-center bg-white/5">
                  <Calendar size={28} color="#132E32" />
                </View>
              </View>
            </View>
          </View>

          {/* LOGS RECIENTES */}
          <View>
            <ThemeText className="text-2xl font-poppins-bold text-[#132E32] dark:text-white mb-5">
              Sesiones Recientes
            </ThemeText>

            {logs.length === 0 && !isLogsLoading ? (
              <View className="items-center py-16">
                <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-6 border-4 border-dashed border-[#84FFC6]/40">
                  <Edit3 size={48} color="#84FFC6" />
                </View>
                <ThemeText className="text-[#132E32]/70 dark:text-white/70 font-poppins-medium text-lg text-center">
                  Tu primera sesión será inolvidable
                </ThemeText>
              </View>
            ) : (
              <View className="space-y-4">
                {logs.slice(0, 6).map((log, index) => (
                  <View
                    key={log.id}
                    className="bg-white/25 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-xl"
                    style={{
                      transform: [{ translateY: index * -5 }],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.15,
                      shadowRadius: 20,
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <ThemeText className="text-3xl font-poppins-bold text-[#132E32] dark:text-white">
                          {log.duration_minutes} min
                        </ThemeText>
                        <ThemeText className="text-lg font-poppins-medium text-[#84FFC6] mt-1">
                          {log.description || "Práctica general"}
                        </ThemeText>
                      </View>
                      <View className="bg-[#FFD015]/20 px-4 py-2 rounded-full">
                        <ThemeText className="text-[#132E32] dark:text-white font-poppins-semibold">
                          {formatDate(log.practice_date)}
                        </ThemeText>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-4 mt-4">
                      <View className="flex-row items-center gap-2">
                        <Clock size={18} color="#84FFC6" />
                        <ThemeText className="text-sm text-[#132E32]/80 dark:text-white/80 font-poppins">
                          {new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </ThemeText>
                      </View>
                      <View className="h-1 w-1 bg-[#84FFC6] rounded-full" />
                      <ThemeText className="text-sm text-[#FFD015] font-poppins-semibold">
                        Sesión #{logs.indexOf(log) + 1}
                      </ThemeText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      </ThemeView>
    );
  };

  export default PracticeDiary;