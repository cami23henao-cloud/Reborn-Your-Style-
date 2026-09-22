import React from 'react';
import { Target, Eye, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="sobre-nosotros" className="py-20 lg:py-28 bg-[#fef8f3] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission, Vision, Values */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
                Nuestra Razón de Ser
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
                Sobre Reborn Your Style
              </h2>
              <p className="mt-4 text-base text-[#424843] leading-relaxed">
                Reborn Your Style es un movimiento y una plataforma comunitaria que devuelve el valor al textil noble. Frente a la cultura del usar y tirar, fomentamos la regeneración, el consumo reposado y la revalorización de los oficios tradicionales de costura y sastrería.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-[#f8f3ee] p-5 rounded-2xl border border-[#e6e2dd]">
                <div className="w-9 h-9 rounded-lg bg-[#caecc6]/70 flex items-center justify-center text-[#032517] mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold font-['Bodoni_Moda',serif] text-[#032517] mb-1">
                  Misión
                </h3>
                <p className="text-xs text-[#424843] leading-relaxed">
                  Conectar prendas en desuso con artesanos de cercanía para alargar su ciclo de vida y erradicar el desperdicio textil.
                </p>
              </div>

              <div className="bg-[#f8f3ee] p-5 rounded-2xl border border-[#e6e2dd]">
                <div className="w-9 h-9 rounded-lg bg-[#caecc6]/70 flex items-center justify-center text-[#032517] mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold font-['Bodoni_Moda',serif] text-[#032517] mb-1">
                  Visión
                </h3>
                <p className="text-xs text-[#424843] leading-relaxed">
                  Convertir la transformación textil artesanal en la primera opción de vestir de una sociedad consciente.
                </p>
              </div>

              <div className="bg-[#f8f3ee] p-5 rounded-2xl border border-[#e6e2dd]">
                <div className="w-9 h-9 rounded-lg bg-[#caecc6]/70 flex items-center justify-center text-[#032517] mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold font-['Bodoni_Moda',serif] text-[#032517] mb-1">
                  Valores
                </h3>
                <p className="text-xs text-[#424843] leading-relaxed">
                  Circularidad radical, transparencia absoluta, dignificación del oficio manual y respeto a las fibras naturales.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photo */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-[#e6e2dd] bg-[#ece7e2]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYBvXakjFn73cxvk-GGub9cUl1ybRG8IWdlJyA9DsxbItvzOO0TdulnKaQU7Rx1k_ltYJ-qShUTQVtIuJ-Cw99wypjKdZC21o3EMHzVZrRhoLQyXI1TqKF_weqpeuMvt8UKs20UeXTIlWZLXGEKFVkiLOQZjBL1GufmWIOFaFKprPjSSzlT-hmtxG8TYVMMeecDNTeX3554DyVPX2WVDTvrDRuHBamMHwoDzROcF0EhumlZ02iExr_NQ"
                alt="Taller artesanal de costura y upcycling"
                className="w-full h-[440px] object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
