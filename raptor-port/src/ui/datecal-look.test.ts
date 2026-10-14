// @vitest-environment node — reads stylesheets off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* THE LOOK OF THE APP'S ONE DATE CALENDAR AND OF THE TRACKER'S DATE BOXES, pinned as a CSS contract — the way
   leavewar/ui/rowglow.test.ts pins the Leave War's. jsdom loads no stylesheet and has no cascade worth the name, so a
   rule that a later rule out-ranks is unreachable from the ordinary suite; the file itself is the only thing that can
   be read here. What a browser must still show is the walk's (docs/handpass/ — the look's own sheet).

   The design look of 13 Oct 26 (docs/handpass/2026-10-13-design-look.md §3; the words he approved:
   docs/mock/design-look-13oct.html; owner D830 — "L1 to L17 and K1 to K4, K7 to K10, K12", none left out):
     L8  a date that cannot be picked is faint and plain WHATEVER else it is — today kept its bright cyan number, and
         the weekday that stands out stayed bold, because each of those rules out-ranked the faint one;
     L11 the sentence under a run of dates was cyan, and cyan means "press me" or "picked" (the design guide's §4);
     L12 the faint dates were about 2.0 to 1 against the card — one step stronger, still plainly fainter than a weekend;
     L13 in the month-and-year lists the keyboard's place was shown by turning one word cyan ("October is chosen, 2026 is
         not"); the title's keyboard ring went round the whole room kept for the longest month's name;
     L17 a Saturday and a Sunday INSIDE a picked run stayed grey, as if left out of it;
     L9  on a phone the card names the box it is for;
     L15 (the Tracker) a date no mark carries yet is drawn in the dim colour of an empty box;
     L16 (the Tracker) one width for the side panel's column of date boxes on a desktop.
   Each test was written first and failed first. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readSchedulerCss } from '../testing/scheduler-css'

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const read = (rel: string) => strip(readFileSync(new URL(rel, import.meta.url), 'utf8'))
const cal = read('./scheduler/26-date-calendar.css')
const trk = read('../tracker/tracker.css')

/** Every rule in a sheet: its selector list, its declarations, and where it sits. An `@media …` line never matches this
 *  shape (its body holds braces), so a rule NESTED in one is still found. */
type Rule = { sels: string[]; body: string; at: number }
const rulesOf = (css: string): Rule[] => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!.replace(/\s+/g, ''), at: m.index! }))
const CAL = rulesOf(cal), TRK = rulesOf(trk)
const rulesFor = (rules: Rule[], sel: string) => rules.filter(r => r.sels.includes(sel))
const one = (rules: Rule[], sel: string): Rule => {
  const hit = rulesFor(rules, sel)
  expect(hit.map(r => r.body), `exactly one rule for "${sel}"`).toHaveLength(1)
  return hit[0]!
}
/** the first rule for a selector — its own rule; a later one of the same name sits in a small-screen block */
const first = (rules: Rule[], sel: string): Rule => {
  const hit = rulesFor(rules, sel)
  expect(hit.length, `a rule for "${sel}"`).toBeGreaterThan(0)
  return hit[0]!
}
/** what a rule sets a property to ('' when it does not set it) */
const decl = (r: Rule, prop: string) => (r.body.split(';').map(d => d.split(':')).find(d => d[0] === prop) || []).slice(1).join(':')
/** how strongly a selector binds: its classes, `:not(.x)` classes and state words count the same; then its elements */
const weight = (sel: string) => {
  const classes = (sel.match(/\.[\w-]+/g) || []).length + (sel.match(/:(focus-visible|focus|hover|disabled)\b/g) || []).length
  const els = (sel.replace(/:not\([^)]*\)|::?[\w-]+(\([^)]*\))?|\.[\w-]+/g, ' ').match(/[a-z]+/gi) || []).length
  return classes * 100 + els
}
/** does the later rule win over the earlier one for a property both set? */
const beats = (rules: Rule[], winner: string, loser: string) => {
  const w = one(rules, winner), l = one(rules, loser)
  return weight(winner) > weight(loser) || (weight(winner) === weight(loser) && w.at > l.at)
}

