import React, { useState } from 'react';
import { User, NavigationTab, Garment, Professional, Tutorial } from '../types';
import {
  MessageSquare,
  User as UserIcon,
  Plus,
  Menu,
  X,
  LogOut,
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

interface HeaderProps {
  currentUser: User | null;
  unreadCount: number;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAuth: () => void;
  onOpenPublish: () => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onOpenAdvisor?: () => void;
  onLogout?: () => void;
  garments?: Garment[];
  professionals?: Professional[];
  tutorials?: Tutorial[];
  onSelectGarment?: (garment: Garment) => void;
  onSelectProfessional?: (prof: Professional) => void;
  onSelectTutorial?: (tutorial: Tutorial) => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'quienes-somos', label: 'Quiénes somos', icon: Users },
  { id: 'catalogo', label: 'Catálogo', icon: ShoppingBag },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
  { id: 'tutoriales', label: 'Tutoriales', icon: BookOpen },
  { id: 'mision', label: 'Misión', icon: Target },
  { id: 'vision', label: 'Visión', icon: Eye },
  { id: 'impacto', label: 'Impacto', icon: Sparkles },
  { id: 'contacto', label: 'Contacto', icon: Mail },
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadCount,
  activeTab,
  onSelectTab,
  onOpenAuth,
  onOpenPublish,
  onOpenProfile,
  onOpenChat,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#9bb593] text-[#1a2d19] border-b border-[#8ea886] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* 1. Official Brand Logo */}
          <button
            onClick={() => handleTabClick('inicio')}
            className="flex items-center gap-2 group text-left cursor-pointer shrink-0 py-1"
            id="brand-logo-link"
            title="Reborn Your Style - Inicio"
          >
            <div className="bg-[#faf8f5] px-3.5 py-1.5 rounded-2xl shadow-xs border border-white/60 group-hover:bg-white transition-all flex items-center">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1X8Npu3ipOaNiAD2bNlieWyzM59yt-uEffoDwzvIyOoNAKnZ1xLmhoQEUyCImw_nh3_lMEaEZ5qiY8Cx-mod_i5fBzbgE2yholJqw9-jZJdu7ZwG4qziqHXVndrKw_-7XupWDeAnXNRFBVm218lb82YOzc2NYGdxwtRXZHdWl-DORnB2HwIz7SP4LwitJqOnvirccKpesimikh_17qTp-1Xupos_dcK_lVigF-H0_JwD4SyA26Wz-lfbgz6"
                alt="Reborn Your Style Logo Oficial"
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </div>
          </button>

          {/* 2. Desktop Navigation Menu: Clean, Professional, Organized in Top Bar */}
          <nav
            aria-label="Navegación principal"
            className="hidden lg:flex items-center gap-1 bg-[#8fae87]/35 p-1.5 rounded-full border border-[#82a37a]/40"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#faf8f5] text-[#1a2d19] shadow-xs font-bold'
                      : 'text-[#1a2d19]/80 hover:text-[#142313] hover:bg-white/40'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* 3. Top-Right Action Controls: Publicar Prenda, Chat, Perfil */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary Action: Publicar Prenda */}
            <button
              id="btn-header-publish"
              onClick={onOpenPublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1a2d19] bg-[#faf8f5] hover:bg-white rounded-full transition-all shadow-xs hover:shadow-sm active:scale-98 cursor-pointer border border-white/80"
            >
              <Plus className="w-4 h-4 text-[#274426]" />
              <span className="hidden sm:inline">Publicar una prenda</span>
              <span className="sm:hidden">Publicar</span>
            </button>

            {/* Chat Icon Button */}
            <button
              id="btn-header-chat"
              onClick={onOpenChat}
              className="relative p-2 text-[#1a2d19] hover:bg-white/40 rounded-full transition-colors cursor-pointer"
              title="Mensajes y conversaciones"
              aria-label="Mensajes"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#223920] rounded-full ring-2 ring-[#faf8f5]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  id="btn-header-profile"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 pr-3 bg-[#faf8f5]/90 hover:bg-white rounded-full transition-colors border border-white/80 cursor-pointer text-[#1a2d19] shadow-xs"
                  title="Ver y editar mi perfil"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#8fae87]"
                  />
                  <span className="text-xs font-semibold max-w-[85px] truncate hidden md:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {onLogout && (
                  <button
                    id="btn-header-logout"
                    onClick={onLogout}
                    title="Cerrar sesión"
                    className="p-2 text-[#1a2d19]/80 hover:text-red-700 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenAuth}
                className="px-3.5 py-2 text-xs font-semibold text-[#1a2d19] bg-[#faf8f5]/90 hover:bg-white rounded-full border border-white/80 shadow-xs transition-colors cursor-pointer"
              >
                Iniciar sesión
              </button>
            )}

            {/* Mobile / Tablet Menu Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1a2d19] rounded-xl hover:bg-white/40 border border-[#82a37a]/40 transition-colors cursor-pointer lg:hidden"
              aria-label="Menú principal de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Clean, Accessible, Pastel Green & Beige) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#8ea886] bg-[#faf8f5] text-[#1c2e1b] px-5 py-6 space-y-5 shadow-xl animate-in slide-in-from-top-2">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#e5decb]">
            <span className="text-xs uppercase font-bold text-[#2e4c2c] tracking-wider">
              Navegación
            </span>
            <span className="text-[11px] text-[#757367]">Reborn Your Style</span>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#9bb593] text-[#1a2d19] font-bold shadow-xs'
                      : 'text-[#1c2e1b] hover:bg-[#efe9dc] bg-white border border-[#e5decb]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a2d19]' : 'text-[#688a62]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Controls in Mobile */}
          <div className="pt-4 border-t border-[#e5decb] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPublish();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-[#1a2d19] bg-[#9bb593] hover:bg-[#8ea886] rounded-full shadow-xs cursor-pointer transition-all border border-[#8ea886]"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar una prenda</span>
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-[#1c2e1b] bg-white border border-[#e5decb] rounded-full cursor-pointer hover:bg-[#efe9dc]"
                >
                  <UserIcon className="w-4 h-4 text-[#688a62]" />
                  <span>Mi perfil ({currentUser.name})</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 text-xs font-semibold text-[#1c2e1b] bg-white rounded-full border border-[#dcd3bd] hover:bg-[#efe9dc] transition-colors cursor-pointer"
              >
                Iniciar sesión / Registrarse
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
