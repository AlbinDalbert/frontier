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
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (text: string) => {
    const cleanedText = text.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: cleanedText,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const context = contextToJson(messages);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          context: context,
          message: cleanedText 
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || 'No response from AI';

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: aiReply, sender: 'ai' },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: 'Error contacting AI', sender: 'ai' },
      ]);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="chat-body">
      <Messages messages={messages} isLoading={loading} />
      <InputBox onSend={handleSendMessage} isLoading={loading} />
    </div>
  );
};


function contextToJson(messages: Message[]) {
  return messages.map((msg) => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));
}

export default ChatBody;