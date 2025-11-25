import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ThemeInput from '../../components/ThemeInput';
import ThemeButton from '../../components/ThemeButton';

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const res = await signIn(email.trim(), password);
    if (res?.error) {
      setError(res.error.message || String(res.error));
      return;
    }
    // Navegar al drawer (index)
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-bg-light dark:bg-bg-dark items-center justify-center px-6">
      <View className="w-full max-w-md">
        <Text className="text-4xl font-poppins-bold text-text-light dark:text-text-dark mb-2">Bienvenido</Text>
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-8">Inicia sesión para acceder a tu biblioteca y prácticas</Text>

        <View className="mb-4">
          <Text className="text-sm font-poppins-semibold text-text-light dark:text-text-dark mb-2">Correo</Text>
          <ThemeInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-poppins-semibold text-text-light dark:text-text-dark mb-2">Contraseña</Text>
          <ThemeInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        {error ? <Text className="text-danger mb-4 font-poppins-semibold">{error}</Text> : null}

        <ThemeButton
          label={isLoading ? "Iniciando..." : "Iniciar sesión"}
          loading={isLoading}
          onPress={handleLogin}
          disabled={isLoading}
          fullWidth
        />

        <Pressable onPress={() => router.push('/auth/signup')} className="items-center mt-4">
            <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              ¿No tienes cuenta? <Text className="text-secondary dark:text-accent font-poppins-semibold">Regístrate</Text>
            </Text>
        </Pressable>
      </View>
    </View>
  );
}
