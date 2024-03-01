// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log(token);
    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.status(403).send('Forbidden');
        req.user = user;
        next();
    });
};

module.exports = verifyToken;
