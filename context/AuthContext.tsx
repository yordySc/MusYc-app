// context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

type UserType = {
  id: string;
  email: string;
} | null;

type AuthContextType = {
  user: UserType;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any } | void>;
  signOut: () => Promise<{ error: any } | void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica el usuario actual al montar
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email ?? '' });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    getSession();

    // Escucha cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Forzar recarga del usuario tras login
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      setUser({ id: userData.user.id, email: userData.user.email ?? '' });
    } else {
      setUser(null);
    }
    setIsLoading(false);
    return { error };
  }, []);

  // Función para cerrar sesión
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('supabase signOut error:', error);
        setIsLoading(false);
        return { error };
      }
      // Forzar limpieza local
      setUser(null);
      setIsLoading(false);
      console.log('signOut successful');
      return { error: null };
    } catch (err) {
      console.log('signOut exception:', err);
      setIsLoading(false);
      return { error: err };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};