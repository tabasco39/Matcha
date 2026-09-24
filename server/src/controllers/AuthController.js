import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';
import EmailTokenModel from '../models/EmailTokenModel.js';
import { sendEmailVerification } from '../services/mailer.js';
import crypto from 'crypto';

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
      const mail_token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const type = 'verification';

      const id = await UserModel.create({
        username,
        email,
        password: hashed,
        first_name,
        last_name,
        birth_date: birth_date || null,
      });
      console.log('User created with ID:', id);
      await EmailTokenModel.create({
        user_id: id,
        token: mail_token,
        type : type,
        expires_at : expiresAt,
      });
      console.log('Email token created for user ID:', id, ' with token:', mail_token, ' and expires at:', expiresAt);

      await sendEmailVerification(email, mail_token);
      console.log('Verification email sent to:', email);

      // const user = await UserModel.findById(id);
      return res.status(201).json({
        success: true,
        message: 'Compte créé, vérifie ton email pour activer ton compte',
      });

    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
        const { token } = req.query;
        const emailToken = await EmailTokenModel.findByToken(token);
        if (!emailToken) {
          return res.status(400).json({ success: false, message: 'Token invalide' });
        }
        console.log('====>Verifying email with token:', token, ' found user_id:', emailToken.user_id);

        const date = new Date();
        console.log('====>Current date:', date, ' and token expires at:', emailToken.expires_at);
        if (new Date(emailToken.expires_at) < date) {
            return res.status(400).json({ success: false, message: 'Token expiré' });
        }

        const user = await UserModel.findById(emailToken.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }

        await UserModel.update(user.id, { is_verified: true });
        console.log('====>Email verified for user ID:', user.id , ' and is_verified:', true);
        await EmailTokenModel.delete(emailToken.id);

        res.json({ success: true, message: 'Email vérifié avec succès' });

    }
    catch (err) {
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

      const isVerified = await UserModel.isVerified(user.id);
      if (!isVerified) {
        return res.status(403).json({ success: false, message: 'Veuillez vérifier votre email avant de vous connecter' });
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

export default AuthController;
