import { useState } from 'react';
import { post } from '../services/api';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await post('/api/contact', form);
      setStatus({ type: 'success', message: 'Thank you! Your message has been sent successfully. We will get back to you soon.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have a project in mind? Let's discuss how we can help you achieve your digital marketing goals.</p>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>We would love to hear from you. Fill out the form and our team will get back to you within 24 hours.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <h4>Email</h4>
                  <p>hello@nova360digital.com</p>
                </div>
                <div className="contact-item">
                  <h4>Phone</h4>
                  <p>+254 700 000 000</p>
                </div>
                <div className="contact-item">
                  <h4>Location</h4>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>

              <div className="contact-map">
                <div className="map-placeholder">
                  <svg viewBox="0 0 400 200" fill="none">
                    <rect width="400" height="200" fill="var(--vanilla)" rx="8"/>
                    <circle cx="200" cy="100" r="30" fill="var(--text)" opacity="0.08"/>
                    <circle cx="200" cy="100" r="8" fill="var(--text)" opacity="0.15"/>
                  </svg>
                  <p>Google Maps Integration</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send Us a Message</h2>
                {status.message && (
                  <div className={status.type === 'error' ? 'error' : 'success'}>
                    {status.message}
                  </div>
                )}
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary submit-btn" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
