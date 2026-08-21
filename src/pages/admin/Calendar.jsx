import { useState, useEffect } from 'react';
import { get, post, put, remove } from '../../services/api';
import './AdminCalendar.css';

export default function AdminCalendar() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    title: '', platform: 'Instagram', content_type: 'Post', caption: '', hashtags: '', scheduled_date: '', scheduled_time: '', campaign: '', status: 'idea', media_url: '', notes: '', cta: '', target_audience: ''
  });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState({ status: '', platform: '' });

  useEffect(() => {
    let cancelled = false;
    const loadItems = async () => {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.platform) params.append('platform', filter.platform);
      try {
        const data = await get(`/api/calendar?${params}`);
        if (!cancelled) setItems(data);
      } catch { /* ignore */ }
    };
    loadItems();
    return () => { cancelled = true; };
  }, [filter]);

  const resetForm = () => {
    setForm({
      title: '', platform: 'Instagram', content_type: 'Post', caption: '', hashtags: '', scheduled_date: '', scheduled_time: '', campaign: '', status: 'idea', media_url: '', notes: '', cta: '', target_audience: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await put(`/api/calendar/${editing}`, form);
        setMessage('Item updated');
      } else {
        await post('/api/calendar', form);
        setMessage('Item created');
      }
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title,
      platform: item.platform,
      content_type: item.content_type,
      caption: item.caption || '',
      hashtags: item.hashtags || '',
      scheduled_date: item.scheduled_date || '',
      scheduled_time: item.scheduled_time || '',
      campaign: item.campaign || '',
      status: item.status,
      media_url: item.media_url || '',
      notes: item.notes || '',
      cta: item.cta || '',
      target_audience: item.target_audience || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await remove(`/api/calendar/${id}`);
      setItems(items.filter(i => i.id !== id));
      setMessage('Item deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Content Calendar</h1>
      <p className="admin-subtitle">Plan and manage your social media content across platforms.</p>
      {message && <div className={message.includes('updated') || message.includes('created') || message.includes('deleted') ? 'success' : 'error'}>{message}</div>}

      <div className="calendar-filters">
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option value="idea">Idea</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select value={filter.platform} onChange={e => setFilter({ ...filter, platform: e.target.value })}>
          <option value="">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="Facebook">Facebook</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="TikTok">TikTok</option>
          <option value="YouTube">YouTube</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h2>{editing ? 'Edit Content' : 'New Content'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Platform</label>
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Website">Website</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Content Type</label>
            <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value })}>
              <option value="Post">Post</option>
              <option value="Story">Story</option>
              <option value="Reel">Reel</option>
              <option value="Video">Video</option>
              <option value="Blog">Blog</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Educational content">Educational content</option>
              <option value="Promotional content">Promotional content</option>
              <option value="Announcement">Announcement</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="idea">Idea</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Caption</label>
          <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} rows={3} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Hashtags</label>
            <input value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Campaign</label>
            <input value={form.campaign} onChange={e => setForm({ ...form, campaign: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Scheduled Date</label>
            <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Scheduled Time</label>
            <input type="time" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>CTA</label>
          <input value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Target Audience</label>
          <input value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="calendar-list">
        {items.map(item => (
          <div key={item.id} className="calendar-item">
            <div className="calendar-item-header">
              <h3>{item.title}</h3>
              <span className={`status-badge status-${item.status}`}>{item.status}</span>
            </div>
            <div className="calendar-item-meta">
              <span>{item.platform}</span>
              <span>{item.content_type}</span>
              <span>{item.scheduled_date} {item.scheduled_time}</span>
            </div>
            <p>{item.caption}</p>
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
