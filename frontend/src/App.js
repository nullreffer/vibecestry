import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FlowList from './pages/FlowList';
import AddFlow from './pages/AddFlow';
import EditFlow from './pages/EditFlow';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FlowList />} />
          <Route path="/add" element={<AddFlow />} />
          <Route path="/edit" element={<EditFlow />} />
          <Route path="/edit/:id" element={<EditFlow />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
