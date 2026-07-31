import { AuthProvider } from './context/AuthContext';
import { Router } from './router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
