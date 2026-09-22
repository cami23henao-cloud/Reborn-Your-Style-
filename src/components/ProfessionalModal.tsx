import React from 'react';
import { Professional } from '../types';
import { X, Star, CheckCircle, MapPin, MessageSquare, Calendar, Award, Scissors } from 'lucide-react';

interface ProfessionalModalProps {
  professional: Professional | null;
  onClose: () => void;
  onContact: (prof: Professional) => void;
}

export const ProfessionalModal: React.FC<ProfessionalModalProps> = ({
  professional,
  onClose,
  onContact,
}) => {
  if (!professional) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#caecc6]"
              />
              {professional.verified && (
                <span className="absolute bottom-0 right-0 bg-[#032517] text-[#caecc6] p-0.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 fill-[#032517] text-[#caecc6]" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                  {professional.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#032517] bg-[#f2ede8] px-2 py-0.5 rounded-full border border-[#e6e2dd]">
                  <Star className="w-3 h-3 fill-[#facc15] text-[#facc15]" />
                  {professional.rating}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#486548] mt-0.5">
                {professional.title}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-[#727973] mt-0.5">
                <MapPin className="w-3 h-3 text-[#486548]" />
                <span>{professional.city}, {professional.neighborhood} ({professional.country})</span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-prof-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-2 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#486548]" />
              <span>Trayectoria y Filosofía</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#424843] leading-relaxed bg-[#f8f3ee] p-4 rounded-2xl border border-[#e6e2dd]">
              {professional.bio}
            </p>
          </div>

          {/* Specialties and Tags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-2">
              Especialidades y Técnicas
            </h4>
            <div className="flex flex-wrap gap-2">
              {professional.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#caecc6]/50 text-[#032517] border border-[#aecfab] rounded-full text-xs font-semibold"
                >
                  {spec}
                </span>
              ))}
              {professional.tags.map((tag, i) => (
                <span
                  key={`tag-${i}`}
                  className="px-3 py-1 bg-[#f2ede8] text-[#424843] rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Transformations */}
          {professional.portfolioImages && professional.portfolioImages.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#032517] mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#486548]" />
                <span>Transformaciones Recientes</span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {professional.portfolioImages.map((imgUrl, i) => (
                  <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-[#e6e2dd] bg-[#ece7e2]">
                    <img
                      src={imgUrl}
                      alt={`Trabajo ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="p-4 bg-[#f8f3ee] rounded-2xl border border-[#e6e2dd] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#486548] font-semibold">
              <Calendar className="w-4 h-4" />
              <span>{professional.available}</span>
            </div>
            <div className="text-[#032517] font-semibold">
              {professional.projectsCount} prendas recuperadas
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-[#e6e2dd] bg-[#f8f3ee] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-[#424843] hover:bg-[#e6e2dd] rounded-full transition-colors"
          >
            Cerrar
          </button>
          <button
            id={`btn-modal-contact-${professional.id}`}
            onClick={() => {
              onClose();
              onContact(professional);
            }}
            className="inline-flex items-center gap-2 px-7 py-2.5 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contactar a {professional.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
