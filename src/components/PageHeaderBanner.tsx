import React from 'react';
import { NavigationTab } from '../types';
import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface PageHeaderBannerProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  title: string;
  subtitle: string;
  badgeText: string;
  nextTab?: NavigationTab;
  nextTabLabel?: string;
  prevTab?: NavigationTab;
  prevTabLabel?: string;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  onSelectTab,
  title,
  subtitle,
  badgeText,
  nextTab,
  nextTabLabel,
  prevTab,
  prevTabLabel,
}) => {
  return (
    <div className="bg-gradient-to-b from-[#f5f0e6] via-[#faf7f2] to-[#faf7f2] border-b border-[#e5decb] pt-8 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Back to Home + Next/Prev quick buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => onSelectTab('inicio')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1a2d19] bg-white border border-[#dcd3bd] hover:bg-[#efe9dc] transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#2e4c2c]" />
            <span>Volver al Inicio</span>
          </button>

          <div className="flex items-center gap-2">
            {prevTab && prevTabLabel && (
              <button
                onClick={() => onSelectTab(prevTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#525648] bg-white border border-[#e5decb] hover:border-[#9bb593] hover:text-[#1c2e1b] transition-colors cursor-pointer"
              >
                <span>← {prevTabLabel}</span>
              </button>
            )}
            {nextTab && nextTabLabel && (
              <button
                onClick={() => onSelectTab(nextTab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1a2d19] bg-[#9bb593] hover:bg-[#8ea886] transition-all shadow-xs cursor-pointer border border-[#8ea886]"
              >
                <span>{nextTabLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#eaf2e8] text-[#2e4c2c] text-xs font-semibold tracking-wide uppercase mb-3 border border-[#c2d6be]">
            <span className="w-2 h-2 rounded-full bg-[#688a62] animate-pulse"></span>
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Outfit',sans-serif] text-[#1c2e1b] tracking-tight leading-tight">
            {title}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-[#525648] font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
