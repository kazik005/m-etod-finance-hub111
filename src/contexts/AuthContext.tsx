import React, { createContext, useContext, useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import type { BlinkUser } from '@blinkdotnew/sdk';

interface AuthContextType {
  user: BlinkUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Translate auth error to Russian based on error message patterns
const translateAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('email not verified') || message.includes('not verified')) {
      return 'Пожалуйста, подтвердите ваш email';
    }
    if (message.includes('invalid') || message.includes('credentials') || message.includes('wrong password') || message.includes('user not found')) {
      return 'Неверный email или пароль';
    }
    if (message.includes('rate') || message.includes('too many')) {
      return 'Слишком много попыток. Попробуйте позже';
    }
    if (message.includes('already exists') || message.includes('already registered') || message.includes('email in use')) {
      return 'Пользователь с таким email уже существует';
    }
    if (message.includes('weak') || message.includes('password') && message.includes('short')) {
      return 'Пароль слишком слабый. Минимум 6 символов';
    }
    if (message.includes('cancel') || message.includes('popup')) {
      return 'Вход был отменен';
    }
    if (message.includes('expired') || message.includes('token')) {
      return 'Сессия истекла. Войдите снова';
    }
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return 'Ошибка сети. Проверьте подключение';
    }
    
    return error.message || 'Произошла ошибка';
  }
  return 'Произошла неизвестная ошибка';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BlinkUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await blink.auth.signInWithEmail(email, password);
    } catch (error) {
      throw new Error(translateAuthError(error));
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Register user
      await (blink.auth as any).signUp({ 
        email, 
        password, 
        displayName: name,
        role: email === 'greef295@yandex.ru' ? 'admin' : 'user'
      });
      // Auto login after registration
      await blink.auth.signInWithEmail(email, password);
    } catch (error) {
      throw new Error(translateAuthError(error));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await blink.auth.sendPasswordResetEmail(email);
    } catch (error) {
      throw new Error(translateAuthError(error));
    }
  };

  const logout = async () => {
    await blink.auth.signOut();
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'greef295@yandex.ru';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
