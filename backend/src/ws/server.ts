import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io"
import useAuthRouter from "../routes/auth"
import cookieParser from "cookie-parser";
import postsRouter from "../routes/posts"
import { registerChatHandlers } from "../socket/chatSocket"



const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/posts", postsRouter);

app.use("/api/auth", useAuthRouter);

app.get("/", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

registerChatHandlers(io);

const PORT = 3000;

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
