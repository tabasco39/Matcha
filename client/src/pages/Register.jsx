import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    birth_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">♡</span>
          <h1>Matcha</h1>
          <p>Commencez votre histoire d'amour aujourd'hui.</p>
        </div>
      </div>

      {success ? (
        <div className="auth-right">
          <div className="auth-card">
            <center>
              <div className="auth-header">
                <h2>Inscription réussie !</h2>
                <p>
                  Ton compte Matcha a été créé avec : 
                  <strong className="success-email">{form.email}</strong>
                </p>
              </div>
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="56" height="56" fill="none">
                  <circle
                    className="success-circle"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="2"
                  />
                  <path
                    className="success-check"
                    d="M8 12.5l2.5 2.5L16 9"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="success-message">
                <p className="auth-switch">{success}
                  <Link to="/login"> Aller à la connexion</Link>
                </p>
              </div>
            </center>
          </div>
        </div>
      ) : (
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Créer un compte</h2>
              <p>Rejoignez des milliers de personnes qui se connectent</p>
            </div>
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="first_name">Prénom</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Marie"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Nom</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Dupont"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="marie_d"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birth_date">Date de naissance</label>
                <input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={form.birth_date}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : 'Créer mon compte'}
              </button>
            </form>
            <p className="auth-switch">
              Déjà un compte ?{' '}
              <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
