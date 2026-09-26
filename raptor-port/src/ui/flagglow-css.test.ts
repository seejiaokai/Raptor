// @vitest-environment node — reads a stylesheet off disk (the lift-css.test.ts shape)
/* A FLAGGED PUCK DOES NOT GLOW (owner, D164, 24 Sep 26 — "some of the flagging on the puck is glowing, some are not
   can u not make it glow. like the 2nd puck picture"). The glow he saw was the "this is you" puck's: when the signed-in
   man's own puck (purple, `.puck.me`) also carried a red flag, `.puck.me.boxred` / `.puck.me.boxdash` laid a blurred
   red halo on top of the ring, while every other flagged puck showed the plain ring. jsdom paints nothing, so the
   stylesheet is the witness: EVERY rule that draws a flag ring — solid, dashed or dotted, on any puck — is walked, and
   none may carry a blurred layer. A roll-call over the rules, not a check of the two that were wrong, so a third ring
   rule written later is caught the same way.
   What is NOT a flag and keeps its glow: the purple "this is you" ring itself (`.puck.me` — its glow is the "you"
   highlight, drawn on his puck flagged or not, and it yields to the red ring when he is flagged) and the clicked-warning
   focus (`.puck.wfoc` — the owner's rule that a clicked warning lights its crew in the warning colours, a transient
   answer to a tap, not a standing flag). */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const RULES = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(m => ({ sels: m[1]!.split(',').map(s => s.trim().replace(/\s+/g, ' ')), body: m[2]!.replace(/\s+/g, ' ') }))
/** box-shadow layers: split on the commas that are not inside rgba(...) */
const layers = (shadow: string) => shadow.split(/,(?![^(]*\))/).map(s => s.trim())
/** the blur radius of one box-shadow layer ('0 0 10px 1px rgba(…)' → 10); inset and colour words skipped */
const blurOf = (layer: string) => {
  const lens = layer.replace(/rgba?\([^)]*\)/g, '').replace(/\binset\b/g, '').match(/-?\d*\.?\d+(px)?/g) || []
  return lens.length >= 3 ? parseFloat(lens[2]!) : 0
}
const shadowOf = (body: string) => { const m = /(?:^|;)\s*box-shadow\s*:\s*([^;]*)/.exec(body); return m ? m[1]!.replace(/!important/, '').trim() : null }
/* every rule whose selector draws a flag ring on a puck: the three red rings (.boxred / .boxdash / .boxdot) AND the
   severity rings under them (.warn — amber, .warn.hard — thin red, .warn.note — grey; Astra's read, 26 Sep 26: the
   first cut walked only the red three) */
const RING = /\.puck(?:\.[\w-]+)*\.(box(red|dash|dot)|warn)\b/
const ringRules = RULES.flatMap(r => r.sels.filter(s => RING.test(s)).map(s => ({ sel: s, body: r.body })))

describe('D164 — no flag ring on any puck carries a glow', () => {
  it('the roll-call finds the ring rules, the "this is you" ones included', () => {
    const sels = ringRules.map(r => r.sel)
    for (const s of ['.puck.boxred', '.puck.me.boxred', '.puck.boxdash', '.puck.me.boxdash', '.puck.boxdot', '.puck.me.boxdot',
      '.puck.warn', '.puck.warn.hard', '.puck.warn.note'])
      expect(sels, `${s} is one of the rules walked`).toContain(s)
  })
  it('every ring rule draws its ring with NO blurred layer', () => {
    for (const r of ringRules) {
      const sh = shadowOf(r.body)
      if (!sh || sh === 'none') continue
      for (const l of layers(sh)) expect(blurOf(l), `${r.sel} — "${l}" is a glow`).toBe(0)
    }
  })
  it('the "this is you" solid ring is the same plain red ring every flagged puck wears', () => {
    const plain = shadowOf(ringRules.find(r => r.sel === '.puck.boxred')!.body)
    const me = shadowOf(ringRules.find(r => r.sel === '.puck.me.boxred')!.body)
    expect(me).toBe(plain)
  })
  it('the "this is you" dashed ring draws nothing solid behind the dashes, as the plain one does', () => {
    expect(shadowOf(ringRules.find(r => r.sel === '.puck.boxdash')!.body)).toBe('none')
    expect(shadowOf(ringRules.find(r => r.sel === '.puck.me.boxdash')!.body)).toBe('none')
  })
  /* Fable's read (26 Sep 26): the check above looks only at rules that DECLARE a shadow, so a "this is you" ring rule
     that declares none inherits `.puck.me`'s purple GLOW and passes unseen — the dotted ring did exactly that, and so
     did every amber / thin-red / grey flag on his own puck. The shadow that WINS for his flagged puck is asked for:
     the last rule naming `.puck.me.<ring>` must declare one, blur-free ("no flagged puck should glow", the item's own
     words). The purple RING stays where no red ring replaces it; only its blur goes. */
  it('the shadow that wins on a flagged "this is you" puck — every kind of flag — has no blur', () => {
    for (const cls of ['boxred', 'boxdash', 'boxdot', 'warn']) {
      const sel = `.puck.me.${cls}`
      const mine = RULES.filter(r => r.sels.includes(sel) && shadowOf(r.body) != null)
      expect(mine.length, `${sel} declares its own shadow (or it inherits the purple glow)`).toBeGreaterThan(0)
      const win = shadowOf(mine[mine.length - 1]!.body)!
      if (win !== 'none') for (const l of layers(win)) expect(blurOf(l), `${sel} — "${l}"`).toBe(0)
    }
  })
  it('…and a red ring still wins over the purple one: the solid and dashed rules come AFTER the flagged-you rule', () => {
    const at = (sel: string) => RULES.findIndex(r => r.sels.includes(sel) && shadowOf(r.body) != null)
    expect(at('.puck.me.boxred')).toBeGreaterThan(at('.puck.me.warn'))
    expect(at('.puck.me.boxdash')).toBeGreaterThan(at('.puck.me.warn'))
  })
  it('what is NOT a flag keeps its glow: the "you" highlight and the clicked-warning focus', () => {
    const me = RULES.find(r => r.sels.includes('.puck.me'))!
    expect(layers(shadowOf(me.body)!).some(l => blurOf(l) > 0), 'the purple "this is you" glow stays').toBe(true)
    const wf = RULES.find(r => r.sels.includes('.puck.wfoc'))!
    expect(layers(shadowOf(wf.body)!).some(l => blurOf(l) > 0), 'the clicked-warning focus stays lit').toBe(true)
  })
})
