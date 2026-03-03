import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ 
  isOpen, 
  onClose, 
  messages = [], 
  onSendMessage, 
  chatWith,
  isGroupChat = false 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 md:w-96 h-[500px] bg-dark-900 rounded-2xl shadow-2xl border border-dark-700 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-accent-600 to-accent-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xl">
                {isGroupChat ? '👥' : '💬'}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900"></div>
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {chatWith?.displayName || 'Chat'}
            </h3>
            <p className="text-white/70 text-xs">
              {isGroupChat ? messages.length + ' messages' : 'Online'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-dark-400 text-sm">No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.isOwnMessage || msg.senderId === 'local';
            return (
              <div key={index} className={'flex ' + (isOwnMessage ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[80%] rounded-2xl px-4 py-2 ' + (isOwnMessage ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-br-md' : 'bg-dark-700 text-dark-100 rounded-bl-md')}>
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className={'text-xs mt-1 ' + (isOwnMessage ? 'text-white/60' : 'text-dark-400')}>{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-dark-900 border-t border-dark-700">
        <div className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-dark-800 text-dark-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 placeholder-dark-500 border border-dark-700"></input>
          <button type="submit" disabled={!newMessage.trim()} className="bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl px-4 py-2 disabled:opacity-50">➤</button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
