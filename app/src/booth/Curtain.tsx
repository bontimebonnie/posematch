import { forwardRef, type HTMLAttributes } from 'react'

// The pleated striped curtain (booth-landing.md §2 "Doorway + curtain"):
// one continuous piece hanging 74% of the doorway, blue/pink stripes on
// paper, pink header band with a stitch line, wavy hem, and the embroidered
// lettering in brown thread. Pleat shadow + sheen sit above the letters so
// they catch the folds too. Task 41 adds the drag; this is the fabric only.
export const Curtain = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Curtain(props, ref) {
  return (
    <div ref={ref} className="booth-curtain" {...props}>
      <div className="booth-fabric" />
      <div className="booth-art" aria-hidden>
        <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="booth-satin" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(60)">
              <rect width="4" height="4" fill="var(--color-decor-thread)" />
              <rect width="1.4" height="4" fill="var(--thread-hi)" />
            </pattern>
          </defs>
          <g className="booth-stitch" textAnchor="middle" fill="url(#booth-satin)">
            <text x="200" y="70">pose match</text>
            <text x="200" y="146">photobooth</text>
          </g>
        </svg>
      </div>
      <div className="booth-folds" />
      <div className="booth-sheen" />
    </div>
  )
})
