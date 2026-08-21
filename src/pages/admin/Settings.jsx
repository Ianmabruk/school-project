import { useState, useEffect } from 'react';
import { get, put } from '../../services/api';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Nova360 Digital',
    siteDescription: 'Your premier digital marketing partner.',
    analyticsId: '',
    contactEmail: 'hello@nova360digital.com',
    contactPhone: '+254 700 000 000',
    location: 'Nairobi, Kenya',
    featured_video_url: '',
    featured_video_title: '',
    featured_video_description: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/site-settings')
      .then(data => {
        if (data) {
          setSettings(prev => ({
            ...prev,
            featured_video_url: data.featured_video_url || '',
            featured_video_title: data.featured_video_title || '',
            featured_video_description: data.featured_video_description || ''
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await put('/api/site-settings', {
        featured_video_url: settings.featured_video_url,
        featured_video_title: settings.featured_video_title,
        featured_video_description: settings.featured_video_description
      });
      setMessage('Settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Settings</h1>
      <p className="admin-subtitle">Manage website configuration.</p>
      {message && <div className={message.includes('success') || message.includes('saved') ? 'success' : 'error'}>{message}</div>}

      <div className="settings-section">
        <h2>General</h2>
        <div className="form-group">
          <label>Site Name</label>
          <input value={settings.siteName} onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Site Description</label>
          <textarea value={settings.siteDescription} onChange={e => setSettings({ ...settings, siteDescription: e.target.value })} rows={2} />
        </div>
      </div>

      <div className="settings-section">
        <h2>Analytics</h2>
        <div className="form-group">
          <label>Google Analytics ID</label>
          <input value={settings.analyticsId} onChange={e => setSettings({ ...settings, analyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" />
          <p className="form-hint">Add your Google Analytics tracking ID. Leave blank to disable.</p>
        </div>
      </div>

      <div className="settings-section">
        <h2>Contact Information</h2>
        <div className="form-group">
          <label>Contact Email</label>
          <input type="email" value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact Phone</label>
          <input value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={settings.location} onChange={e => setSettings({ ...settings, location: e.target.value })} />
        </div>
      </div>

      <div className="settings-section">
        <h2>Featured Video</h2>
        <div className="form-group">
          <label>YouTube Video URL</label>
          <input value={settings.featured_video_url} onChange={e => setSettings({ ...settings, featured_video_url: e.target.value })} placeholder="https://youtu.be/..." />
        </div>
        <div className="form-group">
          <label>Video Title</label>
          <input value={settings.featured_video_title} onChange={e => setSettings({ ...settings, featured_video_title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Video Description</label>
          <textarea value={settings.featured_video_description} onChange={e => setSettings({ ...settings, featured_video_description: e.target.value })} rows={2} />
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">Save Settings</button>
    </div>
  );
}
