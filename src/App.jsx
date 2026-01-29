import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/Admin/PrivateRoute';
import Home from './pages/Home/Home';
import Status from './pages/Status/Status';
import Downloads from './pages/Downloads/Downloads';
import AdminLogin from './pages/Admin/Login/Login';
import AdminCallback from './pages/Admin/Callback/Callback';
import AdminDashboard from './pages/Admin/Dashboard/Dashboard';
import AdminProducts from './pages/Admin/Products/Products';
import AdminPlans from './pages/Admin/Plans/Plans';
import AdminProfile from './pages/Admin/Profile/Profile';
import AdminApps from './pages/Admin/Apps/Apps';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/status" element={<Status />} />
          <Route path="/downloads" element={<Downloads />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/callback" element={<AdminCallback />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <PrivateRoute>
                <AdminProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/planos"
            element={
              <PrivateRoute>
                <AdminPlans />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute>
                <AdminProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/apps"
            element={
              <PrivateRoute>
                <AdminApps />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;



