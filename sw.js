// Service worker della Classifica Risiko.
// Serve solo a rendere la pagina installabile e ad aprirla anche senza rete:
// prova sempre prima la versione online, e usa la copia salvata solo se manca la connessione.
// I dati arrivano da Firebase e non passano di qui.

const nomeCache = "classifica-risiko-v2";
const fileDellApp = ["./", "./index.html", "./manifest.webmanifest", "./icona-192.png", "./icona-512.png"];

self.addEventListener("install", evento => {
  evento.waitUntil(caches.open(nomeCache).then(cache => cache.addAll(fileDellApp)));
  self.skipWaiting();
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys().then(nomi => Promise.all(nomi.filter(nome => nome !== nomeCache).map(nome => caches.delete(nome))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", evento => {
  const richiesta = evento.request;
  const stessoSito = new URL(richiesta.url).origin === self.location.origin;
  if (richiesta.method !== "GET" || !stessoSito) return;

  evento.respondWith(
    fetch(richiesta)
      .then(risposta => {
        const copia = risposta.clone();
        caches.open(nomeCache).then(cache => cache.put(richiesta, copia));
        return risposta;
      })
      .catch(() => caches.match(richiesta).then(salvata => salvata || caches.match("./index.html")))
  );
});
