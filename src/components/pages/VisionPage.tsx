import React from 'react';
import { NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { Eye, Globe, Compass, Award, Sparkles, ArrowRight } from 'lucide-react';

interface VisionPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPublish: () => void;
}

export const VisionPage: React.FC<VisionPageProps> = ({
  onSelectTab,
}) => {
  const horizons = [
    {
      year: '2026',
      title: 'Consolidación comunitaria local',
      desc: 'Creación de la red más confiable de modistas y amantes de la moda circular en Medellín y el Valle de Aburrá, validando el impacto real en cientos de hogares.',
      icon: Compass,
    },
    {
      year: '2028',
      title: 'Expansión a nivel nacional',
      desc: 'Extender la plataforma a las principales ciudades de Colombia, conectando cooperativas textiles de confección con ciudadanos de todo el país.',
      icon: Globe,
    },
    {
      year: '2030',
      title: 'La primera opción de vestimenta',
      desc: 'Lograr que antes de comprar una prenda nueva producida en masa, el 60% de los usuarios elija transformar, reparar o intercambiar ropa existente.',
      icon: Award,
    },
  ];

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="vision"
        onSelectTab={onSelectTab}
        badgeText="Horizonte de Futuro"
        title="Nuestra Visión 2030"
        subtitle="Convertir la transformación textil artesanal en la primera opción de vestir de una sociedad consciente."
        prevTab="mision"
        prevTabLabel="Misión"
        nextTab="catalogo"
        nextTabLabel="Catálogo"
      />

      {/* 2. Central Vision Statement Box */}
      <section className="py-14 lg:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:p-12 rounded-3xl bg-[#eaf2e8] border border-[#c2d6be] text-[#1c2e1b] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/40 blur-2xl pointer-events-none" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#2e4c2c] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#c2d6be]">
                <Eye className="w-3.5 h-3.5 text-[#2e4c2c]" />
                <span>Nuestra Visión Compartida</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit',sans-serif] leading-tight mb-6 text-[#1c2e1b]">
                “Imaginamos un mundo donde cada persona vista con orgullo prendas con historia, donde la costura artesanal sea sinónimo de distinción y donde la ropa desechable pertenezca al pasado.”
              </h2>

              <p className="text-base sm:text-lg text-[#525648] leading-relaxed font-normal mb-8">
                Visualizamos ciudades donde en lugar de centros comerciales repletos de ropa sintética efímera, existan circuitos vibrantes de talleres de transformación en cada esquina, donde reparar y personalizar sea el estándar cultural de elegancia y respeto por el planeta.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onSelectTab('catalogo')}
                  className="px-6 py-3 rounded-full bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] font-bold text-sm transition-all shadow-xs flex items-center gap-2 border border-[#8ea886] cursor-pointer"
                >
                  <span>Explorar el Catálogo Circular</span>
                  <ArrowRight className="w-4 h-4 text-[#1a2d19]" />
                </button>
                <button
                  onClick={() => onSelectTab('servicios')}
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#f5f0e6] text-[#1c2e1b] border border-[#e5decb] font-semibold text-sm transition-all cursor-pointer"
                >
                  Conocer a los Modistas y Artesanos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Strategic Roadmap to 2030 */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] mb-2 block">
              Hoja de Ruta Estratégica
            </span>
            <h3 className="text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              El camino hacia un nuevo paradigma del vestir
            </h3>
            <p className="mt-3 text-sm text-[#525648]">
              Nuestros hitos proyectados para transformar la industria de la moda desde la base social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {horizons.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 bg-white rounded-3xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center text-[#2e4c2c]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-extrabold font-['Outfit',sans-serif] text-[#9bb593]">
                        {item.year}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-3">
                      {item.title}
                    </h4>

                    <p className="text-sm text-[#525648] leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#f5f0e6] flex items-center gap-1.5 text-xs font-semibold text-[#2e4c2c]">
                    <Sparkles className="w-3.5 h-3.5 text-[#2e4c2c]" />
                    <span>Compromiso circular activo</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. The 4 Transformational Pillars of Tomorrow */}
      <section className="py-14 bg-white border-y border-[#e5decb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] mb-2 block">
              Pilares Transformadores
            </span>
            <h3 className="text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              ¿Cómo será el futuro que estamos construyendo?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e5decb]">
              <h5 className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Soberanía del Armario
              </h5>
              <p className="text-xs text-[#757367] leading-relaxed">
                Dejamos de depender de modas impuestas cada semana para vestir prendas hechas a nuestra propia medida y esencia.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e5decb]">
              <h5 className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Relevo Generacional
              </h5>
              <p className="text-xs text-[#757367] leading-relaxed">
                Nuevas generaciones de jóvenes aprenden técnicas de costura, patronaje y bordado, asegurando la supervivencia del oficio.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e5decb]">
              <h5 className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Huella Cero
              </h5>
              <p className="text-xs text-[#757367] leading-relaxed">
                Aprovechamiento al 100% de fibras naturales, reduciendo drásticamente la extracción de agua y el uso de tintes tóxicos.
              </p>
            </div>

            <div className="p-6 bg-[#faf8f5] rounded-2xl border border-[#e5decb]">
              <h5 className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Economía Solidaria
              </h5>
              <p className="text-xs text-[#757367] leading-relaxed">
                El dinero invertido en ropa se queda en la comunidad local, fortaleciendo familias y microempresas del sector textil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Navigation */}
      <PageFooterNav
        currentTab="vision"
        onSelectTab={onSelectTab}
        prevTab="mision"
        prevLabel="Misión"
        nextTab="catalogo"
        nextLabel="Catálogo"
      />
    </div>
  );
};
