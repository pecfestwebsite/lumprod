import { lazy } from 'react';
import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AdminProvider } from './features/admin/context/AdminContext';
import { NotificationProvider } from './features/shared-ui/contexts/NotificationContext';
import { LoadingProvider } from './features/shared-ui/contexts/LoadingContext';
import ErrorBoundary from './features/shared-ui/components/ErrorBoundary';
import LazyLoad from './features/shared-ui/components/LazyLoad';
import Header from './features/shared-ui/components/Header';
import SiteFooter from './features/shared-ui/components/SiteFooter';
import AppLoadingScreen from './features/shared-ui/components/AppLoadingScreen';
import RegistrationsClosed from './features/shared-ui/components/RegistrationsClosed';
import Home from './features/events/pages/Home';
import AdminProtected from './features/admin/components/AdminProtected';
import ScrollToTop from "./features/shared-ui/components/ScrollToTop";
import { resetBodyScroll } from './utils/dom';
import { REGISTRATIONS_OPEN, SITE_MAINTENANCE_MODE } from './config/eventStatus';

const routePrefetchers = {
  '/about': () => import('./features/events/pages/About'),
  '/monster-launch': () => import('./features/events/pages/MonsterLaunch'),
  '/team': () => import('./features/events/pages/Teams'),
  '/sponsors': () => import('./features/events/pages/Sponsors'),
  '/fun-events': () => import('./features/events/pages/FunEvents'),
  '/categories': () => import('./features/events/pages/Categories'),
  '/guidelines': () => import('./features/events/pages/Guidelines'),
  '/faq': () => import('./features/events/pages/FAQ'),
  '/schedule': () => import('./features/events/pages/Schedule'),
  '/login': () => import('./features/auth/pages/Login'),
  ...(REGISTRATIONS_OPEN
    ? {
        '/register': () => import('./features/auth/pages/Register'),
        '/submit': () => import('./features/submissions/pages/Submit'),
        '/dashboard': () => import('./features/submissions/pages/Dashboard'),
        '/payment': () => import('./features/submissions/pages/Payment'),
      }
    : {}),
  '/admin/login': () => import('./features/admin/pages/AdminLogin'),
};

const prefetchedRoutes = new Set();

export const prefetchRoute = (path) => {
  const prefetch = routePrefetchers[path];
  if (!prefetch || prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);
  prefetch().catch(() => {
    prefetchedRoutes.delete(path);
  });
};


// Lazy load pages for better performance
const Login = lazy(() => import('./features/auth/pages/Login'));
const Register = lazy(() => import('./features/auth/pages/Register'));
const Submit = lazy(() => import('./features/submissions/pages/Submit'));
const WorkshopSubmit = lazy(() => import('./features/submissions/pages/WorkshopSubmit'));
const Dashboard = lazy(() => import('./features/submissions/pages/Dashboard'));
const Payment = lazy(() => import('./features/submissions/pages/Payment'));
const MonsterLaunch = lazy(() => import('./features/events/pages/MonsterLaunch'));
const About = lazy(() => import('./features/events/pages/About'));
const Team = lazy(() => import('./features/events/pages/Teams'));
const Categories = lazy(() => import('./features/events/pages/Categories'));
const Schedule = lazy(() => import('./features/events/pages/Schedule'));
const Guidelines = lazy(() => import('./features/events/pages/Guidelines'));
const FAQ = lazy(() => import('./features/events/pages/FAQ'));
const FunEvents = lazy(() => import('./features/events/pages/FunEvents'));
const Sponsors = lazy(() => import('./features/events/pages/Sponsors'));

