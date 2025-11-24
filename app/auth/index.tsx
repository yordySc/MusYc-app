import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

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
    <View className="flex-1 bg-white dark:bg-[#07181a] items-center justify-center px-6">
      <View className="w-full max-w-md">
        <Text className="text-4xl font-poppins-bold text-[#132E32] dark:text-white mb-6">Bienvenido</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-300 mb-6">Inicia sesión para acceder a tu biblioteca y prácticas</Text>

        <View className="mb-4">
          <Text className="text-sm font-poppins-semibold text-gray-700 dark:text-gray-200 mb-2">Correo</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-poppins-semibold text-gray-700 dark:text-gray-200 mb-2">Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            secureTextEntry
            className="bg-white/80 dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3"
          />
        </View>

        {error ? <Text className="text-red-500 mb-4">{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          className="bg-[#132E32] px-4 py-3 rounded-xl items-center justify-center mb-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-poppins-bold">Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/auth/signup')} className="items-center mt-2">
            <Text className="text-sm text-gray-600 dark:text-gray-300">¿No tienes cuenta? <Text className="text-[#132E32] dark:text-white">Regístrate</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}
