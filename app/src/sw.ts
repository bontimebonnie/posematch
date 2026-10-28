/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Parameters<typeof precacheAndRoute>[0] }

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
self.skipWaiting()
clientsClaim()

// Web Share Target: the OS share sheet POSTs the shared images here. We
// can't hand them to the page directly, so stash them in a cache and
// redirect; the app picks them up from `?import=share` (see shareTarget.ts).
export const SHARE_CACHE = 'share-target'
export const SHARE_PATH = '/share-target'

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || url.pathname !== SHARE_PATH) return
  event.respondWith(
    (async () => {
      const form = await event.request.formData()
      const files = form.getAll('files').filter((f): f is File => f instanceof File)
      const cache = await caches.open(SHARE_CACHE)
      await Promise.all(
        files.map((file, i) =>
          cache.put(
            `${SHARE_PATH}/${Date.now()}-${i}`,
            new Response(file, { headers: { 'content-type': file.type, 'x-file-name': encodeURIComponent(file.name) } }),
          ),
        ),
      )
      return Response.redirect('/?import=share', 303)
    })(),
  )
})
