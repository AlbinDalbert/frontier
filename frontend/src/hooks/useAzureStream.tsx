import { useState, useEffect, useRef } from "react";

interface AzureStreamPayload {
    message: string;
    context: Array<{ role: string; content: string }>;
}

interface UseAzureStreamOptions {
    url: string;
    payload: AzureStreamPayload;
    requestId: string;
}

interface UseAzureStreamResult {
    text: string;
    done: boolean;
}


export function useAzureStream(): {
  startStreaming: (options: UseAzureStreamOptions) => void;
  text: string;
  done: boolean;
} {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const lastRequestId = useRef<string | null>(null);

  const startStreaming = (options: UseAzureStreamOptions) => {
    if (options.requestId === lastRequestId.current) {
      console.log("Duplicate request ignored:", options.requestId);
      return;
    }
    
    lastRequestId.current = options.requestId;
    setText("");
    setDone(false);


        const fetchStream = async () => {
            const response = await fetch(options.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(options.payload),
            });

            if (!response.body) {
                console.error(
                    "No response body — streaming failed or not supported"
                );
                setText('No response');
                setDone(true);
                return;
            }

            console.log('Hook started with options:', options);
            console.log('Done state:', done);
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

                            if (parsed.type === 'response.output_text.delta') {
                                const token = parsed.delta;
                                if (token) {
                                    setText(prev => prev + token);
                                }
                            }

                            if (parsed.type === 'response.completed') {
                                setDone(true);
                            }
                        } catch (err) {
                            console.error("Stream parse error:", err, "on data:", data);
                        }
                    }
                }
            }
        };

        fetchStream();

    };
    return { startStreaming, text, done };
}
