import { useEffect, useState } from 'react'
import type { ImportItem } from './db'
import { getLibraryFilter } from './settings'
import { launchedFromShare, takeSharedFiles } from './shareTarget'
import Crop from './screens/Crop'
import Import from './screens/Import'
import Library from './screens/Library'
import Result from './screens/Result'
import Shoot from './screens/Shoot'

type Screen =
  | { name: 'library' }
  | { name: 'crop'; files: File[] }
  | { name: 'import'; items: ImportItem[] }
  | { name: 'shoot'; cartoons: Blob[] }
  | { name: 'result'; cartoons: Blob[]; photos: Blob[] }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'library' })
  const library = () => setScreen({ name: 'library' })

  // Opened from the OS share sheet: go straight to cropping the shared images.
  useEffect(() => {
    if (!launchedFromShare()) return
    takeSharedFiles().then((files) => {
      if (files.length) setScreen({ name: 'crop', files })
    })
  }, [])

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col md:max-w-2xl">
      {screen.name === 'library' && (
        <Library onImport={(files) => setScreen({ name: 'crop', files })} onShoot={(cartoons) => setScreen({ name: 'shoot', cartoons })} />
      )}
      {screen.name === 'crop' && <Crop files={screen.files} onBack={library} onDone={(items) => setScreen({ name: 'import', items })} />}
      {screen.name === 'import' && (
        <Import items={screen.items} defaultPersonCount={getLibraryFilter().personCount ?? 2} onBack={library} onDone={library} />
      )}
      {screen.name === 'shoot' && (
        <Shoot
          cartoons={screen.cartoons}
          onBack={library}
          onDone={(photos) => setScreen({ name: 'result', cartoons: screen.cartoons, photos })}
        />
      )}
      {screen.name === 'result' && (
        <Result
          cartoons={screen.cartoons}
          photos={screen.photos}
          onRetake={() => setScreen({ name: 'shoot', cartoons: screen.cartoons })}
          onHome={library}
        />
      )}
    </div>
  )
}
