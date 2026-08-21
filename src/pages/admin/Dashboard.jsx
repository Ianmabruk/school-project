import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get('/api/analytics'),
      get('/api/blog/all')
    ])
      .then(([analytics, posts]) => {
        setStats(analytics);
        setRecentPosts(posts.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Blog Posts', value: stats?.total_posts || 0, link: '/admin/blog', color: 'var(--orange)' },
    { label: 'Published Posts', value: stats?.published_posts || 0, link: '/admin/blog', color: 'var(--success)' },
    { label: 'Scheduled Content', value: stats?.scheduled_items || 0, link: '/admin/calendar', color: '#1976D2' },
    { label: 'Draft Content', value: stats?.draft_items || 0, link: '/admin/calendar', color: 'var(--text-muted)' },
    { label: 'Services', value: stats?.total_services || 0, link: '/admin/services', color: 'var(--orange)' },
    { label: 'Testimonials', value: stats?.total_testimonials || 0, link: '/admin/testimonials', color: 'var(--orange)' }
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">Overview of your digital marketing website.</p>

      <div className="stats-grid">
        {statCards.map(card => (
          <Link key={card.label} to={card.link} className="stat-card" style={{ borderTopColor: card.color }}>
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Recent Blog Posts</h2>
        <div className="recent-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>
                    <span className={`status-badge status-${post.status}`}>{post.status}</span>
                  </td>
                  <td>{post.category}</td>
                  <td>{post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No posts yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
