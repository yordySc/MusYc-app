import React from 'react';
import { ThemeView, ThemeText } from '../../../components/Theme';
import { View } from 'react-native';

const BreathingExercises: React.FC = () => {
  return (
    <ThemeView className="p-4 items-center justify-center bg-background-dark">
      <ThemeText className="text-3xl font-bold mb-8 text-primary dark:text-primary">
        Ejercicios de Respiracion
      </ThemeText>
      <View className="w-48 h-48 rounded-full bg-primary opacity-70 items-center justify-center shadow-xl mb-12">
        <ThemeText className="text-xl font-bold text-background-dark">
            Inhala 4s
        </ThemeText>
      </View>

      <ThemeText className="text-2xl font-semibold mb-4 text-center">
        Rutina Diaria: Principiante
      </ThemeText>
      <View className="w-full max-w-sm p-4 rounded-xl bg-card-dark shadow-md">
        <ThemeText className="text-base italic text-center">
          Inhala 4s — Mantén 6s — Exhala 8s
        </ThemeText>
      </View>
    </ThemeView>
  );
};

export default BreathingExercises;