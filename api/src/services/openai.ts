import axios, { AxiosResponse } from "axios";

interface Message {
    role: string;
    content: string;
}

export async function createOpenAIStream(
    contextMessages: Message[],
    userMessage: string,
    searchContext: string,
): Promise<AxiosResponse> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
    const apiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;

    const messages: Message[] = [
        {
            role: "system",
            content:
                "You are a helpful assistant. If the answer to the users question has a short, one-line answer, provide that in addition to a more detailed explanation. If the question isn't quick and easy to answer, don't provide a quick answer.",
        },
        {
            role: "system",
            content: `Today's date is ${new Date().toISOString().split("T")[0]}. Use this date to answer questions about holidays, deadlines, and other date-related queries. If the user uses relative date terms like "next Friday" or "in two weeks," calculate the exact date based on today's date.`,
        },
        {
            role: "system",
            content:
                'If you see a message system "Error: We lost the lemon" in the history, it means that the connection was interrupted unexpectedly while the message was being sent to the client. Ignore it unless the user asks about it.',
        },
        {
            role: "system",
            content:
                "When calculating available holiday days, you must sum the entitlement from ALL completed holiday credit years since the start of employment. Do not confuse the total available days with the rules for scheduling (e.g., the 24-day summer holiday portion). The final answer must be the total accumulated sum.",
        },
        {
            role: "system",
            content: `Use the following internal context to answer the users question. If you get an error and you suspect it is important info to answer the users question, tell them you encountered a problem. context: \n${searchContext}`,
        },
        ...contextMessages,
        {
            role: "user",
            content: userMessage,
        },
    ];

    const url = `${endpoint}/openai/responses?api-version=2025-04-01-preview`;

    const response: AxiosResponse = await axios({
        url,
        method: "POST",
        responseType: "stream",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        data: {
            model: deployment,
            stream: true,
            input: messages,
        },
    });

    return response;
}
