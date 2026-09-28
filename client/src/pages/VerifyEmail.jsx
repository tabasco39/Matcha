import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyToken, verifyEmail } from '../api/auth';
import { ErrorComponent } from '../components/ErrorComponent.jsx';


export default function VerifyEmail() {

    const [searchParams] = useSearchParams();
    const token_mail = searchParams.get('token');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token_mail) {
            setError('Invalid Link: Token not found');
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                  const res = await verifyToken(token_mail);
                  const result = await verifyEmail(token_mail);
                  setMessage(res.data, result.data);
                  setSuccess(true);
            } catch (err) {
                setError(err.response?.status);
                setMessage(err.response?.data?.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token_mail]);
    if (error && message) {
      return <ErrorComponent message={message} status={error} />;
    }
    return (
        <div className="verify-email-page">
        <div className="verify-email-card">
          {loading && <div className="spinner" />}
          {!loading && success && (
            <div className="verify-success">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="80" height="80" fill="none">
                  <circle className="success-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path className="success-check" d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="IsMailVerified">
                <h2>Votre email a été vérifié !</h2>
                <p>
                  Vous pouvez maintenant vous connecter à votre compte.{' '}
                  <Link to="/login">Aller à la connexion</Link>
                </p>
              </div>
            </div>
          )}
          {!loading && error && <p className="error-message">{error}</p>}
      </div>
    </div>
    );
}