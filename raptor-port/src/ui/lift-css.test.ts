// @vitest-environment node — reads a stylesheet off disk (the rowglow.test.ts shape)
/* The lift recipe as a CSS CONTRACT. jsdom paints nothing, so an outer shadow
   that the card clips, a frame that lost its absolute position, or a veil that
   animates layout is unreachable from the ordinary suite — the file is the
   only witness. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!, at: m.index! }))
const rulesFor = (sel: string) => RULES.filter(r => r.sels.includes(sel))
const bodyOf = (sel: string) => rulesFor(sel).map(r => r.body).join(' ').replace(/\s+/g, ' ')
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
/** What a selector can actually MATCH — its `:not(…)` arguments dropped. The
 *  veil's own rule is `.lift-land:not(.lift-frame)`, which NAMES the frame in
 *  order to exclude it; a plain substring scan for `.lift-frame` reads that as
 *  a rule setting the frame to `relative` and flags the one guard the frame
 *  depends on. */
const matches = (sel: string) => sel.replace(/:not\([^)]*\)/g, '')
const keyframes = (name: string) => {
  const i = css.indexOf(`@keyframes ${name}`)
  expect(i, `@keyframes ${name} exists`).toBeGreaterThan(-1)
  const rest = css.slice(i)
  return rest.slice(0, rest.indexOf('}}') + 2)
}
/** The character span of every `@media (prefers-reduced-motion:reduce)` block,
 *  brace-matched — the rowglow.test.ts HOVER_MEDIA shape. A rule's position is
 *  the question here, not its existence: `animation:none` written OUTSIDE the
 *  guard would kill the flash for everybody. */
const REDUCED: Array<[number, number]> = [...css.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/g)].map(m => {
  let i = m.index! + m[0]!.length, depth = 1
  while (i < css.length && depth > 0) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++ }
  return [m.index!, i] as [number, number]
})
const insideReduced = (at: number) => REDUCED.some(([a, b]) => at > a && at < b)

