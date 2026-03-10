import { Router, Request, Response, NextFunction } from "express";

import bcrypt from "bcrypt"
// @ts-ignore
import prisma from "../ws/db";
import jwt from "jsonwebtoken";
// @ts-ignore
import {hashPass} from "../utils/hashPass";
import auth from "../api/auth";
import { AuthRequest } from '../types/AuthRequest'
import authMiddleware from "./authMiddleware";

interface RegisterBody {
    username: string,
    password: string,
    email: string,
}

const router = Router();

const SECRET = process.env.SECRET as string;

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user)
        return res.status(400).json({ error: "user not found" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
        return res.status(400).json({ error: "wrong password" });

    const token = jwt.sign(
        {userId: user.id},
        SECRET,
        {expiresIn: "1h"}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    })

    res.json({ message: "logged in" });
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "logged out" })
})

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ error: "Missing fields" });

        const hashedPass = await hashPass(password);

        console.log("REQ BODY:", req.body);
        console.log("DATABASE_URL:", process.env.DATABASE_URL);

        const newUser = await prisma.user.create({
            data: { username, email, password: hashedPass }
        });

        console.log("NEW USER CREATED:", newUser);
        return res.status(200).json(newUser);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/me", authMiddleware, async (req: AuthRequest, res) => {

    if (!req.user) {
        return res.status(401).json({ auth: false });
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { id: true, email: true, username: true },
    });

    res.json({
        auth: true,
        user
    });
});




export default router;
