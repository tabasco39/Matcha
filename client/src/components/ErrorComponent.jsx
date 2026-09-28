import { Link } from 'react-router-dom';

export function ErrorComponent({ message, status }){
    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-brand">
                <span className="brand-icon">♡</span>
                <h1>Ooups!!</h1>
                <p>Une erreur est survenue</p>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2> ERREUR { status } </h2>
                        <p> { message } </p>
                    </div>
                    <div className="error-icon">
                        <svg viewBox="0 0 24 24" width="80" height="80" fill="none">
                        {/* Moitié gauche */}
                            <path
                                className="heart-left"
                                d="M12 21s-6.5-4.35-9.5-8.5C.5 9.5 1.5 5.5 5 4.2c2-.75 4 .1 5.2 1.8L12 8.5V21z"
                                fill="#ef4444"
                            />
                        {/* Moitié droite */}
                            <path
                                className="heart-right"
                                d="M12 21s6.5-4.35 9.5-8.5c2-3 1-7-2.5-8.3-2-.75-4 .1-5.2 1.8L12 8.5V21z"
                                fill="#dc2626"
                            />
                        </svg>
                    </div>
                </div>
                <p>
                  <Link to="/login">Aller à la connexion</Link>
                </p>
            </div>
        </div>
    );
}