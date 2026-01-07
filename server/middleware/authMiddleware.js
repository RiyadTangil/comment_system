import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Expecting "Bearer <token>"
    const tokenParts = token.split(' ');
    const tokenValue = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

export default auth;
