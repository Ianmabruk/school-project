import './About.css';

export default function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="container">
          <h1>About Nova360 Digital</h1>
          <p>We are a team of passionate digital marketers, strategists, and creatives dedicated to helping businesses thrive in the digital age.</p>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>Founded with a vision to democratize digital marketing for businesses of all sizes, Nova360 Digital has grown from a small consultancy into a full-service digital marketing agency.</p>
              <p>We believe that every business deserves access to world-class digital marketing strategies, regardless of budget or industry. Our approach combines creativity with data-driven insights to deliver measurable results.</p>
              <p>Today, we serve clients across Kenya and beyond, helping them build their brands, engage their audiences, and grow their revenues through strategic digital marketing.</p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <svg viewBox="0 0 400 300" fill="none">
                  <rect width="400" height="300" fill="var(--vanilla)" rx="12"/>
                  <circle cx="200" cy="120" r="60" fill="var(--text)" opacity="0.06"/>
                  <rect x="140" y="190" width="120" height="10" rx="5" fill="var(--text)" opacity="0.1"/>
                  <rect x="160" y="210" width="80" height="6" rx="3" fill="var(--text-muted)" opacity="0.08"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <h3>Our Mission</h3>
              <p>To empower businesses with innovative digital marketing strategies that drive growth, build meaningful connections, and create lasting impact in the digital landscape.</p>
            </div>
            <div className="mission-card">
              <h3>Our Vision</h3>
              <p>To be the leading digital marketing partner for brands across Africa, recognized for our creativity, integrity, and results-driven approach.</p>
            </div>
            <div className="mission-card">
              <h3>Our Values</h3>
              <ul>
                <li>Integrity in everything we do</li>
                <li>Creativity without compromise</li>
                <li>Data-driven decision making</li>
                <li>Client success is our success</li>
                <li>Continuous learning and adaptation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Let's Work Together</h2>
            <p>Ready to take your digital presence to the next level? We would love to hear from you.</p>
            <a href="/contact" className="btn-primary">Get In Touch</a>
          </div>
        </div>
      </section>
    </div>
  );
}
