// Genera el blog como HTML estático (legible para Google y para modelos de lenguaje
// que no ejecutan JavaScript), más sitemap.xml y llms.txt. Se ejecuta después de `vite build`.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SRC = join(ROOT, "content", "blog");
const SITE = (process.env.SITE_URL || "https://diagnostico.axisconsultoresmx.com").replace(/\/$/, "");
const ORG = "Axis Consultores";
const GTM = "GTM-M7BHL7HF";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fechaLarga = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

function parse(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("Sin frontmatter: " + file);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = m[2];
  // FAQ para datos estructurados: "### Pregunta" + párrafo dentro de "## Preguntas frecuentes"
  const faqs = [];
  const sec = body.match(/## Preguntas frecuentes\n([\s\S]*?)(?=\n## |$)/);
  if (sec) {
    for (const b of sec[1].split(/\n### /).slice(1)) {
      const [q, ...rest] = b.split("\n");
      faqs.push({ q: q.trim(), a: rest.join(" ").trim() });
    }
  }
  const words = body.split(/\s+/).length;
  return { ...meta, body, faqs, minutes: Math.max(3, Math.round(words / 200)) };
}

const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const id = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};
renderer.link = (href, title, text) =>
  `<a href="${href}"${/^https?:/.test(href) ? ' rel="noopener" target="_blank"' : ""}>${text}</a>`;
marked.use({ renderer });

const CSS = `
:root{--navy:#021f74;--ink:#111;--muted:#2e384c;--line:#e8edf8;--bg:#f8f9fc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:'DM Sans',system-ui,sans-serif;font-size:16px;line-height:1.7}
a{color:var(--navy)}img{max-width:100%}
.wrap{max-width:760px;margin:0 auto;padding:0 24px}.wide{max-width:1000px;margin:0 auto;padding:0 24px}
header.top{position:sticky;top:0;z-index:5;background:rgba(248,249,252,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header.top .wide{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:12px;padding-bottom:12px}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:700;color:var(--navy);font-size:15px}
.brand span.logo{display:flex;width:44px;height:44px;border-radius:50%;background:#fff;border:2px solid var(--line);align-items:center;justify-content:center}
nav a{margin-left:20px;text-decoration:none;color:var(--muted);font-size:14px;font-weight:500}
.btn{display:inline-block;background:var(--navy);color:#fff!important;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin-left:20px}
main{padding:32px 0 64px}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:8px}.crumbs a{color:var(--muted)}
.cat{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
h1{font-size:clamp(28px,5vw,40px);line-height:1.12;letter-spacing:-.02em;color:var(--navy);margin:10px 0 12px}
h2{font-size:24px;letter-spacing:-.015em;color:var(--navy);margin:40px 0 8px;line-height:1.25}
h3{font-size:18px;color:var(--navy);margin:24px 0 4px}
.meta{font-size:14px;color:var(--muted);margin-bottom:24px}
.note{background:#e8edf8;border-radius:8px;padding:12px 16px;font-size:14px;color:var(--navy);margin:20px 0}
table{width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:15px}
th,td{padding:10px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#f0f3fb;color:var(--navy)}
blockquote{border-left:4px solid var(--navy);margin:20px 0;padding:4px 16px;color:var(--muted)}
li{margin:6px 0}
.cta{background:var(--navy);color:#fff;border-radius:12px;padding:28px;margin:48px 0;text-align:center}
.cta h2{color:#fff;margin:0 0 8px}.cta p{margin:0 0 16px;opacity:.85}.cta .btn{background:#fff;color:var(--navy)!important;margin:4px}
.cta .btn.o{background:transparent;color:#fff!important;border:1px solid rgba(255,255,255,.6)}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px;margin:24px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px;text-decoration:none;color:inherit;display:block}
.card h3{margin:6px 0 6px;font-size:18px;line-height:1.3}.card p{margin:0;font-size:14px;color:var(--muted)}
footer{background:var(--navy);color:rgba(255,255,255,.8);padding:32px 0;font-size:14px}footer a{color:#fff}
@media(max-width:640px){nav{display:none}}
`;

const shell = ({ title, desc, path, ogType = "article", jsonld = [], body }) => `<!doctype html>
<html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="${ogType}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path}"><meta property="og:site_name" content="${ORG}"><meta property="og:locale" content="es_MX">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<style>${CSS}</style>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');</script>
</head><body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<header class="top"><div class="wide">
<a class="brand" href="/landing"><span class="logo"><img src="/logoaxis.png" alt="" width="30" height="30"></span>${ORG}</a>
<div style="display:flex;align-items:center"><nav><a href="/landing">Inicio</a><a href="/blog/">Blog</a><a href="/">Diagnóstico gratuito</a></nav><a class="btn" data-cta="header" href="/landing#form">Agendar sesión</a></div>
</div></header>
${body}
<footer><div class="wide">
<p><strong>${ORG}</strong> · Fuentes del Valle, Sector 7, 66224 San Pedro Garza García, N.L.</p>
<p><a href="/landing">Inicio</a> · <a href="/blog/">Blog</a> · <a href="/">Diagnóstico gratuito</a></p>
<p style="opacity:.7">© 2026 ${ORG}. La información de este sitio es de carácter general y no sustituye la asesoría profesional.</p>
</div></footer>
<script>document.querySelectorAll('[data-cta]').forEach(function(a){a.addEventListener('click',function(){window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'blog_cta_click',cta:a.getAttribute('data-cta'),page:location.pathname});});});</script>
</body></html>`;

const org = { "@type": "Organization", name: ORG, url: SITE, logo: `${SITE}/logoaxis.png` };

const posts = readdirSync(SRC).filter((f) => f.endsWith(".md")).map((f) => parse(join(SRC, f)))
  .sort((a, b) => (a.date < b.date ? 1 : a.title.localeCompare(b.title)));

for (const p of posts) {
  const path = `/blog/${p.slug}/`;
  const related = posts.filter((x) => x.slug !== p.slug).sort((a, b) => (b.category === p.category) - (a.category === p.category)).slice(0, 3);
  const jsonld = [
    { "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date,
      inLanguage: "es-MX", mainEntityOfPage: `${SITE}${path}`, author: org, publisher: org, keywords: p.keywords },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/landing` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` },
      { "@type": "ListItem", position: 3, name: p.title, item: `${SITE}${path}` } ] },
  ];
  if (p.faqs.length)
    jsonld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  const body = `<main><article class="wrap">
<div class="crumbs"><a href="/landing">Inicio</a> › <a href="/blog/">Blog</a> › ${esc(p.category)}</div>
<div class="cat">${esc(p.category)}</div><h1>${esc(p.title)}</h1>
<div class="meta">Por Equipo ${ORG} · Actualizado el ${fechaLarga(p.date)} · ${p.minutes} min de lectura</div>
<p class="note">Información de carácter general, elaborada con base en la normativa vigente a la fecha de actualización. No sustituye la asesoría de un contador para tu caso.</p>
${marked.parse(p.body)}
<div class="cta"><h2>¿Quieres que revisemos tu caso?</h2><p>Una sesión de 20 a 30 minutos, sin costo y sin compromiso.</p>
<a class="btn" data-cta="post-${p.slug}" href="/landing#form">Dejar mis datos</a><a class="btn o" data-cta="post-diag" href="/">Hacer el diagnóstico gratuito</a></div>
<h2>Sigue leyendo</h2><div class="cards">${related.map((r) => `<a class="card" href="/blog/${r.slug}/"><div class="cat">${esc(r.category)}</div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p></a>`).join("")}</div>
</article></main>`;
  mkdirSync(join(DIST, "blog", p.slug), { recursive: true });
  writeFileSync(join(DIST, "blog", p.slug, "index.html"), shell({ title: `${p.title} | ${ORG}`, desc: p.description, path, jsonld, body }));
}

