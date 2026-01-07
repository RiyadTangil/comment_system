import * as authService from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};
