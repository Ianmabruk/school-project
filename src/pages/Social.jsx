import { useState, useEffect } from 'react';
import { get } from '../services/api';
import './Social.css';

export default function Social() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    get('/api/social-links')
      .then(setLinks)
      .catch(() => setLinks([]));
  }, []);

  const platforms = [
    { name: 'Instagram', icon: '📷' },
    { name: 'Facebook', icon: '👥' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'TikTok', icon: '🎵' },
    { name: 'YouTube', icon: '▶️' }
  ];

  return (
    <div className="social-page">
      <section className="social-hero">
        <div className="container">
          <h1>Connect With Us</h1>
          <p>Follow Nova360 Digital across all major social media platforms for the latest updates, tips, and insights.</p>
        </div>
      </section>

      <section className="social-links">
        <div className="container">
          <div className="social-grid">
            {platforms.map(platform => {
              const link = links.find(l => l.platform === platform.name);
              return (
                <a
                  key={platform.name}
                  href={link?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-card"
                >
                  <span className="social-icon">{platform.icon}</span>
                  <h3>{platform.name}</h3>
                  <p>{link?.url ? 'Follow us' : 'Coming Soon'}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="social-content">
        <div className="container">
          <h2>Stay Connected</h2>
          <div className="content-tips">
            <div className="tip-card">
              <h3>Instagram</h3>
              <p>Follow us for daily marketing tips, behind-the-scenes content, and client success stories.</p>
            </div>
            <div className="tip-card">
              <h3>LinkedIn</h3>
              <p>Connect with our team for professional insights, industry news, and career opportunities.</p>
            </div>
            <div className="tip-card">
              <h3>YouTube</h3>
              <p>Subscribe for tutorials, case studies, and in-depth digital marketing guides.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
