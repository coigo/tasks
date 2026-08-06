import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { parse, format } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, lerNotificacao } = useNotifications();

   const onClickNotificacao = async (notificacaoId: number) => {
      lerNotificacao(notificacaoId)      
      setIsOpen(false)
   }
   
  const formatDate = (dateStr: string) => {
    const date = parse(dateStr, 'yyyy-MM-dd HH:mm', new Date());
    return format(date, 'dd/MM/yyyy HH:mm');
  };

   
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notificações</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma notificação
                </div>
              ) : (
                <ul>
                  {notifications.map((notification, index) => (
                    <li key={index}>
                      <Link
                        to={notification.redirecionarPara || '#'}
                        onClick={() => onClickNotificacao(notification.id)}
                        className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${
                          !notification.lido ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {!notification.lido && (
                          <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {notification.mensagem}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.criadoEm)}
                          </p>
                        </div>
                        {!notification.lido && (
                          <Check
                            size={14}
                            className="text-blue-500 flex-shrink-0 mt-1"
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
