import React from 'react';
import { NavigationTab } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Users,
  Target,
  Eye,
  ShoppingBag,
  Scissors,
  BookOpen,
  Sparkles,
  Mail,
} from 'lucide-react';

interface PageFooterNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  prevTab?: NavigationTab;
  prevLabel?: string;
  nextTab?: NavigationTab;
  nextLabel?: string;
}

const TAB_ORDER: NavigationTab[] = [
  'inicio',
  'quienes-somos',
  'mision',
  'vision',
  'catalogo',
  'servicios',
  'contacto',
  'tutoriales',
  'impacto',
];

const TAB_META: Record<
  NavigationTab,
  { label: string; desc: string; icon: React.FC<{ className?: string }> }
> = {
  inicio: { label: 'Inicio', desc: 'Portada y accesos directos', icon: Home },
  'quienes-somos': { label: 'Quiénes somos', desc: 'Historia, equipo y manifiesto', icon: Users },
  mision: { label: 'Misión', desc: 'Erradicar el desperdicio textil', icon: Target },
  vision: { label: 'Visión', desc: 'Moda circular para 2030', icon: Eye },
  catalogo: { label: 'Catálogo', desc: 'Explora y transforma prendas', icon: ShoppingBag },
  servicios: { label: 'Servicios', desc: 'Modistas y artesanos locales', icon: Scissors },
  contacto: { label: 'Contacto', desc: 'Escríbenos y únete a la red', icon: Mail },
  tutoriales: { label: 'Tutoriales', desc: 'Aprende upcycling DIY', icon: BookOpen },
  impacto: { label: 'Impacto', desc: 'Métricas de sostenibilidad', icon: Sparkles },
};

export const PageFooterNav: React.FC<PageFooterNavProps> = ({
  currentTab,
  onSelectTab,
  prevTab,
  prevLabel,
  nextTab,
  nextLabel,
}) => {
  return (
    <section className="py-14 bg-gradient-to-b from-[#faf7f2] to-[#f5f0e6] border-t border-[#e5decb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Previous / Next Big Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {prevTab && prevLabel ? (
            <button
              onClick={() => {
                onSelectTab(prevTab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group p-5 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#757367] group-hover:text-[#2e4c2c] flex items-center gap-1 mb-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Pestaña anterior
                </span>
                <p className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
                  {prevLabel}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#f5f0e6] group-hover:bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                onSelectTab('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-5 bg-white rounded-2xl border border-[#e5decb] hover:border-[#9bb593] hover:shadow-md transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#757367] mb-1 block">
                  Ir al portal principal
                </span>
                <p className="text-base font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
                  Página de Inicio
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#eaf2e8] flex items-center justify-center text-[#2e4c2c]">
                <Home className="w-4 h-4" />
              </div>
            </button>
          )}

          {nextTab && nextLabel ? (
            <button
              onClick={() => {
                onSelectTab(nextTab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group p-5 bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between cursor-pointer border border-[#8ea886]"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e341d] flex items-center gap-1 mb-1">
                  Siguiente pestaña <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <p className="text-base font-bold font-['Outfit',sans-serif] text-[#162716]">
                  {nextLabel}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/40 group-hover:bg-white/60 flex items-center justify-center text-[#1a2d19] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                onSelectTab('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-5 bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] rounded-2xl shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between cursor-pointer border border-[#8ea886]"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e341d] mb-1 block">
                  Finalizar recorrido
                </span>
                <p className="text-base font-bold font-['Outfit',sans-serif] text-[#162716]">
                  Volver al Inicio
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center text-[#1a2d19]">
                <Home className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* Explore all tabs grid */}
        <div className="bg-white p-6 rounded-2xl border border-[#e5decb] shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold font-['Outfit',sans-serif] text-[#1c2e1b]">
                Navegación completa entre secciones
              </h3>
              <p className="text-xs text-[#757367]">
                Explora cada una de las hojas independientes de Reborn Your Style con un clic.
              </p>
            </div>
            <button
              onClick={() => {
                onSelectTab('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#1a2d19] bg-[#eaf2e8] hover:bg-[#dbe9d8] transition-colors cursor-pointer border border-[#c2d6be]"
            >
              <Home className="w-3.5 h-3.5 text-[#2e4c2c]" />
              <span>Volver al Inicio</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TAB_ORDER.map((tabId) => {
              const meta = TAB_META[tabId];
              const Icon = meta.icon;
              const isActive = currentTab === tabId;
              return (
                <button
                  key={tabId}
                  onClick={() => {
                    onSelectTab(tabId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#eaf2e8] border-[#9bb593] shadow-xs ring-1 ring-[#9bb593]'
                      : 'bg-[#faf8f5] border-[#e5decb] hover:border-[#9bb593] hover:bg-[#f5f0e6]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isActive ? 'bg-[#9bb593] text-[#1a2d19]' : 'bg-[#e5decb] text-[#2e4c2c]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#2e4c2c]' : 'text-[#1c2e1b]'
                      }`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#757367] line-clamp-1">{meta.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