/* the app's own colour values (ui/scheduler/00-foundation-login.css :root), for the one measured contrast */
const TOKENS = Object.fromEntries([...strip(readSchedulerCss()).matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)].map(m => [m[1]!, m[2]!]))
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const lum = (c: number[]) => { const [r, g, b] = c.map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! }
const contrast = (a: number[], b: number[]) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
const over = (fg: number[], bg: number[], alpha: number) => fg.map((v, i) => alpha * v + (1 - alpha) * bg[i]!)

const OUT = '.dcal .dcal-d.is-out b'
const OUT_TODAY = '.dcal .dcal-d.is-out.is-today:not(.is-sel) b'
const OUT_MARKED = '.dcal.is-marked .dcal-d.is-out:not(.is-sel) b'

describe('the faint dates (L12)', () => {
  it('are one step stronger — about 2.7 to 1 against the card, where they were about 2.0 — and still plainly fainter than a weekend date', () => {
    const r = one(CAL, OUT)
    expect(decl(r, 'color')).toBe('var(--ink-3)')
    const alpha = +decl(r, 'opacity')
    expect(alpha).toBe(0.55)
    /* worked out from the app's colour values: the quiet ink at that strength over the card it is drawn on */
    const ink3 = rgb(TOKENS['ink-3']!), card = rgb(TOKENS['panel']!), form = rgb(TOKENS['bg']!)
    const faint = contrast(over(ink3, card, alpha), card)
    expect(faint).toBeGreaterThan(2.6); expect(faint).toBeLessThan(2.8)
    expect(contrast(over(ink3, card, 0.4), card), 'the premise: what it was').toBeCloseTo(2.0, 1)
    /* a calendar drawn inside its form sits on the form's own ground: the same step there */
    const inForm = contrast(over(ink3, form, alpha), form)
    expect(inForm).toBeGreaterThan(2.6); expect(inForm).toBeLessThan(2.8)
    /* a weekend date is the quiet ink at full strength: more than twice as strong as a faint one */
    expect(decl(one(CAL, '.dcal-d.is-we b'), 'color')).toBe('var(--ink-3)')
    expect(contrast(ink3, card) / faint).toBeGreaterThan(2)
  })
})

describe('a date that cannot be picked is faint and plain, whatever else it is (L8)', () => {
  it('today that cannot be picked keeps its disc, so it still marks today — and loses its bright number and its heavy weight', () => {
    const r = one(CAL, OUT_TODAY)
    expect(beats(CAL, OUT_TODAY, '.dcal .dcal-d.is-today b'), 'today’s own rule still wins').toBe(true)
    expect(decl(r, 'font-weight')).toBe('500')
    expect(r.body, 'the number is still the accent').not.toContain('var(--accent)')
    /* the number is as faint as its neighbours': the quiet ink at the faint dates' own strength — written into the
       colour, not as a fade of the whole date, which would take the disc down with it */
    const pct = Math.round(+decl(one(CAL, OUT), 'opacity') * 100)
    expect(decl(r, 'color')).toBe(`color-mix(insrgb,var(--ink-3)${pct}%,transparent)`)
    expect(decl(r, 'opacity')).toBe('1')
    expect(decl(r, 'background'), 'the disc is taken away').toBe('')
    expect(decl(one(CAL, '.dcal .dcal-d.is-today b'), 'background'), 'the premise: today has a disc').toBe('rgba(59,198,232,.14)')
  })
  it('the weekday that stands out is not bold, nor full ink, on a date that cannot be picked', () => {
    const r = one(CAL, OUT_MARKED)
    expect(beats(CAL, OUT_MARKED, '.dcal.is-marked .dcal-d.is-mk b'), 'the standing-out weekday’s rule still wins').toBe(true)
    expect(decl(r, 'font-weight')).toBe('500'); expect(decl(r, 'color')).toBe('var(--ink-3)')
    /* and today on such a calendar is still today's faint form, not this one */
    expect(beats(CAL, OUT_TODAY, OUT_MARKED)).toBe(true)
  })
  it('the date already PICKED is left as it was: neither rule reaches it', () => {
    for (const sel of [OUT_TODAY, OUT_MARKED]) expect(sel).toContain(':not(.is-sel)')
  })
})

