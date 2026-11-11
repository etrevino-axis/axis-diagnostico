import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// v0 de revisión — landing alternativa al diagnóstico. No está en producción:
// vive en la ruta /landing de la rama landing-lotes-v0. Los textos con
// beneficio fiscal están pendientes de revisión del consejo de Axis.
// Íconos de trazo (estilo Heroicons outline), como pide el kit del portal.
const ICON_PATHS: Record<string, string[]> = {
  check: ["M4.5 12.75l6 6 9-13.5"],
  location_on: [
    "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z",
    "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  ],
  groups: [
    "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  ],
  verified_user: [
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  ],
  folder_open: [
    "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
  ],
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {(ICON_PATHS[name] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const WHATSAPP_NUMBER = "528120349991"; // por confirmar: hay dos números en circulación
const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";

const GIROS = [
  "Lote de autos / compra-venta de autos",
  "Arrendamiento de inmuebles",
  "Persona física con actividad empresarial",
  "Honorarios / RESICO",
  "Comercio o tienda",
  "Servicios profesionales",
  "Inmobiliaria o construcción",
  "Manufactura o industria",
  "Empresa (persona moral)",
  "Voy a iniciar una actividad",
  "Otro",
];

// Cada pregunta se muestra unos segundos en el titular. Sin promesas de ahorro.
const ANGULOS = [
  { q: "¿Compras autos a particulares y no sabes cómo registrarlos bien?", sub: "Revisamos contigo cómo manejas hoy las compras a particulares que no entregan factura.", giro: GIROS[0] },
  { q: "¿Rentas inmuebles y no estás seguro de estar declarando bien?", sub: "Te decimos qué obligaciones aplican a tus rentas y las dejamos en orden.", giro: GIROS[1] },
  { q: "¿Tu empresa crece y la contabilidad ya no te alcanza?", sub: "Ordenamos tus números para que tomes decisiones con información clara.", giro: GIROS[8] },
  { q: "¿Tienes empleados y la nómina y el IMSS te quitan tiempo?", sub: "Nos encargamos del cálculo, el timbrado y las cuotas, y tú te enfocas en tu negocio.", giro: GIROS[8] },
  { q: "¿Tu contabilidad va atrasada y no sabes por dónde empezar?", sub: "Te ayudamos a ponerla al corriente con un plan claro, paso a paso.", giro: GIROS[2] },
  { q: "¿Tienes contador, pero sientes que no te explica?", sub: "Una segunda opinión sin costo, con alguien que te dice qué se hace y por qué.", giro: GIROS[8] },
];

const U = "https://images.unsplash.com/";
const FOTOS = {
  skyline: { src: `${U}photo-1783614221259-107cb8c396be?auto=format&fit=crop&w=1800&q=70`, alt: "Rascacielos de Monterrey con las montañas al fondo" },
  escritorio: { src: `${U}photo-1762831063004-bbd3ea38ba3a?auto=format&fit=crop&w=1200&q=70`, alt: "Escritorio con calculadora, cuaderno y lápiz" },
  calculadora: { src: `${U}photo-1762318986860-a7b18dd0da02?auto=format&fit=crop&w=1200&q=70`, alt: "Calculadora, anteojos y bolígrafos sobre un escritorio blanco" },
};

const TRUST = [
  { icon: "location_on", title: "En San Pedro Garza García", text: "Oficina en Fuentes del Valle." },
  { icon: "groups", title: "Atención de los socios", text: "Hablas con quienes llevan tu caso." },
  { icon: "verified_user", title: "Confidencialidad firmada", text: "Antes de recibir tus documentos." },
  { icon: "folder_open", title: "Portal privado", text: "Tus archivos, en un solo lugar." },
];

const PERFILES = [
  { title: "Lotes de autos", items: ["Registro de compras a particulares", "Obligaciones fiscales del lote", "Contabilidad mensual al corriente"] },
  { title: "Arrendamiento", items: ["Declaraciones de tus rentas", "Facturación a tus inquilinos", "Orden de ingresos y deducciones"] },
  { title: "Empresas y pymes", items: ["Contabilidad y estados financieros", "Nómina, IMSS y timbrado", "Reportes claros y CFO externo"] },
  { title: "Personas físicas", items: ["Actividad empresarial, RESICO y honorarios", "Regularización de meses atrasados", "Declaración anual"] },
];

const SESION = [
  { n: "1", title: "Entendemos tu operación", text: "Nos cuentas a qué te dedicas, cómo llevas hoy tus números y qué te preocupa." },
  { n: "2", title: "Revisamos tu situación", text: "Vemos cómo registras ingresos, gastos y obligaciones, y dónde hay puntos por atender." },
  { n: "3", title: "Te decimos qué sigue", text: "Si podemos ayudarte, recibes una propuesta por escrito. Si no te conviene, también te lo decimos." },
];

const STEPS = [
  { n: "01", title: "Primera llamada", text: "Platicamos de tu operación y te decimos con claridad si podemos ayudarte." },
  { n: "02", title: "Confidencialidad", text: "Firmamos un convenio de confidencialidad y abrimos un grupo de WhatsApp contigo." },
  { n: "03", title: "Plataforma y e.firma", text: "Subes tus documentos a nuestro portal seguro y habilitamos el acceso para trabajar tu contabilidad." },
  { n: "04", title: "Propuesta por escrito", text: "Recibes una carta propuesta con alcance, costo y forma de pago. Sin letras chiquitas." },
];

const FAQ = [
  { q: "¿La primera revisión tiene costo?", a: "No. Es una sesión de 20 a 30 minutos para conocer tu caso." },
  { q: "¿Quién va a atender mi caso?", a: "Eric Treviño y Bernardo, socios de Axis Consultores. Hablas con las personas que llevan tu contabilidad." },
  { q: "¿Cómo protegen mi información?", a: "Firmamos un convenio de confidencialidad antes de recibir tus documentos y los guardamos en un portal privado." },
  { q: "¿Cuánto cuesta trabajar con ustedes?", a: "Depende de tu operación. Después de la sesión recibes una carta propuesta por escrito con alcance, costo y forma de pago." },
  { q: "¿Qué necesito para empezar?", a: "Tus datos de contacto para la primera llamada. Más adelante te pediremos tu documentación fiscal y tu e.firma, siempre después de firmar la confidencialidad." },
  { q: "¿Qué tan rápido me responden?", a: "Te contactamos por WhatsApp el mismo día, en horario de oficina." },
  { q: "¿Trabajan solo con lotes de autos?", a: "Atendemos también a personas físicas con actividad empresarial y a pymes de Monterrey y su área metropolitana." },
];

function track(event: string, extra: Record<string, unknown> = {}) {
  // Solo cuenta conversiones en el dominio real, no en vistas previas.
  if (!window.location.hostname.endsWith("axisconsultoresmx.com")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...extra });
}

export default function Landing() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [giro, setGiro] = useState(GIROS[0]);
  const [angulo, setAngulo] = useState(0);
  const [pausa, setPausa] = useState(false);
  const reducirMovimiento = useReducedMotion();

  // Título y descripción propios de la landing (el HTML base es el del diagnóstico).
  useEffect(() => {
    const prev = document.title;
    document.title = "Contabilidad y asesoría fiscal en San Pedro Garza García | Axis Consultores";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", "Despacho contable y fiscal en Monterrey. Primera revisión sin costo, con atención directa de los socios. Lotes de autos, arrendamiento, pymes y personas físicas.");
    return () => { document.title = prev; if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc); };
  }, []);

  // Rota el titular cada 3.5 s; se detiene al pasar el cursor o si el usuario prefiere menos movimiento.
  useEffect(() => {
    if (reducirMovimiento || pausa) return;
    const id = setInterval(() => setAngulo((i) => (i + 1) % ANGULOS.length), 3500);
    return () => clearInterval(id);
  }, [reducirMovimiento, pausa]);
  const [acepta, setAcepta] = useState(false);
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    try {
      const r = await fetch("/api/notify-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", source: `landing-v0 | ${ANGULOS[angulo].q}`, nombre, telefono, giro }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.ok === false) throw new Error("fallo");
      track("lead_capturado", { fuente: "landing_v0", giro });
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  };

  return (
    <div id="top" className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "#111" }}>
      <div className="px-6 py-2 text-center text-xs font-semibold" style={{ backgroundColor: "#e8edf8", color: "#021f74" }}>
        Versión de revisión v0. Los textos con beneficio fiscal están pendientes de revisión.
      </div>

      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: "#e8edf8", backgroundColor: "rgba(248,249,252,0.92)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white" style={{ border: "2px solid #e8edf8" }}>
              <img src="/logoaxis.png" alt="" width={32} height={32} />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-[#021f74]">Axis Consultores</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#2e384c] md:flex" aria-label="Principal">
            <a href="#para-quien" className="hover:text-[#021f74]">Para quién</a>
            <a href="#sesion" className="hover:text-[#021f74]">Primera sesión</a>
            <a href="#como-trabajamos" className="hover:text-[#021f74]">Cómo trabajamos</a>
            <a href="#faq" className="hover:text-[#021f74]">Preguntas</a>
            <a href="/blog/" className="hover:text-[#021f74]">Blog</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              onClick={() => track("whatsapp_click", { fuente: "landing_v0_header" })}
              className="hidden rounded-[8px] border px-4 py-2 text-sm font-semibold text-[#021f74] sm:inline-block"
              style={{ borderColor: "#021f74", borderWidth: 1.5 }}
            >
              WhatsApp
            </a>
            <a href="#form" className="rounded-[8px] px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "#021f74" }}>
              Agendar sesión
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16">
        <section className="grid gap-10 py-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e384c]">Despacho contable en San Pedro Garza García</p>
            <div onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)} className="min-h-[250px] sm:min-h-[270px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={angulo}
                  initial={reducirMovimiento ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducirMovimiento ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="font-heading mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[#021f74] sm:text-[42px]">
                    {ANGULOS[angulo].q}
                  </h1>
                  <p className="mt-4 text-base leading-relaxed text-[#2e384c]">
                    {ANGULOS[angulo].sub} La primera revisión no tiene costo.
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-2" role="tablist" aria-label="Elegir pregunta">
                {ANGULOS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Pregunta ${i + 1}`}
                    onClick={() => {
                      setAngulo(i);
                      setGiro(ANGULOS[i].giro);
                    }}
                    className="h-2 rounded-full transition-all"
                    style={{ width: i === angulo ? 24 : 8, backgroundColor: i === angulo ? "#021f74" : "#c9d3ea" }}
                  />
                ))}
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-[15px] text-[#2e384c]">
              <li>Atención directa de los socios, sin intermediarios.</li>
              <li>Convenio de confidencialidad antes de recibir tus documentos.</li>
              <li>Portal privado para tus archivos.</li>
            </ul>
          </div>

          <form id="form" onSubmit={enviar} className="scroll-mt-24 rounded-[12px] border bg-white p-6 sm:p-7" style={{ borderColor: "#e8edf8" }}>
            {estado === "ok" ? (
              <div>
                <h2 className="font-heading text-xl font-bold text-[#021f74]">Gracias, {nombre.split(" ")[0]}.</h2>
                <p className="mt-2 text-[15px] text-[#2e384c]">Te escribimos por WhatsApp en unos minutos. Si prefieres, agenda directo tu sesión.</p>
                <a
                  href={CALENDLY_URL}
                  onClick={() => track("calendly_click", { fuente: "landing_v0" })}
                  className="mt-5 inline-block rounded-[8px] px-5 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#021f74" }}
                >
                  Agendar mi sesión
                </a>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold text-[#021f74]">Déjanos tus datos</h2>
                <p className="mt-1 text-sm text-[#2e384c]">Sin compromiso. Te contactamos hoy mismo en horario de oficina.</p>
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="l-nombre">Nombre</Label>
                    <Input id="l-nombre" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre completo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-tel">WhatsApp</Label>
                    <Input id="l-tel" required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="81 0000 0000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="l-giro">¿A qué te dedicas?</Label>
                    <select
                      id="l-giro"
                      value={giro}
                      onChange={(e) => setGiro(e.target.value)}
                      className="h-10 w-full rounded-[8px] border bg-white px-3 text-sm"
                      style={{ borderColor: "#e8edf8" }}
                    >
                      {GIROS.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-[#2e384c]">
                    <input type="checkbox" required checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5" />
                    <span>Acepto que Axis Consultores use mis datos para contactarme. Aviso de privacidad (pendiente de publicar).</span>
                  </label>
                </div>
                {estado === "error" && (
                  <p className="mt-3 text-sm" style={{ color: "#b3423a" }}>
                    No pudimos enviar tus datos. Intenta de nuevo o escríbenos por WhatsApp.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={estado === "enviando"}
                  className="mt-5 h-11 w-full rounded-[8px] text-sm font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "#021f74" }}
                >
                  {estado === "enviando" ? "Enviando" : "Quiero que me contacten"}
                </button>
              </>
            )}
          </form>
        </section>

        <section className="py-4">
          <div className="grid gap-4 rounded-[12px] border bg-white p-6 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "#e8edf8" }}>
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#e8edf8" }}>
                  <Icon name={t.icon} className="text-[19px] text-[#021f74]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#021f74]">{t.title}</p>
                  <p className="mt-0.5 text-sm text-[#2e384c]">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-6">
          <div className="relative overflow-hidden rounded-[12px]" style={{ backgroundColor: "#e8edf8" }}>
            <img src={FOTOS.skyline.src} alt={FOTOS.skyline.alt} loading="lazy" className="h-[220px] w-full object-cover sm:h-[300px]" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7" style={{ background: "rgba(2,31,116,0.82)" }}>
              <p className="text-sm font-semibold text-white sm:text-base">Contabilidad y cumplimiento fiscal para negocios y personas de Monterrey y su área metropolitana.</p>
            </div>
          </div>
        </section>

        <section id="para-quien" className="scroll-mt-24 py-10">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-[#021f74]">Para quién trabajamos</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-[#2e384c]">Negocios y personas de Monterrey y su área metropolitana que quieren tener su contabilidad en orden y con alguien que les explique.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PERFILES.map((p) => (
              <div key={p.title} className="rounded-[12px] border bg-white p-5" style={{ borderColor: "#e8edf8" }}>
                <p className="font-semibold text-[#021f74]">{p.title}</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#2e384c]">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 shrink-0 text-[16px] text-[#021f74]" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="sesion" className="scroll-mt-24 py-10">
          <div className="grid gap-6 md:grid-cols-[1fr_280px] md:items-center">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-[#021f74]">Qué pasa en tu primera sesión</h2>
              <p className="mt-2 max-w-2xl text-[15px] text-[#2e384c]">Dura de 20 a 30 minutos, no tiene costo y no te compromete a nada.</p>
            </div>
            <img src={FOTOS.calculadora.src} alt={FOTOS.calculadora.alt} loading="lazy" className="hidden aspect-[4/3] w-full rounded-[12px] object-cover object-center md:block" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SESION.map((s) => (
              <div key={s.n} className="flex gap-4 rounded-[12px] border bg-white p-5" style={{ borderColor: "#e8edf8" }}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: "#021f74" }}>{s.n}</span>
                <div>
                  <p className="font-semibold text-[#021f74]">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#2e384c]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="como-trabajamos" className="scroll-mt-24 py-10">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-[#021f74]">Cómo trabajamos</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[12px] border bg-white p-5" style={{ borderColor: "#e8edf8" }}>
                <p className="text-xs font-semibold tracking-[0.04em] text-[#2e384c]">{s.n}</p>
                <p className="mt-1 font-semibold text-[#021f74]">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#2e384c]">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="grid overflow-hidden rounded-[12px] border bg-white md:grid-cols-[1fr_340px]" style={{ borderColor: "#e8edf8" }}>
           <div className="p-7 sm:p-8">
            <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-[#021f74]">Tu información, protegida</h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#2e384c]">
              <li className="flex gap-3"><Icon name="check" className="mt-1 shrink-0 text-[16px] text-[#021f74]" /><span>Firmamos un convenio de confidencialidad antes de recibir tu documentación.</span></li>
              <li className="flex gap-3"><Icon name="check" className="mt-1 shrink-0 text-[16px] text-[#021f74]" /><span>Tus archivos viven en un portal privado de acceso restringido, no en cadenas de correo ni en chats.</span></li>
              <li className="flex gap-3"><Icon name="check" className="mt-1 shrink-0 text-[16px] text-[#021f74]" /><span>Solo pedimos tu e.firma cuando ya aceptaste la propuesta y vamos a trabajar tu contabilidad.</span></li>
            </ul>
           </div>
           <img src={FOTOS.escritorio.src} alt={FOTOS.escritorio.alt} loading="lazy" className="h-48 w-full object-cover md:h-full" />
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-10">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-[#021f74]">Preguntas frecuentes</h2>
          <div className="mt-5 divide-y rounded-[12px] border bg-white" style={{ borderColor: "#e8edf8" }}>
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer font-semibold text-[#021f74]">{f.q}</summary>
                <p className="mt-2 text-[15px] leading-relaxed text-[#2e384c]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-[12px] p-8 text-center sm:p-10" style={{ backgroundColor: "#021f74" }}>
            <h2 className="font-heading text-2xl font-bold tracking-[-0.015em] text-white sm:text-[28px]">Platiquemos de tu caso</h2>
            <p className="mx-auto mt-2 max-w-xl text-[15px] text-white/80">Una sesión de 20 a 30 minutos, sin costo y sin compromiso.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#top" className="inline-flex h-11 items-center rounded-[8px] bg-white px-6 text-sm font-semibold text-[#021f74]">Dejar mis datos</a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                onClick={() => track("whatsapp_click", { fuente: "landing_v0_cta" })}
                className="inline-flex h-11 items-center rounded-[8px] border border-white/60 px-6 text-sm font-semibold text-white"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div
            className="flex flex-col gap-6 rounded-[12px] border bg-white p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            style={{ borderColor: "#e8edf8" }}
          >
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2e384c]">Si prefieres empezar por tu cuenta</p>
              <h2 className="font-heading mt-2 text-2xl font-bold tracking-[-0.015em] text-[#021f74]">
                Conoce qué tan en orden está tu situación
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#2e384c]">
                Responde 6 preguntas sobre tu contabilidad y tus obligaciones con el SAT y recibe un resumen por área. Empiezas sin dar tus datos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["6 preguntas", "2 minutos", "Sin costo"].map((c) => (
                  <span key={c} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "#e8edf8", color: "#021f74" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <a
              href="/"
              onClick={() => track("diagnostico_click", { fuente: "landing_v0" })}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-[8px] border px-6 text-sm font-semibold text-[#021f74]"
              style={{ borderColor: "#021f74", borderWidth: 1.5 }}
            >
              Hacer el diagnóstico
            </a>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: "#021f74" }}>
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                <img src="/logoaxis.png" alt="" width={28} height={28} />
              </span>
              <span className="text-[15px] font-bold text-white">Axis Consultores</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
              Despacho contable y fiscal en San Pedro Garza García. Contabilidad en orden y alguien que te explica qué se hace y por qué.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Navegación</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li><a href="#para-quien" className="hover:text-white">Para quién trabajamos</a></li>
              <li><a href="#sesion" className="hover:text-white">Primera sesión</a></li>
              <li><a href="#como-trabajamos" className="hover:text-white">Cómo trabajamos</a></li>
              <li><a href="#faq" className="hover:text-white">Preguntas frecuentes</a></li>
              <li><a href="/blog/" className="hover:text-white">Blog</a></li>
              <li><a href="/" className="hover:text-white">Diagnóstico gratuito</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Contacto</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} onClick={() => track("whatsapp_click", { fuente: "landing_v0_footer" })} className="hover:text-white">
                  WhatsApp
                </a>
              </li>
              <li><a href="mailto:info@axisconsultoresmx.com" className="hover:text-white">info@axisconsultoresmx.com</a></li>
              <li><a href={CALENDLY_URL} className="hover:text-white">Agendar sesión</a></li>
              <li><a href="https://instagram.com/axisconsultores.mx" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">Ubicación</p>
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              Fuentes del Valle, Sector 7
              <br />
              66224 San Pedro Garza García, N.L.
            </p>
            <p className="mt-3 text-sm text-white/60">Horario: [por confirmar]</p>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Axis Consultores. Todos los derechos reservados.</p>
            <p>Aviso de privacidad (pendiente de publicar) · Fotografías: Unsplash</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
