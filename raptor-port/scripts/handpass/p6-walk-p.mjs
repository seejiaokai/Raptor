/* [DB-READINESS] phase 6 (d) — the FULL check's walk, part 2 (30 Sep 26; Astra's scenarios 1, 5, 7, 8):
   - the delete run by the Leave War's posting pass on its date (a posting out with the "Delete" chip, dated today) — a
     delete that runs INSIDE another command (the plan's §9 "found on the way");
   - a week never saved (week 2 untouched): the next-week peek and the week opened read him gone, and no row is made;
   - Undo after the delete: an earlier edit to a day to come never brings him back;
   - a published version loaded back onto the working copy after the delete leaves him out (the load belt).
   Fixed clock Wed 15 Jul 26. The man: Anvil (desks Wed/Thu, a sim seat Fri; next week: a desk Wed, a sim seat Fri).
   Run against this branch (HP_TAG=p6) and the build before phase 6 (HP_TAG=base). */
import { boot, world, fact, saveFacts, alPanel, changesList, TAG } from './p6-lib.mjs'
const { L, W } = await boot()
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, HIM = 'shaft', CS = 'Anvil'
const onDays = () => p.evaluate(i => window.DAYS.map(d => JSON.stringify(d).split(`"${i}"`).length - 1), HIM)
const weekRows = a => (a && a.put ? [...a.put, ...a.del].filter(k => k.startsWith('weeks/')) : [])
const peekHas = () => p.evaluate(c => { const e = document.querySelector('#eWeek .peek, .peekwk, [data-peek]'); return e ? e.innerText.includes(c) : null }, CS)

/* P1 — the fixture: Thursday published (Anvil's desk on it); an edit to Thursday's working copy made BEFORE the delete
   (a note) — the Undo test; week 2 never touched */
await W.toEdit(L, p); await W.showDay(p, THU)
fact('P1.sign', await W.signDay(p, THU)); fact('P1.pub', await W.publishDay(p, THU))
await T.S(p, 'P1', 'a note on Friday (an edit to a day to come, before the delete)', async () => { await W.showDay(p, 4); await W.weekText(p, 'dn:4.0', 'P6P EARLIER EDIT') }, { reload: false })
fact('P1.him', await onDays())
fact('P1.peekHas', await peekHas())
const r0 = await L.rows(p)
fact('P1.week2Rows', Object.keys(r0).filter(k => k.startsWith('weeks/20-07-2026')))

/* P2 — the posting out from the Leave War: Anvil's cell → Post out → dated today, "Delete" → confirm twice */
await L.go(p, 'leavewar')
await p.waitForSelector('[data-testid^="row-"]', { timeout: 10000 })
if (await p.locator('[data-testid="month-JUL"]').count()) { await p.locator('[data-testid="month-JUL"]').click(); await L.sleep(800) }
const p2 = await T.S(p, 'P2', 'Leave War: Anvil posted out today with "Delete" (the posting pass runs on its date)', async () => {
  const cell = p.locator(`[data-testid="cell-${HIM}-2026-07-15"]`).first()
  fact('P2.cell', await cell.count())
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await L.sleep(400)
  await p.click('[data-testid="bid-postout"]'); await L.sleep(300)
  await p.fill('[data-testid="po-date"]', '2026-07-15'); await p.click('[data-testid="po-delete"]'); await L.sleep(150)
  await p.click('[data-testid="po-confirm"]'); await L.sleep(250)
  if (await p.locator('[data-testid="po-confirm"]:visible').count()) { await p.click('[data-testid="po-confirm"]'); await L.sleep(700) }
  await L.go(p, 'editsched'); await L.sleep(600)
}, { reload: false, page: 'leavewar' })
fact('P2.deleted', await p.evaluate(i => !!(window.PEOPLE[i] && window.PEOPLE[i].deleted), HIM))
fact('P2.batches', (p2 && p2.batches || []).map(b => b.type))
fact('P2.weekRows', weekRows(p2))
fact('P2.him', await onDays())
L.check('P2 the posting pass deleted him: off every day from Wed, on Mon (a day he flew)', (await onDays()).slice(2).every(n => n === 0), await onDays())
await W.toEdit(L, p); await W.showDay(p, THU)
fact('P2.head3', await W.head(p, THU)); fact('P2.al', await alPanel(p))
fact('P2.peekHas', await peekHas())
await T.pic(p, 'P2-after-posting-delete')

/* P3 — Undo: the note on Friday (made before the delete) — whatever the app does, Anvil does not come back */
fact('P3.undo', await W.door(p, 'top', 'undo'))
fact('P3.him', await onDays())
L.check('P3 after Undo: Anvil is on no day to come', (await onDays()).slice(2).every(n => n === 0), await onDays())
fact('P3.redo', await W.door(p, 'top', 'redo'))
fact('P3.himRedo', await onDays())

/* P4 — week 2, never saved: opened, Anvil on none of its days, and opening it made no row */
const r1 = await L.rows(p)
await p.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(900); await L.settle(p)
const r2 = await L.rows(p)
fact('P4.loadWrote', L.diff(r1, r2).put.concat(L.diff(r1, r2).del))
fact('P4.him', await onDays())
L.check('P4 week 2 (never saved): Anvil on none of its days', (await onDays()).every(n => n === 0), await onDays())
await W.toEdit(L, p); await W.showDay(p, 2); await T.pic(p, 'P4-week2-never-saved')
await p.evaluate(() => window.loadWeek('13/07/2026')); await L.sleep(800)

/* P5 — reload: the same */
await L.reloadCompare(p, 'P5 reload', 'a', { page: 'editsched' })
fact('P5.him', await onDays())
await W.showDay(p, THU); fact('P5.head3', await W.head(p, THU))

/* P6 — Thursday's ORIG (which holds him) loaded back onto the working copy: the load leaves him out */
await W.toEdit(L, p); await W.showDay(p, THU)
const menu = p.locator(`#eWeek [data-planmenu="${THU}"]:visible`).first()
fact('P6.menu', await menu.count())
if (await menu.count()) {
  await menu.click(); await L.sleep(500)
  const items = await p.evaluate(() => [...document.querySelectorAll('button.wm')].filter(e => e.offsetParent).map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), d: Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(' ') })))
  fact('P6.items', items)
  const orig = p.locator('button[data-planpv]:visible').filter({ hasText: /Original/ }).first()
  if (await orig.count()) { await orig.click(); await L.sleep(700) }
  const load = p.locator(`#eWeek [data-restore="${THU}"]:visible`).first()
  fact('P6.loadBtn', await load.count() ? (await load.innerText()).trim() : null)
  if (await load.count()) {
    const p6 = await T.S(p, 'P6', 'Thursday: its issued ORIG loaded onto the working copy after the delete', async () => {
      await load.click(); await L.sleep(500)
      const again = p.locator(`#eWeek [data-restore="${THU}"]:visible`).first()
      if (await again.count() && /confirm/i.test(await again.innerText())) { await again.click(); await L.sleep(700) }
    }, { reload: true })
    fact('P6.him', await onDays())
    L.check('P6 the load left Anvil out of Thursday', (await onDays())[THU] === 0, await onDays())
    fact('P6.toasts', await W.toasts(p))
    fact('P6.head3', await W.head(p, THU))
    await T.pic(p, 'P6-orig-loaded')
  }
}

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
