import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface LeadData {
  nombre: string;
  empresa: string;
  telefono: string;
  email: string;
}

interface LeadFormProps {
  onSubmit: (lead: LeadData) => void;
}

/**
 * Captura de contacto DESPUÉS de completar el quiz — el visitante ya
 * invirtió tiempo respondiendo y quiere ver su resultado, lo que baja
 * mucho la fricción comparado con pedir el contacto al inicio.
 *
 * Fase 1: sin backend propio. El submit dispara el evento de conversión
 * a GTM/dataLayer y revela el resultado + Calendly. Guardar el lead en
 * Supabase + disparar Resend/WhatsApp vía Railway es la Fase 2.
 */
export function LeadForm({ onSubmit }: LeadFormProps) {
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, empresa, telefono, email });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col justify-center py-6"
    >
      <span className="type-small font-semibold uppercase tracking-[0.14em] text-[#F6C967]">
        Último paso
      </span>
      <h2 className="type-h1 mt-3 text-white">Tu diagnóstico está listo.</h2>
      <p className="type-body-lg mt-4 text-white/70">
        Dinos a dónde enviarlo y con quién estamos hablando.
      </p>

      <div
        className="mt-8 space-y-5 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.55)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa</Label>
          <Input
            id="empresa"
            required
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nombre de tu empresa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">WhatsApp / Teléfono</Label>
          <Input
            id="telefono"
            required
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="81 0000 0000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
          />
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="submit"
          className="h-[52px] rounded-full bg-[var(--color-primary)] px-8 text-base font-semibold text-[var(--color-primary-foreground)] shadow-lg transition-transform duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-[1.02] active:scale-100"
        >
          Ver mi diagnóstico
        </Button>
      </div>
    </motion.form>
  );
}
