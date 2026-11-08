import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// v0 de revisión — landing alternativa al diagnóstico. No está en producción:
// vive en la ruta /landing de la rama landing-lotes-v0. Los textos con
// beneficio fiscal están pendientes de revisión del consejo de Axis.
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

  // Rota el titular cada 5 s; se detiene al pasar el cursor o si el usuario prefiere menos movimiento.
  useEffect(() => {
    if (reducirMovimiento || pausa) return;
    const id = setInterval(() => setAngulo((i) => (i + 1) % ANGULOS.length), 5000);
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
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "#111" }}>
      <div className="px-6 py-2 text-center text-xs font-semibold" style={{ backgroundColor: "#e8edf8", color: "#021f74" }}>
        Versión de revisión v0. Los textos con beneficio fiscal están pendientes de revisión.
      </div>

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <a href="/landing" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white" style={{ border: "2px solid #e8edf8" }}>
            <img src="/logoaxis.png" alt="" width={32} height={32} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[#021f74]">Axis Consultores</span>
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          onClick={() => track("whatsapp_click", { fuente: "landing_v0" })}
          className="rounded-[8px] px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: "#021f74" }}
        >
          Escríbenos por WhatsApp
        </a>
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

          <form onSubmit={enviar} className="rounded-[12px] border bg-white p-6 sm:p-7" style={{ borderColor: "#e8edf8" }}>
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

        <section className="py-10">
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

        <section className="py-6 text-center">
          <p className="text-[15px] text-[#2e384c]">¿Prefieres explorar primero?</p>
          <a href="/" className="mt-1 inline-block text-sm font-semibold text-[#021f74] underline">
            Haz el diagnóstico gratuito de 2 minutos
          </a>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-[#2e384c]" style={{ borderColor: "#e8edf8" }}>
        Axis Consultores · Fuentes del Valle, Sector 7, San Pedro Garza García, N.L.
      </footer>
    </div>
  );
}
