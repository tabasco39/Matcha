import { useState, useEffect} from 'react';
import { forgotPassword } from '../api/auth';
import { Link } from 'react-router-dom';
import { ErrorComponent } from '../components/ErrorComponent.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await forgotPassword(email);
        setMessage(res.data.message);
        setSuccess(true);
        setError('');       
    } catch (err) {
        setError(err.response?.status || 'An error occurred');
        setMessage(err.response?.data?.message || 'An error occurred');
    } finally {
        setLoading(false);
    }
  };
    if (!success && message) {
        return <ErrorComponent message={message} status={error} />;
    }

  return (
    <div className="auth-page">
        <div className="auth-left">
            <div className="auth-brand">
                <span className="brand-icon">♡</span>
                <h1>Matcha</h1>
                <p>Commencez votre histoire d'amour aujourd'hui.</p>
            </div>
        </div>
            { success ? (
                <div className="auth-right">
                    <div className="auth-card">
                        <center>
                        <div className="auth-header">
                            <h2>Email envoyé !</h2>
                            <p>
                            Un lien de réinitialisation de mot de passe a été envoyé à : 
                            <strong className="success-email">{email}</strong>
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
                            <p className="auth-switch">{message}
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
                            <h2>Mot de passe oublié</h2>
                            <p>Entrez votre adresse e-mail pour recevoir
                            un lien de réinitialisation de mot de passe.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <span className="btn-spinner" /> : 'Envoyer le lien'}
                            </button>
                        </form>
                        <p className="auth-switch">
                            Si vous voulez revenir à la connexion,{' '}
                            <Link to="/login">Se connecter</Link>
                        </p>
                    </div>
                </div>
            )}
    </div>
  );
}