import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import Estudios from './pages/Estudios';
import Informes from './pages/Informes';
import Integraciones from './pages/Integraciones';
import Catalogo from './pages/Catalogo';
import './App.css';

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
);
const IconScan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/></svg>
);
const IconFile = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

function NavLink({ to, icon, children, badge }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{children}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
    </Link>
  );
}

function Sidebar({ stats }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">🩻</div>
          <div>
            <h1>Imagen Diagnóstico</h1>
            <p>Sistema Hospitalario</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Principal</div>
          <NavLink to="/" icon={<IconDashboard />}>Dashboard</NavLink>
          <NavLink to="/ordenes" icon={<IconClipboard />}>Órdenes</NavLink>
          <NavLink to="/estudios" icon={<IconScan />}>Estudios</NavLink>
          <NavLink to="/informes" icon={<IconFile />} badge={stats?.pendientes || 0}>Informes</NavLink>
        </div>
        <div className="nav-section">
          <div className="nav-section-title">Administración</div>
          <NavLink to="/catalogo" icon={<IconGrid />}>Catálogo</NavLink>
          <NavLink to="/integraciones" icon={<IconLink />}>Integraciones</NavLink>
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user">
          <div className="avatar">JC</div>
          <div>
            <div className="name">Joel Cerrogrande</div>
            <div className="role">Jefe de Servicio</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ title, children }) {
  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="topbar-actions">{children}</div>
    </header>
  );
}

function App() {
  const [stats, setStats] = useState({ pendientes: 0 });

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar stats={stats} />
        <div className="content">
          <Routes>
            <Route path="/" element={
              <>
                <TopBar title="Dashboard" />
                <div className="page">
                  <Dashboard onStats={setStats} />
                </div>
              </>
            } />
            <Route path="/ordenes" element={
              <>
                <TopBar title="Órdenes de Imagen" />
                <div className="page"><Ordenes /></div>
              </>
            } />
            <Route path="/estudios" element={
              <>
                <TopBar title="Estudios Realizados" />
                <div className="page"><Estudios /></div>
              </>
            } />
            <Route path="/informes" element={
              <>
                <TopBar title="Informes Radiológicos" />
                <div className="page"><Informes /></div>
              </>
            } />
            <Route path="/catalogo" element={
              <>
                <TopBar title="Catálogo" />
                <div className="page"><Catalogo /></div>
              </>
            } />
            <Route path="/integraciones" element={
              <>
                <TopBar title="Integraciones" />
                <div className="page"><Integraciones /></div>
              </>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
