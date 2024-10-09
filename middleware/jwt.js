
const Jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = Jwt.verify(token.split(' ')[1], jwt_secret);
        req.userId = verified.id;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};
module.exports = { verifyToken };