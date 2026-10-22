// D1263's walk ([LW-REDO-ONTO-CLOSED], 22 Oct 26) — the phone (390 x 844, touch), member Ranger, the build served on
// http://localhost:4253/ (lwm1-walk-b). A member's Undo or Redo never puts his bid back on a day closed for him since; only
// his Undo of a step he made on the day while it was already closed does. Every bid, Delete, Undo and Redo is a real tap;
// the only thing moved by the developer bridge is the member's "today" (a day that has PASSED is closed for him — D1211),
// because the admin's closing sits on the same timeline above his step in one browser. Written as assertions of the RIGHT
// behaviour: PASS means correct. Pictures: docs/img/handpass/2026-10-22-lw-m1-open-dates/d1263/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { newPhone, signIn, signInPlain, tapSel, T, cellId, vis, gotoMonth, bid, cellText, undo, redo, rec, results, getBrowser, toggleMonths, asMember, asAdmin, closeAny, lve } from './lw-m1-rewalk-b-lib.mjs'
console.log('lw-d1263-walk v1')
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/d1263')
mkdirSync(OUT, { recursive: true })
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') })
const toast = page => page.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [data-testid="toast"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' || ') || null)
const setToday = async (page, iso) => { await page.evaluate(t => window.lwSetMemberToday(t), iso); await page.waitForTimeout(400) }
const allErrs = []
const run = async (id, fn) => {
  const env = await newPhone()
  try { await fn(env) } catch (e) { rec(id, 'ERROR', 'script error: ' + String(e).slice(0, 300)); try { await shot(env.page, `${id}-ERROR`) } catch {} }
  if (env.errs.length) allErrs.push(...env.errs.map(x => id + ' ' + x))
  await env.ctx.close()
}

/* W1 — bid on 20 Feb while open (today 15 Feb); the day passes (today 25 Feb); his Undo takes the bid off (D1225); his
   Redo is refused and the day stays empty */
await run('W1', async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  await gotoMonth(cdp, page, 'FEB')
  const lv0 = await lve(page, 'bane')
  const placed = await bid(cdp, page, 'bane', '2026-02-20', 'LL')
  const c0 = await cellText(page, 'bane', '2026-02-20')
  await shot(page, 'W1-01-bid-20-feb-today-15-feb')
  await setToday(page, '2026-02-25')
  await undo(cdp, page)
  const c1 = await cellText(page, 'bane', '2026-02-20'), t1 = await toast(page)
  await shot(page, 'W1-02-today-25-feb-after-undo')
  await page.waitForTimeout(2500)
  await redo(cdp, page)
  const c2 = await cellText(page, 'bane', '2026-02-20'), t2 = await toast(page), lv2 = await lve(page, 'bane')
  await shot(page, 'W1-03-after-redo-refused')
  rec('W1', placed && c0 === 'LL' && c1 === '' && c2 === '' && lv2 === lv0 ? 'PASS' : 'FAIL',
    `bid 20 Feb (cell "${c0}"); today → 25 Feb; Undo: cell "${c1}" (said "${t1}"); Redo: cell "${c2}" (said "${t2}"); balance ${lv0} → ${lv2}`,
    ['W1-01-bid-20-feb-today-15-feb.png', 'W1-02-today-25-feb-after-undo.png', 'W1-03-after-redo-refused.png'])
})

/* W2 — bid on 23 Feb and delete it while open; the day passes; his Undo of that delete is refused */
await run('W2', async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  await gotoMonth(cdp, page, 'FEB')
  await bid(cdp, page, 'bane', '2026-02-23', 'LL')
  await tapSel(cdp, page, T(cellId('bane', '2026-02-23')))
  await page.waitForSelector(T('bid-clear'), { timeout: 4000 })
  await shot(page, 'W2-01-own-bid-23-feb-window-open-day')
  await tapSel(cdp, page, T('bid-clear')); await page.waitForTimeout(500)
  if (await vis(page, T('bid-picker'))) await closeAny(cdp, page)
  const c0 = await cellText(page, 'bane', '2026-02-23')
  await setToday(page, '2026-02-25')
  await undo(cdp, page)
  const c1 = await cellText(page, 'bane', '2026-02-23'), t1 = await toast(page)
  await shot(page, 'W2-02-today-25-feb-undo-of-open-day-delete-refused')
  rec('W2', c0 === '' && c1 === '' ? 'PASS' : 'FAIL',
    `deleted 23 Feb while open (cell "${c0}"); today → 25 Feb; Undo: cell "${c1}" (said "${t1}")`,
    ['W2-01-own-bid-23-feb-window-open-day.png', 'W2-02-today-25-feb-undo-of-open-day-delete-refused.png'])
})

