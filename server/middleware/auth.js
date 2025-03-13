import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    let token = req.header('Authorization');

    console.log('🔹 Incoming Token Header:', token); // Log raw token

    if (!token) {
        console.error('❌ No token provided');
        return res.status(403).json({ error: 'Access denied' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7); // Remove "Bearer " prefix
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Decoded Token:', decoded); // Log decoded token

        // Ensure is_admin is explicitly boolean
        req.user = {
            id: decoded.id,
            email: decoded.email,
            is_admin: decoded.is_admin || false
        };

        console.log('✅ User set in req.user:', req.user); // Confirm assignment
        next();
    } catch (error) {
        console.error('❌ JWT Verification Error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