describe('a run of dates (L11, L17)', () => {
  it('the sentence beneath is the plain ink, bold as it was — never the accent: it is not a button', () => {
    const r = one(CAL, '.dcal-foot')
    expect(decl(r, 'color')).toBe('var(--ink)')
    expect(decl(r, 'font-weight')).toBe('700')
  })
  it('a Saturday and a Sunday inside the run are full strength, as every date in it is', () => {
    const IN = '.dcal .dcal-d.is-we.is-in:not(.is-sel):not(.is-today):not(.is-out) b'
    expect(decl(one(CAL, IN), 'color')).toBe('var(--ink)')
    expect(decl(first(CAL, '.dcal-d b'), 'color'), 'the premise: full strength is the plain ink').toBe('var(--ink)')
    for (const we of ['.dcal-d.is-we b', '.dcal.is-marked .dcal-d.is-we b']) expect(beats(CAL, IN, we), `"${we}" still greys it`).toBe(true)
    /* its two ends keep the picked disc's dark number, today its own, and a date that cannot be picked stays faint */
    expect(decl(one(CAL, IN), 'font-weight')).toBe('')
  })
})

describe('the keyboard’s place in the month-and-year lists, and on the title (L13)', () => {
  it('no word of a list turns the accent: the chosen month and year both stay the plain ink, heavy', () => {
    const rows = CAL.filter(r => r.sels.some(s => s.includes('.dcal-opt')))
    expect(rows.length).toBeGreaterThan(1)
    expect(rows.filter(r => r.body.includes('var(--accent)')).map(r => r.sels.join(', '))).toEqual([])
    expect(decl(one(CAL, '.dcal-opt'), 'color')).toBe('var(--ink)')
    expect(decl(one(CAL, '.dcal-opt.is-at'), 'font-weight')).toBe('800')
  })
  it('the list that has the keyboard wears the app’s ring — the months’ on the left, the years’ on the right', () => {
    const MONTHS = '.dcal-lists:has(> .dcal-col:focus-visible)::after', YEARS = '.dcal-lists:has(> .dcal-col ~ .dcal-col:focus-visible)::after'
    const r = one(CAL, MONTHS)
    expect(decl(r, 'outline')).toBe('2pxsolidvar(--accent)')
    expect(decl(r, 'pointer-events'), 'the ring would take the finger from the list under it').toBe('none')
    /* the lists' two columns are 1.25 to 1 (`.dcal-lists`): the months' ring ends where the years' begins */
    expect(decl(first(CAL, '.dcal-lists'), 'grid-template-columns')).toBe('1.25fr1fr')
    expect(decl(r, 'left')).toBe('0'); expect(decl(r, 'right')).toBe('44.444%')
    const y = one(CAL, YEARS)
    expect(decl(y, 'left')).toBe('55.556%'); expect(decl(y, 'right')).toBe('0')
    expect(y.at, 'the years’ place must come after the months’ to win').toBeGreaterThan(r.at)
    /* only for a keyboard (`:focus-visible`), as the ring on a date is (D824) */
    expect(CAL.filter(x => x.sels.some(s => /\.dcal-col:focus(?!-visible)/.test(s)))).toEqual([])
  })
  it('the title’s ring goes round its words, not the room kept beside them — and the title keeps its size', () => {
    expect(decl(one(CAL, '.dcal-title:focus-visible'), 'outline')).toBe('none')
    expect(decl(one(CAL, '.dcal-title:focus-visible .dcal-tw'), 'outline')).toBe('2pxsolidvar(--accent)')
    /* D487 — buttons keep their size: the title is still the fixed room a finger presses */
    expect(decl(first(CAL, '.dcal-title'), 'width')).toBe('10em')
    /* the words sit as they did: the wrapper takes the title's own spacing, on a narrow phone too */
    expect(decl(one(CAL, '.dcal-tw'), 'gap')).toBe('inherit')
    /* the Today icon and the two arrows keep the ring they had */
    const others = one(CAL, '.dcal-nav:focus-visible')
    expect(others.sels).toContain('.dcal .wc-today:focus-visible')
    expect(decl(others, 'outline')).toBe('2pxsolidvar(--accent)')
  })
  it('D824 — the picked date has no ring at rest: the only ring on a date is the keyboard’s', () => {
    const ringed = CAL.filter(r => r.sels.some(s => s.includes('.dcal-d')) && /outline:(?!none)/.test(r.body))
    expect(ringed.map(r => r.sels.join(', '))).toEqual(['.dcal .dcal-d:focus-visible b'])
  })
})

