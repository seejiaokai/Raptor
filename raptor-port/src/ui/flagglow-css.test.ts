// @vitest-environment node — reads a stylesheet off disk (the lift-css.test.ts shape)
/* THE RINGS ON A PUCK — two of his rulings, one witness. jsdom paints nothing, so the stylesheet is read and the cascade
   worked out by hand for the rules that sit on the puck itself.

   D164 (24 Sep 26) — A FLAGGED PUCK DOES NOT GLOW: "some of the flagging on the puck is glowing, some are not can u not
   make it glow. like the 2nd puck picture". EVERY rule that draws a flag ring — solid, dashed or dotted red, the amber /
   thin red / grey severity rings — is walked, and none may carry a blurred layer. A roll-call over the rules, not a
   check of the ones that were wrong, so a ring rule written later is caught the same way.

   D270 / D272 (27 Sep 26) — ON HIS OWN PUCK, ANY OTHER RING WINS OVER THE PURPLE "THIS IS YOU" RING: "Q2 yes" (a flag's
   ring — amber, thin red, grey, the dotted cause ring, as another man's puck shows it) and "question 2 yes" (in OIL Earn
   mode the green OIL ring). The purple FILL stays and says "you"; unflagged, the purple ring and its glow stay. So for
   EVERY set of ring classes a puck can wear (ui/html.ts `puck` — the severity, the red box, the trace, the OIL mode),
   the ring that WINS on `.puck.me` must be the one that wins on a plain `.puck` — resolved rule by rule (!important,
   then specificity, then order), never read off one selector, because a rule that merely exists proves nothing about
   which one paints (Fable's read of the first cut, 26 Sep 26: it passed while the purple glow won).

   What is NOT a flag and keeps its glow: the purple "you" ring on an unflagged puck, and the clicked-warning focus
   (`.puck.wfoc` — the rule that a clicked warning lights its crew in the warning colours, a transient answer to a tap,
   not a standing flag). */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map((m, order) => ({ order, sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!.replace(/\s+/g, ' ') }))
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
/** the blur radius of one box-shadow layer ('0 0 10px 1px rgba(…)' → 10); inset and colour words skipped */
const blurOf = (layer: string) => {
  const lens = layer.replace(/rgba?\([^)]*\)/g, '').replace(/\binset\b/g, '').match(/-?\d*\.?\d+(px)?/g) || []
  return lens.length >= 3 ? parseFloat(lens[2]!) : 0
}
const shadowOf = (body: string) => { const m = /(?:^|;)\s*box-shadow\s*:\s*([^;]*)/.exec(body); return m ? m[1]!.replace(/!important/, '').trim() : null }

/* ---- the cascade, for the rules that sit on the puck itself: `.puck` followed only by classes and :not(.class) ---- */
const ON_PUCK = /^\.puck(?:\.[\w-]+|:not\(\.[\w-]+\))*$/
type Sel = { need: string[], not: string[], spec: number }
const parseSel = (s: string): Sel => {
  const not = [...s.matchAll(/:not\(\.([\w-]+)\)/g)].map(m => m[1]!)
  const need = [...s.replace(/:not\(\.[\w-]+\)/g, '').matchAll(/\.([\w-]+)/g)].map(m => m[1]!)
  return { need, not, spec: need.length + not.length }
}
const decls = (body: string) => body.split(';').map(d => d.trim()).filter(Boolean).map(d => {
  const i = d.indexOf(':'); const v = d.slice(i + 1).trim()
  return { prop: d.slice(0, i).trim(), value: v.replace(/\s*!important\s*$/, '').trim(), imp: /!important\s*$/.test(v) }
})
const PUCK_RULES = RULES.flatMap(r => r.sels.filter(s => ON_PUCK.test(s)).map(s => ({ sel: s, ...parseSel(s), order: r.order, decls: decls(r.body) })))
/** the value that wins for `prop` on a puck wearing `classes` (with 'puck'); `props` lets a shorthand count too */
function winner(classes: string[], props: string[]) {
  const has = new Set(['puck', ...classes])
  let best: { value: string, imp: boolean, spec: number, order: number, sel: string } | null = null
  for (const r of PUCK_RULES) {
    if (!r.need.every(c => has.has(c)) || r.not.some(c => has.has(c))) continue
    for (const d of r.decls) {
      if (!props.includes(d.prop)) continue
      const c = { value: d.value, imp: d.imp, spec: r.spec, order: r.order, sel: r.sel }
      if (!best || (c.imp !== best.imp ? c.imp : c.spec !== best.spec ? c.spec > best.spec : c.order >= best.order)) best = c
    }
  }
  return best
}
const shadowWin = (cls: string[]) => winner(cls, ['box-shadow'])?.value ?? 'none'
const outlineWin = (cls: string[]) => winner(cls, ['outline'])?.value ?? 'none'
const fillWin = (cls: string[]) => winner(cls, ['background-color', 'background'])?.value ?? null

/* every set of ring classes html.ts `puck` can put on a man's puck: the severity ring, the red box, the dotted trace,
   and the OIL Earn mode's glow (or its dimming) — the full cross product, so no pairing is left to chance */
