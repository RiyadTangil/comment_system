import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';



export const register = async (username, password) => {
  if (!username || !password) {
    const error = new Error('Please enter all fields');
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findOne({ username });
  if (user) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({
    username,
    password: hashedPassword
  });

  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username
    }
  };
};
export const getWather = async () => {
  const url = 'https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=b283597c334bcd85d7afc1cca88999a5'
  const res = await axios.get(url)
  return res.data
}

export const login = async (username, password) => {
  if (!username || !password) {
    const error = new Error('Please enter all fields');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ username });
  if (!user) {
    const error = new Error('User does not exist');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username
    }
  };
};
