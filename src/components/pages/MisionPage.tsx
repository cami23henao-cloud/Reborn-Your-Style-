import React from 'react';
import { NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { Target, RefreshCw, Scissors, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface MisionPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPublish: () => void;
}

export const MisionPage: React.FC<MisionPageProps> = ({
  onSelectTab,
  onOpenPublish,
}) => {
  const pillars = [
    {
      step: '01',
      icon: RefreshCw,
      title: 'Reutilizar sin desperdicio',
      subtitle: 'Evitar el vertedero',
      description:
        'Rescatamos prendas olvidadas en armarios, con cambios de talla o pequeños detalles, otorgándoles una segunda vida antes de convertirse en residuo sólido.',
      impact: 'Evita hasta 12 kg de emisiones de CO2 por kilogramo de tela rescatado.',
    },
    {
      step: '02',
      icon: Scissors,
      title: 'Transformar con maestría',
      subtitle: 'Rediseño a medida',
      description:
        'Conectamos con modistas y patronistas que desmontan, adaptan y reconstruyen prendas según tu estilo actual, medidas y necesidades reales.',
      impact: 'Ahorro de hasta 2.400 litros de agua potable que requeriría confeccionar ropa nueva.',
    },
    {
      step: '03',
      icon: Users,
      title: 'Conectar la comunidad',
      subtitle: 'Comercio justo y local',
      description:
        'Generamos una red solidaria de proximidad donde los creadores reciben ingresos justos y los usuarios obtienen prendas únicas con respaldo humano.',
      impact: 'Fomenta el empleo artesanal local en barrios y comunas de Antioquia.',
    },
    {
      step: '04',
      icon: Sparkles,
      title: 'Crear piezas de autor',
      subtitle: 'Diseño exclusivo',
      description:
        'Cada prenda intervenida se transforma en un objeto de arte textil irrepetible, con identidad propia y alta durabilidad frente a la obsolescencia programada.',
      impact: 'Promueve el consumo reposado frente al modelo de ropa descartable.',
    },
  ];

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="mision"
        onSelectTab={onSelectTab}
        badgeText="Propósito de Acción"
        title="Nuestra Misión"
        subtitle="Conectar prendas en desuso con artesanos de cercanía para alargar su ciclo de vida y erradicar el desperdicio textil."
        prevTab="quienes-somos"
        prevTabLabel="Quiénes somos"
        nextTab="vision"
        nextTabLabel="Visión"
      />

      {/* 2. Central Mission Statement Box */}
      <section className="py-14 lg:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:p-12 rounded-3xl bg-[#eaf2e8] border border-[#c2d6be] text-[#1c2e1b] shadow-sm">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#2e4c2c] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#c2d6be]">
                <Target className="w-3.5 h-3.5 text-[#2e4c2c]" />
                <span>Declaración Central de Misión</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit',sans-serif] leading-tight mb-6 text-[#1c2e1b]">
                “Erradicar el descarte textil transformando cada prenda en desuso en una pieza de autor, empoderando el talento de los artesanos de proximidad.”
              </h2>

              <p className="text-base sm:text-lg text-[#525648] leading-relaxed font-normal mb-8">
                En Colombia y en el mundo, millones de toneladas de tela noble terminan en la basura cada año mientras la confección artesanal lucha por sobrevivir. Nuestra misión es unir ambos extremos en un circuito cerrado, donde reparar y reinventar sea siempre más atractivo, accesible y prestigioso que comprar ropa desechable.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onOpenPublish}
                  className="px-6 py-3 rounded-full bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] font-bold text-sm transition-all shadow-xs border border-[#8ea886] cursor-pointer"
                >
                  Transformar una prenda ahora
                </button>
                <button
                  onClick={() => onSelectTab('catalogo')}
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#f5f0e6] text-[#1c2e1b] border border-[#e5decb] font-semibold text-sm transition-all cursor-pointer"
                >
                  Explorar catálogo de prendas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Operational Pillars */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] mb-2 block">
              Metodología de Trabajo
            </span>
            <h3 className="text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              Los 4 pilares fundamentales de nuestra misión
            </h3>
            <p className="mt-3 text-sm text-[#525648]">
              Cada proyecto de costura y upcycling que nace en la plataforma sigue un ciclo riguroso de respeto material y social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-8 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center text-[#2e4c2c]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-bold font-['Outfit',sans-serif] text-[#9bb593]">
                        {pillar.step}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-[#2e4c2c] uppercase tracking-wider block mb-1">
                      {pillar.subtitle}
                    </span>
                    <h4 className="text-xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-3">
                      {pillar.title}
                    </h4>
                    <p className="text-sm text-[#525648] leading-relaxed mb-5">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#f5f0e6] flex items-start gap-2 text-xs text-[#2e4c2c] font-medium bg-[#eaf2e8]/60 p-3 rounded-xl border border-[#c2d6be]/50">
                    <CheckCircle2 className="w-4 h-4 text-[#2e4c2c] shrink-0 mt-0.5" />
                    <span>{pillar.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Strategic Objectives Checklist */}
      <section className="py-14 bg-white border-y border-[#e5decb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c]">
                Impacto Cuantificable
              </span>
              <h3 className="text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
                Objetivos operativos que cumplimos a diario
              </h3>
              <p className="text-sm text-[#525648] leading-relaxed">
                Nuestra misión no se queda en intenciones; medimos y auditamos cada kilo de tela salvado, cada litro de agua preservado y cada taller fortalecido.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5decb]">
                <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c] mb-1">
                  100% Circular
                </div>
                <h5 className="text-sm font-bold text-[#1c2e1b] mb-1">Cero residuo textil directo</h5>
                <p className="text-xs text-[#757367]">
                  Aprovechamiento integral de retazos, deshilados y forros para accesorios y relleno textil.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5decb]">
                <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c] mb-1">
                  +350 Prendas
                </div>
                <h5 className="text-sm font-bold text-[#1c2e1b] mb-1">Rescatadas de vertederos</h5>
                <p className="text-xs text-[#757367]">
                  Ropa que volvió a lucir impecable en las calles en lugar de acumularse en botaderos.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5decb]">
                <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c] mb-1">
                  Proximidad
                </div>
                <h5 className="text-sm font-bold text-[#1c2e1b] mb-1">Economía barrial</h5>
                <p className="text-xs text-[#757367]">
                  Conexión directa en un radio menor a 15 km para minimizar traslados y huella logística.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e5decb]">
                <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c] mb-1">
                  Capacitación
                </div>
                <h5 className="text-sm font-bold text-[#1c2e1b] mb-1">Tutoriales abiertos</h5>
                <p className="text-xs text-[#757367]">
                  Democratizamos el conocimiento de costura básica para que cualquier persona pueda reparar en casa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Navigation */}
      <PageFooterNav
        currentTab="mision"
        onSelectTab={onSelectTab}
        prevTab="quienes-somos"
        prevLabel="Quiénes somos"
        nextTab="vision"
        nextLabel="Visión"
      />
    </div>
  );
};
