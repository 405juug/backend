import {AuthRequest} from "../types/AuthRequest";
import {NextFunction, Response} from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies.accessToken;

    if (!token) return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET) as { userId: number };
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ authenticated: false });
    }
}

