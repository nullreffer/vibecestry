import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import FlowList from './pages/FlowList';
import AddFlow from './pages/AddFlow';
import EditFlow from './pages/EditFlow';
import Settings from './pages/Settings';
import LoginPage from './components/LoginPage';
import AuthLoading from './components/AuthLoading';
import './App.css';

// Protected App Component that requires authentication
const ProtectedApp = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FlowList />} />
        <Route path="/add" element={<AddFlow />} />
        <Route path="/edit" element={<EditFlow />} />
        <Route path="/edit/:id" element={<EditFlow />} />
        <Route path="/settings/*" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedApp />
      </Router>
    </AuthProvider>
  );
}

export default App;
