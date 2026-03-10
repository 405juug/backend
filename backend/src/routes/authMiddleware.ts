import {AuthRequest} from "../types/AuthRequest";
import {NextFunction, Response} from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET as string;

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token)
        return res.status(401).json({ authenticated: false });

    try {
        const decoded = jwt.verify(token, SECRET) as { userId: number };
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ authenticated: false });
    }
}


