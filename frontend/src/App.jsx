import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import Estudios from './pages/Estudios';
import Informes from './pages/Informes';
import Integraciones from './pages/Integraciones';
import Catalogo from './pages/Catalogo';
import './App.css';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-left">
            <span className="logo">🏥</span>
            <h1>Diagnóstico por Imágenes</h1>
          </div>
          <nav className="nav">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/ordenes">Órdenes</NavLink>
            <NavLink to="/estudios">Estudios</NavLink>
            <NavLink to="/informes">Informes</NavLink>
            <NavLink to="/catalogo">Catálogo</NavLink>
            <NavLink to="/integraciones">Integraciones</NavLink>
          </nav>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/estudios" element={<Estudios />} />
            <Route path="/informes" element={<Informes />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/integraciones" element={<Integraciones />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>Servicio de Diagnóstico por Imágenes - Joel David Cerrogrande Ortega © 2026</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
