import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../services/api';
import './Services.css';

export default function Services() {
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      get('/api/services'),
      get('/api/testimonials')
    ])
      .then(([svc, test]) => {
        setServices(svc);
        setTestimonials(test);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive digital marketing solutions designed to help your brand grow, engage, and convert.</p>
        </div>
      </section>

      <section className="services-list">
        <div className="container">
          <div className="services-cards">
            {services.map(service => {
              const features = typeof service.features === 'string' 
                ? JSON.parse(service.features || '[]') 
                : (service.features || []);
              return (
                <div key={service.id} className="service-card">
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  {features.length > 0 && (
                    <ul className="service-features">
                      {features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="services-testimonials">
          <div className="container">
            <h2>Client Success Stories</h2>
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
      )}

      <section className="services-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to Transform Your Digital Presence?</h2>
            <p>Let's discuss how our services can help you achieve your goals.</p>
            <Link to="/contact" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
