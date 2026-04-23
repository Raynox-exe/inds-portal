const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        
        try {
            // Verify token
            const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'inds_jwt_secret');
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid or expired token.' });
        }
    } else {
        // Forbidden
        res.status(403).json({ error: 'Access denied. No token provided.' });
    }
}

module.exports = { verifyToken };
