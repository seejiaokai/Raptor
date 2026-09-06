// @vitest-environment node — reads a stylesheet off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* What a Rearrange drag LOOKS like, how the viewer's own row is lit, and what
   the switch that starts the drag looks like — pinned as a CSS contract, the
   way `arrangepaint.test.ts` pins the compositor promotion beside it. jsdom
   loads no stylesheet and reports every rect as 0×0, so a rule that fades a
   sticky cell, a wash that swallows the weekend band, or a ring that never
   goes away is unreachable from the ordinary suite; the file itself is the
   only thing that can be read here.

   Four faults, all from the owner's iPhone on 6 Sep 26. A dragged row faded
   its FROZEN cells, and a frozen cell is sticky — it paints over the day cells
   scrolling underneath it, so at .5 the numbers came through the callsign
   ("19FL P9 18"). It is the same failure the archived rows had, and
   `.mrow-hidden` already carries its cure: fade the CONTENT, never the cell.
   The picked-up row then read as merely dimmed rather than lifted ("make the
   glow of the selected row more obvious"). The viewer's row was too quiet
   ("make the glow of the view as user row a bit more obvious"), and the
   obvious answer — a wash over its day cells — turned out to out-rank every
   state colour and hide the weekend band, so lines carry it instead. And the
   ⇅ switch is a real `<button>`, so iOS left it FOCUSED after a tap and
   painted its own ring — which read as "still on" after the second tap had
   turned Rearrange off. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./matrix.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** Every rule in the file: its selector list, its declarations, and where it sits.
 *  An `@media …` line never matches this shape (its body holds braces), so a rule
 *  NESTED in one is still found — which is what lets the hover check below ask
 *  where a rule sits rather than only whether it exists. */
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!, at: m.index! }))

/* Every rule that lists `sel` among its comma-separated selectors — not
   `arrangepaint`'s whole-selector-list match, because these recipes are
   deliberately written as SHARED lists (`.who, .bal`) and a fade hiding in one
   of them is exactly what this file is here to catch. */
const rulesFor = (sel: string) => RULES.filter(r => r.sels.includes(sel))
const bodiesFor = (sel: string): string[] => rulesFor(sel).map(r => r.body)
/** Where a rule listing `sel` first appears in the file — for source order. */
const indexOf = (sel: string): number => rulesFor(sel)[0]?.at ?? -1

/** The character span of every `@media (hover: hover)` block, brace-matched. */
const HOVER_MEDIA: Array<[number, number]> = [...css.matchAll(/@media\s*\(\s*hover:\s*hover\s*\)\s*\{/g)].map(m => {
  let i = m.index! + m[0]!.length, depth = 1
  while (i < css.length && depth > 0) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++ }
  return [m.index!, i] as [number, number]
})
const insideHoverMedia = (at: number) => HOVER_MEDIA.some(([a, b]) => at > a && at < b)

/** A selector's specificity as [ids, classes, elements] — enough for the simple
 *  class/element/`:not()` selectors this file deals in. `:not()` adds nothing
 *  itself but its argument counts, which is precisely the arithmetic that
 *  decided the manning-row bug below, so it is computed rather than eyeballed. */
