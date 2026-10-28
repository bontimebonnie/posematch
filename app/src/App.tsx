import { useState } from 'react'
import { getLibraryFilter } from './settings'
import Import from './screens/Import'
import Library from './screens/Library'
import Result from './screens/Result'
import Shoot from './screens/Shoot'

type Screen =
  | { name: 'library' }
  | { name: 'import'; files: File[] }
  | { name: 'shoot'; cartoons: Blob[] }
  | { name: 'result'; cartoons: Blob[]; photos: Blob[] }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'library' })
  const library = () => setScreen({ name: 'library' })

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col">
      {screen.name === 'library' && (
        <Library onImport={(files) => setScreen({ name: 'import', files })} onShoot={(cartoons) => setScreen({ name: 'shoot', cartoons })} />
      )}
      {screen.name === 'import' && (
        <Import files={screen.files} defaultPersonCount={getLibraryFilter().personCount ?? 2} onBack={library} onDone={library} />
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
