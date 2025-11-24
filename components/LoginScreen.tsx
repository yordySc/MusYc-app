import React, { useState } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';


import SignUpScreen from './SignUpScreen';

const LoginScreen = () => {
  const { signIn, signOut, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
      console.log('Login error:', error);
    } else {
      console.log('Login exitoso, usuario actualizado');
    }
  };

  if (isLoading) return <ActivityIndicator />;

  if (showSignUp) {
    return <SignUpScreen onGoToLogin={() => setShowSignUp(false)} />;
  }

  return (
    <View style={{ padding: 20 }}>
      {user ? (
        <>
          <Text>Bienvenido, {user.email}</Text>
          <Button title="Cerrar sesión" onPress={signOut} />
        </>
      ) : (
        <>
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
          <Button title="Iniciar sesión" onPress={handleLogin} />
          <Button title="¿No tienes cuenta? Regístrate" onPress={() => setShowSignUp(true)} />
          {errorMsg ? <Text style={{ color: 'red', marginTop: 10 }}>{errorMsg}</Text> : null}
        </>
      )}
    </View>
  );
};

export default LoginScreen;
