import React, { useState } from 'react';
import { Droplet, Wind, Heart, Sparkles } from 'lucide-react';

export const ImpactSection: React.FC = () => {
  const [garmentsCount, setGarmentsCount] = useState<number>(3);

  const waterSaved = garmentsCount * 2700;
  const co2Avoided = (garmentsCount * 12.5).toFixed(1);
  const artisanHours = garmentsCount * 3.5;

  return (
    <section className="py-20 lg:py-28 bg-[#f8f3ee] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
            Medición de Impacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
            El coste invisible de la moda rápida
          </h2>
          <p className="mt-4 text-base text-[#424843]">
            Según la Agencia Europea de Medio Ambiente (EEA), la industria textil es el cuarto mayor consumidor de materias primas y agua del planeta.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#fef8f3] p-8 rounded-2xl border border-[#e6e2dd] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#caecc6]/60 flex items-center justify-center text-[#032517] mb-4">
              <Droplet className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
              2.700 Litros
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#486548] mt-1 mb-2">
              Agua por camiseta
            </span>
            <p className="text-xs text-[#424843] leading-relaxed">
              El volumen de agua potable que una persona bebe en casi 3 años se ahorra al recuperar y transformar una sola prenda.
            </p>
          </div>

          <div className="bg-[#fef8f3] p-8 rounded-2xl border border-[#e6e2dd] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#caecc6]/60 flex items-center justify-center text-[#032517] mb-4">
              <Wind className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
              -82% CO₂
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#486548] mt-1 mb-2">
              Menos emisiones
            </span>
            <p className="text-xs text-[#424843] leading-relaxed">
              Reducir la producción de tejido virgen y tinturas químicas evita la liberación de toneladas de gases de efecto invernadero.
            </p>
          </div>

          <div className="bg-[#fef8f3] p-8 rounded-2xl border border-[#e6e2dd] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#caecc6]/60 flex items-center justify-center text-[#032517] mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-3xl sm:text-4xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
              100% Local
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#486548] mt-1 mb-2">
              Economía de barrio
            </span>
            <p className="text-xs text-[#424843] leading-relaxed">
              Dignificamos el oficio de modistas, costureras y patronistas de cercanía, manteniendo vivos saberes tradicionales.
            </p>
          </div>
        </div>

        {/* Interactive Impact Calculator */}
        <div className="max-w-3xl mx-auto bg-[#fef8f3] p-8 sm:p-10 rounded-3xl border border-[#486548]/30 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#486548]" />
            <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#032517]">
              Calcula tu huella positiva
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#424843] mb-8">
            Selecciona cuántas prendas tienes en el fondo del armario listas para transformar y descubre el impacto medioambiental evitado:
          </p>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#032517] uppercase tracking-wider">
                Prendas a transformar:
              </span>
              <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517] bg-[#f2ede8] px-4 py-1 rounded-full border border-[#e6e2dd]">
                {garmentsCount} {garmentsCount === 1 ? 'prenda' : 'prendas'}
              </span>
            </div>
            <input
              id="slider-impact-garments"
              type="range"
              min="1"
              max="15"
              value={garmentsCount}
              onChange={(e) => setGarmentsCount(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-[#e6e2dd] rounded-lg appearance-none cursor-pointer accent-[#032517]"
            />
            <div className="flex justify-between text-[11px] text-[#727973] mt-1.5 font-medium">
              <span>1 prenda</span>
              <span>8 prendas</span>
              <span>15 prendas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#e6e2dd]">
            <div className="bg-[#f8f3ee] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                {waterSaved.toLocaleString('es-ES')} L
              </span>
              <p className="text-[11px] text-[#424843] mt-1">Agua potable preservada</p>
            </div>
            <div className="bg-[#f8f3ee] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                {co2Avoided} kg
              </span>
              <p className="text-[11px] text-[#424843] mt-1">CO₂ evitado a la atmósfera</p>
            </div>
            <div className="bg-[#f8f3ee] p-4 rounded-xl text-center">
              <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                {artisanHours} hrs
              </span>
              <p className="text-[11px] text-[#424843] mt-1">De trabajo artesanal retribuido</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
