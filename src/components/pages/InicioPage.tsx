import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Scissors,
  Users,
  Target,
  Eye,
  BookOpen,
  Mail,
  ArrowRight,
  Leaf,
  Plus,
  Compass,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { Manifesto } from '../Manifesto';
import { HowItWorks } from '../HowItWorks';

interface InicioPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPublish: () => void;
  onOpenAdvisor?: () => void;
}

export const InicioPage: React.FC<InicioPageProps> = ({
  onSelectTab,
  onOpenPublish,
}) => {
  const sectionsList: {
    id: NavigationTab;
    title: string;
    badge: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'quienes-somos',
      title: 'Quiénes somos',
      badge: 'Historia & Equipo',
      desc: 'Conoce el origen de Reborn Your Style en Antioquia, nuestra comunidad circular y los valores que nos mueven.',
      icon: Users,
    },
    {
      id: 'mision',
      title: 'Misión',
      badge: 'Erradicar Desperdicio',
      desc: 'Nuestros 4 pilares: Reutilizar, Transformar, Conectar y Crear para evitar toneladas de basura textil.',
      icon: Target,
    },
    {
      id: 'vision',
      title: 'Visión',
      badge: 'Horizonte 2030',
      desc: 'Hacia un futuro donde la transformación artesanal sea la primera opción de vestimenta en la sociedad.',
      icon: Eye,
    },
    {
      id: 'catalogo',
      title: 'Catálogo',
      badge: 'Prendas Disponibles',
      desc: 'Explora y filtra prendas en desuso listas para ser intervenidas, propone ideas de rediseño o adopta piezas.',
      icon: ShoppingBag,
    },
    {
      id: 'servicios',
      title: 'Servicios',
      badge: 'Modistas & Talleres',
      desc: 'Directorio de artesanos locales especializados en patronaje, sastrería a medida, remiendo visible y upcycling.',
      icon: Scissors,
    },
    {
      id: 'tutoriales',
      title: 'Tutoriales',
      badge: 'Academia DIY',
      desc: 'Guías didácticas paso a paso para aprender costura básica, desmonte de prendas y bordado creativo en casa.',
      icon: BookOpen,
    },
    {
      id: 'impacto',
      title: 'Impacto',
      badge: 'Sostenibilidad Real',
      desc: 'Métricas de agua ahorrada, CO2 evitado y calculadora interactiva para medir tu huella ecológica positiva.',
      icon: Sparkles,
    },
    {
      id: 'contacto',
      title: 'Contacto',
      badge: 'Atención & Talleres',
      desc: 'Escríbenos directamente, encuentra preguntas frecuentes o registra tu taller de confección en la red.',
      icon: Mail,
    },
  ];

  return (
    <div className="bg-[#faf8f5] min-h-screen">
      {/* 1. Hero Section with Pastel Green & Warm Beige Styling */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-[#e5decb] bg-gradient-to-b from-[#f5f0e6] via-[#faf8f5] to-[#faf8f5]">
        {/* Soft Pastel Green Glow Orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#9bb593]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#c2d6be]/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#dcd3bd] text-xs font-semibold uppercase tracking-wider text-[#2e4c2c] shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-[#688a62]" />
                <span>Plataforma de Moda Circular</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b] leading-[1.12] tracking-tight">
                Cada puntada cuenta <br />
                <span className="text-[#456b43]">una nueva historia.</span>
              </h1>

              <p className="text-lg text-[#525648] max-w-2xl font-normal leading-relaxed">
                Reutiliza, transforma y rediseña tus prendas olvidadas junto a modistas y artesanos de proximidad. No descartes ropa de calidad: dale una segunda vida con manos expertas.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap gap-3.5 pt-2">
                <button
                  id="hero-btn-catalogo"
                  onClick={() => onSelectTab('catalogo')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-[#1a2d19] bg-[#9bb593] hover:bg-[#8ea886] rounded-full transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer border border-[#8ea886]"
                >
                  <ShoppingBag className="w-4 h-4 text-[#1a2d19]" />
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-btn-publish"
                  onClick={onOpenPublish}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#1c2e1b] bg-white hover:bg-[#faf8f5] border-2 border-[#9bb593] rounded-full transition-all active:scale-98 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#456b43]" />
                  <span>Publicar mi prenda</span>
                </button>
              </div>

              {/* Micro stats banner */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#e5decb] max-w-lg">
                <div>
                  <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c]">
                    100%
                  </div>
                  <div className="text-xs text-[#757367] mt-0.5">Artesanía local</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c]">
                    -80%
                  </div>
                  <div className="text-xs text-[#757367] mt-0.5">Huella hídrica</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-['Outfit',sans-serif] text-[#2e4c2c]">
                    +350
                  </div>
                  <div className="text-xs text-[#757367] mt-0.5">Prendas salvadas</div>
                </div>
              </div>
            </div>

            {/* Right Editorial Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-md bg-white aspect-[4/5] border border-[#dcd3bd]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkTenlFWGG_Qx0Oid91_DMobZ1ZjfMHdYiCja153W268LIKVbkljswEqicrApUBPtYf1jRHhIxd7ueakEl0W48QP9m97dZ7jj1cTTgEMMbeUzczppUfCI8-qIpKQM0GW8ngswuPWKUWN8JIf9MS8ung2Z6oasSLgkv49s-EXqV0yjDN5eYVl79eOAjLrcNYAqtHpLBPx5vugNEEpQb4vxwblB9t1-7AnEC7LyYf92ShOaLUEZEMZEjOw"
                  alt="Bordado botánico visible en prenda denim recuperada"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c2e1b]/80 via-[#1c2e1b]/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c2d6be] animate-ping"></span>
                    <span className="text-xs tracking-wider uppercase font-bold text-[#eaf2e8]">
                      Técnica Destacada
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white/95 leading-snug">
                    Remiendo Sashiko y bordado botánico sobre denim recuperado en Medellín.
                  </p>
                </div>
              </div>

              {/* Floating Impact Card */}
              <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-md border border-[#dcd3bd] max-w-[270px] hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eaf2e8] border border-[#c2d6be] flex items-center justify-center shrink-0 text-[#2e4c2c]">
                  <Sparkles className="w-5 h-5 text-[#2e4c2c]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1c2e1b]">Impacto verificable</p>
                  <p className="text-[11px] text-[#757367] leading-tight">
                    2.700 litros de agua y 12.5 kg de CO₂ ahorrados en cada prenda transformada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Hub (Bento Grid of all Project Sheets) */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaf2e8] text-[#2e4c2c] text-xs font-bold uppercase tracking-wider mb-2 border border-[#c2d6be]">
              <Compass className="w-3.5 h-3.5 text-[#456b43]" />
              <span>Explora el Proyecto</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
              Hojas y Secciones Independientes
            </h2>
            <p className="mt-3 text-base text-[#525648]">
              Haz clic en cualquiera de las secciones para abrir su hoja exclusiva con información completa y navegación directa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectionsList.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSelectTab(sec.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group p-6 bg-white rounded-3xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#f5f0e6] border border-[#e5decb] flex items-center justify-center text-[#2e4c2c] group-hover:scale-105 group-hover:bg-[#eaf2e8] transition-all">
                        <Icon className="w-6 h-6 text-[#2e4c2c]" />
                      </div>
                      <span className="text-[11px] font-bold text-[#2e4c2c] bg-[#eaf2e8] px-2.5 py-1 rounded-full border border-[#c2d6be]">
                        {sec.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-[#1c2e1b] mb-2 group-hover:text-[#2e4c2c] transition-colors">
                      {sec.title}
                    </h3>

                    <p className="text-xs text-[#757367] leading-relaxed mb-6">
                      {sec.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#f5f0e6] flex items-center justify-between text-xs font-bold text-[#2e4c2c] group-hover:text-[#1c2e1b]">
                    <span>Abrir hoja</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Circular Manifesto */}
      <Manifesto />

      {/* 4. How It Works Step-by-Step */}
      <HowItWorks onOpenPublish={onOpenPublish} />

      {/* 5. Fast Call to Action Banner (Pastel Green Theme) */}
      <section className="py-16 bg-[#9bb593] text-[#1a2d19] border-t border-[#8ea886]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-bold text-[#20361f] block mb-2">
              Comienza hoy mismo
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold font-['Outfit',sans-serif] mb-4 text-[#162716]">
              ¿Listo para darle una segunda vida a tu ropa?
            </h3>
            <p className="text-base text-[#1e331d]/90 mb-8 font-normal">
              Publica esa prenda que ya no usas o explora a los artesanos de tu barrio para transformarla.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onOpenPublish}
                className="px-8 py-3.5 rounded-full bg-[#faf8f5] text-[#1a2d19] font-bold text-sm hover:bg-white transition-all shadow-xs cursor-pointer border border-white/80"
              >
                Publicar prenda gratis
              </button>
              <button
                onClick={() => {
                  onSelectTab('servicios');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-full bg-white/30 hover:bg-white/50 text-[#162716] border border-[#82a07c]/60 font-semibold text-sm transition-all cursor-pointer"
              >
                Buscar modistas en mi ciudad
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
