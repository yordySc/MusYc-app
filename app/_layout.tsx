import { Slot } from "expo-router";
import "../global.css";
import React from 'react';
import { ThemeProvider } from "../components/Theme";

const RootLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
};

export default RootLayout;