import React from 'react';
import { NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { ContactSection } from '../ContactSection';

interface ContactoPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAdvisor: () => void;
}

export const ContactoPage: React.FC<ContactoPageProps> = ({
  onSelectTab,
  onOpenAdvisor,
}) => {
  return (
    <div className="bg-[#f7faf8] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="contacto"
        onSelectTab={onSelectTab}
        badgeText="Atención y Comunidad"
        title="Contacto y Soporte Circular"
        subtitle="¿Tienes dudas sobre una prenda, quieres registrar tu taller o necesitas ayuda personalizada? Escríbenos directamente o consulta las preguntas frecuentes."
        prevTab="servicios"
        prevTabLabel="Servicios"
        nextTab="tutoriales"
        nextTabLabel="Tutoriales"
      />

      {/* 2. Full Contact Section */}
      <div className="py-6">
        <ContactSection onOpenAdvisor={onOpenAdvisor} />
      </div>

      {/* 3. Bottom Navigation */}
      <PageFooterNav
        currentTab="contacto"
        onSelectTab={onSelectTab}
        prevTab="servicios"
        prevLabel="Servicios"
        nextTab="tutoriales"
        nextLabel="Tutoriales"
      />
    </div>
  );
};
