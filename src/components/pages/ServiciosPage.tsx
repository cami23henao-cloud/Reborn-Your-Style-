import React from 'react';
import { Professional, NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { ProfessionalsSection } from '../ProfessionalsSection';
import { Scissors, Sparkles, Ruler, RefreshCw } from 'lucide-react';

interface ServiciosPageProps {
  professionals: Professional[];
  onSelectTab: (tab: NavigationTab) => void;
  onSelectProfessional: (prof: Professional) => void;
  onContactProfessional: (prof: Professional) => void;
  onOpenAdvisor?: () => void;
}

export const ServiciosPage: React.FC<ServiciosPageProps> = ({
  professionals,
  onSelectTab,
  onSelectProfessional,
  onContactProfessional,
}) => {
  const serviceCards = [
    {
      icon: Scissors,
      title: 'Transformación y Upcycling',
      desc: 'Desmonte y reestructuración completa de siluetas: convierte vestidos en conjuntos de dos piezas, chaquetas en chalecos o jeans en bolsos de diseño.',
    },
    {
      icon: Ruler,
      title: 'Sastrería y Ajuste a Medida',
      desc: 'Entalles de cintura, ruedos invisibles, ajuste de hombros y mangas para que tus prendas favoritas se adapten a tu cuerpo actual.',
    },
    {
      icon: Sparkles,
      title: 'Remiendo Visible & Bordado',
      desc: 'Técnicas ancestrales como Sashiko japonés, zurcido artístico y bordado botánico para convertir desgarros y manchas en detalles estéticos de autor.',
    },
    {
      icon: RefreshCw,
      title: 'Teñido Natural & Acabados',
      desc: 'Renovación de color y estampación botánica con tintes vegetales biodegradables, devolviendo brillo y textura a fibras nobles desteñidas.',
    },
  ];

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="servicios"
        onSelectTab={onSelectTab}
        badgeText="Servicios Artesanales"
        title="Servicios de Confección & Upcycling"
        subtitle="Conecta con talleres, modistas y sastres locales especializados en alargar la vida útil de tus prendas con acabados impecables."
        prevTab="catalogo"
        prevTabLabel="Catálogo"
        nextTab="contacto"
        nextTabLabel="Contacto"
      />

      {/* 2. Overview of Services */}
      <section className="py-12 bg-white border-b border-[#e5decb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] mb-2 block">
              Catálogo de Especialidades
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              ¿Qué tipo de trabajo textil necesitas realizar?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCards.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#faf8f5] border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center text-[#2e4c2c] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                    {service.title}
                  </h4>
                  <p className="text-xs text-[#525648] leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. The Full Professionals Section */}
      <ProfessionalsSection
        professionals={professionals}
        onSelectProfessional={onSelectProfessional}
        onContactProfessional={onContactProfessional}
      />

      {/* 4. Bottom Navigation */}
      <PageFooterNav
        currentTab="servicios"
        onSelectTab={onSelectTab}
        prevTab="catalogo"
        prevLabel="Catálogo"
        nextTab="contacto"
        nextLabel="Contacto"
      />
    </div>
  );
};
