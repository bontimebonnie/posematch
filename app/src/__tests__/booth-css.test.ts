import { describe, expect, it } from 'vitest'
import css from '../booth/booth.css?raw'

// booth.css is bespoke scenery outside the Tailwind utility scale, so the
// design-tokens gate cannot see it. This keeps its colours on decor tokens.
describe('booth.css colours', () => {
  it('has no hex or rgb() literals', () => {
    const offenders = css
      .split('\n')
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => !line.trim().startsWith('/*') && !line.trim().startsWith('*'))
      .filter(({ line }) => /#[0-9a-f]{3,8}\b|\brgba?\(\s*\d/i.test(line))
      .map(({ line, n }) => `${n}: ${line.trim()}`)
    expect(offenders).toEqual([])
  })

  it('only references decor colour tokens', () => {
    const colourVars = [...css.matchAll(/var\(--color-([a-z0-9-]+)\)/g)].map((m) => m[1])
    expect(colourVars.filter((v) => !v.startsWith('decor-'))).toEqual([])
  })
})
