import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

console.log("Endpoint:", process.env.AZURE_OPENAI_ENDPOINT);

const app: Application = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.CORS_ALLOWED_PUBLIC ?? "",
        ],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "api-key"],
    })
);

app.use("/api", routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global error:", err);
    if (!res.writableEnded) {
        res.status(500).json({
            error: "Internal server error",
            message:
                process.env.NODE_ENV === "production" ? undefined : err.message,
        });
    }
});

app.use("*", (req: Request, res: Response) => {
    res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
