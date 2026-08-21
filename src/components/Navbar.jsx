import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Nova360 Digital
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About</Link></li>
          <li><Link to="/services" className={isActive('/services')}>Services</Link></li>
          <li><Link to="/blog" className={isActive('/blog')}>Blog</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
          <li><Link to="/social" className={isActive('/social')}>Social</Link></li>
          {isAdmin && (
            <li><Link to="/admin" className="admin-link">Admin</Link></li>
          )}
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <button onClick={logout} className="btn-secondary logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/admin/login" className="btn-primary admin-btn">Admin Login</Link>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => document.body.classList.toggle('menu-open')}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
