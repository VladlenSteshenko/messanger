// middleware/auth.js
/*
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from 'Authorization' header
  if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(401).json({ error: 'Unauthorized' });
      }
      req.user = decoded.sub; // Attach user payload to the request
      next();
  });
};

module.exports = authMiddleware;
*/
