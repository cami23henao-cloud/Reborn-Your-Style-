import React from 'react';
import { Garment, NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { GarmentsSection } from '../GarmentsSection';

interface CatalogoPageProps {
  garments: Garment[];
  onSelectTab: (tab: NavigationTab) => void;
  onOpenPublish: () => void;
  onProposeIdea: (garment: Garment) => void;
}

export const CatalogoPage: React.FC<CatalogoPageProps> = ({
  garments,
  onSelectTab,
  onOpenPublish,
  onProposeIdea,
}) => {
  return (
    <div className="bg-[#f7faf8] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="catalogo"
        onSelectTab={onSelectTab}
        badgeText="Prendas Disponibles"
        title="Catálogo de Moda Circular"
        subtitle="Explora prendas nobles listas para ser reutilizadas o reinventadas con la ayuda de modistas y artesanos de proximidad."
        prevTab="vision"
        prevTabLabel="Visión"
        nextTab="servicios"
        nextTabLabel="Servicios"
      />

      {/* 2. Full Garments Section */}
      <div className="py-8">
        <GarmentsSection
          garments={garments}
          onOpenPublish={onOpenPublish}
          onProposeIdea={onProposeIdea}
        />
      </div>

      {/* 3. Bottom Navigation */}
      <PageFooterNav
        currentTab="catalogo"
        onSelectTab={onSelectTab}
        prevTab="vision"
        prevLabel="Visión"
        nextTab="servicios"
        nextLabel="Servicios"
      />
    </div>
  );
};
