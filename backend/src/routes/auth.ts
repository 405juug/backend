import { Router, Request, Response, NextFunction } from "express";

import bcrypt from "bcrypt"
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import {hashPass} from "../utils/hashPass";
import { AuthRequest } from '../types/AuthRequest'
import authMiddleware from "./authMiddleware";
import { findUserByEmail, createUser, findUserById, findUserByUsername } from "../services/user";
import prisma from "../ws/db"

interface RegisterBody {
    username: string,
    password: string,
    email: string,
}

const router = Router();

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

const generateTokens = (userId: number) => {
    const accessToken = jwt.sign({userId}, ACCESS_SECRET, {expiresIn: "15m"})
    const refreshToken = jwt.sign({userId}, REFRESH_SECRET, {expiresIn: "7d"})
    return {accessToken, refreshToken}
}

const setTokenCookies = (res: any, accessToken: string, refreshToken: string) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user)
        return res.status(400).json({ error: "invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ error: "invalid email or password" });

    const {accessToken, refreshToken} = generateTokens(user.id);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    })

    setTokenCookies(res, accessToken, refreshToken);
    res.json({message: "logged in"});
});

router.post("/register", async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password)
            return res.status(400).json({error: "Missing fields"});

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({error: "email already registered"});
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({error: "username already registered"});
        }

        const hashedPass = await hashPass(password);
        const newUser = await createUser(username, email, hashedPass);

        const {accessToken, refreshToken} = generateTokens(newUser.id);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        setTokenCookies(res, accessToken, refreshToken)
        return res.status(200).json(newUser)

    } catch (e: any) {
        console.error(e);
        if(e.code === "P2002"){
            const target = e.meta?.target;
            return res.status(400).json({ error: `User with this ${target} already exists`})
        }
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/refresh", async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({error: "No refresh token"});

    try{
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {userId: number};

        const stored = await prisma.refreshToken.findUnique({
            where: {token: refreshToken},
        });

        if(!stored || stored.expiresAt < new Date()) {
            return res.status(401).json({error: "Invalid or expired refresh token"});
        }

        await prisma.refreshToken.delete({where: {token: refreshToken}});

        const {accessToken: newAccess, refreshToken: newRefresh } = generateTokens(decoded.userId);

        await prisma.refreshToken.create({
            data:{
                token: newRefresh,
                userId: decoded.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        setTokenCookies(res, newAccess, newRefresh);
        res.json({message: "tokens refreshed"});
    } catch (e) {
        return res.status(401).json({error: "Invavil refresh token"});
    }
})


router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(refreshToken){
        await prisma.refreshToken.deleteMany({ where: {token: refreshToken}});
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({message: "logged out"});
})

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {

    if (!req.user) {
        return res.status(401).json({ auth: false });
    }

    const user = await findUserById(req.user.userId)

    res.json({
        auth: true,
        user
    });
});




export default router;
