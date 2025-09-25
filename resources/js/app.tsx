import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PageTitle from './Components/PageTitle/PageTitle';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import './layouts/DashboardLayout.css';

const Home = lazy(() => import('./Pages/Home/Home'));
const About = lazy(() => import('./Pages/About/About'));
const Contact = lazy(() => import('./Pages/Contact/Contact'));
const Service = lazy(() => import('./Pages/Service/Service'));
const NotFound = lazy(() => import('./Pages/NotFound/NotFound'));
const Login = lazy(() => import('./Pages/Login/Login'));
const Register = lazy(() => import('./Pages/Register/Register'));
const Terms = lazy(() => import('./Pages/Terms/Terms'));
const Privacy = lazy(() => import('./Pages/Privacy/Privacy'));
const Dashboard = lazy(() => import('./Pages/Dashboard/Dashboard'));

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeftColor: '#106552',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}></div>
  </div>
);

const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <PageTitle title={title}>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </PageTitle>
);

const DashboardPage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <PageTitle title={title}>
    <Suspense fallback={<LoadingSpinner />}>
      <div className="dashboard-page">
        {children}
      </div>
    </Suspense>
  </PageTitle>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();

  const isPrivateRoute = (pathname: string): boolean => {
    const privateRoutes = ['/dashboard','/login','/register'];
    return privateRoutes.some(route => pathname.startsWith(route));
  };

  const showNavbarFooter = !isPrivateRoute(location.pathname);

  return (
    <>
      {showNavbarFooter && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PageWrapper title="">
            <Home />
          </PageWrapper>
        } />
        <Route path="/about" element={
          <PageWrapper title="About">
            <About />
          </PageWrapper>
        } />
        <Route path="/contact" element={
          <PageWrapper title="Contact">
            <Contact />
          </PageWrapper>
        } />
        <Route path="/services" element={
          <PageWrapper title="Services">
            <Service />
          </PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper title="Login">
            <Login />
          </PageWrapper>
        } />
        <Route path="/register" element={
          <PageWrapper title="Register">
            <Register />
          </PageWrapper>
        } />
        <Route path="/terms" element={
          <PageWrapper title="Terms">
            <Terms />
          </PageWrapper>
        } />
        <Route path="/privacy" element={
          <PageWrapper title="Privacy">
            <Privacy />
          </PageWrapper>
        } />

        {/* Public Routes */}
        <Route path="/" element={
          <PageWrapper title="Home">
            <Home />
          </PageWrapper>
        } />
        <Route path="/about" element={
          <PageWrapper title="About Us">
            <About />
          </PageWrapper>
        } />
        <Route path="/contact" element={
          <PageWrapper title="Contact Us">
            <Contact />
          </PageWrapper>
        } />
        <Route path="/service" element={
          <PageWrapper title="Our Services">
            <Service />
          </PageWrapper>
        } />
        <Route path="/terms" element={
          <PageWrapper title="Terms of Service">
            <Terms />
          </PageWrapper>
        } />
        <Route path="/privacy" element={
          <PageWrapper title="Privacy Policy">
            <Privacy />
          </PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper title="Login">
            <Login />
          </PageWrapper>
        } />
        <Route path="/register" element={
          <PageWrapper title="Create Account">
            <Register />
          </PageWrapper>
        } />

        {/* Protected Routes with Dashboard Layout */}
        <Route element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={
            <DashboardPage title="Dashboard">
              <Dashboard />
            </DashboardPage>
          } />
          {/* Add more protected routes here */}
        </Route>

        {/* 404 Route - Must be the last route */}
        <Route path="*" element={
          <PageWrapper title="Not Found">
            <NotFound />
          </PageWrapper>
        } />
      </Routes>
      {showNavbarFooter && <Footer />}
    </>
  );
};

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
