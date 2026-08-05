import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Tags,
  GitPullRequest,
  Users,
  FileBarChart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Início', icon: LayoutDashboard },
    { path: '/tarefas', label: 'Tarefas', icon: ListTodo },
    { path: '/projetos', label: 'Projetos', icon: FolderKanban },
    { path: '/situacoes', label: 'Situações', icon: Tags },
    { path: '/tipos', label: 'Tipos', icon: GitPullRequest },
    { path: '/usuarios', label: 'Usuários', icon: Users },
    { path: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Task Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transition-transform duration-200 pt-16 lg:pt-0`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-0 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
