// Which screen the app opens on. The booth is the normal front door; the
// VITE_DECOR=0 build flag switches all decor off, and a launch from the OS
// share sheet goes straight to cropping the shared pictures.
export type EntryScreen = 'booth' | 'library'

export function decorEnabled(env: Record<string, string | undefined> = import.meta.env): boolean {
  return env.VITE_DECOR !== '0'
}

export function initialScreen({ decor, share }: { decor: boolean; share: boolean }): EntryScreen {
  if (share) return 'library' // replaced by 'crop' once the shared files arrive
  return decor ? 'booth' : 'library'
}
