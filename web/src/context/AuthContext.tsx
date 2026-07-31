import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface AuthContextData {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post('/auth/login', { email, senha });
    const { tokens, usuario } = response.data;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    api.defaults.headers.common.Authorization = `Bearer ${tokens.access_token}`;
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common.Authorization;
    setUsuario(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
