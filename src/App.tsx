import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginForm from './components/auth/LoginForm';
import Header from './components/common/Header';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ClientDashboard from './components/dashboard/ClientDashboard';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {currentUser.role === 'admin' ? <AdminDashboard /> : <ClientDashboard />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;