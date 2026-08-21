import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '../services/api';
import './BlogPost.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get(`/api/blog/${slug}`)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading">Loading...</div>;

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="error-state">
            <h1>Post Not Found</h1>
            <p>The blog post you are looking for does not exist or has been removed.</p>
            <Link to="/blog" className="btn-primary">Back to Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);

  return (
    <div className="blog-post-page">
      <article className="blog-post">
        {post.featured_image && (
          <div className="post-featured-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}
        <header className="post-header">
          <div className="container">
            <Link to="/blog" className="back-link">← Back to Blog</Link>
            <span className="post-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span>
            </div>
          </div>
        </header>

        <div className="post-content">
          <div className="container">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            {tags.length > 0 && (
              <div className="post-tags">
                {tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="post-cta">
          <div className="container">
            <h3>Enjoyed this article?</h3>
            <p>Share it with your network or explore more insights on our blog.</p>
            <div className="post-actions">
              <Link to="/blog" className="btn-primary">More Articles</Link>
              <Link to="/contact" className="btn-secondary">Work With Us</Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
