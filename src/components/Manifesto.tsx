import React from 'react';

export const Manifesto: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#f5f0e6] border-b border-[#e5decb] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-4xl sm:text-5xl text-[#9bb593] font-['Bodoni_Moda',serif] select-none mb-2">
          “
        </div>
        <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#1c2e1b] leading-snug tracking-tight">
          La prenda más sostenible es la que ya existe en tu armario. No creamos ropa nueva; reinventamos la existente para un futuro consciente.
        </blockquote>
        <div className="mt-8 flex flex-col items-center">
          <div className="w-12 h-0.5 bg-[#9bb593] mb-3" />
          <cite className="text-xs uppercase tracking-widest font-semibold text-[#3d5e3b] not-italic">
            Filosofía Reborn Your Style
          </cite>
        </div>
      </div>
    </section>
  );
};
