import { useEffect, useState } from 'react'
import type { ImportItem } from './db'
import { getLibraryFilter } from './settings'
import { launchedFromShare, takeSharedFiles } from './shareTarget'
import { decorEnabled, initialScreen } from './booth/entry'
import { BoothInterior } from './booth/BoothInterior'
import Booth from './screens/Booth'
import Crop from './screens/Crop'
import Import from './screens/Import'
import Library from './screens/Library'
import Result from './screens/Result'
import Shoot from './screens/Shoot'

type Screen =
  | { name: 'booth'; unfold?: boolean }
  | { name: 'library' }
  | { name: 'crop'; files: File[] }
  | { name: 'import'; items: ImportItem[] }
  | { name: 'shoot'; cartoons: Blob[] }
  | { name: 'result'; cartoons: Blob[]; photos: Blob[] }

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => ({ name: initialScreen({ decor: decorEnabled(), share: launchedFromShare() }) }))
  const library = () => setScreen({ name: 'library' })
  const booth = () => setScreen({ name: 'booth', unfold: true })

  // Opened from the OS share sheet: go straight to cropping the shared images.
  useEffect(() => {
    if (!launchedFromShare()) return
    takeSharedFiles().then((files) => {
      if (files.length) setScreen({ name: 'crop', files })
    })
  }, [])

  // With decor on, every screen lives in the booth and fills the viewport
  // (each screen falls back to its phone stack below 760px). With decor off
  // the working screens keep their phone-width column on desktop.
  const decor = decorEnabled()
  const wide = decor || screen.name === 'booth'
  return (
    <div className={`mx-auto flex h-full flex-col ${wide ? '' : 'max-w-xl md:max-w-2xl'}`}>
      {screen.name === 'booth' && <Booth unfold={screen.unfold} onEnter={library} />}
      {screen.name === 'library' && (
        <Library
          onBooth={decor ? booth : undefined}
          shell={decor ? BoothInterior : undefined}
          onImport={(files) => setScreen({ name: 'crop', files })}
          onShoot={(cartoons) => setScreen({ name: 'shoot', cartoons })}
        />
      )}
      {screen.name === 'crop' && <Crop files={screen.files} booth={decor} onBack={library} onDone={(items) => setScreen({ name: 'import', items })} />}
      {screen.name === 'import' && (
        <Import items={screen.items} defaultPersonCount={getLibraryFilter().personCount ?? 2} booth={decor} onBack={library} onDone={library} />
      )}
      {screen.name === 'shoot' && (
        <Shoot
          cartoons={screen.cartoons}
          booth={decor}
          onBack={library}
          onDone={(photos) => setScreen({ name: 'result', cartoons: screen.cartoons, photos })}
        />
      )}
      {screen.name === 'result' && (
        <Result
          cartoons={screen.cartoons}
          photos={screen.photos}
          booth={decor}
          onRetake={() => setScreen({ name: 'shoot', cartoons: screen.cartoons })}
          onHome={library}
        />
      )}
    </div>
  )
}
