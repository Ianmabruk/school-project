import { useState, useEffect } from 'react';
import { get, post, put, remove } from '../../services/api';
import './AdminTestimonials.css';

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', content: '', image: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/testimonials/all').then(setItems).catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({ name: '', role: '', content: '', image: '', is_active: true });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await put(`/api/testimonials/${editing}`, form);
        setMessage('Updated');
        setItems(items.map(i => i.id === editing ? { ...i, ...form } : i));
      } else {
        const created = await post('/api/testimonials', form);
        setMessage('Created');
        setItems([...items, created]);
      }
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({ name: item.name, role: item.role, content: item.content, image: item.image || '', is_active: item.is_active });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await remove(`/api/testimonials/${id}`);
      setItems(items.filter(i => i.id !== id));
      setMessage('Deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Testimonials</h1>
      <p className="admin-subtitle">Manage client testimonials.</p>
      {message && <div className={message.includes('Updated') || message.includes('Created') || message.includes('Deleted') ? 'success' : 'error'}>{message}</div>}

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h2>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Content *</label>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} required />
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
        {items.map(item => (
          <div key={item.id} className="admin-card">
            <div className="admin-card-header">
              <h3>{item.name}</h3>
              <span className={`status-badge status-${item.is_active ? 'published' : 'draft'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <p>"{item.content}"</p>
            <p className="item-role">{item.role}</p>
            <div className="admin-card-actions">
              <button onClick={() => handleEdit(item)} className="btn-primary">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="btn-secondary">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
