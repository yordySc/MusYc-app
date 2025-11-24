// app/_layout.tsx


import { Slot, useRouter } from "expo-router";
import "../global.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../components/Theme";
import { useAuth } from "../context/AuthContext";
import React, { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </AuthProvider>
  );
}

function Splash() {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#132E32' }}>MusYc</Text>
      </Animated.View>
    </View>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.replace('/auth');
      else router.replace('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <Splash />;
  return <Slot />;
}