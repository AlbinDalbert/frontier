import React from "react";
import { useEffect, useRef } from "react";
import "./Messages.css";
import { Message } from "./ChatBody";

interface MessagesProps {
    messages: Message[];
    isLoading: Boolean;
    streamedText?: string;
}

const Messages: React.FC<MessagesProps> = ({
    messages,
    isLoading,
    streamedText,
}) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="messages">
            {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                    <pre>{msg.text}</pre>
                </div>
            ))}

            {streamedText && (
                <div className="message ai">
                    <pre>{streamedText}</pre>
                </div>
            )}

            {isLoading && <div className="message loading-spinner" />}
            <div ref={endRef} />
        </div>
    );
};

export default Messages;
