import { useState, useEffect } from 'react';
import { get, post, put, remove } from '../../services/api';
import './AdminBlog.css';

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', category: '', tags: '', author: '', featured_image: '', status: 'draft', seo_title: '', meta_description: '', keywords: ''
  });
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/api/blog/all').then(setPosts).catch(() => {});
  }, []);

  const resetForm = () => {
    setForm({
      title: '', slug: '', content: '', excerpt: '', category: '', tags: '', author: '', featured_image: '', status: 'draft', seo_title: '', meta_description: '', keywords: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await put(`/api/blog/${editing}`, form);
        setMessage('Post updated');
        setPosts(posts.map(p => p.id === editing ? { ...p, ...form } : p));
      } else {
        const created = await post('/api/blog', form);
        setMessage('Post created');
        setPosts([...posts, created]);
      }
      resetForm();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags || '[]',
      author: post.author,
      featured_image: post.featured_image || '',
      status: post.status,
      seo_title: post.seo_title || '',
      meta_description: post.meta_description || '',
      keywords: post.keywords || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await remove(`/api/blog/${id}`);
      setPosts(posts.filter(p => p.id !== id));
      setMessage('Post deleted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Blog</h1>
      <p className="admin-subtitle">Create, edit, and manage blog posts.</p>
      {message && <div className={message.includes('updated') || message.includes('created') || message.includes('deleted') ? 'success' : 'error'}>{message}</div>}

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h2>{editing ? 'Edit Post' : 'New Post'}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Slug *</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Author</label>
            <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Excerpt</label>
          <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} />
        </div>
        <div className="form-group">
          <label>Content (HTML) *</label>
          <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Tags (JSON array)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder='["tag1","tag2"]' />
          </div>
          <div className="form-group">
            <label>Featured Image</label>
            <input value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>SEO Title</label>
          <input value={form.seo_title} onChange={e => setForm({ ...form, seo_title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Meta Description</label>
          <textarea value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} rows={2} />
        </div>
        <div className="form-group">
          <label>Keywords</label>
          <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="admin-list">
        {posts.map(post => (
          <div key={post.id} className="admin-card">
            <div className="admin-card-header">
              <h3>{post.title}</h3>
              <span className={`status-badge status-${post.status}`}>{post.status}</span>
            </div>
            <p>{post.excerpt}</p>
            <div className="admin-card-actions">
              <button onClick={() => handleEdit(post)} className="btn-primary">Edit</button>
              <button onClick={() => handleDelete(post.id)} className="btn-secondary">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
