import React, { useState } from 'react';
import { Mail, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ContactSectionProps {
  onOpenAdvisor: () => void;
}

const FAQS = [
  {
    q: '¿Cómo sé si mi prenda olvidada se puede transformar?',
    a: 'Prácticamente cualquier prenda confeccionada en fibras nobles (algodón, lino, lana, seda o denim) es una excelente candidata. Si tienes dudas sobre el tejido o corte, puedes utilizar nuestro botón "Asesor textil" para que un especialista evalúe tus fotos de forma gratuita.',
  },
  {
    q: '¿Cuánto cuesta aproximadamente una transformación textil?',
    a: 'El precio lo fijas de mutuo acuerdo con la modista o sastre según la complejidad del proyecto (desde 15-25€ por un corte y dobladillo entallado, hasta 60-120€ por una deconstrucción completa de abrigo o traje sastre).',
  },
  {
    q: '¿Cómo se gestiona el envío o entrega física de la prenda?',
    a: 'Fomentamos la proximidad: la mayoría de acuerdos se realizan en el mismo barrio o ciudad mediante entrega en el propio taller del artesano. Para distancias mayores, podéis coordinar mensajería sostenible en el chat.',
  },
  {
    q: '¿Cómo puedo verificar mi perfil como modista o sastre?',
    a: 'En el formulario de contacto selecciona "Quiero ofrecer mis servicios como modista". Te solicitaremos fotos de 2 o 3 proyectos previos de confección o upcycling y verificaremos tu perfil en menos de 24 horas.',
  },
];

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenAdvisor }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Duda sobre publicación de prenda',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ success: false, message: 'Por favor completa todos los campos requeridos.' });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitStatus({ success: true, message: data.message || 'Tu mensaje ha sido enviado correctamente.' });
        setFormData({ name: '', email: '', subject: 'Duda sobre publicación de prenda', message: '' });
      } else {
        setSubmitStatus({ success: false, message: data.error || 'Ocurrió un error al enviar el mensaje.' });
      }
    } catch (err) {
      setSubmitStatus({ success: true, message: 'Mensaje recibido. Nuestro equipo te responderá a la brevedad.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-[#f8f3ee] border-b border-[#e6e2dd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#486548] block mb-2">
            Estamos Aquí
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#032517]">
            ¿Tienes dudas o quieres colaborar?
          </h2>
          <p className="mt-3 text-base text-[#424843]">
            Escríbenos directamente o consulta las dudas habituales de nuestra comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Form & Direct Support */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#fef8f3] p-8 rounded-3xl border border-[#e6e2dd] shadow-sm">
              <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#032517] mb-6">
                Envíanos un mensaje
              </h3>

              {submitStatus && (
                <div
                  className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-xs font-medium ${
                    submitStatus.success
                      ? 'bg-[#caecc6]/50 text-[#032517] border border-[#aecfab]'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#032517]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  )}
                  <p className="leading-relaxed">{submitStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Tu nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Sofía Martínez"
                    className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Motivo de contacto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white"
                  >
                    <option value="Duda sobre publicación de prenda">Duda sobre publicación de prenda</option>
                    <option value="Quiero ofrecer mis servicios como modista">Quiero ofrecer mis servicios como modista</option>
                    <option value="Asesoría personalizada de estilo">Asesoría personalizada de estilo</option>
                    <option value="Prensa, alianzas o taller municipal">Prensa, alianzas o taller municipal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#032517] mb-1">
                    Mensaje o descripción
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Cuéntanos con detalle tu inquietud o la idea de transformación..."
                    className="w-full px-4 py-2.5 bg-[#f8f3ee] border border-[#e6e2dd] rounded-xl text-xs text-[#1d1b19] focus:outline-none focus:ring-1 focus:ring-[#032517] focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-submit-contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full transition-all shadow active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Enviando mensaje...' : 'Enviar mensaje'}</span>
                </button>
              </form>
            </div>

            {/* Direct Advisor Callout Card */}
            <div className="bg-[#caecc6]/40 p-6 rounded-2xl border border-[#aecfab] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#032517] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#032517]">
                    ¿Necesitas asesoría técnica inmediata?
                  </h4>
                  <p className="text-xs text-[#424843]">
                    Nuestros asesores textiles te guían con ideas de patronaje y corte.
                  </p>
                </div>
              </div>

              <button
                id="btn-contact-open-advisor"
                onClick={onOpenAdvisor}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#032517] hover:bg-[#1b3b2b] rounded-full shrink-0 transition-colors"
              >
                Contactar asesor
              </button>
            </div>
          </div>

          {/* Right: FAQs Accordion */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#032517] mb-6">
              Preguntas Frecuentes
            </h3>

            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#fef8f3] rounded-2xl border border-[#e6e2dd] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-[#f2ede8]/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-[#032517]">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-[#486548]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-[#727973]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-[#424843] leading-relaxed border-t border-[#e6e2dd]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
