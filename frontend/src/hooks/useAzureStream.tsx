import { useState, useEffect, useRef } from "react";

interface AzureStreamPayload {
    message: string;
    context: Array<{ role: string; content: string }>;
}

interface UseAzureStreamOptions {
    url: string;
    payload: AzureStreamPayload;
}

export function useAzureStream(): {
    startStreaming: (options: UseAzureStreamOptions) => void;
    text: string;
    done: boolean;
    error: string | null;
} {
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startStreaming = (options: UseAzureStreamOptions) => {
        setText("");
        setDone(false);
        setError(null);

        const fetchStream = async () => {
            try {
                const response = await fetch(options.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(options.payload),
                });

                if (!response.body) {
                    console.error(
                        "No response body — streaming failed or not supported"
                    );
                    setText("No response");
                    setDone(true);
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                    const { done: streamDone, value } = await reader.read();
                    if (streamDone) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") {
                                setDone(true);
                                break;
                            }

                            try {
                                const parsed = JSON.parse(data);

                                if (
                                    parsed.type === "response.output_text.delta"
                                ) {
                                    const token = parsed.delta;
                                    if (token) {
                                        setText((prev) => prev + token);
                                    }
                                }

                                if (parsed.type === "response.completed") {
                                    setDone(true);
                                }
                            } catch (err) {
                                console.error(
                                    "Stream parse error:",
                                    err,
                                    "on data:",
                                    data
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Streaming request failed:", error);
                setError(
                    "Error: We lost the lemon :( Please try make lemonade again with a new message or start a new session."
                );
                setDone(true);
                return;
            }
        };
        fetchStream();
    };
    return { startStreaming, text, done, error };
}
