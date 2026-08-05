import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Router } from './router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router />
        <Toaster position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