const spec = (sel: string): [number, number, number] => {
  const s = sel.replace(/:not\(([^)]*)\)/g, ' $1 ')
  const n = (re: RegExp) => (s.match(re) ?? []).length
  return [n(/#[\w-]+/g), n(/\.[\w-]+/g) + n(/:[\w-]+/g) + n(/\[[^\]]*\]/g), n(/(^|[\s>+~])[a-zA-Z][\w-]*/g)]
}
const beats = (a: string, b: string): boolean => {
  const [x, y] = [spec(a), spec(b)]
  for (let i = 0; i < 3; i++) if (x[i]! !== y[i]!) return x[i]! > y[i]!
  return false            // a tie is NOT a win: source order would decide it
}

describe('a dragged row keeps its frozen cells opaque', () => {
  it('nothing fades the sticky cells themselves — not the pair, not the heading', () => {
    for (const sel of ['.mx tbody tr.dragging .who', '.mx tbody tr.dragging .bal', '.mx tbody tr.grp.dragging', '.mx tbody tr.grp.dragging td.grphd']) {
      for (const body of bodiesFor(sel))
        expect(body, `${sel} is sticky — fading it lets the day numbers through the label`).not.toMatch(/opacity/)
    }
  })

  it('the CONTENT fades instead, on the pair and on the heading', () => {
    for (const sel of ['.mx tbody tr.dragging .who > *', '.mx tbody tr.dragging .bal > *', '.mx tbody tr.grp.dragging td.grphd > .grphd-in', '.mx tbody tr.grp.dragging td.grpfill']) {
      const bodies = bodiesFor(sel)
      expect(bodies.length, `${sel} carries the drag's fade`).toBeGreaterThan(0)
      expect(bodies.join(' ')).toMatch(/opacity:\s*\.5/)
    }
  })

  it('the picked-up row is LIFTED — a ring on the frozen cells and a glow past them', () => {
    for (const sel of ['.mx tbody tr.dragging .who', '.mx tbody tr.dragging .bal', '.mx tbody tr.grp.dragging td.grphd']) {
      const body = bodiesFor(sel).join(' ').replace(/\s+/g, ' ')
      expect(body, `${sel} wears the accent ring`).toMatch(/box-shadow:[^;]*inset 0 0 0 2px var\(--accent\)/)
      expect(body, `${sel} glows past its own edge`).toMatch(/box-shadow:[^;]*0 0 12px rgba\(59, 198, 232, \.6\)/)
    }
  })

  it('the landing bar runs the whole row at 3px, top edge or bottom', () => {
    // The `td:not(.who)` rule is the one that runs the width — a category
    // heading's cells are ordinary `td`s, so it serves both kinds of row; the
    // `.who` and `.grphd` rules only add the glow on the sticky cell.
    for (const sel of ['.mx tbody tr.dragover td:not(.who)', '.mx tbody tr.dragover .who', '.mx tbody tr.grp.dragover td.grphd'])
      expect(bodiesFor(sel).join(' '), `${sel} draws the 3px landing bar`).toMatch(/inset 0 3px 0 var\(--accent\)/)
    for (const sel of ['.mx tbody tr.dragover.after td:not(.who)', '.mx tbody tr.dragover.after .who', '.mx tbody tr.grp.dragover.after td.grphd'])
      expect(bodiesFor(sel).join(' '), `${sel} draws it on the bottom edge instead`).toMatch(/inset 0 -3px 0 var\(--accent\)/)
  })

  /* THE MANNING ROW, both halves of it. A count cell that is under strength
     carries its own `box-shadow` ring (`.mx .counts td.amber` / `.red`), and
     box-shadow is ONE property, so the drag rules and the shortfall ring are in
     direct competition on exactly the days an admin reorders the block FOR.
     Two things have to hold, and they used to disagree with each other: the
     drag paint must out-rank the ring (or the landing bar simply vanishes on
     the short days), and it must then put the ring back underneath (or the
     picked-up row loses the shortfall the landing row still shows). */
  it('the drag rules out-rank the counts shortfall states', () => {
    for (const sel of [
      '.mx tbody tr.dragging:not(.grp) td:not(.who):not(.bal)',
      '.mx tbody tr.dragover td:not(.who)',
      '.mx tbody tr.dragover.after td:not(.who)',
    ]) {
      expect(bodiesFor(sel).length, `${sel} exists`).toBe(1)
      for (const state of ['.mx .counts td.amber', '.mx .counts td.red'])
        expect(beats(sel, state), `${sel} must out-rank ${state} — a bare \`td\` here is (0,2,3) and LOSES to (0,3,1), which left no landing bar on a short day`).toBe(true)
    }
  })

  it('…and put the shortfall ring back underneath, so both rows say the same thing', () => {
    for (const state of ['.mx .counts td.amber', '.mx .counts td.red']) {
      const body = bodiesFor(state).join(' ')
      expect(body, `${state} publishes its ring as --mrow-ring`).toMatch(/--mrow-ring:\s*inset 0 0 0 1px/)
      expect(body, `${state} still paints it`).toMatch(/box-shadow:\s*var\(--mrow-ring\)/)
    }
    for (const sel of [
      '.mx tbody tr.dragging:not(.grp) td:not(.who):not(.bal)',
      '.mx tbody tr.dragover td:not(.who)',
      '.mx tbody tr.dragover.after td:not(.who)',
    ]) {
      const body = bodiesFor(sel)[0]!.replace(/\s+/g, ' ')
      expect(body, `${sel} composes the shortfall ring`).toMatch(/var\(--mrow-ring, 0 0 transparent\)/)
      // LAST layer: box-shadow paints first-on-top, so the drag's own edges win
      // and the shortfall shows down the sides rather than over the bar.
      expect(body.trim().replace(/;$/, '').endsWith('var(--mrow-ring, 0 0 transparent)'), `${sel} keeps the ring as the BOTTOM layer`).toBe(true)
    }
  })
})

describe('the viewer\'s own row is lit by LINES, never by a wash', () => {
  /* A `td` background on `tr.me` out-ranks `.mx td.weekend` and every other
     state colour (0,2,3 against 0,2,1), so the 7% accent wash tried on 6 Sep 26
     turned the viewer's Saturdays from rgba(6,8,11,.55) into the tint — the
     weekend band gone on the one row that most needs reading (measured in the
     browser that day). Box-shadows sit OVER a cell's own fill instead. */
  it('no day-cell fill on tr.me — the state colours have to win', () => {
    for (const body of bodiesFor('.mx tbody tr.me td'))
      expect(body, 'a fill here would swallow .weekend / .evoff / .locked').not.toMatch(/background/)
  })
  it('the frozen pair keeps its solid panel, and the row keeps its accent lines', () => {
    expect(bodiesFor('.mx tbody tr.me .who').join(' ')).toMatch(/background: #173C4A/)
    for (const sel of ['.mx tbody tr.me td', '.mxdrawer .mx tbody tr.me td'])
      expect(bodiesFor(sel).join(' ').replace(/\s+/g, ' '), `${sel} brackets the row`)
        .toMatch(/inset 0 1px 0 rgba\(59, 198, 232, \.55\), inset 0 -1px 0 rgba\(59, 198, 232, \.55\)/)
  })
})

describe('the Rearrange switch rings only for a keyboard, and glows while on', () => {
  it('a tap leaves no ring — :focus turns the outline off', () => {
    const bodies = bodiesFor('.rtbtn:focus')
    expect(bodies.length, '.rtbtn:focus is declared').toBeGreaterThan(0)
    expect(bodies.join(' ').replace(/\s+/g, ' ')).toMatch(/outline: none/)
  })

  it('a keyboard still gets one, via :focus-visible AFTER the :focus that clears it', () => {
    const bodies = bodiesFor('.rtbtn:focus-visible')
    expect(bodies.length, '.rtbtn:focus-visible is declared').toBeGreaterThan(0)
    expect(bodies.join(' ')).toMatch(/outline:\s*2px solid var\(--accent\)/)
    // Same specificity, so SOURCE ORDER is the whole contract: written above
    // the `:focus` rule the keyboard ring would be cleared again.
    expect(indexOf('.rtbtn:focus-visible')).toBeGreaterThan(indexOf('.rtbtn:focus'))
  })

  it('ON glows rather than only tinting', () => {
    const body = bodiesFor('.rtbtn.on').join(' ').replace(/\s+/g, ' ')
    expect(body, '.rtbtn.on is declared').not.toBe('')
    expect(body).toMatch(/box-shadow:[^;]*rgba\(59, 198, 232, \.5\)/)
    expect(body).toMatch(/border-color: var\(--accent\)/)
  })

  /* The OTHER half of "a second click when it's turned off shouldn't glow"
     (owner, 6 Sep 26). iOS applies `:hover` to the last element TAPPED and
     leaves it there, so the accent hover border sat on the ⇅ after the second
     tap had turned Rearrange off — the same lie the focus ring told, by a
     second route. Every hover in this family is behind `@media (hover: hover)`,
     which is false on a touch screen and true for a mouse. */
  it('every .rtbtn hover rule is behind @media (hover: hover)', () => {
    expect(HOVER_MEDIA.length, 'matrix.css declares an @media (hover: hover) block').toBeGreaterThan(0)
    const hovers = RULES.filter(r => r.sels.some(s => /\.rtbtn[^,]*:hover$/.test(s)))
    // At least the three that exist today, so the guard cannot be "passed" by
    // deleting the hovers — but not EXACTLY three, or a future hover added
    // correctly inside the guard would fail. The per-rule check below is what
    // actually holds the line.
    expect(hovers.length, 'the .rtbtn family still HAS hover rules — a mouse keeps them').toBeGreaterThanOrEqual(3)
    for (const r of hovers)
      expect(insideHoverMedia(r.at), `${r.sels.join(', ')} is guarded — a touch screen keeps :hover stuck on the last thing tapped`).toBe(true)
  })

  it('no bare .rtbtn:hover survives — the accent border is the mouse\'s alone', () => {
    const rules = rulesFor('.rtbtn:hover')
    expect(rules.length, '.rtbtn:hover is declared exactly once').toBe(1)
    expect(rules[0]!.body).toMatch(/border-color: var\(--accent\)/)
    expect(insideHoverMedia(rules[0]!.at)).toBe(true)
    // …and it stays ABOVE `.rtbtn.pri` / `.rtbtn.arm`, which share its
    // specificity: moved below them, hovering a primary or an armed button
    // would steal the border those states own.
    expect(indexOf('.rtbtn:hover')).toBeLessThan(indexOf('.rtbtn.pri'))
    expect(indexOf('.rtbtn:hover')).toBeLessThan(indexOf('.rtbtn.arm'))
  })
})
