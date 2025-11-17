import React from 'react';
import { Tabs } from 'expo-router';
import IconItem from '../../../components/IconItem';
import { useTheme } from '../../../components/Theme';

const BreathingTabsLayout: React.FC = () => {
    const { isDark } = useTheme();

    return (
        <Tabs screenOptions={{
            headerShown: false, 
            tabBarActiveTintColor: "#059669", 
            tabBarInactiveTintColor: "#6b7280", 
            tabBarStyle: {
              backgroundColor: isDark ? '#1e293b' : '#ffffff', 
              borderTopColor: isDark ? '#334155' : '#e5e5e5', 
            },
            tabBarLabelStyle: { fontWeight: '600' },
        }}>
            <Tabs.Screen name='index' options={{ title: "Ejercicios", tabBarIcon: ({ color, size }) => ( <IconItem type="Ionicons" name="timer-outline" color={color} size={size} /> ), }} />
            <Tabs.Screen name='test' options={{ title: "Test Pulmonar", tabBarIcon: ({ color, size }) => ( <IconItem type="Ionicons" name="mic-outline" color={color} size={size} /> ), }} />
        </Tabs>
    );
};

export default BreathingTabsLayout;