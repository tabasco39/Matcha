import { useState, useEffect,  } from 'react';
import { resetPassword } from '../api/auth';
import { Link , useNavigate, useSearchParams} from 'react-router-dom';
import { verifyToken } from '../api/auth';
import { ErrorComponent } from '../components/ErrorComponent.jsx';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [form, setForm] = useState({ newpassword: '', confirmnewpassword: '' });
  
    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    useEffect(() => {
        if (!token) {
            setError('Invalid Link: Token not found');
            setLoading(false);
            return;
        }
        const verify = async () => {
        try {
            const res = await verifyToken(token);
            if (res.status != 200)
            {
                setError(res.status);
                setMessage(res.data.message);
            }
            else
                setMessage(res.data.message)
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
        };
        verify();
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("Submit ---------------");
            const res = await resetPassword({...form, token});
            console.log("status = ", res.status);
            console.log("Data = ", res.data);
            if (res.status != 200)
            {
                setError(res.status);
                setMessage(res.data.message);
            }
            else
                navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
            setMessage('');
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
                { error ? (
                            <ErrorComponent message={ message } status={ error } />
                ) : (
                    <div className="auth-right">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2>Bienvenu sur la changement de votre mot de passe</h2>
                                <p>Entrez votre nouveau mot de passe.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="newpassword">Nouveau mot de passe</label>
                                    <input
                                        id="newpassword"
                                        name="newpassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.newpassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmnewpassword">Confirme mot de passe</label>
                                    <input
                                        id="confirmnewpassword"
                                        name="confirmnewpassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.confirmnewpassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? <span className="btn-spinner" /> : 'Changer le mot de passe'}
                                </button>
                            </form>
                            <p className="auth-switch">
                                Tu as changé d'avis?{' '}
                                <Link to="/login">Retour</Link>
                            </p>
                        </div>
                    </div>
                )}
        </div>
    );
}