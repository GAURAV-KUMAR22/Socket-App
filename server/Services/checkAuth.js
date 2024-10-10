import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], "MYBirthisMYSpecialDay");
        req.user = decoded;
        console.log(req.user)
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
