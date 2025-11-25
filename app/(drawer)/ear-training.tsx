import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeView, ThemeText, useTheme } from '../../components/Theme';
import { useAuth } from '../../context/AuthContext';
import { usePracticeStore } from '../../store/usePracticeStore';
import { Audio } from 'expo-av';
import { Music, Play, RotateCcw, Volume2, CheckCircle, XCircle } from 'lucide-react-native';

type Note = {
  name: string;
  frequency: number;
  soundFile: any;
};

export default function EarTraining() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isSmall = width <= 360;

  const notes: Note[] = [
    { name: 'Do', frequency: 261.63, soundFile: require('../../assets/sounds/do.mp3') },
    { name: 'Re', frequency: 293.66, soundFile: require('../../assets/sounds/re.mp3') },
    { name: 'Mi', frequency: 329.63, soundFile: require('../../assets/sounds/mi.mp3') },
    { name: 'Fa', frequency: 349.23, soundFile: require('../../assets/sounds/fa.mp3') },
    { name: 'Sol', frequency: 392.0, soundFile: require('../../assets/sounds/sol.mp3') },
    { name: 'La', frequency: 440.0, soundFile: require('../../assets/sounds/la.mp3') },
    { name: 'Si', frequency: 493.88, soundFile: require('../../assets/sounds/si.mp3') },
  ];

  const [mode, setMode] = useState<'listen' | 'guess'>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [randomNote, setRandomNote] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [correctNotes, setCorrectNotes] = useState<string[]>([]);

  const soundRef = useRef<Audio.Sound | null>(null);
  const preloadedRef = useRef<Map<string, Audio.Sound>>(new Map());

  const { user } = useAuth();
  const { addLog } = usePracticeStore();

  const bg = isDark ? '#0A1718' : '#F8FBFC';
  const card = isDark ? '#0F1F21' : '#FFFFFF';
  const border = isDark ? '#1E3A3D' : '#E2E8F0';
  const muted = isDark ? '#94A3A8' : '#64748B';
  const success = '#10B981';
  const danger = '#EF4444';

  useEffect(() => {
    let mounted = true;
    const preloadAll = async () => {
      try {
        for (const n of notes) {
          if (!preloadedRef.current.has(n.name)) {
            const { sound } = await Audio.Sound.createAsync(n.soundFile, { shouldPlay: false });
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
            });
            preloadedRef.current.set(n.name, sound);
          }
        }
        if (mounted) setSoundsLoaded(true);
      } catch (e) {}
    };
    preloadAll();
    return () => {
      mounted = false;
      preloadedRef.current.forEach(s => s.unloadAsync().catch(() => {}));
      preloadedRef.current.clear();
    };
  }, []);

  const playNote = async (note: Note) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setFeedback(null);
    const sound = preloadedRef.current.get(note.name);
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
    setTimeout(() => setIsPlaying(false), 800);
  };

  const handlePlayGuess = async () => {
    if (isPlaying || !soundsLoaded) return;
    if (!randomNote) {
      const r = notes[Math.floor(Math.random() * notes.length)];
      setRandomNote(r);
      setPlayCount(1);
      await playNote(r);
      return;
    }
    if (playCount < 2) {
      setPlayCount(c => c + 1);
      await playNote(randomNote);
    }
  };

  const handleGuess = (note: Note) => {
    if (!randomNote || isPlaying) return;
    if (note.name === randomNote.name) {
      setFeedback('correct');
      setScore(s => s + 10);
      setCorrectNotes(prev => [...prev, note.name]);
      setTimeout(() => {
        const r = notes[Math.floor(Math.random() * notes.length)];
        setRandomNote(r);
        setPlayCount(1);
        setFeedback(null);
        playNote(r);
      }, 1000);
    } else {
      setFeedback('wrong');
    }
  };

  const resetGame = () => {
    setScore(0);
    setRandomNote(null);
    setPlayCount(0);
    setFeedback(null);
    setCorrectNotes([]);
  };

  return (
    <ThemeView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 56, height: 56, backgroundColor: '#0F766E', borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
              <Music size={32} color="#84FFC6" />
            </View>
            <View>
              <ThemeText className="font-poppins-bold" style={{ fontSize: 28, color: isDark ? '#E6F0EF' : '#0D1B1F' }}>
                Entrenar Oído
              </ThemeText>
              <ThemeText style={{ fontSize: 14, color: muted, marginTop: 4 }}>
                Reconocimiento de notas musicales
              </ThemeText>
            </View>
          </View>
        </View>

        {/* Mode Tabs */}
        <View style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', backgroundColor: card, borderRadius: 16, padding: 6, borderWidth: 1.5, borderColor: border }}>
            {['Escuchar', 'Adivinar'].map((m, i) => (
              <Pressable
                key={m}
                onPress={() => {
                  setMode(i === 0 ? 'listen' : 'guess');
                  resetGame();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: mode === (i === 0 ? 'listen' : 'guess') ? '#0F766E' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <ThemeText style={{ color: mode === (i === 0 ? 'listen' : 'guess') ? '#FFFFFF' : (isDark ? '#D1D5DB' : '#374151'), fontWeight: '600', fontSize: 16 }}>
                  {m}
                </ThemeText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Listen Mode */}
        {mode === 'listen' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <View style={{ backgroundColor: isDark ? 'rgba(132, 255, 198, 0.12)' : 'rgba(132, 255, 198, 0.18)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#84FFC6', marginBottom: 24 }}>
              <ThemeText style={{ color: '#84FFC6', fontSize: 15, lineHeight: 22 }}>
                Toca cualquier nota para escucharla. Repite cuantas veces quieras para memorizar su sonido.
              </ThemeText>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: isSmall ? 12 : 16 }}>
              {notes.map((n) => (
                <Pressable
                  key={n.name}
                  onPress={() => {
                    setCurrentNote(n);
                    playNote(n);
                  }}
                  style={{
                    width: isSmall ? '30%' : '30%',
                    aspectRatio: 1,
                    backgroundColor: currentNote?.name === n.name ? '#0F766E' : card,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2.5,
                    borderColor: currentNote?.name === n.name ? '#84FFC6' : border,
                    shadowColor: currentNote?.name === n.name ? '#84FFC6' : 'transparent',
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: currentNote?.name === n.name ? 8 : 2,
                  }}
                >
                  <ThemeText style={{ fontSize: isSmall ? 26 : 32, fontWeight: '800', color: currentNote?.name === n.name ? '#84FFC6' : (isDark ? '#E6F0EF' : '#0D1B1F') }}>
                    {n.name}
                  </ThemeText>
                  <ThemeText style={{ fontSize: 10, marginTop: 6, color: muted }}>
                    {Math.round(n.frequency)} Hz
                  </ThemeText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Guess Mode */}
        {mode === 'guess' && (
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            {/* Play Button */}
            <Pressable
              onPress={handlePlayGuess}
              disabled={isPlaying || !soundsLoaded || (playCount >= 2 && !!randomNote)}
              style={{
                backgroundColor: '#0F766E',
                paddingVertical: 18,
                borderRadius: 20,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                opacity: isPlaying || !soundsLoaded || (playCount >= 2 && !!randomNote) ? 0.6 : 1,
                shadowColor: '#0F766E',
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {isPlaying ? (
                <ActivityIndicator color="#FFFFFF" size={24} />
              ) : !soundsLoaded ? (
                <ActivityIndicator color="#FFFFFF" size={24} />
              ) : (
                <>
                  <Volume2 size={26} color="#FFFFFF" fill="#FFFFFF" />
                  <ThemeText style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                    Reproducir nota {randomNote ? `(${playCount}/2)` : ''}
                  </ThemeText>
                </>
              )}
            </Pressable>

            {/* Remaining Plays */}
            {randomNote && playCount >= 1 && (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <ThemeText style={{ color: muted, fontSize: 14 }}>
                  Te quedan {2 - playCount} reproducción{2 - playCount !== 1 ? 'es' : ''}
                </ThemeText>
              </View>
            )}

            {/* Feedback */}
            {feedback && (
              <View style={{
                backgroundColor: feedback === 'correct' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                borderWidth: 1.5,
                borderColor: feedback === 'correct' ? success : danger,
              }}>
                {feedback === 'correct' ? <CheckCircle size={28} color={success} /> : <XCircle size={28} color={danger} />}
                <ThemeText style={{ fontSize: 17, fontWeight: '600', color: feedback === 'correct' ? success : danger }}>
                  {feedback === 'correct' ? '¡Correcto! +10 puntos' : `Incorrecto — era ${randomNote?.name}`}
                </ThemeText>
              </View>
            )}

            {/* Score */}
            <View style={{ backgroundColor: card, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1.5, borderColor: border }}>
              <ThemeText style={{ color: muted, fontSize: 15 }}>Puntuación</ThemeText>
              <ThemeText style={{ fontSize: 48, fontWeight: '800', color: '#84FFC6', marginTop: 8 }}>{score}</ThemeText>
            </View>

            {/* Answer Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: isSmall ? 12 : 16, marginBottom: 24 }}>
              {notes.map((n) => (
                <Pressable
                  key={n.name}
                  onPress={() => handleGuess(n)}
                  disabled={!randomNote || isPlaying}
                  style={{
                    width: isSmall ? '30%' : '30%',
                    aspectRatio: 1,
                    backgroundColor: card,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2.5,
                    borderColor: border,
                    opacity: !randomNote || isPlaying ? 0.5 : 1,
                  }}
                >
                  <ThemeText style={{ fontSize: isSmall ? 28 : 34, fontWeight: '800', color: isDark ? '#E6F0EF' : '#0D1B1F' }}>
                    {n.name}
                  </ThemeText>
                </Pressable>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 14 }}>
              <Pressable
                onPress={async () => {
                  if (!user?.id) return Alert.alert('Inicia sesión', 'Necesitas estar logueado para guardar tu progreso.');
                  try {
                    const notesPart = correctNotes.length > 0 ? ` | notas_acertadas:${correctNotes.join(',')}` : '';
                    await addLog(user.id, 1, `Entrenar Oído — Adivinar — Puntuación: ${score}${notesPart}`);
                    setCorrectNotes([]);
                    Alert.alert('¡Guardado!', 'Tu puntuación se guardó en el diario');
                  } catch (e) {
                    Alert.alert('Error', 'No se pudo guardar');
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#0F766E',
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: 'center',
                  shadowColor: '#0F766E',
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <ThemeText style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Guardar</ThemeText>
              </Pressable>

              <Pressable
                onPress={resetGame}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  backgroundColor: card,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <RotateCcw size={22} color={isDark ? '#D1D5DB' : '#374151'} />
                <ThemeText style={{ color: isDark ? '#D1D5DB' : '#374151', fontWeight: '600' }}>Nuevo</ThemeText>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemeView>
  );
}