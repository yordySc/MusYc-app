// app/auth/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';

const AuthStackLayout: React.FC = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* El archivo index.tsx se carga automáticamente al ir a /auth */}
        </Stack>
    );
};

export default AuthStackLayout;