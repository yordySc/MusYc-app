import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../utils/supabase';
import ThemeInput from '../../components/ThemeInput';
import ThemeButton from '../../components/ThemeButton';

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
    <View className="flex-1 bg-bg-light dark:bg-bg-dark items-center justify-center px-6">
      <View className="w-full max-w-md">
        <Text className="text-3xl font-poppins-bold text-text-light dark:text-text-dark mb-2">Crear cuenta</Text>
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-8">Crea una cuenta para guardar tus prácticas y accesos</Text>

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
          label={isLoading ? "Registrando..." : "Registrarse"}
          loading={isLoading}
          onPress={handleSignUp} 
          disabled={isLoading}
          fullWidth
        />

        <Pressable onPress={() => router.push('/auth')} className="items-center mt-4">
          <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            ¿Ya tienes cuenta? <Text className="text-secondary dark:text-accent font-poppins-semibold">Inicia sesión</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
