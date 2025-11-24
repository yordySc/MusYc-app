import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SignUpScreen = ({ onGoToLogin }: { onGoToLogin: () => void }) => {
  const { isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data, error } = await import('../utils/supabase').then(({ supabase }) =>
        supabase.auth.signUp({ email, password })
      );
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Registro exitoso. Revisa tu correo para confirmar.');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Registro</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 8 }}
      />
      <Button title="Registrarse" onPress={handleSignUp} />
      {errorMsg ? <Text style={{ color: 'red', marginTop: 10 }}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={{ color: 'green', marginTop: 10 }}>{successMsg}</Text> : null}
      <Button title="¿Ya tienes cuenta? Inicia sesión" onPress={onGoToLogin} />
    </View>
  );
};

export default SignUpScreen;
