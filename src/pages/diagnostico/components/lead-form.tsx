import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Icon } from "@/components/wizard/icon";

export interface LeadData {
  nombre: string;
  empresa?: string;
  telefono: string;
  email: string;
}

interface LeadFormProps {
  onSubmit: (lead: LeadData) => void;
}

/**
 * Captura de contacto DESPUÉS de completar el quiz — el visitante ya
 * invirtió tiempo respondiendo y quiere ver tu resultado, lo que baja
 * mucho la fricción comparado con pedir el contacto al inicio.
 *
 * Fase 1: sin backend propio. El submit dispara el evento de conversión
 * a GTM/dataLayer y revela el resultado + Calendly. Guardar el lead en
 * Supabase + disparar Resend/WhatsApp vía Railway es la Fase 2.
 */
export function LeadForm({ onSubmit }: LeadFormProps) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, telefono, email });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-xl flex-col justify-center py-6"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-gold)" }}>
        Último paso
      </span>
      <h2 className="font-heading mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#021f74] sm:text-[32px]">
        Tu diagnóstico está listo.
      </h2>
      <p className="mt-3 text-[15px] text-[#2e384c] sm:text-base">
        Dinos a dónde enviarlo y con quién estamos hablando.
      </p>

      <div
        className="axis-card mt-8 space-y-5 p-7 sm:p-8"
      >
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-[var(--color-ink)]">
            Nombre
          </Label>
          <Input
            id="nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-[var(--color-ink)]">
            WhatsApp / Teléfono
          </Label>
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
          <Label htmlFor="email" className="text-[var(--color-ink)]">
            Correo
          </Label>
          <Input
            id="email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <ShimmerButton type="submit">
          Ver mi diagnóstico
          <Icon name="arrow_forward" className="text-[18px]" />
        </ShimmerButton>
      </div>
    </motion.form>
  );
}
