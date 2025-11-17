import { Drawer } from "expo-router/drawer";
import React from "react";
import IconItem from "../../components/IconItem";
import { useTheme } from "../../components/Theme";

const DrawerLayout: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerTintColor: "#f4f4f5",
        headerStyle: { backgroundColor: "#5bbf96" },
        drawerActiveTintColor: "#5bbf96",
        drawerInactiveTintColor: isDark ? "#cbd5e1" : "#6b7280",
        drawerStyle: { backgroundColor: isDark ? "#1e293b" : "#f4f4f5" },
        drawerLabelStyle: { fontWeight: "600" },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Bienvenido a MusYc",
          drawerLabel: "Diario",
          drawerIcon: ({ color, size }) => (
            <IconItem
              type="Ionicons"
              name="book-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "ENTRENADOR RESPIRATORIO",
          drawerLabel: "Respiración",
          drawerIcon: ({ color, size }) => (
            <IconItem
              type="Ionicons"
              name="body-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="digitizer"
        options={{
          headerTitle: "ENTRENADOR DE DIGITACIÓN",
          drawerLabel: "Digitación",
          drawerIcon: ({ color, size }) => (
            <IconItem
              type="Ionicons"
              name="keypad-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
            {/* 4. Biblioteca Musical */}
           {" "}
      <Drawer.Screen
        name="library"
        options={{
          headerTitle: "BIBLIOTECA MUSICAL",
          drawerLabel: "Biblioteca",
          drawerIcon: ({ color, size }) => (
            <IconItem
              type="Ionicons"
              name="musical-notes-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
            {/* 5. Ajustes de la App */}
           {" "}
      <Drawer.Screen
        name="settings"
        options={{
          headerTitle: "AJUSTES",
          drawerLabel: "Ajustes",
          drawerIcon: ({ color, size }) => (
            <IconItem
              type="Ionicons"
              name="settings-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
         {" "}
    </Drawer>
  );
};

export default DrawerLayout;
