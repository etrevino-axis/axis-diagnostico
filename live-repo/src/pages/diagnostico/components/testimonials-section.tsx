import { TestimonialsColumn, type Testimonial } from "@/components/ui/testimonials-columns-1";

// NOTA: contenido placeholder — reemplazar por reseñas reales de clientes
// en cuanto existan. Sin fotos falsas de "personas reales": el avatar usa
// la inicial del nombre sobre el acento dorado, siguiendo el patrón del
// UI Kit para señales de confianza discretas, no estampillas genéricas.
const testimonials: Testimonial[] = [
  {
    text: "El diagnóstico nos mostró en dos minutos algo que llevábamos meses sin ver con claridad.",
    name: "Claudia R.",
    role: "Directora de Operaciones, manufactura",
  },
  {
    text: "Descubrimos que estábamos dejando pasar deducciones importantes. La revisión se pagó sola.",
    name: "Roberto S.",
    role: "Socio Fundador, despacho de arquitectura",
  },
  {
    text: "Tener la documentación lista fue la diferencia entre esperar semanas o cerrar el crédito en días.",
    name: "Miguel A.",
    role: "Director General, distribuidora",
  },
  {
    text: "Pasamos de reaccionar cada fin de mes a tener números claros para decidir con anticipación.",
    name: "Daniela V.",
    role: "Gerente Financiera, logística",
  },
  {
    text: "El proceso fue directo, sin tecnicismos innecesarios — justo lo que necesitábamos para entender dónde estábamos parados.",
    name: "Jorge L.",
    role: "Actividad empresarial, consultoría",
  },
  {
    text: "Resolver los pendientes fiscales antes de que escalaran nos ahorró tiempo y preocupaciones reales.",
    name: "Patricia N.",
    role: "Directora Administrativa, servicios",
  },
];

const firstColumn = testimonials.slice(0, 2);
const secondColumn = testimonials.slice(2, 4);
const thirdColumn = testimonials.slice(4, 6);

export function TestimonialsSection() {
  return (
    <div className="mt-4 overflow-hidden rounded-[20px] py-10" style={{ backgroundColor: "var(--color-navy)" }}>
      <div className="mx-auto max-w-lg px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-gold)" }}>
          Testimonios
        </span>
        <h3 className="font-heading mt-3 text-2xl text-white sm:text-[28px]">
          Empresas que ya tienen claridad
        </h3>
      </div>

      <div className="mt-8 flex max-h-[420px] justify-center gap-4 overflow-hidden px-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] sm:max-h-[480px]">
        <TestimonialsColumn testimonials={firstColumn} duration={16} />
        <TestimonialsColumn testimonials={secondColumn} duration={20} className="hidden sm:block" />
        <TestimonialsColumn testimonials={thirdColumn} duration={18} className="hidden lg:block" />
      </div>
    </div>
  );
}
