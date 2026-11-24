import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useAuth } from './AuthContext';

import HomePage from './pages/HomePage';
import PetsPage from './pages/PetsPage';
import PetDetailsPage from './pages/PetDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ApplyPage from './pages/ApplyPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagePetsPage from './pages/ManagePetsPage';
import ManageApplicationsPage from './pages/ManageApplicationsPage';
import NotFoundPage from './pages/NotFoundPage';

const h = React.createElement;

function Layout({ children }) {
  return h(
    'div',
    { className: 'app-shell' },
    h(Navbar),
    h('main', { className: 'main-content' }, children),
    h(Footer)
  );
}

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return h(Navigate, { to: '/login', state: { from: location }, replace: true });
  }
  if (role && user?.role !== role) {
    return h(Navigate, { to: '/', replace: true });
  }
  return children;
}

function route(path, element) {
  return h(Route, { path, element: h(Layout, null, element) });
}

function guarded(path, role, page) {
  return route(
    path,
    h(ProtectedRoute, { role }, h(page))
  );
}

export default function App() {
  return h(
    Routes,
    null,
    route('/', h(HomePage)),
    route('/pets', h(PetsPage)),
    route('/pets/:id', h(PetDetailsPage)),
    route('/login', h(LoginPage)),
    route('/register', h(RegisterPage)),
    guarded('/apply/:id', 'user', ApplyPage),
    guarded('/applications', 'user', MyApplicationsPage),
    guarded('/admin', 'admin', AdminDashboardPage),
    guarded('/admin/pets', 'admin', ManagePetsPage),
    guarded('/admin/applications', 'admin', ManageApplicationsPage),
    route('*', h(NotFoundPage))
  );
}
