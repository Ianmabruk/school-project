import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/api/blog')
      .then(setPosts)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <h1>Digital Marketing Blog</h1>
          <p>Insights, tips, and strategies to help you stay ahead in the digital marketing landscape.</p>
        </div>
      </section>

      <section className="blog-list">
        <div className="container">
          <div className="blog-grid">
            {posts.map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-image">
                  {post.featured_image ? (
                    <img src={post.featured_image} alt={post.title} className="blog-featured-img" loading="lazy" />
                  ) : (
                    <div className="blog-placeholder">
                      <svg viewBox="0 0 300 200" fill="none">
                        <rect width="300" height="200" fill="var(--vanilla)" rx="8"/>
                        <rect x="100" y="70" width="100" height="60" rx="8" fill="var(--text)" opacity="0.06"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="blog-content">
                  <span className="blog-category">{post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <div className="blog-meta">
                    <span>{post.author}</span>
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="blog-link">Read More →</Link>
                </div>
              </article>
            ))}
          </div>
          {posts.length === 0 && (
            <p className="no-posts">No blog posts published yet. Check back soon!</p>
          )}
        </div>
      </section>
    </div>
  );
}