// Índice del blog
{
  const cats = [...new Set(posts.map((p) => p.category))];
  const body = `<main><div class="wide">
<div class="cat">Blog</div><h1>Contabilidad, impuestos y finanzas para tu negocio</h1>
<p class="meta" style="max-width:680px">Guías claras sobre las NIF, el SAT, la nómina y las finanzas de una pyme en México, escritas por el equipo de ${ORG}.</p>
${cats.map((c) => `<h2>${esc(c)}</h2><div class="cards">${posts.filter((p) => p.category === c).map((p) => `<a class="card" href="/blog/${p.slug}/"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></a>`).join("")}</div>`).join("")}
</div></main>`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "Blog", name: `Blog de ${ORG}`, url: `${SITE}/blog/`, inLanguage: "es-MX", publisher: org,
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}/`, datePublished: p.date })) }];
  mkdirSync(join(DIST, "blog"), { recursive: true });
  writeFileSync(join(DIST, "blog", "index.html"), shell({ title: `Blog de contabilidad, impuestos y finanzas | ${ORG}`,
    desc: "Guías sobre NIF, SAT, RESICO, CFDI, nómina y finanzas para pymes y personas físicas en México.", path: "/blog/", ogType: "website", jsonld, body }));
}

// sitemap y llms.txt
const urls = [["/", posts[0]?.date], ["/landing", posts[0]?.date], ["/blog/", posts[0]?.date], ...posts.map((p) => [`/blog/${p.slug}/`, p.date])];
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `<url><loc>${SITE}${u}</loc><lastmod>${d}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(DIST, "llms.txt"), `# ${ORG}

> Despacho contable y fiscal en San Pedro Garza García, Nuevo León, México. Contabilidad, cumplimiento fiscal, nómina y CFO externo para pymes y personas físicas con actividad empresarial. Atendemos Monterrey y su área metropolitana.

## Servicios
- [Inicio y contacto](${SITE}/landing): quiénes somos, cómo trabajamos y formulario de contacto.
- [Diagnóstico gratuito](${SITE}/): cuestionario de 6 preguntas sobre la situación contable y fiscal.

## Blog: guías de contabilidad, SAT y finanzas
${posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/): ${p.description}`).join("\n")}

## Datos de contacto
- Dirección: Fuentes del Valle, Sector 7, 66224 San Pedro Garza García, N.L., México
- Sitio: ${SITE}
`);
console.log(`Blog: ${posts.length} artículos, sitemap.xml y llms.txt generados (${SITE})`);
