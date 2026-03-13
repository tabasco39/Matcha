import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getMyImages, uploadImage, deleteImage } from '../api/user.js';

const API_URL = 'http://localhost:3000';
const MAX_IMAGES = 5;

const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'non-binaire', label: 'Non-binaire' },
];

const PREFERENCES = [
  { value: 'hommes', label: 'Hommes' },
  { value: 'femmes', label: 'Femmes' },
  { value: 'tout', label: 'Tout le monde' },
];

const parseInterests = (str) =>
  str ? str.split('|').map((s) => s.trim()).filter(Boolean) : [];

const joinInterests = (arr) => arr.join('|');

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    first_name: user?.first_name  || '',
    last_name:  user?.last_name   || '',
    bio:        user?.bio         || '',
    birth_date: user?.birth_date  ? user.birth_date.slice(0, 10) : '',
    gender:     user?.gender      || '',
    preference: user?.preference  || '',
    location:   user?.location    || '',
  });

  const [interests,     setInterests]     = useState(parseInterests(user?.interests));
  const [interestInput, setInterestInput] = useState('');

  const [images,     setImages]     = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [imageError, setImageError] = useState('');

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyImages()
      .then((res) => setImages(res.data.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError('');
  };

  const addInterest = (value) => {
    const trimmed = value.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 20) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setInterestInput('');
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '|') {
      e.preventDefault();
      addInterest(interestInput);
    } else if (e.key === 'Backspace' && !interestInput && interests.length) {
      setInterests((prev) => prev.slice(0, -1));
    }
  };

  const removeInterest = (tag) =>
    setInterests((prev) => prev.filter((t) => t !== tag));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    if (images.length >= MAX_IMAGES) {
      setImageError('Maximum 5 images autorisées');
      return;
    }

    setUploading(true);
    setImageError('');
    try {
      await uploadImage(file);
      const res = await getMyImages();
      setImages(res.data.data);
    } catch (err) {
      setImageError(err.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      setImageError('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await updateProfile({ ...form, interests: joinInterests(interests) });
      setUser(res.data.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-icon-sm">♡</span>
          <span className="brand-name">Matcha</span>
        </div>
        <nav className="header-nav">
          <button className="nav-btn" title="Découvrir" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className="nav-btn active" title="Profil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </nav>
        <div className="header-user">
          <div className="user-avatar-sm">{user?.first_name?.[0]?.toUpperCase()}</div>
          <span className="user-greeting">{user?.first_name} {user?.last_name}</span>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-page-card">

          {/* Hero */}
          <div className="profile-page-hero">
            <div className="profile-hero-avatar">
              {images[0]
                ? <img src={`${API_URL}/uploads/${images[0].path}`} alt="avatar" className="profile-hero-img" />
                : user?.first_name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <h2 className="profile-hero-name">{user?.first_name} {user?.last_name}</h2>
              <p className="profile-hero-username">@{user?.username}</p>
            </div>
          </div>

          {/* Photos */}
          <section className="profile-images-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">Photos</h3>
              <span className="images-count">{images.length} / {MAX_IMAGES}</span>
            </div>

            <div className="images-grid">
              {images.map((img) => (
                <div key={img.id} className="image-thumb">
                  <img src={`${API_URL}/uploads/${img.path}`} alt="profil" />
                  <button
                    type="button"
                    className="image-delete"
                    onClick={() => handleDeleteImage(img.id)}
                    aria-label="Supprimer"
                  >✕</button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  className="image-add"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading
                    ? <span className="btn-spinner" style={{ borderColor: 'rgba(139,26,74,.2)', borderTopColor: 'var(--rose)' }} />
                    : <><span className="image-add-icon">+</span><span>Ajouter</span></>
                  }
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {imageError && <p className="form-error" style={{ marginTop: '0.5rem' }}>{imageError}</p>}
          </section>

          {/* Form */}
          <form className="profile-form" onSubmit={handleSubmit}>
            <h3 className="profile-section-title">Informations personnelles</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Votre prénom" required />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Votre nom" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                  <option value="">Sélectionner…</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Préférence</label>
                <select name="preference" value={form.preference} onChange={handleChange} className="form-select">
                  <option value="">Sélectionner…</option>
                  {PREFERENCES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date de naissance</label>
                <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="form-date" />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="Paris, France" />
              </div>
            </div>

            <h3 className="profile-section-title" style={{ marginTop: '0.25rem' }}>À propos de moi</h3>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Parlez de vous en quelques mots…"
                className="form-textarea"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Centres d'intérêt</label>
              <div className="interest-input-wrap">
                {interests.map((tag) => (
                  <span key={tag} className="interest-tag">
                    {tag}
                    <button type="button" onClick={() => removeInterest(tag)} aria-label="Retirer">×</button>
                  </span>
                ))}
                <input
                  className="interest-input"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  onBlur={() => interestInput.trim() && addInterest(interestInput)}
                  placeholder={interests.length ? '' : 'Voyages, Jazz, Photo…'}
                />
              </div>
              <p className="field-hint">Entrée ou virgule pour valider · Retour arrière pour supprimer</p>
            </div>

            {error   && <p className="form-error">{error}</p>}
            {success && <p className="form-success">Profil mis à jour avec succès !</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Enregistrer'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
