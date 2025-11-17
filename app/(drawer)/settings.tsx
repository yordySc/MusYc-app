import React from 'react';
import { ThemeView, ThemeText, ThemeSwitch } from '../../components/Theme';
import { View } from 'react-native';

const Settings: React.FC = () => {
  return (
    <ThemeView className="p-4">
      <ThemeText className="text-3xl font-bold mb-6 text-primary dark:text-secondary">
        Ajustes de la App
      </ThemeText>

      <View className="mb-8">
        <ThemeSwitch />
      </View>

      <View className="p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-md mb-3">
        <ThemeText className="text-lg font-semibold">
          Instrumento Principal: Trompeta (Si♭)
        </ThemeText>
      </View>
    </ThemeView>
  );
};

export default Settings;