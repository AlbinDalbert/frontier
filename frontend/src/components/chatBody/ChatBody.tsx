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

  // const handleSendMessage = (text: string) => {
  //   const newMessage: Message = {
  //     id: Date.now().toString(),
  //     text,
  //     sender: 'user',
  //   };
  //   setMessages((prev) => [...prev, newMessage]);

  //   // Simulate AI response
  //   setTimeout(() => {
  //     setMessages((prev) => [
  //       ...prev,
  //       { id: Date.now().toString(), text: `AI: ${text}`, sender: 'ai' },
  //     ]);
  //   }, 500);
  // };

  const handleSendMessage = async (text: string) => {
  const newMessage: Message = {
    id: Date.now().toString(),
    text,
    sender: 'user',
  };
  setMessages((prev) => [...prev, newMessage]);

  try {
    const response = await fetch('http://localhost:3000/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text }),
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
  }
};

  return (
    <div className="chat-body">
      <Messages messages={messages} />
      <InputBox onSend={handleSendMessage} />
    </div>
  );
};

export default ChatBody;