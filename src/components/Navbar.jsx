import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [mobileOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          Nova360 Digital
        </Link>

        <ul className={`navbar-menu ${mobileOpen ? 'mobile-open' : ''}`}>
          <li><Link to="/" className={isActive('/')} onClick={closeMobile}>Home</Link></li>
          <li><Link to="/about" className={isActive('/about')} onClick={closeMobile}>About</Link></li>
          <li><Link to="/services" className={isActive('/services')} onClick={closeMobile}>Services</Link></li>
          <li><Link to="/blog" className={isActive('/blog')} onClick={closeMobile}>Blog</Link></li>
          <li><Link to="/contact" className={isActive('/contact')} onClick={closeMobile}>Contact</Link></li>
          <li><Link to="/social" className={isActive('/social')} onClick={closeMobile}>Social</Link></li>
        </ul>

        <button
          className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} onClick={closeMobile}></div>
    </nav>
  );
}
