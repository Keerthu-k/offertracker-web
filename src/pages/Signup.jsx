import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  AlertCircle,
  AtSign,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ display_name: '', username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        display_name: form.display_name || null,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back">
          <ArrowLeft size={14} /> Home
        </Link>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <img src="/favicon/favicon.svg" alt="OfferTracker Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
          </div>
          <span>OfferTracker</span>
        </div>

        <h1>Create an account</h1>
        <p className="auth-desc">Start tracking in under 30 seconds.</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="display_name">Display Name <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
            <div className="input-wrap">
              <User size={15} className="input-icon" />
              <input
                id="display_name"
                name="display_name"
                type="text"
                placeholder="Your display name"
                value={form.display_name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="username">Username *</label>
            <div className="input-wrap">
              <AtSign size={15} className="input-icon" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="unique_handle"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email *</label>
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password *</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'} {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
