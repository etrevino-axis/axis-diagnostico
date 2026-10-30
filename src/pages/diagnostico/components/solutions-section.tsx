import { Icon } from "@/components/wizard/icon";

// Sustituye a la sección de testimonios mientras no haya reseñas reales de
// clientes. Describe únicamente lo que Axis ofrece, sin cifras ni citas.
const solutions = [
  {
    icon: "receipt_long",
    title: "Contabilidad al día",
    text: "Registramos tus ingresos y gastos cada mes para que siempre sepas dónde estás parado.",
  },
  {
    icon: "verified_user",
    title: "Cumplimiento con el SAT",
    text: "Declaraciones y obligaciones presentadas a tiempo, con alguien que te explica qué se hace y por qué.",
  },
  {
    icon: "home_work",
    title: "Personas físicas",
    text: "RESICO, rentas y actividad empresarial: te decimos qué aplica a tu caso y lo dejamos en orden.",
  },
  {
    icon: "folder_open",
    title: "Regularización de pendientes",
    text: "Si traes meses atrasados o información sin ordenar, la ponemos al corriente con un plan claro.",
  },
  {
    icon: "insights",
    title: "Reportes claros para decidir",
    text: "Números sencillos de leer y, cuando lo necesitas, acompañamiento financiero de un CFO externo.",
  },
];

export function SolutionsSection() {
  return (
    <div className="axis-card mt-4 p-7 sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#2e384c" }}>
        Cómo te ayudamos
      </span>
      <h3 className="font-heading mt-3 text-2xl font-bold tracking-[-0.02em] text-[#021f74] sm:text-[28px]">
        Soluciones de Axis Consultores
      </h3>
      <ul className="mt-6 space-y-5">
        {solutions.map((item) => (
          <li key={item.title} className="flex items-start gap-3.5">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#e8edf8" }}
            >
              <Icon name={item.icon} className="text-[19px] text-[#021f74]" />
            </span>
            <div>
              <p className="font-semibold text-[#021f74]">{item.title}</p>
              <p className="mt-0.5 text-[15px] leading-relaxed text-[#2e384c]">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
