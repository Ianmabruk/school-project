import { useState, useEffect } from 'react';
import { get, put } from '../../services/api';
import './AdminShared.css';

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', meta_title: '', meta_description: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/pages').then(setPages).catch(() => {});
  }, []);

  const handleEdit = (page) => {
    setEditing(page.id);
    setForm({
      title: page.title,
      content: page.content,
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || ''
    });
  };

  const handleSave = async (id) => {
    try {
      await put(`/api/pages/${id}`, form);
      setMessage('Page updated successfully');
      setPages(pages.map(p => p.id === id ? { ...p, ...form } : p));
      setEditing(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Pages</h1>
      <p className="admin-subtitle">Manage your website pages content and SEO metadata.</p>
      {message && <div className={message.includes('success') || message.includes('updated') ? 'success' : 'error'}>{message}</div>}

      <div className="admin-list">
        {pages.map(page => (
          <div key={page.id} className="admin-card">
            <div className="admin-card-header">
              <h3>{page.title}</h3>
              <span className="slug">{page.slug}</span>
            </div>
            {editing === page.id ? (
              <div className="admin-form">
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Content (HTML)</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} />
                </div>
                <div className="form-group">
                  <label>Meta Title</label>
                  <input value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} rows={3} />
                </div>
                <div className="form-actions">
                  <button onClick={() => handleSave(page.id)} className="btn-primary">Save</button>
                  <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="admin-card-body">
                <p>{page.meta_description || 'No description'}</p>
                <button onClick={() => handleEdit(page)} className="btn-primary">Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
