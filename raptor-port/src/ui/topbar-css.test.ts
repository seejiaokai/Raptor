// @vitest-environment node — reads a stylesheet off disk (the lift-css.test.ts shape)
/* THE TOP BAR'S TWO CLASSES ([UNDO-TOPBAR], owner D347–D349, 28 Sep 26 — the plan's §11.10, Fable's red team 5). The bar
   carried ONE class, `.editing`, for two jobs: Edit Schedule's blue tint (owner, 22 Aug 26) and the phone's "the Sync
   pill drops to its dot while the Undo pair is on the bar". The pair shows on every page where a change is made now, so
   renaming `.editing` would either tint Quals and Admin blue or un-tint Edit Schedule. The jobs split: `.editing` keeps
   the tint and only the tint; `.has-undo` carries the Sync-dot rule. jsdom paints nothing, so the stylesheet is read. */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

describe('the top bar: Edit Schedule’s tint and the phone’s sync dot are two classes', () => {
  it('.topbar.editing re-defines the tint — and nothing about the Sync pill', () => {
    expect(css).toMatch(/\.topbar\.editing\{[^}]*--topbar-a:#15384c/)
    expect(css).not.toMatch(/\.topbar\.editing \.fastsync/)
  })
  it('.topbar.has-undo drops the Sync label to its dot (a phone rule), and tints nothing', () => {
    expect(css).toMatch(/\.topbar\.has-undo \.fastsync \.synclbl\{display:none\}/)
    expect(css).not.toMatch(/\.topbar\.has-undo\{[^}]*--topbar-a/)
  })
  it('on a phone the pair keeps the desktop’s order — no `order` pins it last (D348)', () => {
    const rule = css.match(/\.tb-hist\{[^}]*\}/g) || []
    expect(rule.length).toBeGreaterThan(0)
    for (const r of rule) expect(r).not.toMatch(/order:/)
  })
})
