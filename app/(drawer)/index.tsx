import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemeView, ThemeText } from '../../components/Theme'; 

const PracticeDiary: React.FC = () => {
  return (
    <ThemeView className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} className="py-2">
        <ThemeText className="text-3xl font-bold mb-6 text-primary dark:text-secondary"> MusYc </ThemeText>
        <View className="mb-8">
            <ThemeText className="text-xl font-semibold mb-4 border-b border-border-light dark:border-border-dark pb-2"> Progreso capaz?</ThemeText>
            <View className="h-40 rounded-xl bg-card-light dark:bg-card-dark items-center justify-center shadow-lg border border-border-light dark:border-border-dark">
                <ThemeText className="text-base text-center italic text-gray-500 dark:text-gray-400"> [Grafico de minutos practicados aqui] </ThemeText>
            </View>
        </View>
        <View>
            <ThemeText className="text-xl font-semibold mb-4 border-b border-border-light dark:border-border-dark pb-2"> Logros Desbloqueados</ThemeText>
            <View className="p-4 rounded-xl bg-card-light dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark">
                <ThemeText className="text-base mb-2">pa pensar</ThemeText>
                <ThemeText className="text-base">Texto aun por verse porque no se que mas pueda ir aqui xd</ThemeText>
            </View>
        </View>
      </ScrollView>
    </ThemeView>
  );
};

export default PracticeDiary;