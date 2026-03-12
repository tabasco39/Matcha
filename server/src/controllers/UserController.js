import UserModel from '../models/UserModel.js';

class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await UserModel.findAll();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const id = await UserModel.create(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const affected = await UserModel.update(req.params.id, req.body);
      if (!affected) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User updated' });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req, res, next) {
    try {
      const affected = await UserModel.delete(req.params.id);
      if (!affected) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
