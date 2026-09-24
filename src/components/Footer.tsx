import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { Send, CheckCircle2, Heart } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAdvisor?: () => void;
  onOpenPublish: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      setNewsletterStatus(data.message || '¡Gracias por unirte a nuestro boletín circular!');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('¡Gracias por unirte a nuestro boletín circular!');
      setNewsletterEmail('');
    }
  };

  const handleNav = (tab: NavigationTab) => {
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1f3321] text-white pt-16 pb-12 border-t border-[#314d33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="md:col-span-4 space-y-4">
            <button
              onClick={() => handleNav('inicio')}
              className="bg-[#faf8f5] inline-block p-2 rounded-xl text-left cursor-pointer shadow-xs hover:bg-white transition-colors"
            >
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1X8Npu3ipOaNiAD2bNlieWyzM59yt-uEffoDwzvIyOoNAKnZ1xLmhoQEUyCImw_nh3_lMEaEZ5qiY8Cx-mod_i5fBzbgE2yholJqw9-jZJdu7ZwG4qziqHXVndrKw_-7XupWDeAnXNRFBVm218lb82YOzc2NYGdxwtRXZHdWl-DORnB2HwIz7SP4LwitJqOnvirccKpesimikh_17qTp-1Xupos_dcK_lVigF-H0_JwD4SyA26Wz-lfbgz6"
                alt="Reborn Your Style"
                className="h-8 w-auto object-contain"
              />
            </button>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Plataforma de moda circular para reutilizar, transformar y rediseñar prendas con modistas y artesanos de proximidad. Cada puntada cuenta una nueva historia.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-[#c2d6be]">
              <span className="w-2 h-2 rounded-full bg-[#9bb593] inline-block animate-pulse"></span>
              <span>Economía circular en Antioquia & Colombia</span>
            </div>
          </div>

          {/* Nav column 1: Identidad & Filosofía */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#c2d6be]">
              Identidad
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-medium">
              <li>
                <button onClick={() => handleNav('inicio')} className="hover:text-white transition-colors cursor-pointer">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('quienes-somos')} className="hover:text-white transition-colors cursor-pointer">
                  Quiénes somos
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('mision')} className="hover:text-white transition-colors cursor-pointer">
                  Misión
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('vision')} className="hover:text-white transition-colors cursor-pointer">
                  Visión
                </button>
              </li>
            </ul>
          </div>

          {/* Nav column 2: Exploración & Comunidad */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#c2d6be]">
              Secciones
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-medium">
              <li>
                <button onClick={() => handleNav('catalogo')} className="hover:text-white transition-colors cursor-pointer">
                  Catálogo
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('servicios')} className="hover:text-white transition-colors cursor-pointer">
                  Servicios
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contacto')} className="hover:text-white transition-colors cursor-pointer">
                  Contacto
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('tutoriales')} className="hover:text-white transition-colors cursor-pointer">
                  Tutoriales
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('impacto')} className="hover:text-white transition-colors cursor-pointer">
                  Impacto
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#c2d6be]">
              Boletín de moda circular
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Recibe técnicas de transformación textil, historias de modistas locales y novedades de la comunidad.
            </p>

            {newsletterStatus ? (
              <div className="p-3 bg-[#9bb593]/20 border border-[#9bb593]/40 rounded-xl flex items-center gap-2 text-xs text-[#c2d6be]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#9bb593]" />
                <span>{newsletterStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#9bb593]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#9bb593] hover:bg-[#8ea886] text-[#1a2d19] rounded-full text-xs font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-xs border border-[#8ea886]"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
          <div className="flex items-center gap-1">
            <span>© 2026 Reborn Your Style · Confeccionado con</span>
            <Heart className="w-3.5 h-3.5 text-[#9bb593] fill-[#9bb593]" />
            <span>para un futuro circular.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('contacto')} className="hover:text-white transition-colors cursor-pointer">
              Privacidad
            </button>
            <span>·</span>
            <button onClick={() => handleNav('contacto')} className="hover:text-white transition-colors cursor-pointer">
              Términos de servicio
            </button>
            <span>·</span>
            <button onClick={() => handleNav('contacto')} className="hover:text-white transition-colors cursor-pointer">
              Aviso legal
            </button>
            <span>·</span>
            <a href="/admin" className="hover:text-[#c2d6be] transition-colors cursor-pointer text-white/40 font-medium">
              Acceso Administrativo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
