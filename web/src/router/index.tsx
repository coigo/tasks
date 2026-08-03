import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Tarefas } from '../pages/Tarefas';
import { TarefaCreate } from '../pages/TarefaCreate';
import { TarefaDetail } from '../pages/TarefaDetail';
import { Projetos } from '../pages/Projetos';
import { TarefaSituacoes } from '../pages/TarefaSituacoes';
import { TarefaTipos } from '../pages/TarefaTipos';
import { Usuarios } from '../pages/Usuarios';
import { Relatorios } from '../pages/Relatorios';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const token = localStorage.getItem('access_token');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="tarefas/nova" element={<TarefaCreate />} />
          <Route path="tarefas/:id" element={<TarefaDetail />} />
          <Route path="projetos" element={<Projetos />} />
          <Route path="situacoes" element={<TarefaSituacoes />} />
          <Route path="tipos" element={<TarefaTipos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
