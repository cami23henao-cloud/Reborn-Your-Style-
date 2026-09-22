import React from 'react';
import { Tutorial } from '../types';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';

interface TutorialsSectionProps {
  tutorials: Tutorial[];
  onSelectTutorial: (tutorial: Tutorial) => void;
}

export const TutorialsSection: React.FC<TutorialsSectionProps> = ({
  tutorials,
  onSelectTutorial,
}) => {
  return (
    <section id="tutoriales-inspiracion" className="py-20 lg:py-28 bg-[#fef8f3] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
              Conocimiento Abierto
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
              Tutoriales e inspiración
            </h2>
            <p className="mt-2 text-base text-[#424843]">
              Aprende las bases de la deconstrucción y el remiendo textil con guías artesanales paso a paso.
            </p>
          </div>

          <button
            id="btn-all-tutorials"
            onClick={() => onSelectTutorial(tutorials[0])}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#032517] bg-[#f2ede8] hover:bg-[#e6e2dd] rounded-full transition-all self-start md:self-auto shrink-0"
          >
            <span>Ver guía destacada</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tutorial Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-[#f8f3ee] rounded-2xl overflow-hidden border border-[#e6e2dd] hover:border-[#486548] transition-all hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#ece7e2]">
                  <img
                    src={tutorial.image}
                    alt={tutorial.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#032517] text-white rounded-full">
                      {tutorial.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#fef8f3]/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#032517] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{tutorial.duration}</span>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-bold text-[#486548] uppercase tracking-wider block mb-1.5">
                    {tutorial.category}
                  </span>
                  <h3 className="text-base font-medium font-['Bodoni_Moda',serif] text-[#032517] leading-snug group-hover:text-[#486548] transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-xs text-[#424843] mt-2 line-clamp-2 leading-relaxed">
                    {tutorial.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  id={`btn-tutorial-${tutorial.id}`}
                  onClick={() => onSelectTutorial(tutorial)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#032517] bg-[#caecc6]/50 hover:bg-[#caecc6] border border-[#aecfab] rounded-full transition-all active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver tutorial</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
