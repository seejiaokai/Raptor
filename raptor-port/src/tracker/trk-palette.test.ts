// @vitest-environment jsdom
/* The Tracker wears RAPTOR'S colours, fully — backgrounds, text and the event
   colours (owner, D157, 24 Sep 26: "7 c", the third of three pictures of the
   real chart). The colours live in two places that cannot share one variable:
   tracker.css's tokens (the page) and core.js's PAL / TYPE_COLOR / GRADE_FILL
   (the chart, drawn as SVG attribute strings, which cannot read a CSS variable
   in every browser). Both are COPIES of Raptor's own tokens in scheduler.css
   :root — copied so the Tracker keeps its colours if it is ever lifted back out
   as a standalone app (the standalone rule, 9 Sep 26). A copy is a drift seam,
   so this file is the one source: it reads Raptor's stylesheet and fails the
   moment either copy stops matching. It also keeps the retired Tracker colours
   out, and keeps every event code readable on its ball when Raptor's palette
   moves. */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as core from './app/core.js'

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const vars = (block: string) => Object.fromEntries(
  [...strip(block).matchAll(/--([\w-]+)\s*:\s*([^;}]+)/g)].map(m => [m[1]!, m[2]!.trim()]))
const hex = (c: string) => {
  const h = c.trim().toLowerCase()
  return /^#[0-9a-f]{3}$/.test(h) ? '#' + [...h.slice(1)].map(x => x + x).join('') : h
}
const rgbOf = (c: string) => [0, 2, 4].map(i => parseInt(hex(c).slice(1 + i, 3 + i), 16))

const schedCss = readFileSync(join(__dirname, '..', 'ui', 'scheduler.css'), 'utf8')
const RAPTOR = vars(schedCss.slice(schedCss.indexOf(':root{'), schedCss.indexOf('\n}', schedCss.indexOf(':root{'))))
const trkCss = readFileSync(join(__dirname, 'tracker.css'), 'utf8')
const at = trkCss.indexOf("THE PALETTE IS RAPTOR'S")
const TRK = vars(trkCss.slice(trkCss.indexOf('&{', at), trkCss.indexOf('\n}', at)))

/* The Tracker's name for each colour → the Raptor token it copies. */
const MAP: Record<string, string> = {
  bg: 'bg', panel: 'panel', panel2: 'panel-2', line: 'edge', ink: 'ink', muted: 'ink-3',
  accent: 'accent', 'accent-ink': 'accent-ink',
  flight: 'flight', acad: 'ok', test: 'hard', sim: 'adv', device: 'san',
  marg: 'ok', fail: 'hard', orange: 'adv', red: 'hard',
}

describe("the Tracker's page colours are Raptor's (tracker.css)", () => {
  it('found both palettes (a check that read nothing would pass)', () => {
    expect(Object.keys(RAPTOR).length).toBeGreaterThan(15)
    expect(Object.keys(TRK).length).toBeGreaterThan(15)
  })
  for (const [mine, theirs] of Object.entries(MAP)) {
    it(`--${mine} is Raptor's --${theirs}`, () => {
      expect(RAPTOR[theirs], `Raptor has no --${theirs}`).toBeTruthy()
      expect(hex(TRK[mine] ?? '(missing)')).toBe(hex(RAPTOR[theirs]!))
    })
  }
  it('a failure chip keeps its red outline over the plain grey chip it also is', () => {
    /* Every failure chip is also a `.chip`, whose grey outline sits LATER in the
       file at the same weight — a bare `.failchip` lost to it, so the red outline
       had never been drawn (the D157 walk, 26 Sep 26). Two classes outrank one. */
    const rule = strip(trkCss).match(/(?:^|[}\s])\.chip\.failchip\{([^}]*)\}/)
    expect(rule, 'no .chip.failchip rule').toBeTruthy()
    expect(rule![1]).toContain('border:1px solid var(--red-edge)')
    expect(rule![1]).toContain('background:transparent')
  })
  it("what the Tracker draws outside its page (the details bubble) names only Raptor's colours", () => {
    /* The Tracker's names (--line, --muted, --panel2 …) are set on #page-tracker;
       the details bubble hangs off <body>, so a Tracker name there matches
       nothing and the browser falls back — the bubble's divider drew in the text
       colour that way (the D157 walk). Everything above the wrapper may only
       name a colour Raptor's :root defines — and no bubble rule may sit INSIDE
       the wrapper, where nesting makes it "#page-tracker #detailBubble …", which
       never matches (the record's divider was missing that way until 26 Sep 26). */
    const wrap = trkCss.indexOf('#page-tracker {')
    const outside = strip(trkCss.slice(0, wrap))
    const names = [...outside.matchAll(/var\(--([\w-]+)/g)].map(m => m[1]!)
    expect(names.length).toBeGreaterThan(3)
    expect(names.filter(n => !(n in RAPTOR))).toEqual([])
    expect(outside).toMatch(/#detailBubble \.mkrec\{[^}]*border-top:1px dashed var\(--edge\)/)
    expect(strip(trkCss.slice(wrap))).not.toContain('#detailBubble')
  })
  it("the washes and the light-red text are Raptor's own recipes", () => {
    const [ar, ag, ab] = rgbOf(RAPTOR.accent!), [hr, hg, hb] = rgbOf(RAPTOR.hard!)
    expect(TRK.on).toBe(`rgba(${ar},${ag},${ab},.16)`)
    expect(TRK['red-wash']).toBe(`rgba(${hr},${hg},${hb},.12)`)
    expect(TRK['red-edge']).toBe(`rgba(${hr},${hg},${hb},.55)`)
    // Raptor writes its light red on the dark as a literal, not a token
    expect(schedCss).toContain(`color:${TRK['red-ink']}`)
  })
})

