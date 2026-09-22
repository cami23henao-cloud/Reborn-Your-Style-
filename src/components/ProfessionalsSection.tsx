import React, { useState, useMemo } from 'react';
import { Professional } from '../types';
import { CheckCircle, Star, MapPin, MessageSquare, ExternalLink, Calendar } from 'lucide-react';

interface ProfessionalsSectionProps {
  professionals: Professional[];
  onSelectProfessional: (prof: Professional) => void;
  onContactProfessional: (prof: Professional) => void;
}

export const ProfessionalsSection: React.FC<ProfessionalsSectionProps> = ({
  professionals,
  onSelectProfessional,
  onContactProfessional,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((p) => {
      const matchSpec =
        selectedSpecialty === 'all' ||
        p.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()));
      const matchCity =
        selectedCity === 'all' || p.city.toLowerCase() === selectedCity.toLowerCase();
      return matchSpec && matchCity;
    });
  }, [professionals, selectedSpecialty, selectedCity]);

  return (
    <section id="directorio-profesionales" className="py-20 lg:py-28 bg-[#f8f3ee] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
              Comunidad Artesanal
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              Modistas y artesanos de proximidad
            </h2>
            <p className="mt-2 text-base text-[#424843]">
              Perfiles auditados por técnica, precisión en patronaje y compromiso con la circularidad.
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              id="filter-prof-specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium bg-[#fef8f3] border border-[#e6e2dd] rounded-full text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
            >
              <option value="all">Todas las especialidades</option>
              <option value="alta modistería">Alta modistería</option>
              <option value="sastrería">Sastrería y entalle</option>
              <option value="bordado">Bordado artesanal y reparación</option>
              <option value="upcycling">Upcycling deconstruido</option>
            </select>

            <select
              id="filter-prof-city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium bg-[#fef8f3] border border-[#e6e2dd] rounded-full text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
            >
              <option value="all">Todas las ciudades</option>
              <option value="madrid">Madrid</option>
              <option value="barcelona">Barcelona</option>
              <option value="valencia">Valencia</option>
              <option value="medellín">Medellín</option>
              <option value="bogotá">Bogotá</option>
            </select>
          </div>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfessionals.map((prof) => (
            <div
              key={prof.id}
              className="bg-[#fef8f3] rounded-2xl p-7 border border-[#e6e2dd] hover:border-[#486548] transition-all hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Info & Verified */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative">
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#caecc6]"
                    />
                    {prof.verified && (
                      <span className="absolute bottom-0 right-0 bg-[#032517] text-[#caecc6] p-0.5 rounded-full" title="Artesano Verificado">
                        <CheckCircle className="w-4 h-4 fill-[#032517] text-[#caecc6]" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium font-['Bodoni_Moda',serif] text-[#032517] truncate">
                        {prof.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-[#032517]">
                        <Star className="w-3.5 h-3.5 fill-[#facc15] text-[#facc15]" />
                        <span>{prof.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-[#486548] mt-0.5">
                      {prof.title}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#727973] mt-1">
                      <MapPin className="w-3 h-3 shrink-0 text-[#486548]" />
                      <span className="truncate">{prof.city}, {prof.neighborhood}</span>
                    </div>
                  </div>
                </div>

                {/* Bio Excerpt */}
                <p className="text-xs text-[#424843] leading-relaxed mb-5">
                  {prof.bio}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {prof.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-[10px] font-medium bg-[#f2ede8] text-[#032517] rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Availability & Action Buttons */}
              <div className="pt-4 border-t border-[#e6e2dd] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#486548] font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {prof.available}
                  </span>
                  <span className="text-[#727973]">
                    {prof.projectsCount} transformaciones
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id={`btn-view-profile-${prof.id}`}
                    onClick={() => onSelectProfessional(prof)}
                    className="w-full inline-flex items-center justify-center gap-1 py-2 text-xs font-semibold text-[#032517] bg-[#f2ede8] hover:bg-[#e6e2dd] rounded-full transition-colors"
                  >
                    <span>Ver perfil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-contact-${prof.id}`}
                    onClick={() => onContactProfessional(prof)}
                    className="w-full inline-flex items-center justify-center gap-1 py-2 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-colors active:scale-95 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contactar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
