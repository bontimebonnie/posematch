import { useEffect, useState } from 'react'
import { CELL_RATIO } from './image'

// On a portrait phone a 3:2 landscape viewfinder is only a short band of
// the screen, so the live preview opens up to 4:3 there. The captured frame
// is still the centre 3:2 of what is shown.
export const PHONE_VIEWFINDER_RATIO = 4 / 3
const PHONE_QUERY = '(max-width: 767px) and (orientation: portrait)'

export function useViewfinderRatio(): number {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY)
    const onChange = () => setPhone(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return phone ? PHONE_VIEWFINDER_RATIO : CELL_RATIO
}
