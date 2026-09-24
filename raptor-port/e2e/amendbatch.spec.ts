/* THE AMENDMENT BATCH'S GEOMETRY (25 Sep 26, D112) — what only a real browser can read back.

   A CHANGED PUCK GETS A TAG, NEVER A RING (owner, D92 + D93, AM19). The AL-coloured ring round a published puck, and
   the dotted outline round a waiting one, sat on the very edge the warning rings use — measured on 24 Sep 26, the
   published ring out-ranked the thin amber, grey and red rings and hid them. The contract now: a puck's edge is
   EXACTLY what it would be with no amendment mark at all; the amendment is a tag in the seat's corner (solid once
   out, hollow and dotted while waiting). So this compares every changed puck's computed ring (box-shadow, outline)
   with the same puck's ring once the seat's amendment attributes are taken off — they must be identical — on the
   edit week and the board, a published change and a waiting one alike. jsdom paints nothing, so it lives here. */
import { test, expect, type Page } from '@playwright/test'
import { login, go } from './app'

const RING = (el: Element) => { const s = getComputedStyle(el); return [s.boxShadow, s.outlineStyle, s.outlineWidth, s.outlineColor, s.outlineOffset].join(' | ') }

async function amendMonday(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    const sign = () => { const g = w.signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
    sign(); w.setDayApproved(0, true)
    const seats = [...document.querySelectorAll('#eWeek .day[data-day="0"] .seat[data-slot]')]
      .map(e => (e as HTMLElement).dataset.slot!).filter(k => /^\d+\.\d+\.\d+\.\d+\.p$/.test(k) && w.slotVal(k))
    const other = (k: string) => ['bane', 'stiff', 'pump', 'ignite', 'wolf'].find(p => p !== w.slotVal(k))
    /* two published changes (AL1), then two changes waiting (AL2) */
    w.setSlotVal(seats[0], other(seats[0])); w.setSlotVal(seats[1], other(seats[1])); w.afterSchedMutate()
    sign(); w.publishALDay(0)
    w.setSlotVal(seats[2], other(seats[2])); w.setSlotVal(seats[3], other(seats[3])); w.afterSchedMutate()
  })
  await page.waitForTimeout(500)
}

/* every changed seat in `root`: its puck's ring with the mark on, and with the mark's attributes lifted off */
async function rings(page: Page, root: string) {
  return page.evaluate(({ root, RINGsrc }) => {
    const RING = new Function('el', `return (${RINGsrc})(el)`) as (el: Element) => string
    return [...document.querySelectorAll(`${root} .seat[data-alc], ${root} .seat[data-aln]`)].map(seat => {
      const pk = seat.querySelector('.puck')!, attrs = ['data-alc', 'data-aln', 'data-alp'].map(a => [a, seat.getAttribute(a)] as const)
      const tag = getComputedStyle(seat, '::after').content
      const on = RING(pk)
      attrs.forEach(([a, v]) => { if (v != null) seat.removeAttribute(a) })
      const off = RING(pk)
      attrs.forEach(([a, v]) => { if (v != null) seat.setAttribute(a, v) })
      return { slot: (seat as HTMLElement).dataset.slot, kind: attrs[0][1] != null ? 'published' : 'waiting', tag, on, off }
    })
  }, { root, RINGsrc: RING.toString() })
}

for (const vp of [{ label: 'desktop', width: 1440, height: 900 }, { label: 'phone', width: 390, height: 844 }]) {
  test(`${vp.label}: a changed puck wears its ALn tag and its edge is untouched — week and board (D92, D93, AM19)`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await login(page)
    await go(page, 'editsched')
    await amendMonday(page)
    for (const [where, root] of [['the edit week', '#eWeek'], ['the board', '#schedBoard']] as const) {
      if (root === '#schedBoard') { await page.evaluate(() => (window as any).openScheduler(0)); await page.waitForTimeout(700) }
      const r = await rings(page, root)
      expect(r.filter(x => x.kind === 'published').length, `${where}: published changes are marked`).toBeGreaterThan(0)
      expect(r.filter(x => x.kind === 'waiting').length, `${where}: waiting changes are marked`).toBeGreaterThan(0)
      for (const x of r) {
        expect(x.on, `${where} ${x.slot} (${x.kind}): the mark adds nothing to the puck's edge`).toBe(x.off)
        expect(x.tag, `${where} ${x.slot} (${x.kind}): the ALn tag in the seat's corner`).toMatch(/AL/)
      }
    }
  })
}
