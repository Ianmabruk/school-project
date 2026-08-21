import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './pages/admin/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Social from './pages/Social';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Pages from './pages/admin/Pages';
import ServicesAdmin from './pages/admin/Services';
import BlogAdmin from './pages/admin/Blog';
import Calendar from './pages/admin/Calendar';
import Media from './pages/admin/Media';
import Testimonials from './pages/admin/Testimonials';
import SocialAdmin from './pages/admin/Social';
import SEO from './pages/admin/SEO';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/admin" replace />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<Login />} />
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/social" element={<PublicLayout><Social /></PublicLayout>} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pages" element={<Pages />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="blog" element={<BlogAdmin />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="media" element={<Media />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="social" element={<SocialAdmin />} />
            <Route path="seo" element={<SEO />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
