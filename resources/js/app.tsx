import './bootstrap';
import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PageTitle from './Components/PageTitle/PageTitle';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './Components/LoadingSpinner/LoadingSpinner';
import PageEnter from './Components/PageEnter/PageEnter';
import { scrollToSection } from './lib/motion';
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
const AllUsers = lazy(() => import('./Pages/AllUsers/AllUsers'))
const Compliance = lazy(() => import('./Pages/Compliance/Compliance'))
const UserDocuments = lazy(() => import('./Pages/UserDocuments/UserDocuments'))
const AccountSetting = lazy(() => import('./Pages/AccountSetting/AccountSetting'));
const StateServiceRequests = lazy(() => import('./Pages/StateServiceRequests/StateServiceRequests'));
const AdminActivity = lazy(() => import('./Pages/AdminActivity/AdminActivity'));
const BlogManagement = lazy(() => import('./Pages/BlogManagement/BlogManagement'));

const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { pathname } = useLocation();
  return (
    <PageTitle title={title}>
      <Suspense fallback={<div className="loading-container"><LoadingSpinner size="medium" fullPage={true} /></div>}>
        {/* Keyed by path so every public page change plays the enter transition */}
        <PageEnter key={pathname}>{children}</PageEnter>
      </Suspense>
    </PageTitle>
  );
};

const DashboardPage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <PageTitle title={title}>
    <Suspense fallback={<div className="loading-container"><LoadingSpinner size="medium" fullPage={true} /></div>}>
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
    const privateRoutes = [
      '/dashboard', 
      '/profile', 
      '/user-service', 
      '/acc-settings', 
      '/admin', 
      '/all-users', 
      '/pending', 
      '/compliance', 
      '/compliance-success', 
      '/compliance-uploads', 
      '/blog-management',
      '/user-documents',
      '/state-service-requests',
      '/admin-activity'
    ];
    return privateRoutes.some(route => pathname.startsWith(route));
  };

  const showNavbarFooter = !isPrivateRoute(location.pathname) && ![
    '/login', 
    '/register'
  ].some(route => location.pathname.startsWith(route));

  // Start each new page at the top. Runs before paint so the old scroll
  // position never flashes on the new page.
  const previousPath = useRef(location.pathname);
  useLayoutEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Links such as "/#pricing-section" scroll to that section once the page
  // has rendered. location.key makes repeating the same link work; pathname
  // and hash cover history entries created without a router key.
  useEffect(() => {
    if (location.hash.length > 1) {
      scrollToSection(decodeURIComponent(location.hash.slice(1)));
    }
  }, [location.key, location.pathname, location.hash]);

  const MainElement = showNavbarFooter ? 'main' : 'div';

  return (
    <>
      {showNavbarFooter && <a className="skip-link" href="#main-content">Skip to content</a>}
      {showNavbarFooter && <Navbar />}
      <MainElement id="main-content" className={showNavbarFooter ? 'site-main' : undefined} tabIndex={-1}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PageWrapper title=""><Home /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper title="About"><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper title="Contact"><Contact /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper title="Services"><Service /></PageWrapper>} />
        <Route path="/blogs" element={<PageWrapper title="Blogs"><Blogs /></PageWrapper>} />
        <Route path="/article/:slug" element={<PageWrapper title="Article"><Article /></PageWrapper>} />
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

        <Route element={<PrivateRoute requiredRoles="Admin"><DashboardLayout /></PrivateRoute>}>
          <Route path="/all-users" element={<DashboardPage title="Dashboard"><AllUsers /></DashboardPage>} />
          <Route path="/pending" element={<DashboardPage title="Dashboard"><Dashboard /></DashboardPage>} />
          <Route path="/compliance" element={<DashboardPage title="Dashboard"><Compliance /></DashboardPage>} />
          <Route path="/user-documents" element={<DashboardPage title="User Documents"><UserDocuments /></DashboardPage>} />
          <Route path="/compliance-success" element={<DashboardPage title="Dashboard"><Dashboard /></DashboardPage>} />
          <Route path="/compliance-uploads" element={<DashboardPage title="Dashboard"><Dashboard /></DashboardPage>} />
          <Route path="/blog-management" element={<DashboardPage title="Blog Management"><BlogManagement /></DashboardPage>} />
          <Route path="/state-service-requests" element={<DashboardPage title="State Service Requests"><StateServiceRequests /></DashboardPage>} />
          <Route path="/admin-activity" element={<DashboardPage title="Admin Activity & Reports"><AdminActivity /></DashboardPage>} />
        </Route>

        {/* 403 Access Denied Page */}
        <Route path="/403" element={
          <PageWrapper title="Access Denied">
            <div className="access-denied">
              <h1>403</h1>
              <p>You do not have permission to view this page.</p>
            </div>
          </PageWrapper>
        } />

        {/* 404 Not Found */}
        <Route path="*" element={<PageWrapper title="Not Found"><NotFound /></PageWrapper>} />
      </Routes>
      </MainElement>
      {showNavbarFooter && <Footer />}
    </>
  );
};


const rootElement = document.getElementById('app');
if (rootElement) {
  // Reuse the root when Vite hot-reloads this module instead of creating a
  // second one on the same container (React warns about that in development).
  const holder = window as unknown as { __pcsRoot?: ReactDOM.Root };
  holder.__pcsRoot ??= ReactDOM.createRoot(rootElement);
  holder.__pcsRoot.render(<App />);
}
