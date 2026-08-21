import { useState, useEffect } from 'react';
import { get, put } from '../../services/api';
import './AdminSocial.css';

export default function AdminSocial() {
  const [links, setLinks] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/social-links').then(setLinks).catch(() => {});
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleSave = async () => {
    try {
      await put('/api/social-links', links.map(l => ({ platform: l.platform, url: l.url, is_active: l.is_active })));
      setMessage('Social links updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'];

  const ensurePlatforms = () => {
    const existing = links.map(l => l.platform);
    const missing = platforms.filter(p => !existing.includes(p));
    setLinks([...links, ...missing.map(p => ({ platform: p, url: '', is_active: 1 }))]);
  };

  return (
    <div className="admin-page">
      <h1>Social Links</h1>
      <p className="admin-subtitle">Manage social media URLs displayed on the website.</p>
      {message && <div className={message.includes('updated') ? 'success' : 'error'}>{message}</div>}

      <div className="admin-form-card">
        <div className="social-links-list">
          {links.map((link, idx) => (
            <div key={link.platform} className="social-link-row">
              <label>{link.platform}</label>
              <input
                type="url"
                value={link.url}
                onChange={e => handleChange(idx, 'url', e.target.value)}
                placeholder={`https://${link.platform.toLowerCase()}.com/...`}
              />
            </div>
          ))}
        </div>
        {links.length === 0 && (
          <button type="button" onClick={ensurePlatforms} className="btn-secondary" style={{ marginBottom: 20 }}>Add Platforms</button>
        )}
        <button onClick={handleSave} className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
}
