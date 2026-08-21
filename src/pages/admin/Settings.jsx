import { useState } from 'react';
import './AdminSettings.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Nova360 Digital',
    siteDescription: 'Your premier digital marketing partner.',
    analyticsId: '',
    contactEmail: 'hello@nova360digital.com',
    contactPhone: '+254 700 000 000',
    location: 'Nairobi, Kenya'
  });
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('Settings saved (local state)');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="admin-page">
      <h1>Settings</h1>
      <p className="admin-subtitle">Manage website configuration.</p>
      {message && <div className="success">{message}</div>}

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

      <button onClick={handleSave} className="btn-primary">Save Settings</button>
    </div>
  );
}
