import React, { useState } from 'react';
import './ChatBody.css';
import Messages from './Messages';
import InputBox from './InputBox';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const ChatBody: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: `AI: ${text}`, sender: 'ai' },
      ]);
    }, 500);
  };

  return (
    <div className="chat-body">
      <Messages messages={messages} />
      <InputBox onSend={handleSendMessage} />
    </div>
  );
};

export default ChatBody;