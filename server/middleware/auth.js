const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(403).json({ error: 'Access denied' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware for Admin-Only routes
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
};

module.exports = { authenticate, isAdmin };
