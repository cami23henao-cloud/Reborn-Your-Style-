import React, { useState, useMemo } from 'react';
import { Garment, GarmentCategory } from '../types';
import { MapPin, Sparkles, Plus, Search, Filter } from 'lucide-react';

interface GarmentsSectionProps {
  garments: Garment[];
  onOpenPublish: () => void;
  onProposeIdea: (garment: Garment) => void;
}

const CATEGORIES: { id: GarmentCategory; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'camisas', label: 'Camisas' },
  { id: 'blusas', label: 'Blusas' },
  { id: 'pantalones', label: 'Pantalones' },
  { id: 'vestidos', label: 'Vestidos' },
  { id: 'faldas', label: 'Faldas' },
  { id: 'chaquetas', label: 'Chaquetas' },
  { id: 'bolsos', label: 'Bolsos' },
  { id: 'accesorios', label: 'Accesorios' },
];

export const GarmentsSection: React.FC<GarmentsSectionProps> = ({
  garments,
  onOpenPublish,
  onProposeIdea,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGarments = useMemo(() => {
    return garments.filter((g) => {
      const matchesCat =
        selectedCategory === 'todas' || g.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.neighborhood && g.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [garments, selectedCategory, searchQuery]);

  return (
    <section id="explora-catalogo" className="py-20 lg:py-28 bg-[#fef8f3] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
              Catálogo Abierto
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              Prendas en espera de rescate
            </h2>
            <p className="mt-2 text-base text-[#424843]">
              Piezas nobles con potencial de transformación esperando la creatividad de una modista.
            </p>
          </div>

          <button
            id="btn-catalogo-publicar"
            onClick={onOpenPublish}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow self-start md:self-auto shrink-0 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar mi prenda</span>
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="space-y-4 mb-10">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#032517] text-white shadow-sm'
                    : 'bg-[#f2ede8] text-[#424843] hover:bg-[#e6e2dd] hover:text-[#032517]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727973]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por prenda, ciudad, barrio o material..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-full text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Garment Grid */}
        {filteredGarments.length === 0 ? (
          <div className="py-16 text-center bg-[#f8f3ee] rounded-2xl border border-dashed border-[#c1c8c2]">
            <p className="text-base font-medium text-[#032517]">
              No hay prendas disponibles en esta categoría o búsqueda.
            </p>
            <p className="text-xs text-[#424843] mt-1 mb-6">
              ¡Sé la primera persona en publicar una prenda en esta sección!
            </p>
            <button
              onClick={onOpenPublish}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#032517] rounded-full hover:bg-[#1b3b2b]"
            >
              Publicar una prenda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGarments.map((garment) => (
              <div
                key={garment.id}
                className="bg-[#f8f3ee] rounded-2xl overflow-hidden border border-[#e6e2dd] hover:border-[#486548] transition-all hover:shadow-lg flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ece7e2]">
                  <img
                    src={garment.photos[0] || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80'}
                    alt={garment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#fef8f3]/90 backdrop-blur-sm text-[#032517] rounded-full border border-[#e6e2dd]">
                      {garment.category}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-medium bg-[#032517]/80 backdrop-blur-sm text-white rounded-full">
                      {garment.condition}
                    </span>
                  </div>

                  {/* Color Swatch Pill */}
                  <div className="absolute top-3 right-3 bg-[#fef8f3]/95 backdrop-blur-sm px-2 py-1 rounded-full border border-[#e6e2dd] flex items-center gap-1.5 shadow-sm">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                      style={{
                        background: garment.colorHex || '#9CA3AF',
                      }}
                      title={garment.colorName}
                    />
                    <span className="text-[10px] font-semibold text-[#1d1b19]">
                      {garment.colorName}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-[#486548] font-medium mb-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {garment.city}{garment.neighborhood ? `, ${garment.neighborhood}` : ''}
                      </span>
                    </div>

                    <h3 className="text-base font-medium font-['Bodoni_Moda',serif] text-[#032517] leading-snug group-hover:text-[#486548] transition-colors">
                      {garment.title}
                    </h3>

                    <p className="text-xs text-[#424843] mt-2 line-clamp-2 leading-relaxed">
                      {garment.description}
                    </p>

                    {garment.composition && (
                      <div className="mt-3 inline-block px-2 py-0.5 rounded bg-[#f2ede8] text-[10px] font-medium text-[#727973]">
                        {garment.composition}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#e6e2dd] flex items-center justify-between">
                    <span className="text-[11px] text-[#727973]">
                      {garment.createdAt}
                    </span>
                    <button
                      id={`btn-propose-${garment.id}`}
                      onClick={() => onProposeIdea(garment)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#032517] bg-[#caecc6]/60 hover:bg-[#caecc6] border border-[#aecfab] rounded-full transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#032517]" />
                      <span>Proponer idea</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
