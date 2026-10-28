import { describe, expect, it } from 'vitest'

// Guards docs/DESIGN-SPEC.md §4.1 / §9: every class in the app comes from the
// token scale. Off-grid spacing, raw palette colours, Tailwind's default type
// and radius scales, and arbitrary values are all refused.

// Every component and screen source, read as text at test time.
const SOURCES = import.meta.glob<string>(['../**/*.tsx'], { query: '?raw', import: 'default', eager: true })

const BANNED: { name: string; re: RegExp }[] = [
  // spacing: only 1 2 4 6 8 12 16 (4/8/16/24/32/48/64px)
  { name: 'off-grid spacing', re: /(?<![\w-])-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|inset|top|bottom|left|right|h|w|size)-(?:0\.5|1\.5|2\.5|3|3\.5|5|7|9|10|11|14|20|24)(?![\w.-])/ },
  { name: 'default radius scale', re: /(?<![\w-])rounded(?:-[tbrl]{1,2})?-(?:sm|md|lg|xl|2xl|3xl)(?![\w-])/ },
  { name: 'default type scale', re: /(?<![\w-])text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)(?![\w-])/ },
  { name: 'raw colour (use semantic token)', re: /(?<![\w-])(?:bg|text|ring|border|fill|stroke|outline)-(?:ink|black|white|berry|berry-dark|cream|cocoa|pink|sky|butter|mint|lilac|blush|navy|sand)(?:\/\d+)?(?![\w-])/ },
  { name: 'opacity modifier on colour', re: /(?<![\w-])(?:bg|text|ring|border)-[a-z-]+\/\d+(?![\w-])/ },
  // arbitrary values, except safe-area insets and aspect ratios
  { name: 'arbitrary value', re: /(?<![\w-])(?!aspect-)[a-z-]+-\[(?!max\(1rem,env\()[^\]]+\](?![\w-])/ },
]

export function findViolations(sources: Record<string, string> = SOURCES): string[] {
  const out: string[] = []
  for (const [file, text] of Object.entries(sources)) {
    text.split('\n').forEach((line, i) => {
      for (const { name, re } of BANNED) {
        const m = line.match(re)
        if (m) out.push(`${file.replace('../', '')}:${i + 1}  ${name}: ${m[0]}`)
      }
    })
  }
  return out
}

describe('design tokens gate', () => {
  it('catches a banned class', () => {
    const re = BANNED.map((b) => b.re)
    expect(re.some((r) => r.test('className="px-3"'))).toBe(true)
    expect(re.some((r) => r.test('className="rounded-xl"'))).toBe(true)
    expect(re.some((r) => r.test('className="text-ink/60"'))).toBe(true)
    expect(re.some((r) => r.test('className="text-sm"'))).toBe(true)
    expect(re.some((r) => r.test('className="w-[13px]"'))).toBe(true)
  })

  it('allows token classes', () => {
    const ok = 'px-4 gap-2 p-1 rounded-card rounded-pill text-body text-label bg-accent text-fg-muted ring-line pb-[max(1rem,env(safe-area-inset-bottom))] h-touch size-icon aspect-[3/2]'
    expect(BANNED.filter((b) => b.re.test(ok)).map((b) => b.name)).toEqual([])
  })

  it('src/**/*.tsx uses only token classes', () => {
    expect(findViolations()).toEqual([])
  })
})