describe('the lift recipe — one box, drawn INSIDE the line', () => {
  it('--lift-box is the owner\'s Soft, every layer inset', () => {
    const m = bodyOf(':root').match(/--lift-box:\s*([^;]+)/)
    expect(m, ':root declares --lift-box').toBeTruthy()
    const v = m![1]!.replace(/\s+/g, ' ').trim()
    expect(v).toBe('inset 0 0 0 2px var(--accent), inset 0 0 12px rgba(59,198,232,.30)')
    for (const l of layers(v)) expect(l.startsWith('inset'), `${l} is inset`).toBe(true)
  })
  /* THE RECIPE IS A COLOUR, NOT A SHAPE (7 Sep 26). `.lift{border-radius:8px}`
     re-cornered everything it touched: a wave block's 10/12px went square
     mid-drag and a 15px crew puck (3px corners) read pill-shaped while it was
     carried. An INSET box-shadow follows the element's own border-radius, so
     the ring hugs each thing's own corner the moment the recipe stops naming
     one. What this pins is the absence — the declaration coming back is the
     regression. */
  it('.lift wears it and forces NO radius — an inset ring follows the thing\'s own corner', () => {
    const b = bodyOf('.lift')
    expect(b).toMatch(/box-shadow:\s*var\(--lift-box\)/)
    expect(b, '.lift must not re-corner what it lifts').not.toMatch(/border-radius/)
  })
  it('nothing keys .lift off a body / html / root class — a toggled root class restyles the page', () => {
    const keyed = RULES.filter(r => r.sels.some(s => /^(body|html|:root)[.[]/.test(s) && /\.lift\b/.test(s)))
    expect(keyed.map(r => r.sels.join(', '))).toEqual([])
  })
})

/* THE HOST NAMES A CORNER ONLY WHERE IT HAS ONE TO NAME (7 Sep 26, from the
   live drive). `.sb-sec` is a bare positioned wrapper, but its box is exactly
   the `.sb-panel` card inside it, and that card is 10px round — so the square
   ring the recipe now leaves it drew a cyan wedge past each rounded corner. The
   edit week's `.dsec` wraps a card 10px narrower than itself on both sides, so
   its own square shape IS what the eye sees there and it must stay square. What
   this pins is the pair: one named, the other deliberately not. */
describe('a section wrapper rings the shape the eye sees', () => {
  it('the board\'s section takes its card\'s 10px, and the week\'s wider strip stays square', () => {
    const b = bodyOf('.sb-sec.lift') + ' ' + bodyOf('.sb-sec.lift-land')
    expect(b, 'the carried board panel and its flash are both 10px round').toMatch(/border-radius:\s*10px[\s\S]*border-radius:\s*10px/)
    const dsec = RULES.filter(r => r.sels.some(s => /^\.dsec\.lift/.test(s)))
    expect(dsec.map(r => r.sels.join(', ')), 'the edit week\'s wrapper names no radius').toEqual([])
  })
})

describe('the frame', () => {
  it('is absolute, z 7, pointer-events none, 8px round, hidden until it carries lift or lift-land', () => {
    const b = bodyOf('.lift-frame')
    expect(b).toMatch(/position:\s*absolute/)
    expect(b).toMatch(/z-index:\s*7\b/)
    expect(b).toMatch(/pointer-events:\s*none/)
    expect(b).toMatch(/display:\s*none/)
    /* the frame is an empty overlay with nothing under it to take a shape from,
       so it carries the recipe's old 8px itself (7 Sep 26) */
    expect(b, 'the frame names its own corner').toMatch(/border-radius:\s*8px/)
    expect(bodyOf('.lift-frame.lift')).toMatch(/display:\s*block/)
    expect(bodyOf('.lift-frame.lift-land')).toMatch(/display:\s*block/)
  })
  it('no rule moves it off absolute — the veil\'s relative rule excludes it', () => {
    for (const r of RULES) {
      if (!r.sels.some(s => matches(s).includes('.lift-frame'))) continue
      const p = r.body.match(/position:\s*([a-z-]+)/)
      if (p) expect(p[1], `${r.sels.join(', ')} keeps the frame absolute`).toBe('absolute')
    }
    const relative = RULES.filter(r => /position:\s*relative/.test(r.body) && r.sels.some(s => s.includes('.lift-land')))
    expect(relative.length, 'a plain landed element gets its positioning context').toBeGreaterThan(0)
    for (const r of relative) for (const s of r.sels) if (s.includes('.lift-land')) expect(s).toContain(':not(.lift-frame)')
  })
  it('the bloom is on the frame alone — a transform keyframe would fight a ghost\'s inline transform', () => {
    const users = RULES.filter(r => /animation:[^;]*liftIn/.test(r.body))
    expect(users.length).toBe(1)
    expect(users[0]!.sels).toEqual(['.lift-frame.lift'])
  })
})

describe('the landing flash', () => {
  it('is a veil ::after, inset-only, and animates opacity and nothing else', () => {
    const v = bodyOf('.lift-land::after')
    expect(v).toMatch(/content:\s*''/)
    expect(v).toMatch(/position:\s*absolute/)
    expect(v).toMatch(/inset:\s*0/)
    /* the veil covers the landed thing exactly, so it takes THAT thing's corner
       (7 Sep 26) — the frame's 8px, a wave block's 10/12px, a puck's 3px */
    expect(v, 'the flash matches the shape of what it covers').toMatch(/border-radius:\s*inherit/)
    expect(v).toMatch(/pointer-events:\s*none/)
    expect(v).toMatch(/background:\s*rgba\(59,198,232,\.20\)/)
    expect(v).toMatch(/box-shadow:\s*var\(--lift-box\)/)
    expect(v).toMatch(/animation:\s*liftLand 600ms/)
    const kf = keyframes('liftLand')
    const props = [...kf.matchAll(/([a-z-]+):/g)].map(m => m[1])
    expect(props.every(p => p === 'opacity'), `liftLand animates ${props.join(',')}`).toBe(true)
    expect(kf).toMatch(/0%,\s*25%\s*\{opacity:1\}/)
  })

  /* THE VEIL NEEDS ITS OWN REDUCED-MOTION RULE (review, 6 Sep 26). The blanket
     `@media (prefers-reduced-motion:reduce){*{animation:none!important}}` reaches
     the FRAME's bloom, because `*` matches elements — but `.lift-land::after` is
     a PSEUDO-element, which `*` does not match, so the landing fade ran at full
     600ms for a user who asked for no motion. Measured in Chromium: the veil's
     computed animation-name read `liftLand` under reducedMotion:'reduce' while
     its host element's read `none`. The file already knew the shape of the cure
     — `.legend-sum::before` carries the same targeted override — and .sb-fresh
     puts its one right beside the animation it cancels, which is where this sits.
     The feedback is not lost: the class still HOLDS for LIFT_LAND_MS and lift.ts's
     timer takes it off. */
  it('the veil is silenced under reduced motion by its OWN rule — `*` never matches a pseudo-element', () => {
    const off = RULES.filter(r => r.sels.includes('.lift-land::after') && /animation:\s*none/.test(r.body))
    expect(off.length, '.lift-land::after declares animation:none somewhere').toBe(1)
    expect(insideReduced(off[0]!.at), 'and it is INSIDE @media (prefers-reduced-motion:reduce) — outside it, nobody gets the flash').toBe(true)
    // the blanket itself is untouched and still uses the wildcard it always did
    expect(RULES.some(r => r.sels.includes('*') && /animation:\s*none\s*!important/.test(r.body) && insideReduced(r.at)),
      'the blanket still stands (it is what silences the frame\'s bloom)').toBe(true)
  })
})

/* THE DAY POPOVER'S TWO PICKED-UP THINGS (7 Sep 26). Both are single elements,
   so they wear the recipe DIRECTLY rather than through a frame (design: "Single-
   element things wear the recipe directly") — a section through the prop-driven
   `dragging` class React already writes, a seated puck through the imperative
   `.pk-drag` its own drag adds (nothing re-renders during that one). Neither
   rule may lose what it already carried: the section's fade is what says "this
   one is travelling", and the puck's position/z/pointer-events are load-bearing
   for the hit-test under the finger. The landing bars (`.ic-sec.dragover`,
   `.pk-swap-target`) are a different vocabulary and stay untouched. */
describe('the day popover wears the same recipe', () => {
  it('a dragged section and a lifted seated puck carry --lift-box at the 8px radius', () => {
    for (const sel of ['.ic-sec.dragging', '.ic-secpk.pk-drag']) {
      const b = bodyOf(sel)
      expect(b, `${sel} has a rule at all`).toBeTruthy()
      expect(b, `${sel} wears --lift-box`).toMatch(/box-shadow:\s*var\(--lift-box\)/)
      expect(b, `${sel} takes the recipe's radius`).toMatch(/border-radius:\s*8px/)
    }
  })
  it('and keeps everything it carried before the lift', () => {
    expect(bodyOf('.ic-sec.dragging'), 'the travelling section still fades').toMatch(/opacity:\s*\.45/)
    const pk = bodyOf('.ic-secpk.pk-drag')
    expect(pk, 'the lifted puck still floats above its neighbours').toMatch(/position:\s*relative/)
    expect(pk).toMatch(/z-index:\s*3\b/)
    /* pointer-events:none is what lets elementFromPoint read the SLOT under the
       finger instead of the chip riding it — the swap would never resolve without it */
    expect(pk, 'the lifted puck is not its own hit-test target').toMatch(/pointer-events:\s*none/)
  })
})

/* THE TWO GHOST DRAGS (7 Sep 26). A ghost is one element the machine builds and
   throws away, so it wears the recipe DIRECTLY — no frame. Its own accent
   outline goes (an outline is drawn OUTSIDE the border box, which is the uneven
   look the whole change is about), and the neutral DEPTH shadow stays: it is
   what lifts the ghost off the page, it is not the accent, and nothing clips a
   fixed child of <body>. The two must ride ONE box-shadow, and it is written on
   the ghost's `.lift` compound — `.lift`'s own single-layer box-shadow sits
   later in this file, so at equal specificity it would REPLACE the depth shadow
   outright. What this pins is the SET: the accent only ever paints inset, the
   one outer layer is neutral, and everything the ghost carried for the drag
   itself (fixed position, the compositor layer, the hit-test rules) is intact. */
describe('the ghosts wear the same recipe — inset accent, neutral depth', () => {
  const GHOSTS: Array<[string, string]> = [['.tdghost', '.6'], ['.dragimg', '.6'], ['.ic-ghost', '.5']]
  /** Every rule that paints a ghost in flight: its own class, and the compound
   *  with the `lift` the machine adds beside it (drag.ts tdArm/setDragImage,
   *  caldrag.ts arm). */
  const ghostRules = (cls: string) => RULES.filter(r => r.sels.some(s => s === cls || s === `${cls}.lift`))
  const ghostBody = (cls: string) => ghostRules(cls).map(r => r.body).join(' ').replace(/\s+/g, ' ')

  it('no ghost draws an outline any more — the box is the shared .lift, inside the line', () => {
    for (const [cls] of GHOSTS) {
      expect(ghostRules(cls).length, `${cls} has rules`).toBeGreaterThan(0)
      expect(ghostBody(cls), `${cls} draws no outline`).not.toMatch(/outline/)
    }
  })

  it('each carries --lift-box plus its dark drop shadow, and the ONE outer layer is neutral', () => {
    for (const [cls, alpha] of GHOSTS) {
      const m = ghostBody(cls).match(/box-shadow:\s*([^;}]+)/)
      expect(m, `${cls} declares a box-shadow`).toBeTruthy()
      const ls = layers(m![1]!.trim())
      expect(ls[0], `${cls} leads with the shared recipe`).toBe('var(--lift-box)')
      expect(ls.length, `${cls} carries exactly the recipe and its depth shadow`).toBe(2)
      expect(ls[1], `${cls} keeps the dark drop shadow that lifts it off the page`)
        .toBe(`0 8px 20px rgba(0,0,0,${alpha})`)
      /* the accent NEVER paints outside the border box — that is trap row 1,
         and the reason the outline went */
      expect(ls[1], `${cls}'s outer layer is neutral, never the accent`).not.toMatch(/--accent|59,\s*198,\s*232/)
    }
  })

  it('and nothing the drag itself needs was lost', () => {
    for (const [cls] of GHOSTS) expect(ghostBody(cls), `${cls} still rides the pointer`).toMatch(/position:\s*fixed/)
    /* the puck ghosts' compositor layer (6 Sep 26) and the mouse ghost's
       hit-testable grabbing cursor (css-invalidation.test.ts pins the pair too) */
    for (const cls of ['.tdghost', '.dragimg']) {
      expect(ghostBody(cls), `${cls} keeps its own layer`).toMatch(/will-change:\s*transform/)
      expect(ghostBody(cls), `${cls} is still positioned by transform alone`).toMatch(/left:\s*0!important/)
    }
    expect(ghostBody('.dragimg')).toMatch(/pointer-events:\s*auto/)
    expect(ghostBody('.dragimg')).toMatch(/cursor:\s*grabbing/)
    expect(ghostBody('.tdghost')).toMatch(/pointer-events:\s*none/)
    /* the chip ghost's own look: centred under the finger, slightly grown and faded */
    expect(ghostBody('.ic-ghost')).toMatch(/transform:\s*translate\(-50%,\s*-50%\)\s*scale\(1\.05\)/)
    expect(ghostBody('.ic-ghost')).toMatch(/opacity:\s*\.85/)
  })

  /* Trap row 15: `liftIn` scales, and a ghost's position IS an inline transform —
     the keyframe would throw it back to 0,0 for its first 120ms. The frame-only
     test above pins the one user; this says it in the ghosts' own words. */
  it('no ghost is given the frame\'s bloom — a transform keyframe would fight its inline transform', () => {
    for (const [cls] of GHOSTS) expect(ghostBody(cls), `${cls} runs no animation`).not.toMatch(/animation/)
  })

  /* THE FINGER'S GHOST DRAWS ITS RING ON A VEIL (7 Sep 26, found in the live
     drive). `tdArm` clones the whole `[data-drag]` SEAT for a touch drag, and a
     seat is filled edge to edge by an opaque `.puck`; an INSET shadow paints in
     the element's OWN background layer, UNDER its children, so the ring was in
     the computed style and invisible on the screen — measured edge by edge on
     the built app, no cyan on any of the four. A veil pseudo-element paints
     over the clone's contents (the same answer `.lift-land::after` already
     gives a landing on a seat). It is the WRAPPER case alone: the mouse ghost
     IS the puck and the chip ghost has no such child, both measured showing the
     ring on all four edges, so neither gets a second copy of it. */
  it('the finger\'s ghost carries a veil, because what it clones would cover an inset ring', () => {
    const v = bodyOf('.tdghost.lift::after')
    expect(v, '.tdghost.lift::after exists').toBeTruthy()
    expect(v).toMatch(/content:\s*''/)
    expect(v).toMatch(/position:\s*absolute/)
    expect(v).toMatch(/inset:\s*0/)
    expect(v).toMatch(/box-shadow:\s*var\(--lift-box\)/)
    expect(v, 'it takes the ghost\'s own corner').toMatch(/border-radius:\s*inherit/)
    expect(v, 'and is never a hit-test target').toMatch(/pointer-events:\s*none/)
    for (const cls of ['.dragimg', '.ic-ghost'])
      expect(rulesFor(`${cls}.lift::after`).length, `${cls} shows its ring already and takes no veil`).toBe(0)
  })
})

