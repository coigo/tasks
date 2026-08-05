import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';

interface UsuarioNotificacao {
  mensagem: string;
  redirecionarPara: string;
  lido: boolean;
  criadoEm: string;
}

interface NotificationContextData {
  notifications: UsuarioNotificacao[];
  unreadCount: number;
  isLoading: boolean;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<UsuarioNotificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchNotifications = async () => {
    if (fetched) return;
    setIsLoading(true);
    try {
      const response = await api.get('/usuarios/notificacoes');
      setNotifications(response.data);
      setFetched(true);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchNotifications();
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.lido).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider');
  }
  return context;
}
