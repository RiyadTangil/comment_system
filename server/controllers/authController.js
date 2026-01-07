import * as authService from '../services/authService.js';



export const getWather = async (req, res) => {
  try {
    const result = await authService.getWather()
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' })

  }
}

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
