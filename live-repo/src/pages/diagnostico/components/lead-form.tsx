import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Icon } from "@/components/wizard/icon";

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
      <span className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--color-gold)" }}>
        Último paso
      </span>
      <h2 className="font-heading mt-3 text-[28px] leading-tight text-white sm:text-[34px]">
        Su diagnóstico está listo.
      </h2>
      <p className="mt-3 text-[15px] text-white/65 sm:text-base">
        Indíquenos a dónde enviarlo y con quién estamos hablando.
      </p>

      <div
        className="mt-8 space-y-5 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
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
            placeholder="Su nombre completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="empresa" className="text-[var(--color-ink)]">
            Empresa o actividad
          </Label>
          <Input
            id="empresa"
            required
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nombre de su empresa"
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
            placeholder="usted@empresa.com"
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
