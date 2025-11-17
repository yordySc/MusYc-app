import React from 'react';
import { ThemeView, ThemeText } from '../../../components/Theme';
import { View } from 'react-native';
import IconItem from '../../../components/IconItem';

const LungCapacityTest: React.FC = () => {
  return (
    <ThemeView className="p-4 items-center justify-center">
      <ThemeText className="text-3xl font-bold mb-8 text-primary dark:text-accent"> Mini Test de Capacidad </ThemeText>

      <View className="w-32 h-32 rounded-full bg-secondary items-center justify-center shadow-lg mb-12">
        <IconItem type="Ionicons" name="mic-sharp" size={60} color="#fff" />
      </View>

      <View className="w-full max-w-sm p-4 rounded-xl bg-card-light dark:bg-card-dark shadow-md">
        <ThemeText className="text-xl font-semibold mb-4 text-center"> Presiona para iniciar la medición. </ThemeText>
        <ThemeText className="text-base italic text-center text-gray-500 dark:text-gray-400"> Sopla de manera uniforme y fuerte en el micrófono del móvil. </ThemeText>
      </View>
    </ThemeView>
  );
};

export default LungCapacityTest;