// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import React from "react";
import IconItem from "../../components/IconItem";
import { Pressable } from 'react-native';

export default function DrawerLayout() {
  return (
    <Drawer
      // usar función para screenOptions y acceder a navigation
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#132E32" },
        headerTintColor: "#84FFC6",
        headerTitleStyle: { fontFamily: "Poppins-Bold", fontSize: 20 },

        // icono izquierdo: hamburguesa para abrir/cerrar drawer
        headerLeft: () => (
          <Pressable onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 12 }}>
            <IconItem type="Ionicons" name="menu" color="#84FFC6" size={26} />
          </Pressable>
        ),

        // icono derecho: perfil que navega a la pantalla `profile`
        headerRight: () => (
          <Pressable onPress={() => navigation.navigate('profile')} style={{ marginRight: 12 }}>
            <IconItem type="Ionicons" name="person-circle" color="#84FFC6" size={28} />
          </Pressable>
        ),

        drawerStyle: { 
          backgroundColor: "#132E32", 
          width: 290,
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
        },
        drawerActiveTintColor: "#132E32",
        drawerActiveBackgroundColor: "#84FFC6",
        drawerInactiveTintColor: "#FFD015",
        drawerItemStyle: {
          paddingVertical: 8,
          paddingHorizontal: 12,
        },
        drawerLabelStyle: { 
          fontFamily: "Poppins-SemiBold", 
          fontSize: 17,
          marginLeft: 8
        },
      })}
    >
      <Drawer.Screen name="index" options={{ drawerLabel: "Diario", headerTitle: "MusYc", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="book" color={color} size={28} /> }} />
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Respiración", headerTitle: "ENTRENADOR RESPIRATORIO", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="body" color={color} size={28} /> }} />
      <Drawer.Screen name="digitizer" options={{ drawerLabel: "Lectura Rápida", headerTitle: "ENTRENADOR DE LECTURA RÁPIDA", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="keypad" color={color} size={28} /> }} />
      <Drawer.Screen name="ear-training" options={{ drawerLabel: "Entrenar Oído", headerTitle: "ENTRENAR OÍDO", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="musical-note" color={color} size={28} /> }} />
      <Drawer.Screen name="library" options={{ drawerLabel: "Biblioteca", headerTitle: "BIBLIOTECA MUSICAL", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="musical-notes" color={color} size={28} /> }} />
      <Drawer.Screen name="profile" options={{ drawerLabel: "Perfil", headerTitle: "PERFIL", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="person" color={color} size={28} /> }} />
      <Drawer.Screen name="settings" options={{ drawerLabel: "Ajustes", headerTitle: "AJUSTES", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="settings" color={color} size={28} /> }} />
    </Drawer>
  );
}