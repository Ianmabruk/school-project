import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api';
import './Home.css';

export default function Home() {
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get('/api/services'),
      get('/api/blog?status=published'),
      get('/api/testimonials')
    ])
      .then(([svc, blog, test]) => {
        setServices(svc);
        setPosts(blog.slice(0, 3));
        setTestimonials(test);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>We Help Brands Grow Through Strategic Digital Marketing</h1>
            <p>Nova360 Digital is your partner in building meaningful connections, driving engagement, and achieving measurable results across every digital channel.</p>
            <div className="hero-buttons">
              <Link to="/services" className="btn-primary">Explore Services</Link>
              <Link to="/contact" className="btn-secondary">Get In Touch</Link>
            </div>
          </div>
          <div className="hero-image">
              <div className="hero-placeholder">
                <svg viewBox="0 0 400 300" fill="none">
                  <rect width="400" height="300" fill="var(--vanilla)" rx="12"/>
                  <circle cx="200" cy="120" r="50" fill="var(--text)" opacity="0.08"/>
                  <rect x="120" y="180" width="160" height="12" rx="6" fill="var(--text)" opacity="0.1"/>
                  <rect x="140" y="200" width="120" height="8" rx="4" fill="var(--text-muted)" opacity="0.1"/>
                </svg>
              </div>
          </div>
        </div>
      </section>

      <section className="section intro">
        <div className="container">
          <h2>Welcome to Nova360 Digital</h2>
          <p>We are a team of passionate digital marketers, strategists, and creatives dedicated to helping businesses thrive in the digital age. From social media to SEO, content marketing to brand strategy, we deliver comprehensive solutions tailored to your unique goals.</p>
        </div>
      </section>

      <section className="section services">
        <div className="container">
          <h2>Our Services</h2>
          <p className="section-subtitle">Comprehensive digital marketing solutions to elevate your brand.</p>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/services" className="service-link">Learn more →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-us">
        <div className="container">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Data-Driven Strategies</h3>
              <p>Every decision we make is backed by data and analytics to ensure maximum ROI.</p>
            </div>
            <div className="feature">
              <h3>Creative Excellence</h3>
              <p>Our team combines creativity with strategy to produce content that resonates.</p>
            </div>
            <div className="feature">
              <h3>Transparent Reporting</h3>
              <p>We believe in full transparency with regular reports on campaign performance.</p>
            </div>
            <div className="feature">
              <h3>Dedicated Support</h3>
              <p>You get a dedicated team that knows your business and is invested in your success.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section video">
        <div className="container">
          <h2>See Our Work In Action</h2>
          <p className="section-subtitle">Watch how we transform brands through digital marketing.</p>
          <div className="video-placeholder">
            <div className="video-box">
               <svg viewBox="0 0 600 340" fill="none">
                  <rect width="600" height="340" fill="var(--vanilla)" rx="12"/>
                  <circle cx="300" cy="170" r="40" fill="var(--text)" opacity="0.08"/>
                  <polygon points="292,155 292,185 315,170" fill="var(--text)" opacity="0.2"/>
                </svg>
              <p className="video-text">Promotional Video Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section blog">
        <div className="container">
          <h2>Latest Insights</h2>
          <p className="section-subtitle">Stay updated with the latest digital marketing trends and strategies.</p>
          <div className="blog-grid">
            {posts.map(post => (
              <article key={post.id} className="blog-card">
                <div className="blog-image">
                  <div className="blog-placeholder">
                      <svg viewBox="0 0 300 200" fill="none">
                        <rect width="300" height="200" fill="var(--vanilla)" rx="8"/>
                        <rect x="100" y="70" width="100" height="60" rx="8" fill="var(--text)" opacity="0.06"/>
                      </svg>
                  </div>
                </div>
                <div className="blog-content">
                  <span className="blog-category">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="blog-link">Read More →</Link>
                </div>
              </article>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/blog" className="btn-primary">View All Posts</Link>
          </div>
        </div>
      </section>

      <section className="section testimonials">
        <div className="container">
          <h2>What Our Clients Say</h2>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.id} className="testimonial-card">
                <p>"{t.content}"</p>
                <div className="testimonial-author">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Grow Your Brand?</h2>
            <p>Let's discuss how we can help you achieve your digital marketing goals.</p>
            <Link to="/contact" className="btn-primary">Start The Conversation</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
