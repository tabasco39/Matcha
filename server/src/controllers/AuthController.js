const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password, first_name, last_name, birth_date } = req.body;

      if (!username || !email || !password || !first_name || !last_name) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
      }

      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ success: false, message: "Ce nom d'utilisateur est déjà pris" });
      }

      const hashed = await bcrypt.hash(password, 12);

      const id = await UserModel.create({
        username,
        email,
        password: hashed,
        first_name,
        last_name,
        birth_date: birth_date || null,
      });

      const user = await UserModel.findById(id);

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Identifiants invalides' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Identifiants invalides' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, COOKIE_OPTIONS);

      const { password: _, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.json({ success: true, message: 'Déconnecté avec succès' });
  }

  static async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
