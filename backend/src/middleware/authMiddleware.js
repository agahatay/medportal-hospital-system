const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    // Bearer <token>
    const tokenString = token.split(' ')[1];

    jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }
        next();
    };
};

const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) { req.user = null; return next(); }
    const tokenString = token.split(' ')[1];
    jwt.verify(tokenString, process.env.JWT_SECRET, (err, decoded) => {
        req.user = err ? null : decoded;
        next();
    });
};

module.exports = { verifyToken, checkRole, optionalAuth };
