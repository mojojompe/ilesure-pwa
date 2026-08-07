import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/auth/Onboarding';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

const Discover = () => <div className="p-4 text-center">Discover Screen</div>;
const NotFound = () => <div className="p-4 text-center">404 - Not Found</div>;

export default function App() {
  useEffect(() => {
    // Hide splash screen or initialization logic here
  }, []);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
