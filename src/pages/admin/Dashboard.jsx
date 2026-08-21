import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../../services/api';
import FeaturedVideo from '../../components/FeaturedVideo';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      get('/api/analytics'),
      get('/api/blog/all'),
      get('/api/calendar/upcoming'),
      get('/api/site-settings')
    ])
      .then(([analytics, posts, upcomingData, siteSettings]) => {
        if (!cancelled) {
          setStats(analytics);
          setRecentPosts(posts.slice(0, 5));
          setUpcoming(upcomingData);
          setSettings(siteSettings);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Blog Posts', value: stats?.total_posts || 0, link: '/admin/blog', color: 'var(--text)' },
    { label: 'Published Posts', value: stats?.published_posts || 0, link: '/admin/blog', color: 'var(--text)' },
    { label: 'Scheduled Content', value: stats?.scheduled_items || 0, link: '/admin/calendar', color: 'var(--text-muted)' },
    { label: 'Draft Content', value: stats?.draft_items || 0, link: '/admin/calendar', color: 'var(--text-muted)' },
    { label: 'Services', value: stats?.total_services || 0, link: '/admin/services', color: 'var(--text)' },
    { label: 'Testimonials', value: stats?.total_testimonials || 0, link: '/admin/testimonials', color: 'var(--text)' }
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

      {settings && settings.featured_video_url && (
        <div className="dashboard-section">
          <h2>Featured Learning Video</h2>
          <FeaturedVideo
            title={settings.featured_video_title}
            description={settings.featured_video_description}
            youtubeUrl={settings.featured_video_url}
          />
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="dashboard-section">
          <h2>Upcoming Content</h2>
          <div className="upcoming-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Content</th>
                  <th>Platform</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 5).map(item => (
                  <tr key={item.id}>
                    <td>{item.scheduled_date ? new Date(item.scheduled_date + 'T00:00:00').toLocaleDateString() : '-'}</td>
                    <td>{item.title}</td>
                    <td>{item.platform}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/calendar" className="dashboard-more-link">View Calendar →</Link>
        </div>
      )}

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
