import { useState, useEffect } from 'react';
import { get, post, put, remove } from '../../services/api';
import './AdminServices.css';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', features: '', image: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/services/all').then(setServices).catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', features: '', image: '', is_active: true });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await put(`/api/services/${editing}`, form);
        setMessage('Service updated');
        setServices(services.map(s => s.id === editing ? { ...s, ...form } : s));
      } else {
        const created = await post('/api/services', form);
        setMessage('Service created');
        setServices([...services, created]);
      }
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (svc) => {
    setEditing(svc.id);
    setForm({
      title: svc.title,
      description: svc.description,
      features: svc.features || '[]',
      image: svc.image || '',
      is_active: svc.is_active
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await remove(`/api/services/${id}`);
      setServices(services.filter(s => s.id !== id));
      setMessage('Service deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Services</h1>
      <p className="admin-subtitle">Manage your service offerings.</p>
      {message && <div className={message.includes('updated') || message.includes('created') || message.includes('deleted') ? 'success' : 'error'}>{message}</div>}

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h2>{editing ? 'Edit Service' : 'Add Service'}</h2>
        <div className="form-group">
          <label>Title *</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div className="form-group">
          <label>Features (JSON array)</label>
          <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder='["Feature 1","Feature 2"]' />
        </div>
        <div className="form-group">
          <label>Image</label>
          <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="admin-list">
        {services.map(svc => (
          <div key={svc.id} className="admin-card">
            <div className="admin-card-header">
              <h3>{svc.title}</h3>
              <span className={`status-badge status-${svc.is_active ? 'published' : 'draft'}`}>{svc.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <p>{svc.description}</p>
            <div className="admin-card-actions">
              <button onClick={() => handleEdit(svc)} className="btn-primary">Edit</button>
              <button onClick={() => handleDelete(svc.id)} className="btn-secondary">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
