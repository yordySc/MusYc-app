import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Dimensions } from 'react-native';
import { getBestScore, subscribeBestScore } from '../../utils/bestScore';
import { getBestLungCapacityRecord, subscribeLungCapacityRecord } from '../../utils/lungCapacityRecord';
import { ThemeView, ThemeText, useTheme } from '../../components/Theme';
import { usePracticeStore, PracticeLog } from '../../store/usePracticeStore';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Edit3 } from 'lucide-react-native';

const PracticeDiary: React.FC = () => {
  const { logs, loadLogs, isLogsLoading } = usePracticeStore();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { width } = Dimensions.get('window');
  const isSmall = width <= 360;
  const [bestScore, setBestScoreState] = useState<number | null>(null);
  const [bestLungCapacity, setBestLungCapacity] = useState<number>(0);

  useEffect(() => {
    if (user?.id) loadLogs(user.id);
    (async () => {
      const b = await getBestScore(user?.id);
      setBestScoreState(b);
      const l = await getBestLungCapacityRecord(user?.id);
      setBestLungCapacity(l);
    })();

    const unsub = subscribeBestScore((uid, s) => {
      if (!user?.id && !uid) setBestScoreState(s);
      if (user?.id && uid === user.id) setBestScoreState(s);
    });

    const unsubLung = subscribeLungCapacityRecord((record) => {
      setBestLungCapacity(record);
    });

    return () => {
      unsub();
      unsubLung();
    };
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const sessionDays = React.useMemo(() => new Set(logs.map(l => l.practice_date)).size, [logs]);

  const breathingSessions = React.useMemo(() => logs.filter(l => /respir/i.test(l.description || '')), [logs]);

  const breathingTotalMinutes = React.useMemo(() => breathingSessions.reduce((s, l) => s + (l.duration_minutes || 0), 0), [breathingSessions]);

  const lastBreathing = React.useMemo(() => {
    if (breathingSessions.length === 0) return null;
    return [...breathingSessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [breathingSessions]);

  const breathingStabilityAvg = React.useMemo(() => {
    const withStability = breathingSessions.filter(l => l.breathing_avg_stability != null);
    if (withStability.length === 0) return 0;
    return Math.round(withStability.reduce((s, l) => s + (l.breathing_avg_stability || 0), 0) / withStability.length);
  }, [breathingSessions]);

  const READING_GOAL = 20;
  const readingPercent = Math.round(Math.min(100, ((bestScore ?? 0) / READING_GOAL) * 100));

  const cardBgColor = isDark ? '#1A2E33' : '#FFFFFF';
  const cardBorderColor = isDark ? '#374151' : '#E5E7EB';
  const textSecondaryColor = isDark ? '#D1D5DB' : '#6B7280';

  // Estadísticas de notas acertadas (totales y top 3)
  const notesStats = React.useMemo(() => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const l of logs) {
      const desc = l.description || '';
      const m = desc.match(/notas_acertadas:([^|]*)/);
      if (m && m[1]) {
        const list = m[1].split(',').map(s => s.trim()).filter(Boolean);
        for (const n of list) {
          counts.set(n, (counts.get(n) || 0) + 1);
          total += 1;
        }
      }
    }
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { total, top };
  }, [logs]);

    // Agrupar logs por día y crear resumen consolidado (incluye notas acertadas)
    const dailySummaries = React.useMemo(() => {
      const grouped = new Map<string, PracticeLog[]>();
      logs.forEach(log => {
        const date = log.practice_date;
        if (!grouped.has(date)) grouped.set(date, []);
        grouped.get(date)!.push(log);
      });

      const sortedDates = Array.from(grouped.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      return sortedDates.slice(0, 7).map((date) => {
        const dayLogs = grouped.get(date)!;
        const totalMinutes = dayLogs.reduce((sum, l) => sum + l.duration_minutes, 0);
        const breathingLogs = dayLogs.filter(l => /respir/i.test(l.description || ''));
        const otherLogs = dayLogs.filter(l => !/respir/i.test(l.description || ''));

        const avgBreathingStability = breathingLogs.length > 0
          ? Math.round(breathingLogs.reduce((sum, l) => sum + (l.breathing_avg_stability || 0), 0) / breathingLogs.length)
          : 0;

        // Extraer notas acertadas desde la descripción si existen: formato "notas_acertadas:Do,Mi,La"
        const correctMap = new Map<string, number>();
        let totalCorrect = 0;
        for (const l of dayLogs) {
          const desc = l.description || '';
          const m = desc.match(/notas_acertadas:([^|]*)/);
          if (m && m[1]) {
            const list = m[1].split(',').map(s => s.trim()).filter(Boolean);
            for (const note of list) {
              correctMap.set(note, (correctMap.get(note) || 0) + 1);
              totalCorrect += 1;
            }
          }
        }

        const correctNotesList = Array.from(correctMap.entries()).sort((a, b) => b[1] - a[1]);

        return { date, dayLogs, totalMinutes, breathingLogs, otherLogs, avgBreathingStability, totalCorrect, correctNotesList };
      });
    }, [logs]);

  return (
    <ThemeView className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        className="px-5 pt-6"
      >
        <View className="mb-6">
          <ThemeText className="font-poppins-bold tracking-tight" style={{ fontSize: isSmall ? 24 : 32 }}>Mi Diario</ThemeText>
          <ThemeText className="font-poppins-medium mt-1" style={{ fontSize: isSmall ? 12 : 14, color: isDark ? '#D1D5DB' : '#374151' }}>
            Registro de práctica musical — sigue tu progreso
          </ThemeText>

          <View style={{ marginTop: 16, backgroundColor: cardBgColor, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: cardBorderColor }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Récord de Lectura</ThemeText>
              <ThemeText className="font-poppins-bold mt-2" style={{ fontSize: isSmall ? 28 : 36 }}>{bestScore ?? 0}</ThemeText>
            </View>
            <View style={{ flex: 1, minWidth: 120, maxWidth: 220 }}>
              <View style={{ height: 12, backgroundColor: isDark ? '#223233' : '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ height: '100%', backgroundColor: isDark ? '#0F766E' : '#84FFC6', width: `${readingPercent}%` }} />
              </View>
              <ThemeText className="text-xs text-right mt-2" style={{ color: textSecondaryColor }}>{readingPercent}% del objetivo ({READING_GOAL})</ThemeText>
            </View>
          </View>

          <View style={{ marginTop: 12, backgroundColor: cardBgColor, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: cardBorderColor }}>
            <View>
              <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Récord Capacidad</ThemeText>
              <ThemeText className="text-4xl font-poppins-bold mt-2">{bestLungCapacity}s</ThemeText>
            </View>
            <View style={{ flex: 1, minWidth: 120, alignItems: 'flex-end' }}>
              <View style={{ height: 12, backgroundColor: isDark ? '#223233' : '#E5E7EB', borderRadius: 999, overflow: 'hidden', width: '100%', marginBottom: 8 }}>
                <View style={{ height: '100%', backgroundColor: '#EF4444', width: `${Math.min(100, (bestLungCapacity / 30) * 100)}%` }} />
              </View>
              <ThemeText className="text-xs text-right" style={{ color: textSecondaryColor }}>Objetivo: 30s</ThemeText>
            </View>
          </View>

          {/* Tarjeta: Notas acertadas */}
          <View style={{ marginTop: 12, backgroundColor: cardBgColor, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: cardBorderColor }}>
            <View>
              <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Notas Adivinadas</ThemeText>
              <ThemeText className="font-poppins-bold mt-2" style={{ fontSize: isSmall ? 28 : 36 }}>{notesStats.total}</ThemeText>
            </View>
            <View style={{ flex: 1, minWidth: 120, alignItems: 'flex-end' }}>
              {notesStats.top.length > 0 ? (
                <View style={{ alignItems: 'flex-end' }}>
                  {notesStats.top.map(([note, count]) => (
                    <ThemeText key={note} className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>{note} ×{count}</ThemeText>
                  ))}
                </View>
              ) : (
                <ThemeText className="text-xs text-right" style={{ color: textSecondaryColor }}>Aún no hay aciertos</ThemeText>
              )}
            </View>
          </View>

          <View style={{ marginTop: 12, backgroundColor: cardBgColor, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: cardBorderColor }}>
            <View>
              <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Tiempo Total Respiración</ThemeText>
              <ThemeText className="text-4xl font-poppins-bold mt-2">{breathingTotalMinutes}'</ThemeText>
            </View>
            <View style={{ flex: 1, minWidth: 120 }}>
              <View style={{ height: 12, backgroundColor: isDark ? '#223233' : '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                <View style={{ height: '100%', backgroundColor: '#FFD015', width: `${Math.min(100, breathingStabilityAvg)}%` }} />
              </View>
              <ThemeText className="text-xs text-right" style={{ color: textSecondaryColor }}>Estabilidad: {breathingStabilityAvg}%</ThemeText>
              <ThemeText className="text-xs text-right mt-1" style={{ color: textSecondaryColor }}>{breathingSessions.length} sesiones</ThemeText>
            </View>
          </View>

          {lastBreathing && (
            <View style={{ marginTop: 16, backgroundColor: cardBgColor, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: cardBorderColor }}>
              <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Última Respiración</ThemeText>
              <View className="flex-row items-center justify-between mt-3 mb-3">
                <View>
                  <ThemeText className="text-lg font-poppins-bold">{lastBreathing.duration_minutes} min</ThemeText>
                  <ThemeText className="text-sm mt-1" style={{ color: textSecondaryColor }}>
                    {lastBreathing.breathing_cycles ? `${lastBreathing.breathing_cycles} ciclos` : 'Sin datos'}
                  </ThemeText>
                </View>
                <ThemeText className="text-sm" style={{ color: textSecondaryColor }}>{formatDate(lastBreathing.practice_date)}</ThemeText>
              </View>
              {lastBreathing.breathing_avg_stability !== undefined && (
                <View style={{ backgroundColor: isDark ? '#0D1B1F' : '#F5F7FA', borderRadius: 12, padding: 12, marginTop: 8, flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <ThemeText className="text-xs font-poppins-medium" style={{ color: textSecondaryColor }}>Estabilidad</ThemeText>
                    <ThemeText className="text-lg font-poppins-bold text-accent mt-1">{lastBreathing.breathing_avg_stability}%</ThemeText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <ThemeText className="text-xs font-poppins-medium" style={{ color: textSecondaryColor }}>Mejor momento</ThemeText>
                    <ThemeText className="text-lg font-poppins-bold text-secondary mt-1">{lastBreathing.breathing_peak_stability}%</ThemeText>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <ThemeText className="text-xs font-poppins-medium" style={{ color: textSecondaryColor }}>Potencia</ThemeText>
                    <ThemeText className="text-lg font-poppins-bold text-danger mt-1">{Math.round(lastBreathing.breathing_max_rms || 0)} dB</ThemeText>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View className="mb-8">
          <View style={{ backgroundColor: cardBgColor, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: cardBorderColor }}>
            <View style={{ flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 8 }}>
              <ThemeText className="text-2xl font-poppins-semibold">Progreso del Mes</ThemeText>
              <ThemeText className="text-lg font-poppins-medium text-accent">{logs.length} sesiones</ThemeText>
            </View>
            <View style={{ marginTop: 12, flexDirection: isSmall ? 'column' : 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, minHeight: isSmall ? 120 : 140, backgroundColor: isDark ? '#122626' : '#F0F4F8', borderRadius: 12, padding: 12, justifyContent: 'center' }}>
                {isLogsLoading ? (
                  <ActivityIndicator size="large" color="#84FFC6" />
                ) : logs.length === 0 ? (
                  <ThemeText className="font-poppins-medium text-center px-4" style={{ color: textSecondaryColor, fontSize: isSmall ? 13 : 16 }}>
                    Aún no tienes sesiones este mes. ¡Empieza a practicar!
                  </ThemeText>
                ) : (
                  <View style={{ alignItems: isSmall ? 'flex-start' : 'center' }}>
                    <ThemeText className="font-poppins-bold" style={{ fontSize: isSmall ? 28 : 40 }}>
                      {logs.reduce((acc, log) => acc + log.duration_minutes, 0)}′
                    </ThemeText>
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                      <View style={{ alignItems: 'center' }}>
                        <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Días</ThemeText>
                        <ThemeText className="text-xl font-poppins-bold">{sessionDays}</ThemeText>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Lectura (récord)</ThemeText>
                        <ThemeText className="text-xl font-poppins-bold">{bestScore ?? 0}</ThemeText>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              <View style={{ width: isSmall ? '100%' : 96, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#122E30' : '#FFFFFF', borderRadius: 12, padding: 8 }}>
                <Calendar size={isSmall ? 22 : 28} color={isDark ? '#F0F9FF' : '#132E32'} />
              </View>
            </View>
          </View>
        </View>

        {/* Sesiones Recientes */}
        <View>
          <ThemeText className="text-2xl font-poppins-bold mb-5">Sesiones Recientes</ThemeText>

          {logs.length === 0 && !isLogsLoading ? (
            <View className="items-center py-16">
              <View style={{ width: 128, height: 128, backgroundColor: isDark ? 'rgba(132, 255, 198, 0.1)' : 'rgba(132, 255, 198, 0.2)', borderRadius: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(132, 255, 198, 0.4)' }}>
                <Edit3 size={48} color="#84FFC6" />
              </View>
              <ThemeText className="font-poppins-medium text-lg text-center" style={{ color: textSecondaryColor }}>
                Tu primera sesión será inolvidable
              </ThemeText>
            </View>
          ) : (
            <View className="space-y-4">
              {dailySummaries.map((summary) => (
                <View
                  key={summary.date}
                  style={{
                    backgroundColor: cardBgColor,
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: cardBorderColor,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 12,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <ThemeText className="text-3xl font-poppins-bold">{summary.totalMinutes} min</ThemeText>
                      <ThemeText className="text-sm font-poppins-medium text-secondary mt-1">
                        {summary.dayLogs.length} sesión{summary.dayLogs.length > 1 ? 'es' : ''} este día
                      </ThemeText>
                    </View>
                    <View style={{ backgroundColor: isDark ? 'rgba(255, 208, 21, 0.15)' : 'rgba(255, 208, 21, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start' }}>
                      <ThemeText className="font-poppins-semibold text-xs" style={{ color: isDark ? '#FDB022' : '#F59E0B', textAlign: 'center' }}>
                        {formatDate(summary.date)}
                      </ThemeText>
                    </View>
                  </View>

                  {summary.breathingLogs.length > 0 && (
                    <View style={{ backgroundColor: isDark ? 'rgba(132, 255, 198, 0.08)' : 'rgba(132, 255, 198, 0.1)', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-around' }}>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <ThemeText className="text-xs font-poppins-medium" style={{ color: textSecondaryColor }}>Respiración</ThemeText>
                        <ThemeText className="text-base font-poppins-bold text-accent mt-1">{summary.breathingLogs.length}x</ThemeText>
                      </View>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <ThemeText className="text-xs font-poppins-medium" style={{ color: textSecondaryColor }}>Estabilidad</ThemeText>
                        <ThemeText className="text-base font-poppins-bold text-secondary mt-1">{summary.avgBreathingStability}%</ThemeText>
                      </View>
                    </View>
                  )}

                  {summary.otherLogs.length > 0 && (
                    <View style={{ marginBottom: summary.breathingLogs.length > 0 ? 12 : 0 }}>
                      {summary.otherLogs.slice(0, 3).map((log, idx) => (
                        <View key={log.id} style={{ marginBottom: idx < summary.otherLogs.length - 1 ? 8 : 0 }}>
                          <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>
                            {log.description || 'Práctica general'} • {log.duration_minutes} min
                          </ThemeText>
                        </View>
                      ))}
                      {summary.otherLogs.length > 3 && (
                        <ThemeText className="text-xs font-poppins-medium text-accent">
                          +{summary.otherLogs.length - 3} más
                        </ThemeText>
                      )}
                    </View>
                  )}

                    {summary.totalCorrect > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        <ThemeText className="text-sm font-poppins-medium" style={{ color: textSecondaryColor }}>Notas acertadas: {summary.totalCorrect}</ThemeText>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                          {summary.correctNotesList.map(([note, count]) => (
                            <View key={note} style={{ backgroundColor: isDark ? 'rgba(132,255,198,0.08)' : 'rgba(132,255,198,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 }}>
                              <ThemeText className="text-sm font-poppins-medium" style={{ color: isDark ? '#84FFC6' : '#065F46' }}>{note} {count > 1 ? `×${count}` : ''}</ThemeText>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                  <View className="flex-row items-center gap-2 mt-4">
                    <Clock size={16} color="#84FFC6" />
                    <ThemeText className="text-xs font-poppins" style={{ color: textSecondaryColor }}>
                      Última actividad: {new Date(summary.dayLogs[0].created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
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