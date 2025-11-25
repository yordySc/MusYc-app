import React, { useState, useEffect, useRef } from 'react';
import { ThemeView, ThemeText } from '../../../components/Theme';
import { View, Pressable, Animated, ScrollView, Easing, AccessibilityInfo } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import IconItem from '../../../components/IconItem';
import { Waveform, StabilityMeter } from '../../../components/AudioVisualizers';
import { usePracticeStore } from '../../../store/usePracticeStore';
import { Share } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { audioAnalysisService } from '../../../utils/audioAnalysisService';

interface BreathingPhase {
  label: string;
  duration: number;
  instruction: string;
  color: string;
  description: string;
}

interface SessionStats {
  cycles: number;
  totalStability: number;
  peakStability: number;
  averageStability: number;
  maxRMS: number;
  activeTime: number;
}

const CompleteBreathingTrainer: React.FC = () => {
  const phases: BreathingPhase[] = [
    {
      label: 'Inhala',
      duration: 4,
      instruction: 'INHALA LENTO',
      color: '#84FFC6',
      description: 'Respira profundamente por la nariz',
    },
    {
      label: 'Mantén',
      duration: 5,
      instruction: 'MANTÉN',
      color: '#FFD015',
      description: 'Retén el aire sin tensión',
    },
    {
      label: 'Exhala',
      duration: 7,
      instruction: 'EXHALA UNIFORME',
      color: '#FF6B6B',
      description: 'Exhala lentamente por la boca',
    },
  ];

  // Estados principales
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].duration);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Estados de audio y datos
  const [audioData, setAudioData] = useState<number[]>([]);
  const [stability, setStability] = useState(0);
  const [rms, setRms] = useState(0);
  const [frequency, setFrequency] = useState<number[]>([]);
  // Historial corto para detectar objetivo
  const rmsHistoryRef = useRef<number[]>([]);

  // Estadísticas de sesión
  const [stats, setStats] = useState<SessionStats>({
    cycles: 0,
    totalStability: 0,
    peakStability: 0,
    averageStability: 0,
    maxRMS: 0,
    activeTime: 0,
  });

  // Referencias
  const startRef = useRef<number | null>(null);
  const circleScale = useRef(new Animated.Value(0.6)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
  const statsRef = useRef<SessionStats>({
    cycles: 0,
    totalStability: 0,
    peakStability: 0,
    averageStability: 0,
    maxRMS: 0,
    activeTime: 0,
  });
  const stabilityHistoryRef = useRef<number[]>([]);
  const [targetReached, setTargetReached] = useState(false);
  const targetHoldRef = useRef(0);

  const addLog = usePracticeStore(state => state.addLog);
  const { user } = useAuth();

  // Inicializar servicio de audio
  useEffect(() => {
    const initAudio = async () => {
      const initialized = await audioAnalysisService.initialize();
      if (!initialized) {
        console.warn('Audio service failed to initialize');
      }
    };
    initAudio();

    // Check for reduced motion preference
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => setReduceMotion(enabled));
  }, []);

  // Animar círculo según fase: escala, color y rotación
  useEffect(() => {
    if (!running) {
      // Si reduced motion está activo, simplemente setear valores sin animación
      if (reduceMotion) {
        circleScale.setValue(0.6);
        colorAnim.setValue(0);
        rotateAnim.setValue(0);
        return;
      }

      Animated.parallel([
        Animated.spring(circleScale, { toValue: 0.6, useNativeDriver: true }),
        Animated.timing(colorAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      return;
    }

    const phaseData = phases[phaseIndex];
    const duration = Math.max(300, phaseData.duration * 1000);

    // Targets por fase: Inhala -> grande, Mantén -> medio, Exhala -> pequeño
    const scaleTarget = phaseIndex === 0 ? 1.25 : phaseIndex === 1 ? 1.05 : 0.75;
    const colorTarget = phaseIndex; // 0,1,2 map to phases
    const rotateTarget = 1; // animamos de 0 a 1 y lo interpolamos a grados

    // Si reduced motion está activo, aplicar cambios instantáneos
    if (reduceMotion) {
      circleScale.setValue(scaleTarget);
      colorAnim.setValue(colorTarget);
      rotateAnim.setValue(0);
      return;
    }

    // Animaciones combinadas: escala (native), rotación (native) y color (JS-driven)
    const anims = [
      Animated.timing(circleScale, {
        toValue: scaleTarget,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: rotateTarget,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(colorAnim, {
        toValue: colorTarget,
        duration: Math.min(400, duration),
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ];

    // Ejecutar animación; al completarse, reiniciamos rotateAnim para permitir animar de nuevo en la siguiente fase
    Animated.parallel(anims).start(() => {
      rotateAnim.setValue(0);
    });
  }, [phaseIndex, running, reduceMotion]);

  // Timer principal
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          return phases[(phaseIndex + 1) % phases.length].duration;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, phaseIndex]);

  // Cambiar fase
  useEffect(() => {
    if (!running || timeLeft > 0) return;

    const nextIndex = (phaseIndex + 1) % phases.length;
    setPhaseIndex(nextIndex);
    setTimeLeft(phases[nextIndex].duration);

    if (nextIndex === 0) {
      statsRef.current.cycles++;
      audioAnalysisService.triggerHapticFeedback('medium');
    }
  }, [timeLeft, running]);

  // Monitorear audio
  useEffect(() => {
    if (!running) return;

    const handleAudioUpdate = (data: any) => {
      setAudioData(prev => [...prev.slice(-100), data.rms]);
      setStability(data.stability);
      setRms(data.rms);
      setFrequency(data.frequency);

      // Actualizar estadísticas
      stabilityHistoryRef.current.push(data.stability);
      rmsHistoryRef.current.push(data.rms);
      // Mantener sólo las últimas 60 muestras para memoria pequeña
      if (stabilityHistoryRef.current.length > 300) stabilityHistoryRef.current.shift();
      if (rmsHistoryRef.current.length > 300) rmsHistoryRef.current.shift();
      statsRef.current.totalStability += data.stability;
      statsRef.current.peakStability = Math.max(statsRef.current.peakStability, data.stability);
      statsRef.current.maxRMS = Math.max(statsRef.current.maxRMS, data.rms);
      statsRef.current.activeTime++;

      // Chequeo del objetivo: promedio de ventana móvil
      const TARGET_MIN = 65;
      const TARGET_MAX = 75;
      const WINDOW = 5; // muestras
      const HOLD_REQUIRED = 3; // cantidad de ticks consecutivos (aprox segundos)

      const lastStabs = stabilityHistoryRef.current.slice(-WINDOW);
      const lastRms = rmsHistoryRef.current.slice(-WINDOW);
      const avgStab = lastStabs.length ? lastStabs.reduce((a, b) => a + b, 0) / lastStabs.length : 0;
      const avgR = lastRms.length ? lastRms.reduce((a, b) => a + b, 0) / lastRms.length : 0;

      if (avgStab >= TARGET_MIN && avgStab <= TARGET_MAX && avgR >= TARGET_MIN && avgR <= TARGET_MAX) {
        targetHoldRef.current++;
        if (targetHoldRef.current >= HOLD_REQUIRED && !targetReached) {
          setTargetReached(true);
          audioAnalysisService.triggerHapticFeedback('medium');
        }
      } else {
        targetHoldRef.current = 0;
        if (targetReached) setTargetReached(false);
      }
    };

    audioAnalysisService.startMonitoring(handleAudioUpdate);

    return () => {
      audioAnalysisService.stopMonitoring();
    };
  }, [running]);

  const currentPhaseData = phases[phaseIndex];
  const progress = ((phases[phaseIndex].duration - timeLeft) / phases[phaseIndex].duration) * 100;

  const interpolatedColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [phases[0].color, phases[1].color, phases[2].color],
  });

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '6deg'],
  });

  // Indicador para mostrar el objetivo de estabilidad/RMS
  const targetIndicator = targetReached
    ? { label: 'Objetivo alcanzado', color: '#84FFC6' }
    : { label: 'Objetivo 65–75', color: '#FFD015' };

  const toggleSession = async () => {
    if (running) {
      // Detener sesión
      setRunning(false);
      await audioAnalysisService.stopMonitoring();

      // Calcular estadísticas finales
      const totalStabilityCount = stabilityHistoryRef.current.length;
      const averageStability =
        totalStabilityCount > 0
          ? Math.round(statsRef.current.totalStability / totalStabilityCount)
          : 0;

      const finalStats: SessionStats = {
        ...statsRef.current,
        averageStability,
      };

      setStats(finalStats);
      setSessionComplete(true);

      if (user?.id && finalStats.cycles > 0) {
        // Guardar con datos de respiración para que el diario muestre métricas
        await addLog(user.id, finalStats.cycles, 'Respiración Completa', {
          cycles: finalStats.cycles,
          avgStability: finalStats.averageStability,
          peakStability: finalStats.peakStability,
          maxRMS: Math.round(finalStats.maxRMS || 0),
        });
      }

      // Reset
      setPhaseIndex(0);
      setTimeLeft(phases[0].duration);
      statsRef.current = {
        cycles: 0,
        totalStability: 0,
        peakStability: 0,
        averageStability: 0,
        maxRMS: 0,
        activeTime: 0,
      };
      stabilityHistoryRef.current = [];
      rmsHistoryRef.current = [];
      targetHoldRef.current = 0;
      setTargetReached(false);
      setAudioData([]);
      setStability(0);
    } else {
      // Iniciar sesión
      setRunning(true);
      setPhaseIndex(0);
      setTimeLeft(phases[0].duration);
      setSessionComplete(false);
      startRef.current = Date.now();
      statsRef.current = {
        cycles: 0,
        totalStability: 0,
        peakStability: 0,
        averageStability: 0,
        maxRMS: 0,
        activeTime: 0,
      };
      stabilityHistoryRef.current = [];
      setAudioData([]);
      audioAnalysisService.triggerHapticFeedback('light');
    }
  };

  if (sessionComplete) {
    return (
      <ThemeView className="p-6 bg-background-light dark:bg-background-dark flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <ThemeText className="text-3xl font-poppins-bold mb-6 text-[#132E32] dark:text-white text-center">
            ¡Sesión Completada!
          </ThemeText>

          {/* Tarjetas de resultados */}
          <View className="gap-4 mb-8">
            {/* Ciclos */}
            <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <ThemeText className="text-sm text-gray-400 text-center mb-2">Ciclos Respiratorios</ThemeText>
              <ThemeText className="text-5xl font-poppins-bold text-[#84FFC6] text-center">{stats.cycles}</ThemeText>
              <ThemeText className="text-xs text-gray-500 text-center mt-2">
                {Math.round(stats.activeTime / 60)} min de actividad
              </ThemeText>
            </View>

            {/* Estabilidad promedio */}
            <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <ThemeText className="text-sm text-gray-400 text-center mb-2">Estabilidad Promedio</ThemeText>
              <ThemeText className="text-5xl font-poppins-bold text-[#FFD015] text-center">
                {stats.averageStability}%
              </ThemeText>
              <View className="mt-3">
                <StabilityMeter stability={stats.averageStability} width={250} />
              </View>
            </View>

            {/* Pico de estabilidad */}
            <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <ThemeText className="text-sm text-gray-400 text-center mb-2">Mejor Momento</ThemeText>
              <ThemeText className="text-5xl font-poppins-bold text-[#84FFC6] text-center">
                {stats.peakStability}%
              </ThemeText>
            </View>

            {/* Amplitud máxima */}
            <View className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <ThemeText className="text-sm text-gray-400 text-center mb-2">Potencia Máxima</ThemeText>
              <ThemeText className="text-5xl font-poppins-bold text-[#FF6B6B] text-center">
                {Math.round(stats.maxRMS)}
              </ThemeText>
              <ThemeText className="text-xs text-gray-500 text-center mt-2">dB</ThemeText>
            </View>
          </View>

          {/* Botones de acción */}
          <View className="gap-3 mb-4">
            <Pressable
              onPress={() => {
                setSessionComplete(false);
                setPhaseIndex(0);
                setTimeLeft(phases[0].duration);
              }}
              className="px-8 py-4 rounded-full bg-[#84FFC6] items-center"
            >
              <ThemeText className="text-lg font-poppins-bold text-[#132E32]">Nueva Sesión</ThemeText>
            </Pressable>

            <Pressable
              onPress={async () => {
                try {
                  const shareText = `Sesión de respiración\nCiclos: ${stats.cycles}\nEstabilidad: ${stats.averageStability}%\nPico: ${stats.peakStability}%\nPotencia: ${Math.round(stats.maxRMS)} dB`;
                  await Share.share({ message: shareText });
                } catch (err) {
                  console.warn('Error compartiendo resultado', err);
                }
              }}
              className="px-8 py-4 rounded-full bg-white/10 items-center border border-white/20"
            >
              <ThemeText className="text-lg font-poppins-bold text-[#132E32] dark:text-white">
                Compartir Resultado
              </ThemeText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemeView>
    );
  }

  return (
    <ThemeView className="p-6 bg-background-light dark:bg-background-dark flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="mb-4">
          <ThemeText className="text-2xl font-poppins-bold text-[#132E32] dark:text-white">
            Entrenador Respiratorio
          </ThemeText>
          <ThemeText className="text-xs text-gray-400 mt-1">Sesión activa</ThemeText>
        </View>

        {/* Círculo animado principal */}
        <View className="items-center mb-8 py-4">
            <Animated.View
              style={{
                width: 220,
                height: 220,
                transform: [{ scale: circleScale }, { rotate: rotateDeg }],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Svg width={220} height={220} viewBox="0 0 220 220" style={{ position: 'absolute', top: 0, left: 0 }}>
                <AnimatedPolygon
                  points="202.1,71.1 202.1,148.9 148.3,202.4 71.7,202.4 17.9,148.9 17.9,71.1 71.7,17.6 148.3,17.6"
                  fill={interpolatedColor}
                  opacity={0.95}
                />
              </Svg>

              <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-[#07201f]">
                {currentPhaseData.label}
              </ThemeText>
              <ThemeText className="text-5xl font-poppins-bold text-[#132E32] dark:text-[#07201f] mt-2">
                {timeLeft}
              </ThemeText>
            </Animated.View>
        </View>

        {/* Información de fase */}
        <View className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
          <ThemeText className="text-lg font-poppins-semibold text-[#132E32] dark:text-white text-center">
            {currentPhaseData.instruction}
          </ThemeText>
          <ThemeText className="text-sm text-gray-400 text-center mt-2">
            {currentPhaseData.description}
          </ThemeText>
        </View>

        {/* Barra de progreso de fase */}
        <View className="mb-6">
          <View className="h-3 bg-white/20 rounded-full overflow-hidden">
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: currentPhaseData.color,
              }}
            />
          </View>
          <ThemeText className="text-xs text-gray-400 text-right mt-1">{Math.round(progress)}%</ThemeText>
        </View>

        {/* Gráfico de forma de onda */}
        <View className="mb-6">
          <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">
            Amplitud Detectada
          </ThemeText>
          <Waveform data={audioData} height={60} color={currentPhaseData.color} />
        </View>

        {/* Medidor de estabilidad */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white">
              Estabilidad
            </ThemeText>
            <View className="flex-row items-center gap-2">
              <ThemeText className="text-sm font-poppins-bold text-[#84FFC6]">{Math.round(stability)}%</ThemeText>
              <View style={{ backgroundColor: targetIndicator.color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                <ThemeText className="text-xs font-poppins-bold text-[#132E32]">{targetIndicator.label}</ThemeText>
              </View>
            </View>
          </View>
          <StabilityMeter stability={stability} width={300} />
        </View>

        {/* Información en tiempo real */}
        <View className="grid grid-cols-2 gap-3 mb-6">
          <View className="bg-white/10 rounded-lg p-3 border border-white/20">
            <ThemeText className="text-xs text-gray-400">RMS (dB)</ThemeText>
            <ThemeText className="text-2xl font-poppins-bold text-[#FFD015] mt-1">
              {Math.round(rms)}
            </ThemeText>
          </View>

          <View className="bg-white/10 rounded-lg p-3 border border-white/20">
            <ThemeText className="text-xs text-gray-400">Ciclos</ThemeText>
            <ThemeText className="text-2xl font-poppins-bold text-[#84FFC6] mt-1">
              {statsRef.current.cycles}
            </ThemeText>
          </View>
        </View>

        {/* Visualizador de bandas de frecuencia */}
        <View className="mb-6">
          <ThemeText className="text-sm font-poppins-semibold text-[#132E32] dark:text-white mb-2">
            Espectro de Frecuencia
          </ThemeText>
          <View className="flex-row items-end justify-center gap-1 h-16 bg-white/10 rounded-lg p-3">
            {frequency.map((freq, idx) => (
              <View
                key={idx}
                style={{
                  width: 6,
                  height: `${Math.max(10, (freq / 100) * 100)}%`,
                  backgroundColor: freq > 70 ? '#FF6B6B' : '#84FFC6',
                  borderRadius: 2,
                }}
              />
            ))}
          </View>
        </View>

        {/* Botón principal de control */}
        <Pressable
          onPress={toggleSession}
          className={`w-40 h-40 rounded-full items-center justify-center mx-auto mb-6 ${
            running ? 'bg-red-500' : 'bg-[#84FFC6]'
          }`}
        >
          <IconItem
            type="Ionicons"
            name={running ? 'stop' : 'play'}
            size={64}
            color={running ? 'white' : '#132E32'}
          />
          <ThemeText className="text-xs font-poppins-bold text-[#132E32] dark:text-[#07201f] mt-2">
            {running ? 'Detener' : 'Comenzar'}
          </ThemeText>
        </Pressable>

        {/* Instrucciones */}
        <View className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30 mb-6">
          <View className="flex-row gap-2">
            <IconItem type="Ionicons" name="information-circle" size={20} color="#84FFC6" />
            <View className="flex-1">
              <ThemeText className="text-xs text-blue-200 font-poppins-semibold mb-1">
                Consejo de Respiración
              </ThemeText>
              <ThemeText className="text-xs text-blue-100 leading-5">
                Sigue el círculo con tu respiración. Mantén un soplido estable para maximizar tu estabilidad.
              </ThemeText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemeView>
  );
};

export default CompleteBreathingTrainer;
