import { Router, Request, Response, NextFunction } from "express";

import bcrypt from "bcrypt"
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import {hashPass} from "../utils/hashPass";
import { AuthRequest } from '../types/AuthRequest'
import authMiddleware from "./authMiddleware";
import { findUserByEmail, createUser, findUserById, findUserByUsername } from "../services/user";

interface RegisterBody {
    username: string,
    password: string,
    email: string,
}

const router = Router();

const SECRET = process.env.SECRET as string;

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user)
        return res.status(400).json({ error: "invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
        return res.status(400).json({ error: "invalid email or password" });

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

        const token = jwt.sign({userId: newUser.id}, SECRET, {expiresIn: "1h"})

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json(newUser);


    } catch (e: any) {
        console.error(e);
        if(e.code === "P2002"){
            const target = e.meta?.target;
            return res.status(400).json({ error: `User with this ${target} already exists`})
        }
        return res.status(500).json({ error: "Server error" });
    }
});

router.post("/me", authMiddleware, async (req: AuthRequest, res) => {

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
