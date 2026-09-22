import React, { useState } from 'react';
import { User, Garment } from '../types';
import { X, Sparkles, Send, CheckCircle2, MessageSquare, Shield } from 'lucide-react';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  targetGarment?: Garment | null;
  onAdvisorInquirySent: (inquiryData: any) => void;
}

export const AdvisorModal: React.FC<AdvisorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetGarment,
  onAdvisorInquirySent,
}) => {
  if (!isOpen) return null;

  const [subject, setSubject] = useState(
    targetGarment
      ? `Asesoría sobre prenda: ${targetGarment.title}`
      : 'Asesoría de estilo y deconstrucción upcycling'
  );
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userEmail, setUserEmail] = useState(currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: userName || currentUser?.name || 'Amante de la moda circular',
          userEmail: userEmail || currentUser?.email || 'contacto@comunidad.org',
          subject,
          message: message.trim(),
          garmentId: targetGarment?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
        onAdvisorInquirySent(data);
      }
    } catch (err) {
      setSent(true);
      onAdvisorInquirySent({
        inquiry: {
          id: `adv-${Date.now()}`,
          userName: userName || 'Usuario',
          subject,
          message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#fef8f3] w-full max-w-lg rounded-3xl shadow-2xl border border-[#e6e2dd] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#e6e2dd] flex items-center justify-between bg-[#f8f3ee]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#032517] text-[#caecc6] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#486548] block">
                Atención Especializada
              </span>
              <h2 className="text-xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
                Contactar con un Asesor Textil
              </h2>
            </div>
          </div>
          <button
            id="btn-close-advisor-modal"
            onClick={onClose}
            className="p-2 rounded-full text-[#424843] hover:text-[#032517] hover:bg-[#e6e2dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#caecc6]/70 text-[#032517] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-['Bodoni_Moda',serif] text-[#032517]">
                ¡Consulta enviada con éxito!
              </h3>
              <p className="text-xs text-[#424843] max-w-sm mx-auto leading-relaxed">
                Hemos recibido tu mensaje y se ha abierto un canal directo en tu sección de <strong>Conversaciones</strong> con nuestro equipo de modistas asesores.
              </p>
              <div className="pt-3">
                <button
                  id="btn-advisor-success-close"
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#032517] rounded-full hover:bg-[#1b3b2b]"
                >
                  Entendido, ver mensajes
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#424843] leading-relaxed">
                ¿No estás seguro de si tu prenda puede transformarse, qué modista elegir o cómo recortar una pieza? Cuéntanos y un especialista en patronaje te orientará.
              </p>

              {!currentUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#032517] mb-1">Tu nombre</label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ej. Sofía"
                      className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#032517] mb-1">Tu correo</label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Motivo de asesoría
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517]"
                >
                  <option value="Asesoría de estilo y deconstrucción upcycling">
                    Asesoría de estilo y deconstrucción upcycling
                  </option>
                  <option value="Evaluación de tejido (lino, lana, seda, denim)">
                    Evaluación de tejido (lino, lana, seda, denim)
                  </option>
                  <option value="Recomendación de modista o sastre en mi ciudad">
                    Recomendación de modista o sastre en mi ciudad
                  </option>
                  <option value="Presupuesto estimado de transformación">
                    Presupuesto estimado de transformación
                  </option>
                  <option value="Reparación artesanal y bordado visible Sashiko">
                    Reparación artesanal y bordado visible Sashiko
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#032517] mb-1">
                  Describe tu prenda o consulta *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ej. Tengo un trench de algodón rígido que me queda ancho de hombros. Quiero saber si es viable entallarlo o convertirlo en chaqueta cropped y si conocen modistas en mi zona..."
                  className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#727973] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#486548]" />
                  Asesoría artesanal sin costo
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  id="btn-send-advisor-inquiry"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Enviando...' : 'Enviar a los asesores'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