describe('on a phone the card’s one line of small capitals (L9)', () => {
  it('is the weekday line’s own small capitals, on one line, cut with "…" before it wraps — so the card is the same height for every box', () => {
    const r = one(CAL, '.dcal-name'), dow = one(CAL, '.dcal-dow span')
    expect(decl(r, 'text-transform')).toBe('uppercase')
    for (const p of ['font-size', 'font-weight', 'letter-spacing', 'color']) expect(decl(r, p), p).toBe(decl(dow, p))
    expect(decl(r, 'white-space')).toBe('nowrap'); expect(decl(r, 'text-overflow')).toBe('ellipsis'); expect(decl(r, 'overflow')).toBe('hidden')
  })
})

describe('the Tracker’s date boxes (L15, L16)', () => {
  it('L15 — a date no mark carries yet wears the dim colour an empty box’s words wear', () => {
    /* the app's box: an empty box's words are the quiet ink … */
    expect(decl(one(CAL, 'button.datebox.is-empty .datebox-txt'), 'color')).toBe('var(--ink-3)')
    /* … and the Tracker's name for that same colour is --muted (tracker/trk-palette.test.ts pins the copy) */
    expect(trk).toContain('--muted:#8A96A3;')
    expect(TOKENS['ink-3']!.toUpperCase()).toBe('#8A96A3')
    expect(decl(one(TRK, 'button.datebox.trpopdate.is-notyet .datebox-txt'), 'color')).toBe('var(--muted)')
  })
  it('L16 — on a desktop the side panel’s column of date boxes has one width, a full date’s; a phone’s two-across grid is untouched', () => {
    const SEL = '.curGrid .field .trdatebox'
    const r = one(TRK, SEL)
    /* the width the failures list already gives a date box (`.faillog .frow`) — "Tue 13 Oct 2026" with its ✕ measured
       128px on the look's desktop, an empty box 98px */
    expect(decl(r, 'min-width')).toBe('144px')
    expect(trk).toMatch(/\.faillog \.frow\{[^}]*144px/)
    /* inside the desktop's block — the phone's is everything up to 1050px wide */
    const blocks = [...trk.matchAll(/@media\s*\(\s*min-width:\s*1051px\s*\)\s*\{/g)].map(m => {
      let depth = 1, i = m.index! + m[0].length
      for (; i < trk.length && depth; i++) { if (trk[i] === '{') depth++; else if (trk[i] === '}') depth-- }
      return [m.index!, i] as const
    })
    expect(blocks.some(([a, b]) => r.at > a && r.at < b), 'the one width reaches a phone').toBe(true)
    expect(trk, 'the premise: the phone’s layout is the 1050px block').toMatch(/@media\(max-width:1050px\)\{\s*\.curGrid\{display:grid/)
  })
})
