import React from 'react';
import { Camera, Compass, MessageCircle, Scissors, HeartHandshake, Plus } from 'lucide-react';

interface HowItWorksProps {
  onOpenPublish: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenPublish }) => {
  const steps = [
    {
      num: '01',
      icon: Camera,
      title: 'Publica tu prenda olvidada',
      description: 'Sube fotos de esa prenda que ya no usas, indica su tejido, color y qué transformación imaginas.',
    },
    {
      num: '02',
      icon: Compass,
      title: 'Conecta con profesionales',
      description: 'Explora modistas y patronistas verificados por técnica (sastrería, bordado, entalle) y ciudad.',
    },
    {
      num: '03',
      icon: MessageCircle,
      title: 'Acuerda los detalles por chat',
      description: 'Chatea directamente, resuelve dudas de confección, concreta el presupuesto y acuerda la entrega.',
    },
    {
      num: '04',
      icon: Scissors,
      title: 'Transformación artesanal',
      description: 'El profesional deconstruye, cose y transforma tu prenda con mimo y técnicas sostenibles.',
    },
    {
      num: '05',
      icon: HeartHandshake,
      title: 'Nueva vida para tu estilo',
      description: 'Recibe una pieza única y personalizada, apoyando la economía circular y el talento de proximidad.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-[#f5f0e6] border-b border-[#e5decb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] block mb-2">
            El Proceso Circular
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#1c2e1b]">
            ¿Cómo funciona Reborn Your Style?
          </h2>
          <p className="mt-4 text-base text-[#525648]">
            Un camino simple de 5 pasos para pasar del desuso a una pieza artesanal de autor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#e5decb] relative flex flex-col justify-between hover:border-[#9bb593] transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#9bb593]">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center text-[#2e4c2c]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium font-['Bodoni_Moda',serif] text-[#1c2e1b] mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#525648] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <button
            id="btn-howitworks-publish"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-[#1a2d19] bg-[#9bb593] hover:bg-[#8ea886] rounded-full transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer border border-[#8ea886]"
          >
            <Plus className="w-4 h-4 text-[#1a2d19]" />
            <span>Publicar mi primera prenda ahora</span>
          </button>
        </div>
      </div>
    </section>
  );
};
