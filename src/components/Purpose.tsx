import React from 'react';
import { RefreshCw, Scissors, Users, Sparkles } from 'lucide-react';

export const Purpose: React.FC = () => {
  const pillars = [
    {
      icon: RefreshCw,
      title: '1. Reutilizar',
      description: 'Damos una segunda oportunidad a prendas olvidadas, fuera de temporada o con pequeños defectos antes de que terminen como residuo.',
    },
    {
      icon: Scissors,
      title: '2. Transformar',
      description: 'Conectamos con modistas y patronistas que rediseñan cada prenda según tu estilo, silueta actual y medidas exactas.',
    },
    {
      icon: Users,
      title: '3. Conectar',
      description: 'Generamos una red de apoyo mutuo entre amantes de la moda sostenible y profesionales de confección de proximidad.',
    },
    {
      icon: Sparkles,
      title: '4. Crear',
      description: 'Cada prenda transformada se convierte en una pieza de autor exclusiva, con historia propia y valor artesanal tangible.',
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-[#fef8f3] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#486548] mb-3">
            Nuestro Propósito
          </h2>
          <p className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
            Cuatro pilares para transformar la forma en que vestimos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[#f8f3ee] p-8 rounded-2xl border border-[#e6e2dd] hover:border-[#486548]/50 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#caecc6]/60 flex items-center justify-center text-[#032517] mb-6 group-hover:bg-[#caecc6] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#032517] mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#424843] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
