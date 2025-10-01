import './bootstrap';
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
const Blogs = lazy(() => import('./Pages/Blogs/Blogs'));
const Article = lazy(() => import('./Pages/Article/Article'));
const NotFound = lazy(() => import('./Pages/NotFound/NotFound'));
const Login = lazy(() => import('./Pages/Login/Login'));
const Register = lazy(() => import('./Pages/Register/Register'));
const Terms = lazy(() => import('./Pages/Terms/Terms'));
const Privacy = lazy(() => import('./Pages/Privacy/Privacy'));
const Dashboard = lazy(() => import('./Pages/Dashboard/Dashboard'));
const MyProfile = lazy(() => import('./Pages/MyProfile/MyProfile'));
const AccountSetting = lazy(() => import('./Pages/AccountSetting/AccountSetting'));

const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <PageTitle title={title}>
    <Suspense>
      {children}
    </Suspense>
  </PageTitle>
);

const DashboardPage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <PageTitle title={title}>
    <Suspense>
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
    const privateRoutes = ['/dashboard', '/profile', '/user-service', '/acc-settings', '/admin'];
    return privateRoutes.some(route => pathname.startsWith(route));
  };

  const showNavbarFooter = !isPrivateRoute(location.pathname);

  return (
    <>
      {showNavbarFooter && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper title=""><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper title="About"><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper title="Contact"><Contact /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper title="Services"><Service /></PageWrapper>} />
        <Route path="/blogs" element={<PageWrapper title="Blogs"><Blogs /></PageWrapper>} />
        <Route path="/article" element={<PageWrapper title="Article"><Article /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper title="Login"><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper title="Register"><Register /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper title="Terms"><Terms /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper title="Privacy"><Privacy /></PageWrapper>} />

        {/* Protected Routes with Dashboard Layout */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage title="Dashboard"><Dashboard /></DashboardPage>} />
          <Route path="/profile" element={<DashboardPage title="Profile"><MyProfile /></DashboardPage>} />
          <Route path="/user-service" element={<DashboardPage title="Services"><Dashboard /></DashboardPage>} />
          <Route path="/acc-settings" element={<DashboardPage title="Account Settings"><AccountSetting /></DashboardPage>} />
        </Route>

        {/* Admin Route - Top Level, role-protected */}
        <Route path="/admin" element={
          <PrivateRoute requiredRoles="Admin">
            <DashboardLayout>
              <DashboardPage title="Admin Dashboard">
                <div>Welcome, Admin! Only users with the Admin role can see this.</div>
              </DashboardPage>
            </DashboardLayout>
          </PrivateRoute>
        } />

        {/* 403 Access Denied Page */}
        <Route path="/403" element={
          <PageWrapper title="Access Denied">
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h1>403</h1>
              <p>You do not have permission to view this page.</p>
            </div>
          </PageWrapper>
        } />

        {/* 404 Not Found */}
        <Route path="*" element={<PageWrapper title="Not Found"><NotFound /></PageWrapper>} />
      </Routes>
      {showNavbarFooter && <Footer />}
    </>
  );
};


const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}
