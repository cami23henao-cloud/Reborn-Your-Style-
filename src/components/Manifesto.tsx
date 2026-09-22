import React from 'react';

export const Manifesto: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#f8f3ee] border-b border-[#e6e2dd] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-4xl sm:text-5xl text-[#486548]/30 font-['Bodoni_Moda',serif] select-none mb-2">
          “
        </div>
        <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517] leading-snug tracking-tight">
          La prenda más sostenible es la que ya existe en tu armario. No creamos ropa nueva; reinventamos la existente para un futuro consciente.
        </blockquote>
        <div className="mt-8 flex flex-col items-center">
          <div className="w-12 h-0.5 bg-[#486548]/40 mb-3" />
          <cite className="text-xs uppercase tracking-widest font-semibold text-[#486548] not-italic">
            Filosofía Reborn Your Style
          </cite>
        </div>
      </div>
    </section>
  );
};
