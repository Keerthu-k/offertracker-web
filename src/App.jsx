import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Resumes from './pages/Resumes';
import SavedJobs from './pages/SavedJobs';
import Contacts from './pages/Contacts';
import Reminders from './pages/Reminders';
import Community from './pages/Community';
import Progress from './pages/Progress';
import SettingsPage from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

const publicPaths = ['/', '/login', '/signup'];

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isPublic = publicPaths.includes(location.pathname);

  // If logged in and hitting a public page, redirect to dashboard
  if (!loading && user && isPublic && location.pathname !== '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // Public pages
  if (isPublic) {
    return (
      <>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <ToastContainer />
      </>
    );
  }

  // Authenticated shell
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 py-6 px-6 lg:px-10 xl:px-14">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/resumes" element={<Resumes />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/community" element={<Community />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </ProtectedRoute>
  );
}

export default App;
