import { Router, Response, Request } from "express";
import { getSearchContext } from "./services/search";
import { createOpenAIStream } from "./services/openai";
import {
    setupStreamingHeaders,
    handleStreamError,
    handleApiError,
} from "./utils/streaming";

interface MessageRequestBody {
    context?: Array<{ role: string; content: string }>;
    message?: string;
}

const router = Router();

router.post("/message", async (req: Request, res: Response) => {
    try {
        const { context = [], message = "Hello!" } =
            req.body as MessageRequestBody;

        const searchContext = await getSearchContext(message);

        const openaiResponse = await createOpenAIStream(
            context,
            message,
            searchContext,
        );

        setupStreamingHeaders(res);

        openaiResponse.data.on("data", (chunk: Buffer) => {
            if (!res.writableEnded) {
                res.write(chunk);
            }
        });

        openaiResponse.data.on("end", () => {
            if (!res.writableEnded) {
                res.write("data: [DONE]\n\n");
                res.end();
            }
        });

        openaiResponse.data.on("error", (err: Error) => {
            handleStreamError(err, res);
        });
    } catch (error) {
        handleApiError(error as Error, res);
    }
});

router.post("/message/echo", async (req, res) => {
    const { message = "Hello!" } = req.body;
    await sleep(2000);
    res.json({ reply: message });
});

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default router;
