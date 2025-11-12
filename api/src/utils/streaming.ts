import { Response } from "express";

export function setupStreamingHeaders(res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
}

export function handleStreamError(error: Error, res: Response): void {
    console.error("Stream error:", error);
    if (res.writableEnded) return;

    try {
        res.write(
            `data: ${JSON.stringify({ error: "Stream error occurred", message: error.message })}\n\n`,
        );
        res.write("data: [ERROR]\n\n");
        res.end();
    } catch (writeError) {
        console.error("Error sending stream error response:", writeError);
        res.destroy(writeError as Error);
    }
}

export function handleApiError(error: Error, res: Response): void {
    console.error("Error:", error);
    if (res.writableEnded) return;

    try {
        res.write(
            `data: ${JSON.stringify({ error: "Server error occurred", message: error.message })}\n\n`,
        );
        res.write("data: [ERROR]\n\n");
        res.end();
    } catch (writeError) {
        console.error("Error sending error response:", writeError);
        res.destroy(writeError as Error);
    }
}
