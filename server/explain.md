# Architecture du serveur — Model / Routes / Controller

Ce document explique comment le serveur Matcha est organisé selon le principe
**Model – Routes – Controller** (une variante de l'architecture MVC côté back-end,
sans la partie « View » puisque c'est une API).

L'idée centrale : **séparer les responsabilités**. Chaque couche a un seul rôle,
ce qui rend le code plus lisible, testable et maintenable.

---

## 1. Vue d'ensemble

```
Requête HTTP du client (React)
        │
        ▼
┌─────────────────┐
│     ROUTES      │   « Quelle URL ? Quelle méthode ? »  → aiguille vers le bon Controller
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   MIDDLEWARES   │   (optionnel) vérifie l'auth, uploade un fichier, etc.
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   CONTROLLER    │   « Que faire ? »  → logique métier, validation, réponse HTTP
└─────────────────┘
        │
        ▼
┌─────────────────┐
│      MODEL      │   « Comment parler à la base ? »  → requêtes SQL uniquement
└─────────────────┘
        │
        ▼
   Base de données MySQL
```

Chaque flèche vers le bas est un appel de fonction ; la réponse remonte ensuite
dans l'autre sens jusqu'au client.

---

## 2. Structure des dossiers

```
server/
├── server.js                  # Point d'entrée : démarre le serveur
└── src/
    ├── app.js                 # Configuration d'Express (middlewares globaux)
    ├── config/
    │   ├── database.js        # Connexion (pool) MySQL
    │   └── multer.js          # Configuration de l'upload d'images
    ├── routes/
    │   ├── index.js           # Regroupe toutes les routes sous /api
    │   ├── authRoutes.js      # /api/auth/...
    │   ├── userRoutes.js      # /api/users/...
    │   └── imageRoutes.js     # /api/images/...
    ├── controllers/
    │   ├── AuthController.js   # Logique d'inscription/connexion
    │   ├── UserController.js   # Logique CRUD des utilisateurs
    │   └── ImageController.js  # Logique des images
    ├── models/
    │   └── UserModel.js        # Accès aux données de la table `users`
    └── middlewares/
        ├── authMiddleware.js   # Vérifie le token JWT
        └── errorHandler.js     # Gestion centralisée des erreurs
```

---

## 3. Les trois couches en détail

### 🟦 ROUTES — « Quelle URL correspond à quelle action ? »

Une route ne fait **aucune logique**. Elle se contente d'associer une méthode HTTP
+ une URL à une fonction de Controller (avec éventuellement des middlewares au passage).

`src/routes/authRoutes.js` :

```js
import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login',    AuthController.login);
router.post('/logout',   AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);  // ← middleware avant le controller

export default router;
```

Lecture de la dernière ligne : *« Quand une requête `GET /me` arrive, passe d'abord
par `authMiddleware` (vérifie que l'utilisateur est connecté), puis exécute
`AuthController.me`. »*

Toutes les routes sont regroupées dans `src/routes/index.js` et préfixées par thème :

```js
router.use('/auth',   authRoutes);   // → /api/auth/...
router.use('/users',  userRoutes);   // → /api/users/...
router.use('/images', imageRoutes);  // → /api/images/...
```

Comme `app.js` monte ce routeur sous `/api`, l'URL finale de la connexion est donc :
**`POST /api/auth/login`**.

---

### 🟩 CONTROLLER — « Que faut-il faire concrètement ? »

Le Controller contient la **logique métier** : il lit la requête (`req`), valide les
données, appelle le(s) Model(s) nécessaire(s), puis construit la réponse (`res`).
Il ne parle **jamais directement à la base de données** — il passe toujours par un Model.

Exemple, `AuthController.login` (extrait de `src/controllers/AuthController.js`) :

```js
static async login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Validation des entrées
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    // 2. On demande la donnée au MODEL (pas de SQL ici !)
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    // 3. Logique métier : vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    // 4. Créer un token et le poser dans un cookie
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username },
                           process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);

    // 5. Construire la réponse HTTP (sans renvoyer le mot de passe)
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);   // ← délègue à errorHandler en cas d'erreur inattendue
  }
}
```

Points à retenir :
- Le Controller **orchestre** : validation → appel Model → mise en forme de la réponse.
- Il gère les codes HTTP (`400`, `401`, `201`, `404`…).
- En cas d'erreur imprévue, il fait `next(err)` pour laisser le middleware
  `errorHandler` répondre — pas de `try/catch` dupliqué partout.

---

### 🟥 MODEL — « Comment lire/écrire dans la base ? »

Le Model est la **seule** couche qui connaît le SQL et la structure des tables.
Il expose des méthodes simples (`findById`, `create`, `update`…) que les Controllers
utilisent sans se soucier de la base.

`src/models/UserModel.js` :

```js
import db from '../config/database.js';

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await db.query('INSERT INTO users SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    const [result] = await db.query('UPDATE users SET ? WHERE id = ?', [data, id]);
    return result.affectedRows;
  }
  // ... findAll, findById, findByUsername, delete
}

export default UserModel;
```

Avantages de cette isolation :
- Si demain on change la base (colonnes, index, voire moteur), **seul le Model change**.
  Les Controllers ne bougent pas.
- Les requêtes utilisent des **paramètres préparés** (`?`), ce qui protège contre
  les injections SQL.
- Le SQL est centralisé à un seul endroit, facile à relire.

---

## 4. Les middlewares — le travail transverse

Entre la Route et le Controller, on peut insérer des **middlewares** : des fonctions
`(req, res, next)` qui font un traitement commun avant d'atteindre le Controller.

`src/middlewares/authMiddleware.js` protège les routes privées :

```js
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // ← on attache l'utilisateur à la requête
    next();               // ← on continue vers le Controller
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};
```

- Si le token est absent/invalide → il **coupe** la chaîne et répond `401`.
- Sinon → il attache `req.user` puis appelle `next()`, et le Controller peut alors
  utiliser `req.user.id` (ex. dans `AuthController.me` ou `UserController.updateProfile`).

`errorHandler.js` est un middleware spécial (4 arguments) monté **en dernier** dans
`app.js`. Tous les `next(err)` des Controllers y aboutissent :

```js
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal Server Error' });
};
```

---

## 5. Le fil rouge : app.js et server.js

`src/app.js` assemble tout et applique les middlewares globaux **dans l'ordre** :

```js
app.use(helmet(...));        // sécurité des en-têtes HTTP
app.use(cors(...));          // autorise le front (localhost:5173) + cookies
app.use(cookieParser());     // lit les cookies (pour le token JWT)
app.use(express.json());     // parse le corps JSON des requêtes

app.use('/uploads', express.static(...));  // sert les images uploadées

app.use('/api', /* no-cache */, routes);   // ← toutes nos routes ici

app.use(errorHandler);       // gestion des erreurs, toujours en dernier
```

`server.js` ne fait qu'une chose : démarrer l'écoute du serveur.

```js
import app from './src/app.js';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 6. Exemple complet : le cycle d'une requête

Suivons une connexion de bout en bout — **`POST /api/auth/login`** :

| Étape | Fichier | Rôle |
|------|---------|------|
| 1 | `app.js` | La requête arrive, passe par CORS, cookieParser, `express.json()`… |
| 2 | `routes/index.js` | `/api/auth` → aiguille vers `authRoutes` |
| 3 | `routes/authRoutes.js` | `POST /login` → appelle `AuthController.login` |
| 4 | `controllers/AuthController.js` | Valide email + mot de passe |
| 5 | `models/UserModel.js` | `findByEmail()` → exécute le SQL, renvoie l'utilisateur |
| 6 | `controllers/AuthController.js` | Vérifie le mot de passe, crée le JWT, pose le cookie |
| 7 | `app.js` | Réponse JSON renvoyée au client ; si erreur → `errorHandler` |

Et un exemple **CRUD protégé** — `PUT /api/users/profile` :

```
Route:      router.put('/profile', authMiddleware, UserController.updateProfile)
Middleware: authMiddleware vérifie le token → attache req.user
Controller: updateProfile filtre les champs autorisés (bio, gender, location…)
Model:      UserModel.update(req.user.id, data) → UPDATE SQL
Réponse:    { success: true, data: <utilisateur mis à jour> }
```

---

## 7. Pourquoi cette organisation ?

| Principe | Bénéfice concret |
|----------|------------------|
| **Séparation des responsabilités** | Chaque fichier a un seul rôle → on sait tout de suite où chercher. |
| **Model isolé** | Changer la base ou une requête SQL n'impacte pas la logique métier. |
| **Controllers sans SQL** | La logique métier reste lisible et testable indépendamment de la base. |
| **Routes déclaratives** | Une simple lecture des fichiers `routes/` donne toute l'API disponible. |
| **Middlewares réutilisables** | L'authentification et la gestion d'erreurs sont écrites une fois, utilisées partout. |
| **Réponses uniformes** | Toutes les réponses suivent le même format `{ success, data / message }`. |

---

### Règle d'or à retenir

> **Routes** décident *où aller*.
> **Controllers** décident *quoi faire*.
> **Models** décident *comment parler à la base*.
>
> Un Controller ne fait jamais de SQL. Un Model ne connaît jamais `req`/`res`.
> Une Route ne contient jamais de logique.
