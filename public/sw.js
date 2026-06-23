const CACHE_NAME = 'fincoach-cache-v1'

// Les fichiers essentiels à mettre en cache au démarrage
const FICHIERS_A_CACHER = [
  '/',
  '/index.html',
]

// Installation : on met en cache les fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 FinCoach SW : mise en cache initiale')
      return cache.addAll(FICHIERS_A_CACHER)
    })
  )
  self.skipWaiting()
})

// Activation : on supprime les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  )
  self.clients.claim()
})

// Interception des requêtes : Network First pour l'API, Cache First pour les assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // ⛔ On ne cache jamais les appels API (Supabase, Groq, FastAPI)
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('groq') ||
    url.pathname.startsWith('/api')
  ) {
    return // Laisse passer sans interception
  }

  // ✅ Pour tout le reste : Cache First (assets, pages)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // On met en cache la nouvelle réponse pour la prochaine fois
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
    })
  )
})