import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { CLIWindow } from './cli';
import { useGlobalShortcut } from './cli/useGlobalShortcut';
import { useSiteStore } from './store';

function AppInner() {
  useGlobalShortcut();

  // Sync theme store → data-theme attribute on <html>
  const theme = useSiteStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <CLIWindow />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