// Admin pages
const AdminLogin = lazy(() => import('./features/admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const Registrations = lazy(() => import('./features/admin/pages/Registrations'));
const ManageEvents = lazy(() => import('./features/admin/pages/ManageEvents'));
const Events = lazy(() => import('./features/admin/pages/Events'));
const Discounts = lazy(() => import('./features/admin/pages/Discounts'));
const TeamPageEditor = lazy(() => import('./features/admin/pages/TeamPageEditor'));
const DecorativeEffects = lazy(() => import('./features/shared-ui/components/DecorativeEffects'));

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen message="Checking your account..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <LazyLoad fallback={<AppLoadingScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/monster-launch" element={<MonsterLaunch />} />
        <Route path="/team" element={<Team />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route
          path="/categories"
          element={<Categories />}
        />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/fun-events" element={<FunEvents />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={
            REGISTRATIONS_OPEN ? (
              <Register />
            ) : (
              <RegistrationsClosed title="Registrations Closed" />
            )
          }
        />
        <Route 
          path="/submit" 
          element={
            REGISTRATIONS_OPEN ? (
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            ) : (
              <RegistrationsClosed title="Submissions Closed" />
            )
          } 
        />
        <Route
          path="/submit/workshop"
          element={
            REGISTRATIONS_OPEN ? (
              <ProtectedRoute>
                <WorkshopSubmit />
              </ProtectedRoute>
            ) : (
              <RegistrationsClosed title="Workshop Registrations Closed" />
            )
          }
        />
        <Route 
          path="/dashboard" 
          element={
            REGISTRATIONS_OPEN ? (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ) : (
              <RegistrationsClosed title="Submission Dashboard Closed" />
            )
          } 
        />
        <Route 
          path="/payment" 
          element={
            REGISTRATIONS_OPEN ? (
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            ) : (
              <RegistrationsClosed title="Payments Closed" />
            )
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <AdminProtected>
              <AdminDashboard />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/registrations" 
          element={
            <AdminProtected>
              <Registrations />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/submission-events" 
          element={
            <AdminProtected>
              <Events />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/events" 
          element={
            <AdminProtected>
              <ManageEvents />
            </AdminProtected>
          } 
        />
        <Route 
          path="/admin/discounts" 
          element={
            <AdminProtected>
              <Discounts />
            </AdminProtected>
          } 
        />
        <Route
          path="/admin/team"
          element={
            <AdminProtected>
              <TeamPageEditor />
            </AdminProtected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LazyLoad>
  );
}

function AppShell({ showDecorativeEffects }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // When maintenance mode is ON, show a permanent loading screen for all public routes.
  // Admin routes are never affected so you can still manage the site.
  if (SITE_MAINTENANCE_MODE && !isAdminRoute) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      {showDecorativeEffects ? (
        <React.Suspense fallback={null}>
          <DecorativeEffects />
        </React.Suspense>
      ) : null}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!isAdminRoute && <Header />}
        <AppRoutes />
        {!isAdminRoute && <SiteFooter />}
      </div>
    </>
  );
}

export default function App() {
  const [showDecorativeEffects, setShowDecorativeEffects] = React.useState(false);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallViewport = window.innerWidth < 768;

    if (prefersReducedMotion || isCoarsePointer || isSmallViewport) return;

    const revealEffects = () => setShowDecorativeEffects(true);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(revealEffects, { timeout: 1800 });
    } else {
      window.setTimeout(revealEffects, 300);
    }
  }, []);

  React.useEffect(() => {
    const forceUnlockScroll = () => {
      const hasActiveOverlay = Boolean(document.querySelector('.modal, .mobile-popup.open'));
      if (hasActiveOverlay) return;

      resetBodyScroll();
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
    };

    forceUnlockScroll();
    window.addEventListener('focus', forceUnlockScroll);
    window.addEventListener('pageshow', forceUnlockScroll);
    document.addEventListener('visibilitychange', forceUnlockScroll);

    return () => {
      window.removeEventListener('focus', forceUnlockScroll);
      window.removeEventListener('pageshow', forceUnlockScroll);
      document.removeEventListener('visibilitychange', forceUnlockScroll);
    };
  }, []);

  React.useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = connection?.effectiveType || '';
    const shouldSkipPrefetch = connection?.saveData || ['slow-2g', '2g'].includes(effectiveType);

    if (shouldSkipPrefetch) return;

    const prefetchCommonRoutes = () => {
      prefetchRoute('/about');
      prefetchRoute('/categories');
      prefetchRoute('/guidelines');
    };

    let prefetched = false;

    const runPrefetchOnce = () => {
      if (prefetched) return;
      prefetched = true;
      prefetchCommonRoutes();
    };

    const onFirstInteraction = () => {
      runPrefetchOnce();
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });

    const fallbackTimer = window.setTimeout(runPrefetchOnce, 4500);

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runPrefetchOnce, { timeout: 3500 });
    } else {
      window.setTimeout(runPrefetchOnce, 1600);
    }

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <NotificationProvider>
          <LoadingProvider>
            <AuthProvider>
              <AdminProvider>
                <AppShell showDecorativeEffects={showDecorativeEffects} />
              </AdminProvider>
            </AuthProvider>
          </LoadingProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

