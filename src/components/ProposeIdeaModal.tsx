import React, { useState } from 'react';
import { Garment } from '../types';
import { X, Sparkles, Send, MapPin, CheckCircle2 } from 'lucide-react';

interface ProposeIdeaModalProps {
  garment: Garment | null;
  onClose: () => void;
  onSubmitIdea: (garment: Garment, ideaText: string) => void;
}

export const ProposeIdeaModal: React.FC<ProposeIdeaModalProps> = ({
  garment,
  onClose,
  onSubmitIdea,
}) => {
  if (!garment) return null;

  const [ideaText, setIdeaText] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    onSubmitIdea(garment, ideaText.trim());
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-lg rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#032517] text-[#caecc6] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
                Rediseño Colaborativo
              </span>
              <h2 className="text-xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
                Proponer idea de rescate
              </h2>
            </div>
          </div>
          <button
            id="btn-close-propose-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#caecc6]/70 text-[#032517] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                ¡Idea enviada al autor!
              </h3>
              <p className="text-xs text-[#424843] max-w-sm mx-auto leading-relaxed">
                Tu propuesta para <strong>{garment.title}</strong> ha iniciado un canal de conversación en tu bandeja de <strong>Conversaciones</strong>.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#032517] rounded-full hover:bg-[#1b3b2b]"
                >
                  Continuar explorando
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Garment Summary Card */}
              <div className="flex items-center gap-3 p-3.5 bg-[#f8f3ee] rounded-2xl border border-[#e6e2dd]">
                <img
                  src={garment.photos[0]}
                  alt={garment.title}
                  className="w-16 h-16 rounded-xl object-cover border border-[#e6e2dd]"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#486548]">
                    {garment.category} · {garment.condition}
                  </span>
                  <h4 className="text-xs font-bold text-[#032517] truncate">
                    {garment.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#727973] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#486548]" />
                    <span className="truncate">{garment.city}, {garment.neighborhood}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  ¿Qué técnica o transformación sugieres para esta prenda? *
                </label>
                <textarea
                  rows={4}
                  required
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  placeholder="Ej. Te propongo cortar las mangas y deconstruir los laterales para convertirla en chaleco utilitario con forro de algodón contrastado..."
                  className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-[#424843] hover:bg-[#e6e2dd] rounded-full transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!ideaText.trim()}
                  id="btn-submit-propose-idea"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar propuesta</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
