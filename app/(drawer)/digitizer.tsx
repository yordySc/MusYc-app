// app/(drawer)/digitizer.tsx  ← VERSIÓN FINAL CORREGIDA Y PERFECTA
import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Modal, Image, ScrollView } from 'react-native';
import { getBestScore, setBestScore } from '../../utils/bestScore';
import { ThemeView, ThemeText, useTheme } from '../../components/Theme';
import { Trophy, Play, Pause, HelpCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const ALL_NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;
type Note = typeof ALL_NOTES[number];

const NOTE_IMAGES: Record<Note, any> = {
  Do: require('../../assets/notes/do.png'),
  Re: require('../../assets/notes/re.png'),
  Mi: require('../../assets/notes/mi.png'),
  Fa: require('../../assets/notes/fa.png'),
  Sol: require('../../assets/notes/sol.png'),
  La: require('../../assets/notes/la.png'),
  Si: require('../../assets/notes/si.png'),
};

export default function DigitizerScreen() {
  const [note, setNote] = useState<Note>('Sol');
  const [timeLeft, setTimeLeft] = useState(4.0);
  const [score, setScore] = useState(0);
  const [gameOn, setGameOn] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [options, setOptions] = useState<Note[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const newNote = useCallback(() => {
    const random = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
    setNote(random);
    setTimeLeft(4.0);
    setFeedback('none');

    const opts = [random];
    while (opts.length < 4) {
      const r = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
      if (!opts.includes(r)) opts.push(r);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  const start = () => {
    setScore(0);
    setGameOn(true);
    newNote();
  };

  // ← AQUÍ ESTABA EL ERROR, AHORA ESTÁ CORREGIDO
  const answer = (selected: Note) => {
    if (!gameOn) return;

    if (selected === note) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(newNote, 600);
    } else {
      setFeedback('wrong');
      setGameOn(false);
    }
  };

  useEffect(() => {
    if (!gameOn) return;
    if (timeLeft <= 0) {
      setFeedback('wrong');
      setGameOn(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100);
    return () => clearTimeout(timer);
  }, [gameOn, timeLeft]);

  const { user } = useAuth();
  const { isDark } = useTheme();

  // Guarda el mejor puntaje cuando el juego termina (por usuario si hay sesión)
  useEffect(() => {
    if (gameOn) return; // sólo cuando se detiene
    (async () => {
      try {
        const best = await getBestScore(user?.id);
        if (score > best) {
          await setBestScore(score, user?.id);
        }
      } catch (err) {
        console.warn('Failed saving best score', err);
      }
    })();
  }, [gameOn, user?.id]);

  return (
    <ThemeView className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-5 pt-10 pb-8">

          {/* TÍTULO */}
          <View className="items-center mb-6">
            <ThemeText className="text-3xl font-poppins-bold">
              Lectura Rápida
            </ThemeText>
            <ThemeText className="text-lg text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Identificá la nota en 4 segundos
            </ThemeText>
          </View>

          {/* PUNTAJE EN CABECERA */}
          <View className="items-center mb-6">
            <View className="flex-row items-center gap-3 bg-primary px-5 py-2 rounded-full">
              <Trophy size={24} color="#FFD015" />
              <ThemeText className="text-2xl font-poppins-bold text-white">{score}</ThemeText>
            </View>
          </View>

          {/* PENTAGRAMA */}
          <View className="bg-bg-card-light dark:bg-bg-card-dark rounded-2xl p-8 mb-8 shadow-lg border border-border-light dark:border-border-dark">
            <Image
              source={NOTE_IMAGES[note]}
              style={{ width: '100%', height: 240 }}
              resizeMode="contain"
            />
          </View>

          {/* RELOJ GRANDE */}
          <View className="items-center mb-6">
            <View className="w-36 h-36 rounded-full bg-bg-card-light dark:bg-bg-card-dark items-center justify-center shadow-md border border-border-light dark:border-border-dark">
              <ThemeText className="text-4xl font-poppins-bold" style={{ color: isDark ? '#000000' : undefined }}>{timeLeft.toFixed(1)}</ThemeText>
              <ThemeText className="text-xs text-text-secondary-light dark:text-text-secondary-dark" style={{ color: isDark ? '#000000' : undefined }}>seg</ThemeText>
            </View>
          </View>

          {/* FEEDBACK */}
          {feedback !== 'none' && (
            <View className="items-center mb-6">
              <ThemeText className={`text-2xl font-poppins-bold ${feedback === 'correct' ? 'text-success' : 'text-danger'}`}>
                {feedback === 'correct' ? '¡Correcto!' : `Era ${note}`}
              </ThemeText>
            </View>
          )}

          {/* BOTONES 2×2 */}
          <View className="gap-4 mb-10">
            <View className="flex-row gap-4">
              {[0, 1].map(i => (
                <Pressable
                  key={i}
                  onPress={() => answer(options[i])}
                  disabled={!gameOn}
                  className="flex-1 bg-bg-card-light dark:bg-bg-card-dark rounded-2xl py-5 items-center border-2 border-border-light dark:border-border-dark active:bg-border-light dark:active:bg-bg-card-dark"
                >
                  <ThemeText className="text-2xl font-poppins-semibold" style={{ color: isDark ? '#000000' : undefined }}>
                    {options[i]}
                  </ThemeText>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-4">
              {[2, 3].map(i => (
                <Pressable
                  key={i}
                  onPress={() => answer(options[i])}
                  disabled={!gameOn}
                  className="flex-1 bg-bg-card-light dark:bg-bg-card-dark rounded-2xl py-5 items-center border-2 border-border-light dark:border-border-dark active:bg-border-light dark:active:bg-bg-card-dark"
                >
                  <ThemeText className="text-2xl font-poppins-semibold" style={{ color: isDark ? '#000000' : undefined }}>
                    {options[i]}
                  </ThemeText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* BOTONES */}
          <View className="items-center">
            <View className="flex-row gap-6">
              <Pressable
                onPress={gameOn ? () => setGameOn(false) : start}
                className="bg-secondary px-12 py-5 rounded-full flex-row items-center gap-3 shadow-lg"
              >
                {gameOn ? <Pause size={30} color="#132E32" /> : <Play size={30} color="#132E32" />}
                <ThemeText className="text-xl font-poppins-bold text-primary">
                  {gameOn ? 'Pausar' : 'Comenzar'}
                </ThemeText>
              </Pressable>

              <Pressable onPress={() => setShowHelp(true)} className="bg-primary p-5 rounded-full">
                <HelpCircle size={30} color="#84FFC6" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={showHelp} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-8">
          <View className="bg-bg-card-light dark:bg-bg-card-dark rounded-3xl p-10 w-full max-w-sm border border-border-light dark:border-border-dark">
            <ThemeText className="text-2xl font-poppins-bold text-center mb-6">Cómo jugar</ThemeText>
            <ThemeText className="text-center text-text-light dark:text-text-dark leading-6">
              Aparecerá una nota en el pentagrama.{'\n'}
              Tocá su nombre correcto antes de que se acabe el tiempo.
            </ThemeText>
            <Pressable onPress={() => setShowHelp(false)} className="bg-secondary mt-8 px-12 py-5 rounded-full">
              <ThemeText className="text-xl font-poppins-bold text-primary">¡Listo!</ThemeText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemeView>
  );
}