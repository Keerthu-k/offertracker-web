import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Resumes from './pages/Resumes';

function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 py-8 px-8 lg:px-12 xl:px-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/resumes" element={<Resumes />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;
