import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import express, { Request, Response } from "express";
import useAuthRouter from "../routes/auth"
import cookieParser from "cookie-parser";
import postsRouter from "../routes/posts"



const app = express();


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



const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
