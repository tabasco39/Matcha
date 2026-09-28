import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';
import { sendEmailVerification } from '../services/mailer.js';
import crypto from 'crypto';
import TokenModel from '../models/TokenModel.js';
import { create } from 'domain';
import { type } from 'os';

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
      const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${mail_token}`;


      const id = await UserModel.create({
        username,
        email,
        password: hashed,
        first_name,
        last_name,
        birth_date: birth_date || null,
      });

      await TokenModel.create({
        user_id: id,
        token: mail_token,
        type : type,
        expires_at : expiresAt,
      });
      console.log('Email token created for user ID:', id, ' with token:', mail_token, ' and expires at:', expiresAt);
      await sendEmailVerification(email, verificationLink, type);

      console.log('Verification email sent to:', email);

      return res.status(201).json({
        success: true,
        message: 'Compte créé, vérifie ton email pour activer ton compte',
      });

    } catch (err) {
      next(err);
    }
  }

  static async verifyToken(req, res, next) {
    try {
        const { token } = req.query;
        const tokenModel = await TokenModel.findByToken(token);
        if (!tokenModel) {
          return res.status(400).json({ success: false, message: 'Token invalide' });
        }

        const date = new Date();
        if (new Date(tokenModel.expires_at) < date) {
            return res.status(400).json({ success: false, message: 'Token expiré' });
        }

        const user = await UserModel.findById(tokenModel.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }
        if (user.is_verified === false) {
            return res.status(400).json({ success: false, message: 'User mail non vérifié' });
        }
        res.status(200).json({ success: true, message: 'Token vérifié avec succès' });
    }
    catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req, res, next)
  {
    const { token } = req.query;
    const tokenModel = await TokenModel.findByToken(token);

    const user = await UserModel.findById(tokenModel.user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
        }
        if (user.is_verified) {
            return res.status(400).json({ success: false, message: 'Email déjà vérifié' });
        }
        await UserModel.update(user.id, { is_verified: true });
        await TokenModel.delete(tokenModel.id);
        res.status(200).json({ success: true, message: 'Email vérifié avec succès' });
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

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email requis' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }
      console.log("user = " , user);
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const type = 'resetpassword';

      await TokenModel.create({
        user_id: user.id,
        token: resetToken,
        type: type,
        created_at: new Date(),
        expires_at: expiresAt
      });

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmailVerification(user.email, resetLink, type);

      res.json({ success: true, message: 'Email de réinitialisation de mot de passe envoyé' });
      console.log('Email de réinitialisation de mot de passe envoyé');

    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { newpassword, confirmnewpassword } = req.body;
      const { token } = req.query;
      if (!token || !newpassword || !confirmnewpassword) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
      }

      if (newpassword !== confirmnewpassword) {
        return res.status(400).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
      }
      
      const tokenModel = await TokenModel.findByToken(token);
        if (!tokenModel) {
          return res.status(400).json({ success: false, message: 'Token invalide' });
        }

      const date = new Date();
      if (new Date(tokenModel.expires_at) < date) {
          return res.status(400).json({ success: false, message: 'Token expiré' });
      }
      
      const user = await UserModel.findById(tokenModel.user_id);
      if (!user) {
          return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      }

      const hashedPassword = await bcrypt.hash(newpassword, 10);
      await UserModel.update(user.id, { password: hashedPassword });
      await TokenModel.delete(tokenModel.id);
      console.log("Update vitaaaaaaaaaaaaaaaaaa");

      res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });

    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
