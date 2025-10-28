import React from 'react';
import './Messages.css';
import { Message } from './ChatBody';

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.sender}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default Messages;
``