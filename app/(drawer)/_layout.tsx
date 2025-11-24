// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";
import React from "react";
import IconItem from "../../components/IconItem";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#132E32" },
        headerTintColor: "#84FFC6",
        headerTitleStyle: { fontFamily: "Poppins-Bold", fontSize: 20 },

        drawerStyle: { 
          backgroundColor: "#132E32", 
          width: 290,
          borderTopRightRadius: 30,
          borderBottomRightRadius: 30,
        },
        drawerActiveTintColor: "#132E32",
        drawerActiveBackgroundColor: "#84FFC6",
        drawerInactiveTintColor: "#FFD015",
        drawerLabelStyle: { 
          fontFamily: "Poppins-SemiBold", 
          fontSize: 17,
          marginLeft: -15 
        },
      }}
    >
      <Drawer.Screen name="index" options={{ drawerLabel: "Diario", headerTitle: "MusYc", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="book" color={color} size={28} /> }} />
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Respiración", headerTitle: "ENTRENADOR RESPIRATORIO", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="body" color={color} size={28} /> }} />
      <Drawer.Screen name="digitizer" options={{ drawerLabel: "Digitación", headerTitle: "ENTRENADOR DE DIGITACIÓN", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="keypad" color={color} size={28} /> }} />
      <Drawer.Screen name="library" options={{ drawerLabel: "Biblioteca", headerTitle: "BIBLIOTECA MUSICAL", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="musical-notes" color={color} size={28} /> }} />
      <Drawer.Screen name="settings" options={{ drawerLabel: "Ajustes", headerTitle: "AJUSTES", drawerIcon: ({ color }) => <IconItem type="Ionicons" name="settings" color={color} size={28} /> }} />
    </Drawer>
  );
}