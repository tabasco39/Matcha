import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { likeUser, unlikeUser } from '../api/likes';

const MOCK_PROFILES = [
  { id: 1, name: 'Sophie', age: 26, bio: 'Passionnée de voyages et de photographie. Aime les soirées jazz et les cafés parisiens.', tags: ['Voyages', 'Photo', 'Jazz'], avatar: 'S' },
  { id: 2, name: 'Lucas', age: 29, bio: 'Cuisinier amateur, lecteur invétéré. À la recherche d\'une âme avec qui partager de bons repas.', tags: ['Cuisine', 'Lecture', 'Art'], avatar: 'L' },
  { id: 3, name: 'Chloé', age: 24, bio: 'Danseuse contemporaine. La vie est trop courte pour ne pas vivre pleinement chaque moment.', tags: ['Danse', 'Musique', 'Nature'], avatar: 'C' },
  { id: 4, name: 'Antoine', age: 31, bio: 'Architecte de jour, astronome amateur de nuit. Curieux de tout, ouvert à tout.', tags: ['Architecture', 'Astronomie', 'Randonnée'], avatar: 'A' },
];

const isProfileIncomplete = (user) =>
  !user?.bio || !user?.gender || !user?.preference;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLike = async (profileId) => {
    try {
      const res = await likeUser(profileId);
      setLikedProfiles((prev) => [...prev, profileId]);
      if (res.data.match) {
        alert(`C'est un match avec ${MOCK_PROFILES.find(p => p.id === profileId)?.name} !`);
      }
    } catch (err) {
      console.error('Erreur lors du like:', err);
    }
  }

  const handleUnlike = async (profileId) => {
    try {
      await unlikeUser(profileId);
      setLikedProfiles((prev) => prev.filter(id => id !== profileId));
    } catch (err) {
      console.error('Erreur lors du unlike:', err);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-icon-sm">♡</span>
          <span className="brand-name">Matcha</span>
        </div>
        <nav className="header-nav">
          <button className="nav-btn active" title="Découvrir">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </button>
          <button className="nav-btn" title="Messages">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button className="nav-btn" title="Profil" onClick={() => navigate('/profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </nav>
        <div className="header-user">
          <div className="user-avatar-sm">{user?.first_name?.[0]?.toUpperCase()}</div>
          <span className="user-greeting">Bonjour, {user?.first_name}</span>
          <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      {isProfileIncomplete(user) && !bannerDismissed && (
        <div className="profile-banner">
          <div className="profile-banner-content">
            <span className="profile-banner-icon">✦</span>
            <div>
              <strong>Votre profil est incomplet</strong>
              <p>Complétez votre profil pour apparaître dans les suggestions et trouver des correspondances.</p>
            </div>
          </div>
          <div className="profile-banner-actions">
            <button className="banner-btn-primary" onClick={() => navigate('/profile')}>
              Compléter mon profil
            </button>
            <button className="banner-btn-dismiss" onClick={() => setBannerDismissed(true)} aria-label="Fermer">
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        <div className="discover-header">
          <h2>Découvrir</h2>
          <p>Des profils qui pourraient vous correspondre</p>
        </div>

        <div className="profiles-grid">
          {MOCK_PROFILES.map((profile) => (
            <div key={profile.id} className="profile-card">
              <div className="profile-avatar">{profile.avatar}</div>
              <div className="profile-info">
                <div className="profile-name-row">
                  <h3>{profile.name}</h3>
                  <span className="profile-age">{profile.age} ans</span>
                </div>
                <p className="profile-bio">{profile.bio}</p>
                <div className="profile-tags">
                  {profile.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="profile-actions">
                <button className="action-btn dislike" title="Passer" onClick={handleUnlike(profile.id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button className="action-btn like" title="J'aime" onClick={handleLike(profile.id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
