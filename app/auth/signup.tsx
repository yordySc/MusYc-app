import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setIsLoading(false);
    if (error) {
      setError(error.message || String(error));
      return;
    }
    Alert.alert('Registro enviado', 'Revisa tu correo para confirmar la cuenta.');
    router.replace('/auth');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#07181a] items-center justify-center px-6">
      <View className="w-full max-w-md">
        <Text className="text-3xl font-poppins-bold text-[#132E32] dark:text-white mb-4">Crear cuenta</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-300 mb-6">Crea una cuenta para guardar tus prácticas y accesos</Text>

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

        <Pressable onPress={handleSignUp} className="bg-[#132E32] px-4 py-3 rounded-xl items-center justify-center mb-4" disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-poppins-bold">Registrarse</Text>}
        </Pressable>

        <Pressable onPress={() => router.push('/auth')} className="items-center mt-2">
          <Text className="text-sm text-gray-600 dark:text-gray-300">¿Ya tienes cuenta? <Text className="text-[#132E32] dark:text-white">Inicia sesión</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}
