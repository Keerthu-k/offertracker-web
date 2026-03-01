import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Users,
  BookOpen,
  FileText,
  Github,
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      {/* ── Nav ──────────────────────────────────────── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo">
          <div className="logo-icon">
            <img src="/favicon/favicon.svg" alt="OfferTracker Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
          </div>
          <span className="logo-text">OfferTracker</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-btn-login">Log in</Link>
          <Link to="/signup" className="nav-btn-signup">Sign up</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>A quiet place to track<br />your job search</h1>
          <p className="hero-subtitle">
            Log applications in seconds. See where you stand.
            Share the journey with friends if you want to.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="hero-btn-primary">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── What it does ─────────────────────────────── */}
      <section className="about">
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon" style={{ background: 'rgba(99,102,241,0.08)' }}>
              <Briefcase size={20} color="#6366f1" />
            </div>
            <h3>Track applications</h3>
            <p>Company, role, done. Everything else is optional. It takes seconds, not minutes.</p>
          </div>
          <div className="about-card">
            <div className="about-icon" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <BookOpen size={20} color="#10b981" />
            </div>
            <h3>Reflect &amp; learn</h3>
            <p>Structured stages, notes per round, rejection reasons. Figure out what&apos;s working and what isn&apos;t.</p>
          </div>
          <div className="about-card">
            <div className="about-icon" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <FileText size={20} color="#8b5cf6" />
            </div>
            <h3>Resume versions</h3>
            <p>Track which resume you sent where. See which version gets callbacks.</p>
          </div>
          <div className="about-card">
            <div className="about-icon" style={{ background: 'rgba(245,158,11,0.08)' }}>
              <Users size={20} color="#f59e0b" />
            </div>
            <h3>Share with friends</h3>
            <p>Follow friends, join circles, exchange tips. Not a social network — just people going through the same thing.</p>
          </div>
        </div>
      </section>

      {/* ── Quiet CTA ────────────────────────────────── */}
      <section className="cta-section">
        <p className="cta-text">Free and open. No credit card, no upsell.</p>
        <Link to="/signup" className="cta-link">
          Create an account <ArrowRight size={15} />
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} <a href="https://github.com/Keerthu-k" target="_blank" rel="noopener noreferrer">Keerthana</a> &mdash; OfferTracker
          </p>
          <div className="footer-links">
            <a href="https://github.com/Keerthu-k/offertracker-backend" target="_blank" rel="noopener noreferrer">Backend</a>
            <span className="footer-divider">&middot;</span>
            <a href="https://github.com/Keerthu-k/offertracker-web" target="_blank" rel="noopener noreferrer">Star on GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
