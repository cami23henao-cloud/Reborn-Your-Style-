import React from 'react';
import { Tutorial } from '../types';
import { X, Clock, CheckCircle2, BookOpen, Layers } from 'lucide-react';

interface TutorialModalProps {
  tutorial: Tutorial | null;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ tutorial, onClose }) => {
  if (!tutorial) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with image cover */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-[#ece7e2] shrink-0">
          <img
            src={tutorial.image}
            alt={tutorial.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            id="btn-close-tutorial-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#032517] text-white rounded-full border border-white/20">
                {tutorial.difficulty}
              </span>
              <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {tutorial.duration}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal font-['Bodoni_Moda',serif] text-white leading-snug">
              {tutorial.title}
            </h2>
          </div>
        </div>

        {/* Scrollable instructions */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto flex-1">
          {/* Materials */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#486548]" />
              <span>Materiales Necesarios</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#f8f3ee] p-4 rounded-2xl border border-[#e6e2dd]">
              {tutorial.materials.map((mat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#424843]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#486548] shrink-0 mt-0.5" />
                  <span>{mat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#486548]" />
              <span>Instrucciones Paso a Paso</span>
            </h3>
            <div className="space-y-4">
              {tutorial.steps.map((step) => (
                <div
                  key={step.number}
                  className="p-5 rounded-2xl bg-[#f8f3ee] border border-[#e6e2dd] space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#032517] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {step.number}
                    </span>
                    <h4 className="text-sm font-semibold font-['Bodoni_Moda',serif] text-[#032517]">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#424843] leading-relaxed pl-10">
                    {step.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#e6e2dd] bg-[#f8f3ee] flex items-center justify-between text-xs">
          <span className="text-[#486548] font-medium">
            Guía comunitaria de confección circular
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#032517] text-white rounded-full font-semibold hover:bg-[#1b3b2b] transition-colors"
          >
            Cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
};