/* W3 — the exception, by time: bid on 24 Feb; the day passes; he deletes it from the closed note; Undo puts it back; Redo
   takes it again */
await run('W3', async ({ page, cdp }) => {
  await signIn(page, 'member', '2026-02-15')
  await gotoMonth(cdp, page, 'FEB')
  await bid(cdp, page, 'bane', '2026-02-24', 'LL')
  await setToday(page, '2026-02-26')
  await tapSel(cdp, page, T(cellId('bane', '2026-02-24'))); await page.waitForTimeout(400)
  const delOffered = await vis(page, T('closed-delete'))
  await shot(page, 'W3-01-today-26-feb-closed-note-24-feb')
  if (delOffered) { await tapSel(cdp, page, T('closed-delete')); await page.waitForTimeout(600) }
  const c0 = await cellText(page, 'bane', '2026-02-24')
  await undo(cdp, page)
  const c1 = await cellText(page, 'bane', '2026-02-24'), t1 = await toast(page)
  await shot(page, 'W3-02-undo-puts-the-bid-back')
  await page.waitForTimeout(2500)
  await redo(cdp, page)
  const c2 = await cellText(page, 'bane', '2026-02-24')
  await shot(page, 'W3-03-redo-takes-it-again')
  rec('W3', delOffered && c0 === '' && c1 === 'LL' && c2 === '' ? 'PASS' : 'FAIL',
    `closed note's Delete offered ${delOffered}; after Delete "${c0}"; Undo "${c1}" (said "${t1}"); Redo "${c2}"`,
    ['W3-01-today-26-feb-closed-note-24-feb.png', 'W3-02-undo-puts-the-bid-back.png', 'W3-03-redo-takes-it-again.png'])
})

/* W4 — the exception as the earlier walk had it (S3-single): bid on 20 Mar, the admin closes MAR in "Open for bidding", his
   Delete from the closed note, Undo puts it back */
await run('W4', async ({ page, cdp }) => {
  await signInPlain(page, 'member', '2026-02-15')   // saved storage: the admin's sign-in below must still see his bid
  await gotoMonth(cdp, page, 'MAR')
  await bid(cdp, page, 'bane', '2026-03-20', 'LL')
  await asAdmin(page)
  const st = await toggleMonths(cdp, page, ['2026-03'])
  await asMember(page)
  await gotoMonth(cdp, page, 'MAR')
  await tapSel(cdp, page, T(cellId('bane', '2026-03-20'))); await page.waitForTimeout(400)
  const delOffered = await vis(page, T('closed-delete'))
  if (delOffered) { await tapSel(cdp, page, T('closed-delete')); await page.waitForTimeout(600) }
  const c0 = await cellText(page, 'bane', '2026-03-20')
  await undo(cdp, page)
  const c1 = await cellText(page, 'bane', '2026-03-20'), t1 = await toast(page)
  await shot(page, 'W4-01-admin-closed-mar-delete-then-undo')
  rec('W4', st['2026-03'] === 'closed' && delOffered && c0 === '' && c1 === 'LL' ? 'PASS' : 'FAIL',
    `MAR ${JSON.stringify(st)}; closed note's Delete offered ${delOffered}; after Delete "${c0}"; Undo "${c1}" (said "${t1}")`,
    ['W4-01-admin-closed-mar-delete-then-undo.png'])
})

console.log('ERRORS', JSON.stringify(allErrs))
console.log('SUMMARY', JSON.stringify(results.map(r => [r.id, r.verdict])))
await (await getBrowser()).close()
