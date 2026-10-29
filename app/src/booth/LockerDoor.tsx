import type { ReactNode } from 'react'

// One cream locker door (booth-landing.md §2). Both doors share the same
// structure: hinge on the right, handle + padlock on the left, number plate,
// vents top and bottom. `children` is the door's extras (mirror + polaroids,
// or the how-to note).
export function LockerDoor({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="booth-locker">
      <div className="booth-door">
        <div className="booth-hinge" aria-hidden />
        <div className="booth-plate booth-hand">{number}</div>
        <div className="booth-vents" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        {children}
        <div className="booth-vents booth-vents-bottom" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <div className="booth-handle" aria-hidden />
        <div className="booth-lock" aria-hidden />
      </div>
    </div>
  )
}

// Four placeholder pose drawings, two held with blue tape (Bonnie's art
// replaces public/booth/pose-*.svg later).
export function Polaroids() {
  return (
    <div className="booth-polas" aria-hidden>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`booth-pola ${n === 1 || n === 4 ? 'booth-pola-tape' : ''}`}>
          <img src={`/booth/pose-${n}.svg`} alt="" />
        </div>
      ))}
    </div>
  )
}
