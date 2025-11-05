import React, { useState } from "react";
import { useEffect, useRef } from "react";
import "./InputBox.css";

interface InputBoxProps {
    onSend: (text: string) => void;
    isLoading: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ onSend, isLoading }) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (isLoading) return;
        if (input.trim()) {
            onSend(input);
            setInput("");
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    return (
        <div className="input-box">
            <textarea
                autoFocus
                className="input-field"
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                    if (isLoading) setInput(e.target.value);
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight - 14}px`;
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Type your message..."
                rows={1}
            />
            <button onClick={handleSend} disabled={isLoading}>
                Send
            </button>
        </div>
    );
};

export default InputBox;
