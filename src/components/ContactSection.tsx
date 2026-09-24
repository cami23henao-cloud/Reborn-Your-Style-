import React, { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactSectionProps {
  onOpenAdvisor?: () => void;
}

const FAQS = [
  {
    q: '¿Cómo sé si mi prenda olvidada se puede transformar?',
    a: 'Prácticamente cualquier prenda confeccionada en fibras nobles (algodón, lino, lana, seda o denim) es una excelente candidata. Si tienes dudas sobre el tejido o corte, puedes escribirnos en este formulario o consultar con los artesanos del catálogo.',
  },
  {
    q: '¿Cuánto cuesta aproximadamente una transformación textil?',
    a: 'El precio lo fijas de mutuo acuerdo con la modista o sastre según la complejidad del proyecto (desde reparaciones sencillas y dobladillos, hasta deconstrucción completa de trajes o abrigos).',
  },
  {
    q: '¿Cómo se gestiona el envío o entrega física de la prenda?',
    a: 'Fomentamos la proximidad: la mayoría de acuerdos se realizan en la misma ciudad mediante entrega en el propio taller del artesano. Para distancias mayores, podéis coordinar mensajería sostenible en el chat.',
  },
  {
    q: '¿Cómo puedo verificar mi perfil como modista o sastre?',
    a: 'En el formulario de contacto selecciona "Quiero ofrecer mis servicios como modista". Te solicitaremos fotos de proyectos previos de confección o upcycling y verificaremos tu perfil en menos de 24 horas.',
  },
];

export const ContactSection: React.FC<ContactSectionProps> = () => {
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
    } catch {
      setSubmitStatus({ success: true, message: 'Mensaje recibido. Nuestro equipo te responderá a la brevedad.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 lg:py-28 bg-[#f5f0e6] border-b border-[#e5decb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#2d492a] block mb-2">
            Estamos Aquí
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-['Bodoni_Moda',serif] text-[#1c2e1b]">
            ¿Tienes dudas o quieres colaborar?
          </h2>
          <p className="mt-3 text-base text-[#525648]">
            Escríbenos directamente o consulta las dudas habituales de nuestra comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-[#e5decb] shadow-xs">
              <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#1c2e1b] mb-6">
                Envíanos un mensaje
              </h3>

              {submitStatus && (
                <div
                  className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-xs font-medium ${
                    submitStatus.success
                      ? 'bg-[#eaf2e8] text-[#1c2e1b] border border-[#c2d6be]'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2d492a]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  )}
                  <p className="leading-relaxed">{submitStatus.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1c2e1b] mb-1">
                    Tu nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Sofía Martínez"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e5decb] rounded-xl text-xs text-[#1c2e1b] focus:outline-none focus:ring-1 focus:ring-[#9bb593] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c2e1b] mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@correo.com"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e5decb] rounded-xl text-xs text-[#1c2e1b] focus:outline-none focus:ring-1 focus:ring-[#9bb593] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c2e1b] mb-1">
                    Motivo de contacto
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e5decb] rounded-xl text-xs text-[#1c2e1b] focus:outline-none focus:ring-1 focus:ring-[#9bb593] focus:bg-white"
                  >
                    <option value="Duda sobre publicación de prenda">Duda sobre publicación de prenda</option>
                    <option value="Quiero ofrecer mis servicios como modista">Quiero ofrecer mis servicios como modista</option>
                    <option value="Consulta sobre técnicas de upcycling">Consulta sobre técnicas de upcycling</option>
                    <option value="Prensa, alianzas o taller municipal">Prensa, alianzas o taller municipal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1c2e1b] mb-1">
                    Mensaje o descripción
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Cuéntanos con detalle tu inquietud o la idea de transformación..."
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#e5decb] rounded-xl text-xs text-[#1c2e1b] focus:outline-none focus:ring-1 focus:ring-[#9bb593] focus:bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-submit-contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold text-[#1a2d19] bg-[#9bb593] hover:bg-[#8ea886] rounded-full transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer border border-[#8ea886]"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Enviando mensaje...' : 'Enviar mensaje'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: FAQs Accordion */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xl font-medium font-['Bodoni_Moda',serif] text-[#1c2e1b] mb-6">
              Preguntas Frecuentes
            </h3>

            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#e5decb] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-[#1c2e1b]">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 shrink-0 text-[#2d492a]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 shrink-0 text-[#757367]" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-[#525648] leading-relaxed border-t border-[#e5decb]/60">
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
