import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Import pages with lazy loading
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Events = lazy(() => import('./pages/Events'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const EventCreate = lazy(() => import('./pages/EventCreate'));
const ManageEvents = lazy(() => import('./pages/ManageEvents'));
const EventApplications = lazy(() => import('./pages/EventApplications'));
const Applications = lazy(() => import('./pages/Applications'));
const Notifications = lazy(() => import('./pages/Notifications'));
const History = lazy(() => import('./pages/History'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback
import Loading from './components/ui/Loading';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Suspense fallback={<Loading />}><Home /></Suspense>} />
        <Route path="events" element={<Suspense fallback={<Loading />}><Events /></Suspense>} />
        <Route path="opportunities" element={<Suspense fallback={<Loading />}><Opportunities /></Suspense>} />
        <Route path="opportunities/:id" element={<Suspense fallback={<Loading />}><EventDetail /></Suspense>} />
        <Route path="events/create" element={<Suspense fallback={<Loading />}><EventCreate /></Suspense>} />
        <Route path="events/:id/applications" element={<Suspense fallback={<Loading />}><EventApplications /></Suspense>} />
        <Route path="manage-events" element={<Suspense fallback={<Loading />}><ManageEvents /></Suspense>} />
        <Route path="dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<Loading />}><Profile /></Suspense>} />
        <Route path="applications" element={<Suspense fallback={<Loading />}><Applications /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<Loading />}><Notifications /></Suspense>} />
        <Route path="history" element={<Suspense fallback={<Loading />}><History /></Suspense>} />
        <Route path="admin" element={<Suspense fallback={<Loading />}><AdminDashboard /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<Loading />}><NotFound /></Suspense>} />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Suspense fallback={<Loading />}><Login /></Suspense>} />
        <Route path="register" element={<Suspense fallback={<Loading />}><Register /></Suspense>} />
      </Route>
    </Routes>
  );
}
