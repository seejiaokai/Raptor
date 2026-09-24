/* THE SCENARIO for question 6 (25 Sep 26, his ask: "can u explain this with a scenario with mockup") — what a
   mistaken Unpublish does, and the way back. Not a proposal: pictures of the REAL app as it behaves today (the
   production build, the everything-week), every step through the app's own buttons:
     1. Saturday is published at its Original; AL1 puts Wisp on the OPS DESK in Outlaw's place — a weekend desk, so it
        earns him OIL. The edit week and View-only Sched both show AL1.
     2. Unpublish is pressed by mistake; OIL is involved, so it asks "Withdraw — confirm".
     3. After the confirm: View-only Sched is back at the Original (Outlaw on the desk); the working copy still has
        Wisp, marked as waiting, "1 pending", and "Publish AL1" — locked until the four sign again.
     4. The four sign, Publish AL1 is pressed: AL1 is out again, the same label, Wisp back on View-only Sched.
   Usage, with the build served on :4173:  node mk-unpublish.mjs desktop 1  |  node mk-unpublish.mjs phone 3 */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const SIZE = W === 'phone' ? { width: 390, height: 1100 } : { width: 1440, height: 1100 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/unpublish'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, head, signDay, publishAL, go, STATE } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: STATE, dpr: DPR })
const SAT = 5
const show = async (label) => { const h = await head(page, SAT); console.log(label, JSON.stringify({ tag: h.tag, pending: h.pending || '(none)', alpub: h.alpub && (h.alpub.text + (h.alpub.disabled ? ' (locked)' : '')), unpub: h.unpub && h.unpub.text })) }

/* crops: the day head, and the OPS DESK row — on the edit week or on View-only Sched */
async function crop(name, scope, what) {
  const box = await page.evaluate(([scope, what]) => {
    const d = document.querySelector(scope); if (!d) return null
    let el = null
    if (what === 'head') el = d.querySelector('.day-head')
    else {
      el = [...d.querySelectorAll('.pl-row, .ah-row, .sb-arow, .drow, tr')].find(r => {
        const t = (r.querySelector('.ntx, textarea, input') || {}); return ((t.innerText || t.value || '') + '').trim() === 'OPS DESK' })
      if (!el) { const s = d.querySelector('[data-slot="d:5.0.2"]'); el = s && (s.closest('.pl-row, .ah-row, .sb-arow, .drow, tr') || s.parentElement) }
    }
    if (!el) return null
    el.scrollIntoView({ block: 'center', inline: 'center' })
    const r = el.getBoundingClientRect(), dr = d.getBoundingClientRect()
    return { x: dr.left, y: r.top, w: dr.width, h: r.height }
  }, [scope, what])
  if (!box) { console.log('NOTHING FOR', name); return }
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y - 6), width: Math.min(SIZE.width, box.w), height: box.h + 12 } })
  console.log('shot', name)
}
const EDIT = `#eWeek .day[data-day="${SAT}"]`, VIEW = `#vWeek .day[data-day="${SAT}"]`
async function both(n) {
  await editWeek(page); await page.waitForTimeout(300)
  await crop(`${n}-edit-head`, EDIT, 'head'); await crop(`${n}-edit-desk`, EDIT, 'desk')
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  await crop(`${n}-view-desk`, VIEW, 'desk')
  await editWeek(page); await page.waitForTimeout(300)
}

/* 1 — AL1: Wisp onto the OPS DESK */
await editWeek(page)
await page.evaluate(() => { const P = window.PEOPLE; const id = Object.keys(P).find(i => P[i].cs === 'Wisp'); window.setSlotVal('d:5.0.2', id); window.afterSchedMutate() })
await page.waitForTimeout(600)
await signDay(page, SAT)
console.log('publish', JSON.stringify(await publishAL(page, SAT)))
await show('1 AL1   ')
await both(1)
/* 2 — Unpublish by mistake: the first press arms the confirm */
await editWeek(page)
const ub = page.locator(`${EDIT} [data-unpub="${SAT}"]:visible`).first()
await ub.evaluate(e => e.scrollIntoView({ block: 'center' })); await ub.click(); await page.waitForTimeout(600)
await crop('2-edit-head', EDIT, 'head')
console.log('armed  ', (await page.locator(`${EDIT} [data-unpub="${SAT}"]:visible`).first().innerText()).trim())
/* 3 — confirmed */
await page.locator(`${EDIT} [data-unpub="${SAT}"]:visible`).first().click(); await page.waitForTimeout(800)
await show('3 after ')
await both(3)
/* 4 — sign again, Publish AL1 */
await signDay(page, SAT)
console.log('publish', JSON.stringify(await publishAL(page, SAT)))
await show('4 back  ')
await both(4)
console.log('errors', JSON.stringify(errors))
await browser.close()
