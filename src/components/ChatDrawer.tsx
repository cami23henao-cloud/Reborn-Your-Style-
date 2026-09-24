import React, { useState } from 'react';
import { Conversation } from '../types';
import { X, Send, MessageSquare } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onOpenAdvisor?: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
}) => {
  if (!isOpen) return null;

  const [messageInput, setMessageInput] = useState('');

  const currentConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConv) return;
    onSendMessage(currentConv.id, messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#faf8f5] h-full shadow-2xl flex flex-col border-l border-[#e5decb] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e5decb] bg-[#f5f0e6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9bb593] text-[#1a2d19] flex items-center justify-center border border-[#8ea886]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Bodoni_Moda',serif] text-[#1c2e1b]">
                Conversaciones
              </h2>
              <p className="text-[11px] text-[#456b43] font-medium">
                Mensajería directa y circular
              </p>
            </div>
          </div>

          <button
            id="btn-close-chat-drawer"
            onClick={onClose}
            className="p-2 rounded-full text-[#525648] hover:text-[#1c2e1b] hover:bg-[#e5decb] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty State vs Real Conversations */}
        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f5f0e6] text-[#757367] flex items-center justify-center mb-2">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>

            <h3 className="text-lg font-medium font-['Bodoni_Moda',serif] text-[#1c2e1b]">
              Todavía no tienes conversaciones
            </h3>

            <p className="text-xs text-[#525648] max-w-xs leading-relaxed">
              Cuando contactes a un modista del directorio o propongas una idea sobre una prenda, tus mensajes aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation Selector Tabs if more than 1 */}
            {conversations.length > 1 && (
              <div className="flex overflow-x-auto p-2 gap-2 border-b border-[#e5decb] bg-[#f5f0e6]/60">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer ${
                      c.id === currentConv.id
                        ? 'bg-[#9bb593] text-[#1a2d19] font-bold shadow-xs'
                        : 'bg-white text-[#525648] hover:bg-[#e5decb]'
                    }`}
                  >
                    <img
                      src={c.participantAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                      alt={c.participantName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="font-semibold">{c.participantName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Active Contact Bar */}
            <div className="p-3.5 px-5 bg-white border-b border-[#e5decb] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentConv.participantAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                  alt={currentConv.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-[#c2d6be]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#1c2e1b]">
                    {currentConv.participantName}
                  </h4>
                  <p className="text-[10px] text-[#456b43] font-medium">
                    {currentConv.participantRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[#faf8f5]">
              {currentConv.messages.map((msg) => {
                const isMe = msg.senderId === 'me' || msg.senderId === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[82%]">
                      {!isMe && (
                        <img
                          src={currentConv.participantAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                          alt={msg.senderName}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                        />
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#9bb593] text-[#1a2d19] font-medium rounded-br-xs'
                            : 'bg-white text-[#1c2e1b] rounded-bl-xs border border-[#e5decb]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[9px] text-[#757367] mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-[#f5f0e6] border-t border-[#e5decb] flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2.5 bg-white border border-[#e5decb] rounded-full text-xs text-[#1c2e1b] focus:outline-none focus:ring-1 focus:ring-[#9bb593] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                id="btn-send-chat-message"
                className="p-2.5 bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] rounded-full transition-colors disabled:opacity-40 cursor-pointer border border-[#8ea886]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
