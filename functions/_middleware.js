// Alte Adressen (pages.dev, www) dauerhaft auf lobbycontrolvpn.de umleiten.
// Verifizierungsdateien bleiben erreichbar (Google, IndexNow).
const ZIEL = "lobbycontrolvpn.de";
export async function onRequest(ctx) {
  const u = new URL(ctx.request.url);
  const alt = u.hostname === "lobbycontrol.pages.dev" || u.hostname === "www." + ZIEL;
  const frei = /^\/(google[0-9a-f]+\.html|[0-9a-f]{32}\.txt)$/.test(u.pathname);
  if (alt && !frei) { u.hostname = ZIEL; return Response.redirect(u.toString(), 301); }
  return ctx.next();
}
