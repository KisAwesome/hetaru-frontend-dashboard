'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SendIcon } from './icons';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, isLoading, error }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-[500px] w-full mt-8">
      <div className="bg-slate-50 p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Ask the Nutritionist</h3>
        <p className="text-xs text-slate-500">Ask about recipes, alternatives, or health tips.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
           <div className="text-center text-slate-400 text-sm mt-10">
              No messages yet. Ask something like "Is this keto friendly?"
           </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
            <div className="text-center text-red-500 text-xs bg-red-50 p-2 rounded">
                {error}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;