import React, { useState } from 'react';
import { Conversation, ChatMessage } from '../types';
import { X, Send, MessageSquare, Sparkles, User as UserIcon, ShieldAlert } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onOpenAdvisor: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onOpenAdvisor,
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#fef8f3] h-full shadow-2xl flex flex-col border-l border-[#e6e2dd] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e6e2dd] bg-[#f8f3ee] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#032517] text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                Conversaciones
              </h2>
              <p className="text-[11px] text-[#486548] font-medium">
                Mensajería directa y circular
              </p>
            </div>
          </div>

          <button
            id="btn-close-chat-drawer"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty State vs Real Conversations */}
        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f2ede8] text-[#727973] flex items-center justify-center mb-2">
              <MessageSquare className="w-8 h-8 stroke-[1.5]" />
            </div>

            <h3 className="text-lg font-medium font-['Bodoni_Moda',serif] text-[#032517]">
              Todavía no tienes conversaciones
            </h3>

            <p className="text-xs text-[#424843] max-w-xs leading-relaxed">
              Cuando contactes a un modista del directorio, propongas una idea sobre una prenda o hables con nuestro asesor textil, tus conversaciones aparecerán aquí.
            </p>

            <div className="pt-4">
              <button
                id="btn-chat-empty-advisor"
                onClick={() => {
                  onClose();
                  onOpenAdvisor();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#032517] bg-[#caecc6]/70 hover:bg-[#caecc6] border border-[#aecfab] rounded-full transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#032517]" />
                <span>Contactar con un asesor textil</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation Selector Tabs if more than 1 */}
            {conversations.length > 1 && (
              <div className="flex overflow-x-auto p-2 gap-2 border-b border-[#e6e2dd] bg-[#f8f3ee]/60">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                      c.id === currentConv.id
                        ? 'bg-[#032517] text-white shadow-xs'
                        : 'bg-[#fef8f3] text-[#424843] hover:bg-[#e6e2dd]'
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
            <div className="p-3.5 px-5 bg-[#fef8f3] border-b border-[#e6e2dd] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentConv.participantAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                  alt={currentConv.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-[#caecc6]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#032517]">
                    {currentConv.participantName}
                  </h4>
                  <p className="text-[10px] text-[#486548] font-medium">
                    {currentConv.participantRole}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[#fef8f3]">
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
                            ? 'bg-[#032517] text-white rounded-br-xs'
                            : 'bg-[#f2ede8] text-[#1d1b19] rounded-bl-xs border border-[#e6e2dd]'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[9px] text-[#727973] mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-[#f8f3ee] border-t border-[#e6e2dd] flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2.5 bg-[#fef8f3] border border-[#e6e2dd] rounded-full text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                id="btn-send-chat-message"
                className="p-2.5 bg-[#032517] hover:bg-[#1b3b2b] text-white rounded-full transition-colors disabled:opacity-40"
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
