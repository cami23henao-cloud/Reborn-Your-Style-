import React, { useState } from 'react';
import { User } from '../types';
import { MessageSquare, User as UserIcon, Plus, Menu, X, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  unreadCount: number;
  onOpenAuth: () => void;
  onOpenPublish: () => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onOpenAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount,
  onOpenAuth,
  onOpenPublish,
  onOpenProfile,
  onOpenChat,
  onOpenAdvisor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fef8f3]/95 backdrop-blur-md border-b border-[#e6e2dd] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group"
            id="brand-logo-link"
          >
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1X8Npu3ipOaNiAD2bNlieWyzM59yt-uEffoDwzvIyOoNAKnZ1xLmhoQEUyCImw_nh3_lMEaEZ5qiY8Cx-mod_i5fBzbgE2yholJqw9-jZJdu7ZwG4qziqHXVndrKw_-7XupWDeAnXNRFBVm218lb82YOzc2NYGdxwtRXZHdWl-DORnB2HwIz7SP4LwitJqOnvirccKpesimikh_17qTp-1Xupos_dcK_lVigF-H0_JwD4SyA26Wz-lfbgz6"
              alt="Reborn Your Style Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7 text-[14px] font-medium text-[#424843]">
            <button
              id="nav-inicio"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#032517] font-semibold hover:text-[#486548] transition-colors"
            >
              Inicio
            </button>
            <button
              id="nav-como-funciona"
              onClick={() => scrollToSection('como-funciona')}
              className="hover:text-[#032517] transition-colors"
            >
              ¿Cómo funciona?
            </button>
            <button
              id="nav-explorar-prendas"
              onClick={() => scrollToSection('explora-catalogo')}
              className="hover:text-[#032517] transition-colors"
            >
              Prendas
            </button>
            <button
              id="nav-profesionales"
              onClick={() => scrollToSection('directorio-profesionales')}
              className="hover:text-[#032517] transition-colors"
            >
              Profesionales
            </button>
            <button
              id="nav-tutoriales"
              onClick={() => scrollToSection('tutoriales-inspiracion')}
              className="hover:text-[#032517] transition-colors"
            >
              Tutoriales
            </button>
            <button
              id="nav-sobre-nosotros"
              onClick={() => scrollToSection('sobre-nosotros')}
              className="hover:text-[#032517] transition-colors"
            >
              Sobre nosotros
            </button>
            <button
              id="nav-contacto"
              onClick={() => scrollToSection('contacto')}
              className="hover:text-[#032517] transition-colors"
            >
              Contacto
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Contactar Asesor */}
            <button
              id="btn-header-advisor"
              onClick={onOpenAdvisor}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#032517] bg-[#caecc6]/50 hover:bg-[#caecc6] border border-[#aecfab] rounded-full transition-all"
              title="Habla con un especialista en patronaje y transformación textil"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#032517]" />
              <span>Asesor textil</span>
            </button>

            {/* Chat Icon Button */}
            <button
              id="btn-header-chat"
              onClick={onOpenChat}
              className="relative p-2.5 text-[#424843] hover:text-[#032517] hover:bg-[#f2ede8] rounded-full transition-colors"
              title="Mensajes y conversaciones"
              aria-label="Mensajes"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-[#032517] rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile or Login Button */}
            {currentUser ? (
              <button
                id="btn-header-profile"
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-[#f2ede8] rounded-full transition-colors border border-[#e6e2dd]"
                title="Ver y editar perfil"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#486548]"
                />
                <span className="text-xs font-semibold text-[#032517] max-w-[90px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-[#032517] hover:text-[#486548] transition-colors"
              >
                Iniciar sesión
              </button>
            )}

            {/* Primary Action: Publicar Prenda */}
            <button
              id="btn-header-publish"
              onClick={onOpenPublish}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow-sm hover:shadow active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar prenda</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              id="btn-mobile-chat"
              onClick={onOpenChat}
              className="relative p-2 text-[#032517]"
              aria-label="Abrir chat"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#032517] rounded-full"></span>
              )}
            </button>

            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#032517] rounded-lg hover:bg-[#f2ede8]"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e6e2dd] bg-[#fef8f3] px-5 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-2 text-sm font-medium text-[#1d1b19]">
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              ¿Cómo funciona?
            </button>
            <button
              onClick={() => scrollToSection('explora-catalogo')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              Prendas en espera de rescate
            </button>
            <button
              onClick={() => scrollToSection('directorio-profesionales')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              Modistas y artesanos
            </button>
            <button
              onClick={() => scrollToSection('tutoriales-inspiracion')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              Tutoriales e inspiración
            </button>
            <button
              onClick={() => scrollToSection('sobre-nosotros')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              Sobre nosotros
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#f2ede8]"
            >
              Contacto
            </button>
          </div>

          <div className="pt-4 border-t border-[#e6e2dd] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdvisor();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#032517] bg-[#caecc6]/60 border border-[#aecfab] rounded-full"
            >
              <Sparkles className="w-4 h-4" />
              Contactar con un asesor textil
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#032517] bg-[#f2ede8] rounded-full"
              >
                <UserIcon className="w-4 h-4" />
                Mi perfil ({currentUser.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 text-xs font-semibold text-[#032517] bg-[#f2ede8] rounded-full"
              >
                Iniciar sesión / Registrarse
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPublish();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-white bg-[#032517] rounded-full shadow"
            >
              <Plus className="w-4 h-4" />
              Publicar una prenda
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
