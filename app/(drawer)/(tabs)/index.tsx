import React, { useState, useEffect, useRef } from 'react';
import { ThemeView, ThemeText, useTheme } from '../../../components/Theme';
import { View, Pressable } from 'react-native';
import { usePracticeStore } from '../../../store/usePracticeStore';
import { useAuth } from '../../../context/AuthContext';

const BreathingExercises: React.FC = () => {
  const phases = [
    { label: 'Inhala', duration: 4 },
    { label: 'Mantén', duration: 6 },
    { label: 'Exhala', duration: 8 },
  ];

  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const startRef = useRef<number | null>(null);
  const addLog = usePracticeStore(state => state.addLog);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const instrBg = isDark ? '#122626' : '#FFFFFF';
  const instrText = isDark ? '#D1D5DB' : '#132E32';

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (running) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      const next = (phaseIndex + 1) % phases.length;
      setPhaseIndex(next);
      setTimeLeft(phases[next].duration);
    }
  }, [timeLeft, running]);

  const toggle = () => {
    if (running) {
      // stop and save session
      setRunning(false);
      const now = Date.now();
      const start = startRef.current ?? now;
      const deltaMs = now - start;
      const minutes = Math.round((deltaMs / 60000) * 10) / 10;
      setPhaseIndex(0);
      setTimeLeft(phases[0].duration);
      startRef.current = null;
      if (user?.id && minutes > 0) {
        addLog(user.id, minutes, 'Respiración');
      }
    } else {
      // start
      setRunning(true);
      setPhaseIndex(0);
      setTimeLeft(phases[0].duration);
      startRef.current = Date.now();
    }
  };

  return (
    <ThemeView className="p-6 items-center justify-start bg-background-light dark:bg-background-dark flex-1">
      <ThemeText className="text-3xl font-poppins-bold mb-6 text-[#132E32] dark:text-white">Ejercicios de Respiración</ThemeText>

      <View className="w-56 h-56 rounded-full bg-gradient-to-br from-[#84FFC6] to-[#68d99f] items-center justify-center shadow-2xl mb-8">
        <ThemeText className="text-2xl font-poppins-bold text-white">{phases[phaseIndex].label}</ThemeText>
        <ThemeText className="text-xl mt-2 text-white">{timeLeft}s</ThemeText>
      </View>

      <ThemeText className="text-xl font-poppins-semibold mb-4 text-center text-[#132E32] dark:text-white">Rutina diaria — Principiante</ThemeText>
      <View style={{ width: '100%', maxWidth: 560, padding: 16, borderRadius: 12, backgroundColor: instrBg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 16 }}>
        <ThemeText style={{ color: instrText, textAlign: 'center', fontStyle: 'italic' }}>Inhala 4s — Mantén 6s — Exhala 8s</ThemeText>
      </View>

      <Pressable onPress={toggle} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, backgroundColor: running ? '#EF4444' : '#84FFC6' }}>
        <ThemeText style={{ color: running ? '#FFFFFF' : '#132E32', fontSize: 18, fontFamily: 'Poppins-Bold' }}>{running ? 'Detener' : 'Comenzar'}</ThemeText>
      </Pressable>
    </ThemeView>
  );
};

export default BreathingExercises;