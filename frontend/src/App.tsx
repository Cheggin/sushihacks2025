import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import FishMapPage from './pages/FishMapPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/map" element={<FishMapPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
