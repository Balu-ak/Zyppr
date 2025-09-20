import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import AuthPage from './components/AuthPage';
import AdminApp from './components/AdminApp';
import UserApp from './components/UserApp';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <AuthPage />;
  }

  // Business owner gets the BusinessProvider at their app level
  if (user.role === 'business_owner') {
    return (
      <BusinessProvider>
        <AdminApp />
      </BusinessProvider>
    );
  }

  // Customer gets a simpler setup
  return <UserApp />;
};

export default App;