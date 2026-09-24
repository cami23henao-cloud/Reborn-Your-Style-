import React from 'react';
import { NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { Users, Heart, Sparkles, ShieldCheck, Compass } from 'lucide-react';

interface QuienesSomosPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAdvisor?: () => void;
}

export const QuienesSomosPage: React.FC<QuienesSomosPageProps> = ({
  onSelectTab,
}) => {
  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="quienes-somos"
        onSelectTab={onSelectTab}
        badgeText="Identidad e Historia"
        title="Quiénes somos en Reborn Your Style"
        subtitle="Un movimiento colaborativo que rescata prendas olvidadas y dignifica los oficios tradicionales de costura y patronaje."
        prevTab="inicio"
        prevTabLabel="Inicio"
        nextTab="mision"
        nextTabLabel="Misión"
      />

      {/* 2. Main Narrative & Core Story */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Story Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaf2e8] border border-[#c2d6be] text-xs font-semibold text-[#2e4c2c]">
                <Users className="w-3.5 h-3.5 text-[#2e4c2c]" />
                <span>Nuestra Razón de Ser</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b] tracking-tight leading-snug">
                Más que una plataforma, una comunidad de regeneración textil
              </h2>

              <p className="text-base text-[#525648] leading-relaxed">
                <strong>Reborn Your Style</strong> nació como una respuesta valiente y creativa frente a la cultura global del hiperconsumo y el descarte acelerado de ropa. Frente a prendas que terminan prematuramente en vertederos o abandonadas en el fondo de armarios, decidimos conectar dos mundos que se necesitan mutuamente: personas con ropa valiosa en desuso y artesanos, modistas y patronistas de cercanía con manos maestras capaces de reinventarla.
              </p>

              <p className="text-base text-[#525648] leading-relaxed">
                Con raíces en Antioquia, Colombia —tierra de tradición textil centenaria—, impulsamos la economía circular barrial. Creemos firmemente que cada costura deshecha y vuelta a coser contiene una historia única de identidad, sostenibilidad y orgullo local.
              </p>

              {/* Three Core Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-white rounded-xl border border-[#e5decb] shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] mb-2.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-1">
                    Amor al detalle
                  </h4>
                  <p className="text-xs text-[#757367] leading-relaxed">
                    Rescatamos la paciencia y dedicación de la confección artesanal a medida.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#e5decb] shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-1">
                    Comercio justo
                  </h4>
                  <p className="text-xs text-[#757367] leading-relaxed">
                    Remuneración digna y directa a los maestros de la aguja y la tijera.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#e5decb] shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] mb-2.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-1">
                    Impacto medible
                  </h4>
                  <p className="text-xs text-[#757367] leading-relaxed">
                    Ahorro verificable de miles de litros de agua y reducción de huella de carbono.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Editorial Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#e5decb] bg-white">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYBvXakjFn73cxvk-GGub9cUl1ybRG8IWdlJyA9DsxbItvzOO0TdulnKaQU7Rx1k_ltYJ-qShUTQVtIuJ-Cw99wypjKdZC21o3EMHzVZrRhoLQyXI1TqKF_weqpeuMvt8UKs20UeXTIlWZLXGEKFVkiLOQZjBL1GufmWIOFaFKprPjSSzlT-hmtxG8TYVMMeecDNTeX3554DyVPX2WVDTvrDRuHBamMHwoDzROcF0EhumlZ02iExr_NQ"
                  alt="Taller de modistería y sastrería circular Reborn Your Style"
                  className="w-full h-[460px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#9bb593] text-[#1a2d19] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Taller Colaborativo
                  </span>
                  <p className="text-sm font-semibold text-white/95 leading-snug">
                    Donde la aguja y la creatividad transforman el desecho en arte textil vivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Circular Manifesto Quote Section */}
      <section className="py-16 bg-[#f5f0e6] border-y border-[#e5decb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center mx-auto text-[#2e4c2c] mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <blockquote className="text-2xl sm:text-3xl font-bold font-['Bodoni_Moda',serif] text-[#1c2e1b] leading-snug tracking-tight">
            “La prenda más sostenible es la que ya existe en tu armario. No creamos ropa nueva; reinventamos la existente para un futuro consciente.”
          </blockquote>
          <div className="mt-6 flex flex-col items-center">
            <div className="w-12 h-0.5 bg-[#9bb593] mb-2" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c]">
              Manifiesto Reborn Your Style
            </span>
          </div>
        </div>
      </section>

      {/* 4. Our Core Values Detailed */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#2e4c2c] mb-2 block">
              Principios Inquebrantables
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              Los valores que guían cada puntada
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] font-bold mb-4">
                01
              </div>
              <h4 className="text-lg font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Circularidad Radical
              </h4>
              <p className="text-sm text-[#525648] leading-relaxed">
                Ninguna fibra textil de calidad debe terminar en la basura. Diseñamos para el ciclo perpetuo y la reutilización continua.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] font-bold mb-4">
                02
              </div>
              <h4 className="text-lg font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Transparencia Total
              </h4>
              <p className="text-sm text-[#525648] leading-relaxed">
                Trazabilidad completa: conoces quién intervino tu prenda, qué materiales se usaron y cuánto impacto ambiental positivo se generó.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] font-bold mb-4">
                03
              </div>
              <h4 className="text-lg font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Dignidad del Oficio
              </h4>
              <p className="text-sm text-[#525648] leading-relaxed">
                Visibilizamos el trabajo silencioso de costureras, sastres y bordadores, otorgándoles el protagonismo de verdaderos artistas.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] font-bold mb-4">
                04
              </div>
              <h4 className="text-lg font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2">
                Identidad Auténtica
              </h4>
              <p className="text-sm text-[#525648] leading-relaxed">
                Frente a la ropa masiva idéntica de tiendas rápidas, una prenda transformada es una obra irrepetible con tu estilo personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Navigation */}
      <PageFooterNav
        currentTab="quienes-somos"
        onSelectTab={onSelectTab}
        prevTab="inicio"
        prevLabel="Inicio"
        nextTab="mision"
        nextLabel="Misión"
      />
    </div>
  );
};
