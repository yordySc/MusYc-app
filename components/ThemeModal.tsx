import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import ThemeCard from './ThemeCard'; 
import { ThemeText } from './Theme';
import ThemeButton from './ThemeButton';

interface ThemeModalProps { 
    isVisible: boolean; 
    onClose: () => void; 
    title: string; 
    animationType?: 'slide' | 'fade'; }
const { height: screenHeight } = Dimensions.get('window');

const ThemeModal: React.FC<PropsWithChildren<ThemeModalProps>> = ({ 
    isVisible, onClose, title, animationType = 'slide', children 
}) => {
    if (!isVisible) return null;
    const enteringAnimation = animationType === 'slide' ? SlideInDown.duration(400) : FadeIn.duration(300);
    const exitingAnimation = animationType === 'slide' ? SlideOutDown.duration(400) : FadeOut.duration(300);

    return (
        <Pressable style={styles.overlay} onPress={onClose}>
            <Animated.View style={styles.container} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <Animated.View style={{ width: '90%', maxHeight: screenHeight * 0.8 }} entering={enteringAnimation} exiting={exitingAnimation}>
                        <ThemeCard className="p-6 space-y-4">
                            <ThemeText className="text-xl font-bold mb-3 text-text-light dark:text-text-dark"> {title} </ThemeText>
                            {children}
                            <ThemeButton label="Entendido" variant="secondary" onPress={onClose} className="mt-4" />
                        </ThemeCard>
                    </Animated.View>
                </Pressable>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        zIndex: 1000, 
    },
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
    },
});

export default ThemeModal;