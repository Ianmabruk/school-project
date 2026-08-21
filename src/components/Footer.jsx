import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api';
import './Footer.css';

function SocialLinksComponent() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    get('/api/social-links')
      .then(setLinks)
      .catch(() => {});
  }, []);

  return (
    <div className="social-icons">
      {links.map(link => (
        <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform}>
          {link.platform}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Nova360 Digital</h3>
            <p>Your premier digital marketing partner. We help brands grow through strategic, data-driven marketing solutions.</p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Social Media Marketing</Link></li>
              <li><Link to="/services">SEO</Link></li>
              <li><Link to="/services">Content Marketing</Link></li>
              <li><Link to="/services">Brand Strategy</Link></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Connect</h4>
            <SocialLinksComponent />
          </div>
        </div>

        <div className="footer-bottom">
          <p> Nova360 Digital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