describe("the chart's colours are the same tokens (core.js)", () => {
  it('each event type is drawn in its Raptor colour, the same one the legend shows', () => {
    for (const t of ['flight', 'acad', 'test', 'sim', 'device'] as const) {
      expect(hex(core.TYPE_COLOR[t]), t).toBe(hex(TRK[t]!))
      expect(hex(core.TYPE_COLOR[t]), t).toBe(hex(RAPTOR[MAP[t]!]!))
    }
    expect(Object.keys(core.TYPE_COLOR).sort()).toEqual(['acad', 'device', 'flight', 'sim', 'test'])
  })
  it('the grade fills match the legend: Marginal is Raptor\'s green, DCO / DPCO / N.A. the Tracker\'s own', () => {
    expect(hex(core.GRADE_FILL.marg)).toBe(hex(RAPTOR.ok!))
    for (const g of ['dco', 'dpco', 'na', 'marg'] as const) expect(hex(core.GRADE_FILL[g]), g).toBe(hex(TRK[g]!))
  })
  it('selected, the failure ticks and the key ball\'s names are Raptor\'s accent, red and ink', () => {
    expect(hex(core.PAL.accent)).toBe(hex(RAPTOR.accent!))
    expect(hex(core.PAL.fail)).toBe(hex(RAPTOR.hard!))
    expect(hex(core.PAL.ink)).toBe(hex(RAPTOR.ink!))
    expect(core.PAL.on).toBe(TRK.on)
  })
})

describe('the words that name a colour say the one drawn', () => {
  /* The event editor's "Colour / type" list names each type by its colour. With
     D157 a sim turned from yellow to amber, and "Sim (yellow)" was left saying the
     old one (the D157 walk's wording roll-call). A colour change is also a wording
     change wherever the colour is named. */
  const modals = readFileSync(join(__dirname, 'components', 'Modals.jsx'), 'utf8')
  const WORD: Record<string, string> = { flight: 'blue', acad: 'green', test: 'red', sim: 'amber', device: 'purple' }
  for (const [t, w] of Object.entries(WORD)) {
    it(`the ${t} option names ${w}`, () => {
      expect(modals).toMatch(new RegExp(`<option value="${t}">[^<]*\\(${w}\\)</option>`))
    })
  }
})

describe('every event code stays readable on its ball', () => {
  /* The code is printed in Raptor's darkest (.ball text.lbl: var(--bg)) on the
     type's fill; 4.5:1 is the floor the smoke suite measures in the browser.
     Here it is computed from the tokens, so a later change to Raptor's palette
     that would sink a label fails in the unit tests, not only in CI's browser. */
  const lum = (c: string) => {
    const m = rgbOf(c).map(x => x / 255).map(x => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
    return 0.2126 * m[0]! + 0.7152 * m[1]! + 0.0722 * m[2]!
  }
  const ratio = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  it('the label ink is the page background token', () => {
    expect(strip(trkCss)).toMatch(/\.ball text\.lbl\{[^}]*fill:var\(--bg\)/)
  })
  for (const t of ['flight', 'acad', 'test', 'sim', 'device'] as const) {
    it(`${t}: the code on the ball reads at 4.5:1 or better`, () => {
      expect(ratio(TRK.bg!, core.TYPE_COLOR[t])).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('the retired Tracker colours do not come back', () => {
  /* Its own palette before D157, and the literal copies and tints of it that sat
     outside the token block. A new rule that reaches for one of these should use
     the token instead. */
  const RETIRED = ['#19b6e8', '#27d64a', '#ff4040', '#ffe000', '#b063ff', '#36c2ff', '#ff2b2b', '#0f1115',
    '#161922', '#1d212b', '#2b313d', '#e9ecf2', '#98a2b3', '#ff9800', '#16384a', '#5ec8ff', '#262c38',
    '#151b26', '#ff9b9b', '#10131a', '#04121b', '#8a93a3', '#39d353', '#ff6b6b', '#4a2f16', '54,194,255']
  const files: string[] = []
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n)
      if (statSync(p).isDirectory()) { if (n !== 'data') walk(p) } else if (/\.(css|js|jsx|ts|tsx)$/.test(n) && !/\.test\./.test(n)) files.push(p)
    }
  }
  walk(__dirname)
  it('found the Tracker\'s files', () => { expect(files.length).toBeGreaterThan(15) })
  it('none of them uses a retired colour', () => {
    const hits = files.flatMap(f => {
      const s = readFileSync(f, 'utf8').toLowerCase()
      return RETIRED.filter(c => s.includes(c)).map(c => `${f.slice(__dirname.length + 1)}: ${c}`)
    })
    expect(hits).toEqual([])
  })
})
