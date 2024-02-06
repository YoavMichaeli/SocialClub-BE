import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthResquest extends Request {
    user?: { _id: string, user: string};
};

const authMiddleware = (req: AuthResquest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log(err);
        if (err) return res.status(401).json(err);
        req.user = user as { _id: string, user: string};
        next();
    });
}

module.exports = [authMiddleware];