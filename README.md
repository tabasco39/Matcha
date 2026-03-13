# Matcha ♡

Application de rencontre full-stack — Node.js / Express / React / MySQL.

---

## Sommaire

1. [Stack technique](#stack-technique)
2. [Structure du projet](#structure-du-projet)
3. [Prérequis](#prérequis)
4. [Installation & démarrage](#installation--démarrage)
5. [Variables d'environnement](#variables-denvironnement)
6. [Base de données](#base-de-données)
7. [API — routes disponibles](#api--routes-disponibles)
8. [Authentification](#authentification)
9. [Upload d'images](#upload-dimages)
10. [Scripts npm](#scripts-npm)

---

## Stack technique

| Couche      | Technologie                          |
|-------------|--------------------------------------|
| Backend     | Node.js 20+, Express 5, ES Modules   |
| Auth        | JWT stocké en cookie `httpOnly`      |
| Base de données | MySQL 8, driver `mysql2/promise` |
| Frontend    | React 18, Vite, React Router v6      |
| Upload      | Multer (stockage local)              |
| Sécurité    | Helmet, CORS, bcryptjs, cookie httpOnly + SameSite |

---

## Structure du projet

```
matcha/
├── server/                  # Backend Node.js / Express
│   ├── server.js            # Point d'entrée — charge .env et lance Express
│   ├── uploads/             # Images uploadées (ignoré par git sauf .gitkeep)
│   └── src/
│       ├── app.js           # Configuration Express (middlewares, routes, static)
│       ├── config/
│       │   ├── database.js  # Pool de connexion MySQL
│       │   └── multer.js    # Configuration upload (5 Mo, images uniquement)
│       ├── controllers/
│       │   ├── AuthController.js   # register, login, logout, me
│       │   ├── UserController.js   # CRUD utilisateurs + updateProfile
│       │   └── ImageController.js  # Upload / liste / suppression images
│       ├── middlewares/
│       │   ├── authMiddleware.js   # Vérifie le JWT dans le cookie
│       │   └── errorHandler.js     # Gestionnaire d'erreurs global
│       ├── models/
│       │   └── UserModel.js        # Requêtes SQL utilisateurs
│       └── routes/
│           ├── index.js            # Agrège toutes les routes sous /api
│           ├── authRoutes.js       # /api/auth/*
│           ├── userRoutes.js       # /api/users/*
│           └── imageRoutes.js      # /api/images/*
│
├── client/                  # Frontend React / Vite
│   └── src/
│       ├── api/
│       │   ├── auth.js      # Appels axios auth (login, register, logout, me)
│       │   └── user.js      # Appels axios profil + images
│       ├── context/
│       │   └── AuthContext.jsx   # État global utilisateur connecté
│       ├── components/
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx     # Découvrir des profils
│           └── Profile.jsx       # Édition profil + photos
│
├── database/
│   └── migration.sql        # Schéma complet de la base de données
├── .env.example             # Modèle de configuration
├── start.sh                 # Script de démarrage guidé
└── package.json             # Dépendances backend + scripts racine
```

---

## Prérequis

- **Node.js** ≥ 20 ([nodejs.org](https://nodejs.org))
- **MySQL** 8 en cours d'exécution
- **npm** ≥ 10

---

## Installation & démarrage

### Option 1 — Script automatique (recommandé)

```bash
chmod +x start.sh
./start.sh
```

Le script vérifie les prérequis, crée le `.env` si absent, installe les dépendances et lance les deux serveurs.

### Option 2 — Manuel

```bash
# 1. Cloner le dépôt
git clone https://github.com/tabasco39/Matcha.git
cd Matcha

# 2. Copier et remplir les variables d'environnement
cp .env.example .env
# → éditer .env (DB_USER, DB_PASSWORD, JWT_SECRET)

# 3. Exécuter la migration SQL
mysql -u <user> -p < database/migration.sql

# 4. Installer les dépendances
npm install
npm install --prefix client

# 5. Lancer en développement (API + frontend en parallèle)
npm run dev:all
```

- **API** → `http://localhost:3000`
- **Frontend** → `http://localhost:5173`

---

## Variables d'environnement

Fichier `.env` à la racine (modèle dans `.env.example`) :

| Variable      | Description                                   | Défaut              |
|---------------|-----------------------------------------------|---------------------|
| `PORT`        | Port du serveur Express                       | `3000`              |
| `DB_HOST`     | Hôte MySQL                                    | `localhost`         |
| `DB_PORT`     | Port MySQL                                    | `3306`              |
| `DB_USER`     | Utilisateur MySQL                             | `root`              |
| `DB_PASSWORD` | Mot de passe MySQL                            | *(vide)*            |
| `DB_NAME`     | Nom de la base de données                     | `matcha`            |
| `JWT_SECRET`  | Clé secrète JWT — **changer en production**   | `change_this_...`   |
| `CLIENT_URL`  | URL autorisée par CORS                        | `http://localhost:5173` |
| `NODE_ENV`    | `development` ou `production`                 | `development`       |

---

## Base de données

Le fichier `database/migration.sql` crée et configure la base complète. Il est idempotent (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) — on peut le relancer sans risque.

### Table `users`

| Colonne      | Type           | Description                                      |
|--------------|----------------|--------------------------------------------------|
| `id`         | INT UNSIGNED   | Clé primaire auto-incrémentée                    |
| `username`   | VARCHAR(50)    | Nom d'utilisateur unique                         |
| `email`      | VARCHAR(255)   | Email unique                                     |
| `password`   | VARCHAR(255)   | Hash bcrypt (coût 12)                            |
| `first_name` | VARCHAR(100)   |                                                  |
| `last_name`  | VARCHAR(100)   |                                                  |
| `bio`        | TEXT           | Description libre                                |
| `birth_date` | DATE           |                                                  |
| `gender`     | VARCHAR(20)    | `homme`, `femme`, `non-binaire`                  |
| `preference` | VARCHAR(20)    | `hommes`, `femmes`, `tout`                       |
| `location`   | VARCHAR(55)    | Ville / pays                                     |
| `interests`  | VARCHAR(500)   | Centres d'intérêt séparés par `\|` (ex: `Jazz\|Photo\|Voyages`) |
| `can_located`| BOOLEAN        | Consentement géolocalisation                     |
| `created_at` | TIMESTAMP      |                                                  |
| `updated_at` | TIMESTAMP      | Mis à jour automatiquement                       |

### Table `images`

Jusqu'à **5 images** par utilisateur. Les fichiers sont stockés dans `server/uploads/`.

| Colonne    | Type         | Description            |
|------------|--------------|------------------------|
| `id`       | INT UNSIGNED | Clé primaire           |
| `path`     | VARCHAR(255) | Nom de fichier (ex: `a3f2...jpg`) |
| `user_id`  | INT UNSIGNED | FK → `users.id` CASCADE DELETE |

---

## API — routes disponibles

### Auth — `/api/auth`

| Méthode | Route             | Auth | Description                        |
|---------|-------------------|------|------------------------------------|
| POST    | `/register`       | —    | Création de compte + cookie JWT    |
| POST    | `/login`          | —    | Connexion + cookie JWT             |
| POST    | `/logout`         | —    | Suppression du cookie              |
| GET     | `/me`             | ✓    | Utilisateur connecté               |

### Utilisateurs — `/api/users`

| Méthode | Route             | Auth | Description                        |
|---------|-------------------|------|------------------------------------|
| PUT     | `/profile`        | ✓    | Mise à jour du profil connecté     |
| GET     | `/`               | —    | Liste tous les utilisateurs        |
| GET     | `/:id`            | —    | Détail d'un utilisateur            |
| POST    | `/`               | —    | Créer un utilisateur (admin)       |
| PUT     | `/:id`            | —    | Modifier un utilisateur (admin)    |
| DELETE  | `/:id`            | —    | Supprimer un utilisateur (admin)   |

### Images — `/api/images`

| Méthode | Route    | Auth | Description                                      |
|---------|----------|------|--------------------------------------------------|
| GET     | `/`      | ✓    | Liste les images de l'utilisateur connecté       |
| POST    | `/`      | ✓    | Upload une image (`multipart/form-data`, champ `image`) — max 5 |
| DELETE  | `/:id`   | ✓    | Supprime une image (vérifie la propriété)        |

Les images sont servies en statique : `http://localhost:3000/uploads/<filename>`

---

## Authentification

Le JWT est signé avec `JWT_SECRET` (durée 7 jours) et stocké dans un cookie `httpOnly` + `SameSite: strict`. Ce mécanisme protège contre les attaques XSS — le JavaScript côté client ne peut pas lire le token.

Le cookie est automatiquement envoyé par axios grâce à `withCredentials: true` configuré dans `client/src/api/auth.js`.

Le middleware `authMiddleware.js` vérifie le cookie sur chaque route protégée et expose `req.user` (id, email, username).

---

## Upload d'images

- Format accepté : tout type `image/*`
- Taille maximale : **5 Mo** par fichier
- Maximum : **5 images** par utilisateur
- Stockage : `server/uploads/` (répertoire local, non versionné)
- Nommage : hash aléatoire 16 octets + extension originale

> En production, remplacer le stockage local par un service cloud (S3, Cloudinary, etc.).

---

## Scripts npm

Depuis la racine du projet :

| Commande         | Description                                    |
|------------------|------------------------------------------------|
| `npm run dev`    | Lance uniquement le serveur Express (nodemon)  |
| `npm run client` | Lance uniquement le frontend Vite              |
| `npm run dev:all`| Lance les deux en parallèle                    |
| `npm start`      | Lance Express en production (`node`)           |