const SEV = [[], ['warn'], ['warn', 'hard'], ['warn', 'note']]
const BOX = [[], ['boxred'], ['boxdash']]
const TRACE = [[], ['boxdot']]
const OIL = [[], ['oilglow'], ['oilglow', 'half'], ['oildim']]
const SETS = SEV.flatMap(a => BOX.flatMap(b => TRACE.flatMap(c => OIL.map(d => [...a, ...b, ...c, ...d]))))
const RINGED = (s: string[]) => s.some(c => ['warn', 'boxred', 'boxdash', 'boxdot', 'oilglow'].includes(c))
const PURPLE = '0 0 0 2px #F0B6FF,0 0 12px 1px rgba(155,47,174,.7)'

/* every rule whose selector draws a flag ring on a puck: the three red rings (.boxred / .boxdash / .boxdot) AND the
   severity rings under them (.warn — amber, .warn.hard — thin red, .warn.note — grey; Astra's read, 26 Sep 26) */
const RING = /\.puck(?:\.[\w-]+)*\.(box(red|dash|dot)|warn)\b/
const ringRules = RULES.flatMap(r => r.sels.filter(s => RING.test(s)).map(s => ({ sel: s, body: r.body })))

describe('D164 — no flag ring on any puck carries a glow', () => {
  it('the roll-call finds the ring rules', () => {
    const sels = ringRules.map(r => r.sel)
    for (const s of ['.puck.boxred', '.puck.boxdash', '.puck.boxdot', '.puck.warn', '.puck.warn.hard', '.puck.warn.note'])
      expect(sels, `${s} is one of the rules walked`).toContain(s)
  })
  it('every ring rule draws its ring with NO blurred layer', () => {
    for (const r of ringRules) {
      const sh = shadowOf(r.body)
      if (!sh || sh === 'none') continue
      for (const l of layers(sh)) expect(blurOf(l), `${r.sel} — "${l}" is a glow`).toBe(0)
    }
  })
  it('the shadow that WINS on any flagged puck, his own or another man\'s, has no blur', () => {
    for (const s of SETS.filter(s => s.some(c => ['warn', 'boxred', 'boxdash', 'boxdot'].includes(c)) && !s.includes('oilglow')))
      for (const me of [[], ['me']]) {
        const w = shadowWin([...me, ...s])
        if (w !== 'none') for (const l of layers(w)) expect(blurOf(l), `${[...me, ...s].join('.')} — "${l}"`).toBe(0)
      }
  })
})

describe('D270 / D272 — on his own puck, any other ring wins over the purple "this is you" ring', () => {
  it('the cascade reader sees the rules it resolves (a guard on the test itself)', () => {
    expect(shadowWin(['boxred'])).toBe('0 0 0 2px var(--hard)')
    expect(shadowWin(['warn'])).toBe('0 0 0 1.5px var(--adv)')
    expect(shadowWin(['me'])).toBe(PURPLE)
    expect(outlineWin(['boxdot'])).toBe('1.5px dotted var(--hard)')
  })
  it('flagged or earning, his puck wears exactly the ring another man\'s puck wears — every combination', () => {
    const sets = SETS.filter(RINGED)
    expect(sets.length).toBeGreaterThan(60)
    for (const s of sets) {
      const tag = s.join('.')
      expect(shadowWin(['me', ...s]), `${tag}: the ring`).toBe(shadowWin(s))
      expect(outlineWin(['me', ...s]), `${tag}: the dashed / dotted stroke`).toBe(outlineWin(s))
    }
  })
  it('the named cases, in his words: amber, thin red, grey, the dotted ring alone, and the green OIL ring', () => {
    expect(shadowWin(['me', 'warn'])).toBe('0 0 0 1.5px var(--adv)')
    expect(shadowWin(['me', 'warn', 'hard'])).toBe('0 0 0 1.5px var(--hard)')
    expect(shadowWin(['me', 'warn', 'note'])).toBe('0 0 0 1.5px #8A96A3')
    expect(shadowWin(['me', 'boxdot']), 'the dotted ring alone, nothing purple behind it').toBe('none')
    expect(outlineWin(['me', 'boxdot'])).toBe('1.5px dotted var(--hard)')
    expect(shadowWin(['me', 'warn', 'hard', 'boxred'])).toBe('0 0 0 2px var(--hard)')
    expect(shadowWin(['me', 'oilglow'])).toBe('0 0 0 2px var(--oil),0 0 8px rgba(47,166,92,.5)')
    expect(shadowWin(['me', 'oilglow', 'half'])).toBe('0 0 0 2px var(--oil)')
  })
  it('with nothing else to say, his puck keeps the purple ring and its glow — in OIL mode too when he earns nothing', () => {
    for (const s of SETS.filter(s => !RINGED(s))) expect(shadowWin(['me', ...s]), s.join('.') || '(unflagged)').toBe(PURPLE)
    expect(layers(PURPLE).some(l => blurOf(l) > 0), 'the "you" glow is a glow').toBe(true)
  })
  it('the purple FILL stays on every one of them — it is what says "you"', () => {
    for (const s of SETS) expect(fillWin(['me', ...s]), s.join('.') || '(unflagged)').toBe('var(--me)')
  })
  it('what is NOT a flag keeps its glow: the clicked-warning focus', () => {
    const wf = RULES.find(r => r.sels.includes('.puck.wfoc'))!
    expect(layers(shadowOf(wf.body)!).some(l => blurOf(l) > 0), 'the clicked-warning focus stays lit').toBe(true)
  })
})
