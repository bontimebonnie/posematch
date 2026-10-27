import { useState } from 'react'
import type { PersonCount } from './db'
import Home from './screens/Home'
import Upload from './screens/Upload'
import Shoot from './screens/Shoot'
import Result from './screens/Result'

type Screen =
  | { name: 'home' }
  | { name: 'upload' }
  | { name: 'shoot'; cartoons: Blob[] }
  | { name: 'result'; cartoons: Blob[]; photos: Blob[] }

export default function App() {
  const [personCount, setPersonCount] = useState<PersonCount>(2)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const home = () => setScreen({ name: 'home' })

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col">
      {screen.name === 'home' && (
        <Home
          personCount={personCount}
          onPersonCount={setPersonCount}
          onUpload={() => setScreen({ name: 'upload' })}
          onPick={(cartoons) => setScreen({ name: 'shoot', cartoons })}
        />
      )}
      {screen.name === 'upload' && (
        <Upload
          personCount={personCount}
          onBack={home}
          onSaved={(cartoons) => setScreen({ name: 'shoot', cartoons })}
        />
      )}
      {screen.name === 'shoot' && (
        <Shoot
          cartoons={screen.cartoons}
          onBack={home}
          onDone={(photos) => setScreen({ name: 'result', cartoons: screen.cartoons, photos })}
        />
      )}
      {screen.name === 'result' && (
        <Result
          cartoons={screen.cartoons}
          photos={screen.photos}
          onRetake={() => setScreen({ name: 'shoot', cartoons: screen.cartoons })}
          onHome={home}
        />
      )}
    </div>
  )
}
