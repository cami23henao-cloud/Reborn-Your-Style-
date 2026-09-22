import React, { useState } from 'react';
import { Send, CheckCircle2, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdvisor: () => void;
  onOpenPublish: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdvisor, onOpenPublish }) => {
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
    } catch (err) {
      setNewsletterStatus('¡Gracias por unirte a nuestro boletín circular!');
      setNewsletterEmail('');
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#032517] text-white pt-16 pb-12 border-t border-[#1b3b2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-[#fef8f3] inline-block p-2 rounded-xl">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1X8Npu3ipOaNiAD2bNlieWyzM59yt-uEffoDwzvIyOoNAKnZ1xLmhoQEUyCImw_nh3_lMEaEZ5qiY8Cx-mod_i5fBzbgE2yholJqw9-jZJdu7ZwG4qziqHXVndrKw_-7XupWDeAnXNRFBVm218lb82YOzc2NYGdxwtRXZHdWl-DORnB2HwIz7SP4LwitJqOnvirccKpesimikh_17qTp-1Xupos_dcK_lVigF-H0_JwD4SyA26Wz-lfbgz6"
                alt="Reborn Your Style"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Plataforma de moda circular para reutilizar, transformar y rediseñar prendas con modistas y artesanos de proximidad. Cada puntada cuenta una nueva historia.
            </p>
          </div>

          {/* Nav column 1 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#caecc6]">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-medium">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('como-funciona')} className="hover:text-white transition-colors">
                  ¿Cómo funciona?
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('explora-catalogo')} className="hover:text-white transition-colors">
                  Catálogo de prendas
                </button>
              </li>
              <li>
                <button onClick={onOpenPublish} className="hover:text-white transition-colors">
                  Publicar prenda
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('directorio-profesionales')} className="hover:text-white transition-colors">
                  Directorio de artesanos
                </button>
              </li>
            </ul>
          </div>

          {/* Nav column 2 */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#caecc6]">
              Comunidad
            </h4>
            <ul className="space-y-2 text-xs text-white/70 font-medium">
              <li>
                <button onClick={() => scrollTo('tutoriales-inspiracion')} className="hover:text-white transition-colors">
                  Tutoriales DIY
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('sobre-nosotros')} className="hover:text-white transition-colors">
                  Manifiesto & Misión
                </button>
              </li>
              <li>
                <button onClick={onOpenAdvisor} className="hover:text-white transition-colors">
                  Contactar asesor textil
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('contacto')} className="hover:text-white transition-colors">
                  Ofrecer servicios
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#caecc6]">
              Boletín de moda circular
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Recibe técnicas de transformación textil, historias de modistas locales y novedades de la comunidad.
            </p>

            {newsletterStatus ? (
              <div className="p-3 bg-[#caecc6]/20 border border-[#caecc6]/40 rounded-xl flex items-center gap-2 text-xs text-[#caecc6]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
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
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-[#caecc6]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#caecc6] hover:bg-[#b2e5ac] text-[#032517] rounded-full text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
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
            <Heart className="w-3.5 h-3.5 text-[#caecc6] fill-[#caecc6]" />
            <span>para un futuro circular.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo('contacto'); }} className="hover:text-white transition-colors">
              Privacidad
            </a>
            <span>·</span>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo('contacto'); }} className="hover:text-white transition-colors">
              Términos de servicio
            </a>
            <span>·</span>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); scrollTo('contacto'); }} className="hover:text-white transition-colors">
              Aviso legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
