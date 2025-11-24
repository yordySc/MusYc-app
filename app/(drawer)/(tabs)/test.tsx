import React, { useState, useRef } from 'react';
import { ThemeView, ThemeText } from '../../../components/Theme';
import { View, Pressable } from 'react-native';
import IconItem from '../../../components/IconItem';

const LungCapacityTest: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);

  const handlePressIn = () => {
    startRef.current = Date.now();
    setRunning(true);
    setResult(null);
  };

  const handlePressOut = () => {
    if (!startRef.current) return;
    const delta = Date.now() - startRef.current;
    const seconds = Math.round(delta / 100) / 10; // décimas
    setResult(seconds);
    setRunning(false);
    startRef.current = null;
  };

  return (
    <ThemeView className="p-6 items-center justify-start bg-background-light dark:bg-background-dark flex-1">
      <ThemeText className="text-3xl font-poppins-bold mb-6 text-[#132E32] dark:text-white">Mini Test de Capacidad</ThemeText>

      <View className="w-36 h-36 rounded-full bg-[#84FFC6] items-center justify-center shadow-2xl mb-6">
        <IconItem type="Ionicons" name="mic-sharp" size={56} color="#07201f" />
      </View>

      <View className="w-full max-w-md p-5 rounded-xl bg-white/95 dark:bg-card-dark shadow-md mb-6">
        <ThemeText className="text-lg font-poppins-semibold mb-3 text-center text-[#132E32] dark:text-white">Mantén pulsado mientras soplas</ThemeText>
        <ThemeText className="text-base italic text-center text-gray-500 dark:text-gray-400">Presiona y mantén para iniciar la medición, suelta cuando termines.</ThemeText>
      </View>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`w-56 h-56 rounded-full items-center justify-center ${running ? 'bg-red-400' : 'bg-[#84FFC6]'} mb-6`}
      >
        <ThemeText className="text-2xl font-poppins-bold text-[#07201f]">{running ? 'Sopla...' : 'Presiona'}</ThemeText>
      </Pressable>

      {result !== null && (
        <View className="items-center">
          <ThemeText className="text-3xl font-poppins-bold text-[#132E32] dark:text-white">{result}s</ThemeText>
          <ThemeText className="text-sm text-gray-600 mt-2">Tiempo de soplo (estimado)</ThemeText>
        </View>
      )}
    </ThemeView>
  );
};

export default LungCapacityTest;