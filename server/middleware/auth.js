const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    let token = req.header('Authorization');

    console.log('Incoming Token Header:', token); // ✅ Log raw header

    if (!token) return res.status(403).json({ error: 'Access denied' });

    if (token.startsWith('Bearer ')) {
        token = token.slice(7); // ✅ Remove "Bearer " prefix
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded User:', req.user); // ✅ Log decoded token
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error); // ✅ Log errors
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware for Admin-Only routes
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
};

module.exports = { authenticate, isAdmin };
