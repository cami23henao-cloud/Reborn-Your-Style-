import React from 'react';
import { ArrowDown, Sparkles, Scissors, Leaf } from 'lucide-react';

interface HeroProps {
  onReutilizarClick: () => void;
  onOfrecerServiciosClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onReutilizarClick, onOfrecerServiciosClick }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#e6e2dd] bg-[#fef8f3]">
      {/* Subtle organic background gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-[#caecc6]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-[#caecc6]/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Typography & Intent */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f2ede8] border border-[#e6e2dd] text-xs font-semibold tracking-wider uppercase text-[#486548]">
              <Leaf className="w-3.5 h-3.5 text-[#486548]" />
              <span>Manifiesto por la moda circular</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-['Bodoni_Moda',serif] text-[#032517] leading-[1.12] tracking-tight">
              Cada puntada cuenta <br />
              <span className="italic font-light">una nueva historia.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#424843] max-w-2xl font-light leading-relaxed">
              Plataforma de moda circular para reutilizar, transformar y rediseñar prendas con modistas y artesanos de proximidad. No descartes: reinventa con manos maestras.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="hero-btn-reutilizar"
                onClick={onReutilizarClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow-md hover:shadow-lg active:scale-98"
              >
                <span>Quiero reutilizar una prenda</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                id="hero-btn-ofrecer"
                onClick={onOfrecerServiciosClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-[#032517] bg-transparent hover:bg-[#f2ede8] border-2 border-[#032517] rounded-full transition-all active:scale-98"
              >
                <Scissors className="w-4 h-4" />
                <span>Quiero ofrecer mis servicios</span>
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#e6e2dd]/80 max-w-lg">
              <div>
                <div className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">100%</div>
                <div className="text-xs text-[#424843] mt-0.5">Artesanía local</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">-80%</div>
                <div className="text-xs text-[#424843] mt-0.5">Huella hídrica</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">+350</div>
                <div className="text-xs text-[#424843] mt-0.5">Prendas salvadas</div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual & Living Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#ece7e2] aspect-[4/5] border border-[#e6e2dd]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkTenlFWGG_Qx0Oid91_DMobZ1ZjfMHdYiCja153W268LIKVbkljswEqicrApUBPtYf1jRHhIxd7ueakEl0W48QP9m97dZ7jj1cTTgEMMbeUzczppUfCI8-qIpKQM0GW8ngswuPWKUWN8JIf9MS8ung2Z6oasSLgkv49s-EXqV0yjDN5eYVl79eOAjLrcNYAqtHpLBPx5vugNEEpQb4vxwblB9t1-7AnEC7LyYf92ShOaLUEZEMZEjOw"
                alt="Bordado botánico visible en denim"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#caecc6] animate-pulse"></span>
                  <span className="text-xs tracking-wider uppercase font-semibold text-[#caecc6]">
                    Técnica en foco
                  </span>
                </div>
                <p className="text-sm font-medium text-white/95 leading-snug">
                  Bordado botánico visible y remiendo Sashiko japonés sobre denim recuperado.
                </p>
              </div>
            </div>

            {/* Floating Impact Card */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-[#e6e2dd] max-w-[260px] hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#caecc6] flex items-center justify-center shrink-0 text-[#032517]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#032517]">Impacto positivo</p>
                <p className="text-[11px] text-[#424843] leading-tight">
                  2.400 L de agua y 12 kg de CO₂ evitados en cada transformación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
