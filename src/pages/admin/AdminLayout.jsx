import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/pages', label: 'Pages' },
    { to: '/admin/services', label: 'Services' },
    { to: '/admin/blog', label: 'Blog' },
    { to: '/admin/calendar', label: 'Calendar' },
    { to: '/admin/media', label: 'Media' },
    { to: '/admin/testimonials', label: 'Testimonials' },
    { to: '/admin/social', label: 'Social' },
    { to: '/admin/seo', label: 'SEO' },
    { to: '/admin/analytics', label: 'Analytics' },
    { to: '/admin/settings', label: 'Settings' }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Nova360 Admin</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
