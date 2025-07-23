import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';

import AppContent from './pages/app';
import { useAppStore } from './store/useAppStore';

const App: FC = () => {
  const { userSession } = useAppStore((state) => state);

  if (!userSession) {
    const localSession = localStorage.getItem('userSession');
    if (localSession) {
      // TODO: Validate session and check for expiration
      useAppStore.setState({ userSession: localSession });
      return;
    }

    return <Login />
  }

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/app" element={<AppContent />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;