import { useState, useEffect } from 'react';
import { get, post, put, remove } from '../../services/api';
import { Link } from 'react-router-dom';
import './AdminCalendar.css';

export default function AdminCalendar() {
  const [items, setItems] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', platform: 'Instagram', content_type: 'Post', caption: '', hashtags: '', scheduled_date: '', scheduled_time: '', campaign: '', status: 'idea', media_url: '', video_url: '', blog_id: '', cta: '', notes: '', target_audience: ''
  });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState({ status: '', platform: '' });
  const [view, setView] = useState('list');

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

  useEffect(() => {
    let cancelled = false;
    const loadUpcoming = async () => {
      try {
        const data = await get('/api/calendar/upcoming');
        if (!cancelled) setUpcoming(data);
      } catch { /* ignore */ }
    };
    loadUpcoming();
    return () => { cancelled = true; };
  }, []);

  const resetForm = () => {
    setForm({
      title: '', description: '', platform: 'Instagram', content_type: 'Post', caption: '', hashtags: '', scheduled_date: '', scheduled_time: '', campaign: '', status: 'idea', media_url: '', video_url: '', blog_id: '', cta: '', notes: '', target_audience: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, blog_id: form.blog_id ? Number(form.blog_id) : null };
      if (editing) {
        await put(`/api/calendar/${editing}`, payload);
        setMessage('Item updated');
      } else {
        await post('/api/calendar', payload);
        setMessage('Item created');
      }
      resetForm();
      setTimeout(() => setMessage(''), 3000);
      window.location.reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      platform: item.platform,
      content_type: item.content_type,
      caption: item.caption || '',
      hashtags: item.hashtags || '',
      scheduled_date: item.scheduled_date || '',
      scheduled_time: item.scheduled_time || '',
      campaign: item.campaign || '',
      status: item.status,
      media_url: item.media_url || '',
      video_url: item.video_url || '',
      blog_id: item.blog_id || '',
      cta: item.cta || '',
      notes: item.notes || '',
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

  const platformOptions = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Website', 'Blog'];
  const typeOptions = ['Social Media Post', 'Story', 'Reel', 'Short Video', 'YouTube Video', 'Blog Article', 'Promotional Content', 'Educational Content', 'Advertisement', 'Announcement'];
  const statusOptions = ['Idea', 'Draft', 'Scheduled', 'Published', 'Archived'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupedItems = items.reduce((groups, item) => {
    const date = item.scheduled_date || 'Undated';
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <div className="admin-page">
      <h1>Content Calendar</h1>
      <p className="admin-subtitle">Plan and manage your marketing content across platforms.</p>
      {message && <div className={message.includes('updated') || message.includes('created') || message.includes('deleted') ? 'success' : 'error'}>{message}</div>}

      <div className="calendar-controls">
        <div className="calendar-filters">
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s.toLowerCase()} value={s.toLowerCase()}>{s}</option>)}
          </select>
          <select value={filter.platform} onChange={e => setFilter({ ...filter, platform: e.target.value })}>
            <option value="">All Platforms</option>
            {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="calendar-view-toggle">
          <button type="button" className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
          <button type="button" className={`view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>Calendar</button>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming-section">
          <h2>Upcoming Content</h2>
          <div className="upcoming-grid">
            {upcoming.slice(0, 5).map(item => (
              <Link key={item.id} to={`/admin/calendar`} className="upcoming-card" onClick={() => handleEdit(item)}>
                <span className="upcoming-date">{formatDate(item.scheduled_date)}</span>
                <span className="upcoming-platform">{item.platform}</span>
                <span className="upcoming-title">{item.title}</span>
                <span className={`status-badge status-${item.status}`}>{item.status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h2>{editing ? 'Edit Content' : 'Create Content'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Platform *</label>
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
              {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Content Type *</label>
            <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value })}>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {statusOptions.map(s => <option key={s.toLowerCase()} value={s.toLowerCase()}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
        <div className="form-group">
          <label>Caption</label>
          <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} rows={3} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Hashtags</label>
            <input value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} placeholder="#DigitalMarketing #SEO" />
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
          <label>Video URL</label>
          <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtu.be/..." />
        </div>
        <div className="form-group">
          <label>Featured Image URL</label>
          <input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Blog Article ID (optional)</label>
          <input type="number" value={form.blog_id} onChange={e => setForm({ ...form, blog_id: e.target.value })} placeholder="e.g. 4" />
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
        {view === 'list' ? (
          items.length === 0 ? (
            <p className="no-items">No calendar items found.</p>
          ) : (
            <div className="calendar-table-wrapper">
              <table className="calendar-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Content</th>
                    <th>Platform</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{formatDate(item.scheduled_date)}</td>
                      <td>
                        <strong>{item.title}</strong>
                        {item.description && <p className="item-desc">{item.description}</p>}
                      </td>
                      <td>{item.platform}</td>
                      <td>{item.content_type}</td>
                      <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                      <td>
                        <div className="admin-card-actions">
                          <button onClick={() => handleEdit(item)} className="btn-primary">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="btn-secondary">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="calendar-calendar-view">
            {Object.keys(groupedItems).length === 0 ? (
              <p className="no-items">No calendar items found.</p>
            ) : (
              Object.entries(groupedItems).map(([date, dateItems]) => (
                <div key={date} className="calendar-day-group">
                  <h3 className="calendar-day-header">{formatDate(date)}</h3>
                  <div className="calendar-day-items">
                    {dateItems.map(item => (
                      <div key={item.id} className="calendar-item-card">
                        <div className="calendar-item-card-header">
                          <span className="calendar-item-platform">{item.platform}</span>
                          <span className={`status-badge status-${item.status}`}>{item.status}</span>
                        </div>
                        <h4>{item.title}</h4>
                        <p>{item.content_type}</p>
                        {item.video_url && <p className="item-video">🎬 {item.video_url}</p>}
                        <div className="admin-card-actions">
                          <button onClick={() => handleEdit(item)} className="btn-primary">Edit</button>
                          <button onClick={() => handleDelete(item.id)} className="btn-secondary">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
