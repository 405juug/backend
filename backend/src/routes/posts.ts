import { Router } from "express";
import prisma from "../ws/db";
import { AuthRequest } from "../types/AuthRequest";
import authMiddleware from "./authMiddleware";

const router = Router();



router.get("/", async (req, res) => {
    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: { username: true, id: true }
            }
        },
        orderBy: { id: "desc" },
    });

    res.json(posts);
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    const { title, content } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const newPost = await prisma.post.create({
        data: {
            title,
            content,
            authorId: req.user.userId,
        },
        select: {
            id: true,
            title: true,
            content: true,
            author: { select: { username: true } },
        },
    });

    res.status(201).json(newPost);
});

export default router;
