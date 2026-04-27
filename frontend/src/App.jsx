import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import ProcessingPage from './pages/ProcessingPage';
import OCRResultPage from './pages/OCRResultPage';
import CameraOCR from './components/CameraOCR';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-main text-slate-200 selection:bg-primary/30">
      {user && <Navbar />}
      <div className={`flex-1 transition-all duration-300 ${user ? 'ml-64' : 'ml-0'}`}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/processing/:id" 
            element={
              <ProtectedRoute>
                <ProcessingPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/live" 
            element={
              <ProtectedRoute>
                <div className="ml-64 p-10"><CameraOCR /></div>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/result/:id" 
            element={
              <ProtectedRoute>
                <OCRResultPage />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
