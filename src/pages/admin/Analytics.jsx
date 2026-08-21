import { useState, useEffect } from 'react';
import { get } from '../../services/api';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/api/analytics')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics...</div>;

  const metrics = [
    { label: 'Total Blog Posts', value: stats?.total_posts || 0 },
    { label: 'Published Posts', value: stats?.published_posts || 0 },
    { label: 'Total Services', value: stats?.total_services || 0 },
    { label: 'Testimonials', value: stats?.total_testimonials || 0 },
    { label: 'Calendar Items', value: stats?.total_calendar_items || 0 },
    { label: 'Scheduled Content', value: stats?.scheduled_items || 0 },
    { label: 'Draft Content', value: stats?.draft_items || 0 }
  ];

  return (
    <div className="admin-page">
      <h1>Analytics</h1>
      <p className="admin-subtitle">Website performance overview.</p>

      <div className="analytics-grid">
        {metrics.map(metric => (
          <div key={metric.label} className="analytics-card">
            <span className="analytics-value">{metric.value}</span>
            <span className="analytics-label">{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="analytics-note">
        <p>For detailed traffic analytics, integrate Google Analytics by adding your tracking ID in the Settings page.</p>
      </div>
    </div>
  );
}
