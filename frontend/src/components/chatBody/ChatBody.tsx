import React, { useEffect, useState } from "react";
import "./ChatBody.css";
import Messages from "./Messages";
import InputBox from "./InputBox";
import { useAzureStream } from "../../hooks/useAzureStream";

export interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
}

const ChatBody: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const { startStreaming, text: streamedText, done } = useAzureStream();
    const [isStreaming, setIsStreaming] = useState(false);

    const handleSendMessage = (messageText: string) => {
        if (!messageText.trim() || isStreaming) return;

        const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            text: messageText,
            sender: "user",
        };

        const currentContext = contextToJson(messages);
        setMessages((prev) => [...prev, newUserMessage]);
        setIsStreaming(true);

        startStreaming({
            url: `${import.meta.env.VITE_API_URL}/message`,
            payload: {
                message: messageText,
                context: currentContext,
            },
        });
    };

    useEffect(() => {
        if (done) {
            setIsStreaming(false);
            if (streamedText) {
                const newAiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    text: streamedText,
                    sender: "ai",
                };
                setMessages((prev) => [...prev, newAiMessage]);
            }
        }
    }, [done, streamedText]);

    return (
        <div className="chat-body">
            <Messages
                messages={messages}
                isLoading={isStreaming && !streamedText}
                streamedText={isStreaming ? streamedText : ""}
            />
            <InputBox onSend={handleSendMessage} isLoading={isStreaming} />
        </div>
    );
};

function contextToJson(messages: Message[]) {
    return messages.map((msg) => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.text,
    }));
}

export default ChatBody;
