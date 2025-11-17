import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { ThemeView, ThemeText } from '../../components/Theme';
import ThemeButton from '../../components/ThemeButton';
import ThemeCard from '../../components/ThemeCard';
import ThemeModal from '../../components/ThemeModal'; 

const ALL_NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const TIME_LIMIT = 2.0; 
const getOptions = (correctNote: string) => { 
    const options = new Set<string>();
    options.add(correctNote);

    while (options.size < 4) {
        const randomIndex = Math.floor(Math.random() * ALL_NOTES.length);
        options.add(ALL_NOTES[randomIndex]);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
};

const getNoteSymbol = (note: string) => { 
    const symbols: { [key: string]: string } = {
        'Do': '●', 'Re': '○', 'Mi': '♩',
        'Fa': '♪', 'Sol': '♫', 'La': '♬',
        'Si': '𝅘𝅥𝅮'
    };
    return symbols[note] || '?';
};
const DigitizerScreen: React.FC = () => {
    const [correctNote, setCorrectNote] = useState('Do');
    const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT);
    const [score, setScore] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [feedback, setFeedback] = useState<'default' | 'correct' | 'error'>('default');
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const generateNewNote = useCallback(() => {
        const randomIndex = Math.floor(Math.random() * ALL_NOTES.length);
        setCorrectNote(ALL_NOTES[randomIndex]);
        setTimeRemaining(TIME_LIMIT);
        setFeedback('default');
    }, []);

    const startGame = () => {
        setScore(0);
        setIsRunning(true);
        generateNewNote();
    };
    
    const handleAnswer = (selectedNote: string) => {
        if (!isRunning) return;

        if (selectedNote === correctNote) {
            setScore(s => s + 1);
            setFeedback('correct');
            setTimeout(generateNewNote, 500); 
        } else {
            setFeedback('error');
            setIsRunning(false); 
        }
    };
        useEffect(() => {
        let timerId: NodeJS.Timeout | undefined;

        if (isRunning) {
            timerId = setInterval(() => {
                setTimeRemaining(t => {
                    const newTime = Math.max(0, t - 0.1); 
                    if (newTime <= 0) {
                        setFeedback('error');
                        setIsRunning(false);
                        return 0;
                    }
                    return newTime;
                });
            }, 100); 
        }

        return () => { 
            if (timerId) clearInterval(timerId); 
        };
    }, [isRunning]);
    const currentOptions = useMemo(() => getOptions(correctNote), [correctNote]);
    const timerColor = timeRemaining < 0.5 && isRunning ? 'text-red-500' : 'text-secondary dark:text-accent';
    const noteColor = feedback === 'correct' ? 'text-primary' : (feedback === 'error' ? 'text-red-500' : 'text-text-light dark:text-text-dark');


    return (
        <ThemeView className="p-4 items-center">
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} className="w-full">
                
                <ThemeText className="text-3xl font-bold my-4 text-primary dark:text-secondary">
                    Entrenador de Lectura Rápida
                </ThemeText>
                
                <ThemeText className={`text-xl font-medium ${timerColor} mb-2`}>
                    Tiempo: <ThemeText className="font-bold text-3xl">{timeRemaining.toFixed(1)}s</ThemeText>
                </ThemeText>

                <ThemeCard className="w-full max-w-md items-center py-6 space-y-4">
                    <ThemeText className="text-lg font-semibold text-accent"> ¿QUÉ NOTA ESTÁ EN EL PENTAGRAMA? </ThemeText>

                    <View className="w-full h-32 items-center justify-center border-y-4 border-text-light dark:border-text-dark my-2">
                        <ThemeText className={`text-[100px] font-extrabold ${noteColor}`}>
                            {getNoteSymbol(correctNote)} 
                        </ThemeText>
                    </View>
                    
                    <View className="h-6">
                        {feedback === 'correct' && <ThemeText className="text-primary font-bold text-lg">¡CORRECTO! +1</ThemeText>}
                        {feedback === 'error' && <ThemeText className="text-red-500 font-bold text-lg">TIEMPO Juego Detenido</ThemeText>}
                    </View>
                </ThemeCard>
                
                <View className="w-full max-w-md mt-6 flex-row flex-wrap justify-between">
                    {currentOptions.map((note) => (
                        <ThemeButton key={note} label={note} variant={isRunning ? 'secondary' : 'accent'} onPress={() => handleAnswer(note)} fullWidth={false} className="w-[48%] mb-3" disabled={!isRunning || feedback === 'error'} />
                    ))}
                </View>
                
                <View className="w-full max-w-md mt-8 space-y-3">
                    <ThemeButton 
                        label={isRunning ? 'DETENER JUEGO' : 'COMENZAR PRUEBA'}
                        variant={isRunning ? 'accent' : 'primary'} 
                        onPress={isRunning ? () => setIsRunning(false) : startGame} 
                    />
                    <ThemeButton label="¿Cómo jugar?" variant="text" onPress={() => setIsModalVisible(true)} />
                                        
                    <ThemeText className="text-sm text-gray-500 dark:text-gray-400 text-center">Puntaje Total: {score}</ThemeText>
                </View>
            </ScrollView>

            <ThemeModal 
                isVisible={isModalVisible} 
                onClose={() => setIsModalVisible(false)} 
                title="Instrucciones: Lectura Rápida"
                animationType="slide"
            >
                <ThemeText className="text-base text-justify">
                    El objetivo es identificar la nota musical en el pentagrama antes de que el tiempo se agote.
                </ThemeText>
                <ThemeText className="text-sm mt-2">
                    1. Presiona "Comenzar Prueba".
                </ThemeText>
                <ThemeText className="text-sm">
                    2. Selecciona la opción correcta en menos de 2.0 segundos.
                </ThemeText>
                <ThemeText className="text-sm">
                    3. Un error o tiempo agotado detiene la prueba.
                </ThemeText>
            </ThemeModal>

        </ThemeView>
    );
};

export default DigitizerScreen;