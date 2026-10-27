import {useLocation, Link } from 'react-router-dom'

export default function ErrorPage(){
    const location = useLocation();
    const { status, message } = location.state || {};

    return (
        <div className="error-page">
            <div className="error-content">
                <div className="auth-brand">
                    {/* <span className="brand-icon">♡</span> */}
                    <h1>Ooups!! erreur { status } </h1>
                    <p> { message } </p>
                </div>
                <div className="error-icon">
                    <svg viewBox="0 0 200 190" width="220" height="200" fill="none">
                        {/* Moitié gauche du cœur */}
                        <path
                        className="heart-left"
                        d="M100,170
                            C100,170 20,110 20,60
                            C20,25 50,10 75,20
                            C88,25 95,40 100,55
                            L92,75 L104,95 L90,115 L100,135 L96,150 L100,170 Z"
                        fill="#B5436A"
                        />
                        {/* Moitié droite du cœur */}
                        <path
                        className="heart-right"
                        d="M100,170
                            C100,170 180,110 180,60
                            C180,25 150,10 125,20
                            C112,25 105,40 100,55
                            L108,75 L96,95 L110,115 L100,135 L104,150 L100,170 Z"
                        fill="#B5436A"
                        />
                        {/* Petits éclats qui tombent */}
                        <rect className="shard shard-1" x="85" y="175" width="10" height="8" fill="#e63946" />
                        <rect className="shard shard-2" x="105" y="180" width="6" height="5" fill="#d62839" />
                    </svg>
                </div>
                <p className="error-link">
                    <Link to="/login">Aller à la connexion</Link>
                </p>
            </div>
        </div>
    );
}