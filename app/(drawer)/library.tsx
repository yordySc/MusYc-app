import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemeView, ThemeText } from '../../components/Theme';
import ThemeCard from '../../components/ThemeCard';
import IconItem from '../../components/IconItem';

interface RepertoireItem { 
    title: string; 
    type: string; 
    instrument: string;
    level: 'Principiante' | 'Intermedio' | 'Avanzado';
}

const repertoire: RepertoireItem[] = [
    { title: "Marcha Héroes del Pacífico", type: "Marcha", instrument: "Trompeta (Si♭)", level: 'Intermedio' },
    { title: "El Cóndor Pasa", type: "Folklórico", instrument: "Quena", level: 'Principiante' },
    { title: "Cochabamba Querida", type: "Cueca", instrument: "Clarinete", level: 'Intermedio' },
    { title: "El Tinku", type: "Tinku", instrument: "Zampoña", level: 'Avanzado' },
    { title: "Selección de Caporal", type: "Danza", instrument: "Trombón", level: 'Avanzado' },
];

const LibraryScreen: React.FC = () => {
    
  const getLevelColor = (level: RepertoireItem['level']) => {
      switch (level) {
          case 'Avanzado': return 'text-red-400';
          case 'Intermedio': return 'text-secondary dark:text-secondary';
          default: return 'text-primary dark:text-primary';
      }
  };

  return (
    <ThemeView className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} className="py-2">
        <ThemeText className="text-3xl font-bold mb-6 text-primary dark:text-secondary">
          Biblioteca Musical
        </ThemeText>

        <ThemeText className="text-xl font-semibold mb-4">
          Repertorio Adaptado para Viento
        </ThemeText>

        {repertoire.map((item, index) => (
          <ThemeCard 
            key={index} 
            className="mb-3"
            borderStyle="left-accent"
          >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                    <ThemeText className="text-lg font-bold">{item.title}</ThemeText>
                    <ThemeText className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                        {item.type} | {item.instrument}
                    </ThemeText>
                </View>
                <ThemeText className={`text-xs font-bold ${getLevelColor(item.level)}`}>
                    {item.level.toUpperCase()}
                </ThemeText>
            </View>

            <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                <ThemeText className="text-xs text-accent font-semibold">
                    Ver Partitura / Transponer
                </ThemeText>
                <IconItem type="Ionicons" name="arrow-down-circle-outline" size={24} color="#5bbf96" />
            </View>
          </ThemeCard>
        ))}
      </ScrollView>
    </ThemeView>
  );
};

export default LibraryScreen;