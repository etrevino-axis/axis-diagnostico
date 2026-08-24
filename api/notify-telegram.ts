export const config = { runtime: "nodejs" };

interface NotifyPayload {
  type?: "lead" | "profile";
  nombre: string;
  empresa: string;
  telefono?: string;
  email: string;
  scorePercent?: number;
  tierStamp?: string;
  puntoDebil?: string;
  profile?: Record<string, string>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Faltan TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID en las variables de entorno de Vercel.");
    res.status(200).json({ ok: false, reason: "telegram_not_configured" });
    return;
  }

  let body: NotifyPayload;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const text = body.type === "profile" ? buildProfileMessage(body) : buildLeadMessage(body);

  try {
    const tgResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
    });

    if (!tgResponse.ok) {
      const errText = await tgResponse.text();
      console.error("Telegram API error:", errText);
      res.status(200).json({ ok: false, reason: "telegram_api_error" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error llamando a Telegram:", err);
    res.status(200).json({ ok: false, reason: "network_error" });
  }
}

function buildLeadMessage(body: NotifyPayload): string {
  const { nombre, empresa, telefono, email, scorePercent, tierStamp, puntoDebil } = body;
  return (
    `🆕 *Nuevo diagnóstico completado*\n\n` +
    `👤 *Nombre:* ${escapeMd(nombre)}\n` +
    `🏢 *Empresa/Actividad:* ${escapeMd(empresa)}\n` +
    `📱 *WhatsApp:* ${escapeMd(telefono)}\n` +
    `✉️ *Correo:* ${escapeMd(email)}\n\n` +
    `📊 *Resultado:* ${escapeMd(tierStamp)} (${scorePercent}%)\n` +
    `⚠️ *Punto más débil:* ${escapeMd(puntoDebil)}`
  );
}

function buildProfileMessage(body: NotifyPayload): string {
  const { nombre, empresa, email, profile } = body;
  const lines = Object.entries(profile ?? {})
    .map(([q, a]) => `▪️ ${escapeMd(q)}\n   ${escapeMd(a)}`)
    .join("\n");
  return (
    `📋 *Perfil ampliado*\n` +
    `_(mismo lead: ${escapeMd(nombre)} — ${escapeMd(empresa)} — ${escapeMd(email)})_\n\n` +
    lines
  );
}

function escapeMd(value: string | undefined): string {
  if (!value) return "—";
  return value.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
