import { DefaultShell, type LibraryParts } from '../screens/Library'
import { BoothChrome, TrayStrip } from './BoothChrome'
import { useWide } from './useWide'

// The library seen from inside the booth: its header, filters and grid in
// the glass, its action bar on the counter, the picks in the tray. Below
// 760px it is the plain phone layout.
export function BoothInterior(parts: LibraryParts) {
  const wide = useWide()
  if (!wide) return <DefaultShell {...parts} />
  const lit = parts.mode === 'pick' && parts.picked.length >= parts.total
  return (
    <BoothChrome
      lit={lit}
      glass={
        <>
          {parts.header}
          {parts.filters}
          {parts.grid}
        </>
      }
      actions={parts.bottom}
      tray={<TrayStrip rows={parts.picked.map((p) => ({ pose: p.src }))} total={parts.total} />}
    />
  )
}
