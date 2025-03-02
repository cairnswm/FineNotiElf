import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './auth/components/ProtectedRoute';
import PublicRoute from './auth/components/PublicRoute';
import AdminRoute from './auth/components/AdminRoute';
import LandingPage from './notielf/pages/Landing/LandingPage';

// Lazy load all components except LandingPage
const Navigation = lazy(() => import('./auth/components/Navigation'));
const Login = lazy(() => import('./auth/pages/Login'));
const Register = lazy(() => import('./auth/pages/Register'));
const ForgotPassword = lazy(() => import('./auth/pages/ForgotPassword'));
const Profile = lazy(() => import('./auth/pages/Profile'));
const HomePage = lazy(() => import('./auth/pages/HomePage'));
const Settings = lazy(() => import('./auth/pages/Settings'));
const Properties = lazy(() => import('./auth/pages/Properties'));
const Payment = lazy(() => import('./auth/pages/Payment'));
const Main = lazy(() => import('./main'));
const AppPage = lazy(() => import('./notielf/pages/AppPage'));

const App = () => {
  return (
    <>
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navigation />
              <Main>
                <AppPage />
              </Main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navigation />
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <AdminRoute>
              <Navigation />
              <Settings />
            </AdminRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <Navigation />
              <Properties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Navigation />
              <Payment />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </>
  );
};

export default App;
