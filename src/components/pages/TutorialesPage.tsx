import React from 'react';
import { Tutorial, NavigationTab } from '../../types';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { PageFooterNav } from '../PageFooterNav';
import { TutorialsSection } from '../TutorialsSection';

interface TutorialesPageProps {
  tutorials: Tutorial[];
  onSelectTab: (tab: NavigationTab) => void;
  onSelectTutorial: (tutorial: Tutorial) => void;
}

export const TutorialesPage: React.FC<TutorialesPageProps> = ({
  tutorials,
  onSelectTab,
  onSelectTutorial,
}) => {
  return (
    <div className="bg-[#f7faf8] min-h-screen">
      {/* 1. Header Banner */}
      <PageHeaderBanner
        currentTab="tutoriales"
        onSelectTab={onSelectTab}
        badgeText="Academia Circular"
        title="Tutoriales de Upcycling y Confección"
        subtitle="Aprende técnicas artesanales paso a paso para deconstruir, reparar y personalizar tus prendas desde casa con herramientas accesibles."
        prevTab="servicios"
        prevTabLabel="Servicios"
        nextTab="impacto"
        nextTabLabel="Impacto"
      />

      {/* 2. Full Tutorials Section */}
      <div className="py-6">
        <TutorialsSection
          tutorials={tutorials}
          onSelectTutorial={onSelectTutorial}
        />
      </div>

      {/* 3. Bottom Navigation */}
      <PageFooterNav
        currentTab="tutoriales"
        onSelectTab={onSelectTab}
        prevTab="servicios"
        prevLabel="Servicios"
        nextTab="impacto"
        nextLabel="Impacto"
      />
    </div>
  );
};
