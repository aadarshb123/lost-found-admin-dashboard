import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Link2,
  FlaskConical,
  Activity,
  MapPin
} from 'lucide-react';

import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import MatchesPage from './pages/MatchesPage';
import ExperimentsPage from './pages/ExperimentsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <a href="/" className="sidebar-logo">
          <MapPin size={24} />
          <h1>Lost & Found <span>Admin</span></h1>
        </a>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Activity size={20} />
            Analytics
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          <NavLink to="/items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            Items
          </NavLink>
          <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Link2 size={20} />
            Matches
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Testing</div>
          <NavLink to="/experiments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FlaskConical size={20} />
            A/B Tests
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