/* THE HOST ARRANGES AROUND THE FRAME (review, 7 Sep 26). The quals column frame
   is the one frame in the app that TRAVELS: it is placed in `.qwrap`'s content
   coordinates so it rides the sideways scroll with its column, which means a
   scrolled column slides its whole rectangle under the FROZEN callsign column —
   and at the shared recipe's z 7 it drew its cyan ring over the frozen names.
   Dropping the frame alone is not the cure either: below `.qtbl thead th`'s
   opaque z 2 the ring round the PICKED-UP heading disappears on every ordinary
   drag. So the numbers are a set, and the set is what this pins — read out of
   the file and compared to each other, so a later re-tune of any one of them
   has to keep the order that makes the picture right. */
describe('the quals column frame stacks under the frozen column and over the headings', () => {
  const zOf = (sel: string) => {
    const m = bodyOf(sel).match(/z-index:\s*(-?\d+)/)
    expect(m, `${sel} declares a z-index`).toBeTruthy()
    return Number(m![1])
  }
  it('the frame sits at the heading row\'s own level and below both frozen cells', () => {
    const frame = zOf('.qwrap .lift-frame'), head = zOf('.qtbl thead th')
    const name = zOf('.qtbl td.qname'), corner = zOf('.qtbl thead th[data-sort="cs"]')
    /* at-or-above the heading row: the frame is rendered AFTER the table inside
       .qwrap, so an equal z-index still paints it over the heading it wraps */
    expect(frame, 'the ring shows over the picked-up heading').toBeGreaterThanOrEqual(head)
    /* and under the frozen column, which then covers the frame's overhang
       exactly as it covers the column's own cells */
    expect(frame, 'the frozen callsign cells win over the travelling frame').toBeLessThan(name)
    expect(frame).toBeLessThan(corner)
    /* the corner still out-ranks every other heading (it is the one place the
       frozen column and the heading row DO meet) */
    expect(corner).toBeGreaterThan(head)
    expect(corner).toBeGreaterThan(name)
  })
  it('the host rule re-stacks the frame and nothing else — position and hit-testing are the recipe\'s', () => {
    expect(rulesFor('.qwrap .lift-frame').length, 'one host rule').toBe(1)
    expect(bodyOf('.qwrap .lift-frame').replace(/z-index:\s*-?\d+;?/, '').trim(), 'z-index only').toBe('')
  })
})
