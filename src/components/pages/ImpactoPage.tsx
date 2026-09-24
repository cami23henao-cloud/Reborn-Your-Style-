import React from 'react';
import { NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { ImpactSection } from '../ImpactSection';

interface ImpactoPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPublish: () => void;
}

export const ImpactoPage: React.FC<ImpactoPageProps> = ({
  onSelectTab,
  onOpenPublish,
}) => {
  return (
    <div className="bg-[#f7faf8] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="impacto"
        onSelectTab={onSelectTab}
        badgeText="Sostenibilidad Medible"
        title="Impacto Ambiental y Social"
        subtitle="Descubre cuánto ahorro de agua y reducción de emisiones generas cada vez que decides transformar una prenda en lugar de descartarla."
        prevTab="tutoriales"
        prevTabLabel="Tutoriales"
        nextTab="contacto"
        nextTabLabel="Contacto"
      />

      {/* 2. Full Impact Section with Interactive Calculator */}
      <div className="py-6">
        <ImpactSection />
      </div>

      {/* 3. Bottom Navigation */}
      <PageFooterNav
        currentTab="impacto"
        onSelectTab={onSelectTab}
        prevTab="tutoriales"
        prevLabel="Tutoriales"
        nextTab="contacto"
        nextLabel="Contacto"
      />
    </div>
  );
};
