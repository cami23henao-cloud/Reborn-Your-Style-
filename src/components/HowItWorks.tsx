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
    <section id="como-funciona" className="py-20 lg:py-28 bg-[#f8f3ee] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
            El Proceso Circular
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
            ¿Cómo funciona Reborn Your Style?
          </h2>
          <p className="mt-4 text-base text-[#424843]">
            Un camino simple de 5 pasos para pasar del desuso a una pieza artesanal de autor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#fef8f3] p-6 rounded-2xl border border-[#e6e2dd] relative flex flex-col justify-between hover:border-[#486548] transition-all hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold font-['Bodoni_Moda',serif] text-[#486548]/40">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#f2ede8] flex items-center justify-center text-[#032517]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium font-['Bodoni_Moda',serif] text-[#032517] mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#424843] leading-relaxed">
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
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar mi primera prenda ahora</span>
          </button>
        </div>
      </div>
    </section>
  );
};
