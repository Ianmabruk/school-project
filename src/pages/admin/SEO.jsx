import { useState, useEffect } from 'react';
import { get, put } from '../../services/api';
import './AdminSEO.css';

export default function AdminSEO() {
  const [settings, setSettings] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/seo').then(setSettings).catch(() => {});
  }, []);

  const handleChange = (page, field, value) => {
    setSettings(settings.map(s => s.page === page ? { ...s, [field]: value } : s));
  };

  const handleSave = async (page) => {
    const setting = settings.find(s => s.page === page);
    try {
      await put(`/api/seo/${page}`, {
        seo_title: setting.seo_title,
        meta_description: setting.meta_description,
        keywords: setting.keywords,
        og_image: setting.og_image
      });
      setMessage('SEO settings updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const pages = ['home', 'about', 'services', 'blog', 'contact'];

  return (
    <div className="admin-page">
      <h1>SEO Settings</h1>
      <p className="admin-subtitle">Manage SEO metadata for your pages.</p>
      {message && <div className={message.includes('updated') ? 'success' : 'error'}>{message}</div>}

      <div className="seo-list">
        {pages.map(page => {
          const setting = settings.find(s => s.page === page) || { seo_title: '', meta_description: '', keywords: '', og_image: '' };
          return (
            <div key={page} className="seo-card">
              <h3>{page.charAt(0).toUpperCase() + page.slice(1)}</h3>
              <div className="form-group">
                <label>SEO Title</label>
                <input value={setting.seo_title} onChange={e => handleChange(page, 'seo_title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea value={setting.meta_description} onChange={e => handleChange(page, 'meta_description', e.target.value)} rows={2} />
              </div>
              <div className="form-group">
                <label>Keywords</label>
                <input value={setting.keywords} onChange={e => handleChange(page, 'keywords', e.target.value)} />
              </div>
              <div className="form-group">
                <label>OG Image URL</label>
                <input value={setting.og_image} onChange={e => handleChange(page, 'og_image', e.target.value)} />
              </div>
              <button onClick={() => handleSave(page)} className="btn-primary">Save</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
