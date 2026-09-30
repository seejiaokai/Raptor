/* [DB-READINESS] phase 6 (d) — the FULL check's walk: a man deleted (Admin → Users → Delete, asked twice) (30 Sep 26).
   The promise: the delete writes HIS records (the person, his account, his requests, the planning calendar, the war) and
   never a week; every WORKING day from his cutoff reads without him wherever a week comes into memory — the week on screen
   (at once), after a reload, a saved week opened later, the next-week peek, the crew-rest look ahead; days before the
   cutoff keep him (D297); an issued version keeps him (D299) — a published day to come reads pending and its four fall
   (D45, D103); the change history lists one line per seat he held on the week on screen (D337); the holder's next change
   to a day saves it without him. The clock is fixed at Wed 15 Jul 26 — Mon 13 and Tue 14 are days he flew.
   Run against this branch (HP_TAG=p6) and the build before phase 6 (HP_TAG=base). */
import { boot, world, fact, saveFacts, alPanel, changesList, TAG } from './p6-lib.mjs'
const { L, W } = await boot()
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const WK = 'weeks/13-07-2026', WK2 = 'weeks/20-07-2026', THU = 3
const onDays = (id) => p.evaluate(i => window.DAYS.map(d => JSON.stringify(d).split(`"${i}"`).length - 1), id)
const weekRowsTouched = a => (a && a.put ? [...a.put, ...a.del].filter(k => k.startsWith('weeks/')) : [])
const heads = async (tag, days = [2, 3, 4]) => { await W.toEdit(L, p); for (const di of days) { await W.showDay(p, di); fact(`${tag}.head${di}`, await W.head(p, di)) } fact(`${tag}.al`, await alPanel(p)) }
const peekText = () => p.evaluate(() => { const e = document.querySelector('#eWeek .peek, .peekwk, [data-peek]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 4000) : null })
const warnsOf = (cs) => p.evaluate(c => [...document.querySelectorAll('#eWeek .day')].map(d => [...d.querySelectorAll('.chk, .checks, .dwarn, .wlist')].map(e => e.innerText).join(' ').split(c).length - 1), cs)
async function del(pid, cs) {
  await L.go(p, 'admin')
  /* a phone opens Admin on its list of sections — Users first, as a person taps it */
  if (!(await p.locator('#accList').isVisible().catch(() => false))) { await p.locator('.adm-cat', { hasText: 'Users' }).first().click().catch(() => {}); await L.sleep(400) }
  await p.waitForSelector('#accList')
  await p.locator(`#accList [data-person="${pid}"] .acc-tap`).click(); await L.sleep(300)
  await p.locator('#accEdDel').click(); await L.sleep(200)
  const armed = (await p.locator('#accEdDel').innerText()).trim()
  await p.locator('#accEdDel').click(); await L.sleep(900)
  return armed
}

/* D1 — the fixture: Thursday 16 Jul published (Hex flies it, Anvil holds a desk); week 2 saved (a note on Mon 20 Jul,
   where Hex flies) — so a saved week to come exists; back to week 1 */
await W.toEdit(L, p); await W.showDay(p, THU)
fact('D1.sign', await W.signDay(p, THU)); fact('D1.pub', await W.publishDay(p, THU))
await p.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(800)
await W.toEdit(L, p); await W.showDay(p, 0)
await T.S(p, 'D1', 'week 2 saved: a note on Mon 20 Jul (Hex flies it)', async () => { await W.weekText(p, 'dn:0.0', 'P6D WEEK TWO NOTE') }, { reload: false })
fact('D1.w2hex', await onDays('rocky'))
await p.evaluate(() => window.loadWeek('13/07/2026')); await L.sleep(800)
fact('D1.hex', await onDays('rocky')); fact('D1.anvil', await onDays('shaft'))
await heads('D1')
fact('D1.peekHasHex', ((await peekText()) || '').includes('Hex'))
fact('D1.warnsHex', await warnsOf('Hex'))
await T.pic(p, 'D1-before')

/* D2 — Delete Hex */
const w2before = await L.rows(p).then(r => Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith(WK2))))
const d2 = await T.S(p, 'D2', 'Admin → Users → Hex → Delete, asked twice', async () => { fact('D2.armed', await del('rocky', 'Hex')) }, { reload: false, page: 'admin' })
fact('D2.weekRowsWritten', weekRowsTouched(d2))
fact('D2.batches', (d2 && d2.batches || []).map(b => b.type))
fact('D2.hex', await onDays('rocky'))
L.check('D2 the week on screen: Hex on Mon and Tue (days he flew), on no day from Wed', (await onDays('rocky')).slice(2).every(n => n === 0) && (await onDays('rocky'))[1] > 0, await onDays('rocky'))
await heads('D2')
fact('D2.list3', await changesList(L, p, THU))
fact('D2.list2', await changesList(L, p, 2))
fact('D2.peekHasHex', ((await peekText()) || '').includes('Hex'))
fact('D2.warnsHex', await warnsOf('Hex'))
fact('D2.issuedThuHasHex', await p.evaluate(() => { const S = window.SCHED; const v = S.cur && S.cur[3]; const snap = (S.orig || {})[3]; return JSON.stringify(snap || v || '').includes('"rocky"') }))
await T.pic(p, 'D2-after-delete-week')
await W.boardOn(p, THU); fact('D2.boardHead', await W.head(p, THU)); await T.pic(p, 'D2-after-delete-board-thu'); await W.boardOff(p)
await L.go(p, 'viewsched'); await L.sleep(500)
fact('D2.viewThuHasHex', await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="3"]'); return d ? d.innerText.includes('Hex') : null }))
await T.pic(p, 'D2-view-only-sched')

/* D3 — a reload: the same */
await L.reloadCompare(p, 'D3 reload after the delete', 'a', { page: 'editsched' })
await W.toastSpy(p)
fact('D3.hex', await onDays('rocky'))
await heads('D3')
fact('D3.peekHasHex', ((await peekText()) || '').includes('Hex'))

/* D4 — week 2 opened: Hex on none of its days; opening it writes nothing; its stored rows were never touched */
const w2after = await L.rows(p).then(r => Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith(WK2))))
fact('D4.w2storedUnchanged', JSON.stringify(w2before) === JSON.stringify(w2after))
const r0 = await L.rows(p)
await p.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(900)
await L.settle(p)
const r1 = await L.rows(p)
fact('D4.loadWrote', L.diff(r0, r1).put.concat(L.diff(r0, r1).del))
fact('D4.w2hex', await onDays('rocky'))
L.check('D4 week 2: Hex on none of its days', (await onDays('rocky')).every(n => n === 0), await onDays('rocky'))
await W.toEdit(L, p); await W.showDay(p, 0); await T.pic(p, 'D4-week2-opened')

/* D5 — back to week 1; the holder's next change to Wednesday saves it without Hex, and only that day */
await p.evaluate(() => window.loadWeek('13/07/2026')); await L.sleep(800)
await W.toEdit(L, p); await W.showDay(p, 2)
const d5 = await T.S(p, 'D5', 'a note on Wednesday (the holder\'s next change to a day to come)', async () => { await W.weekText(p, 'dn:2.0', 'P6D WED NOTE') }, { reload: true })
fact('D5.weekRowsWritten', weekRowsTouched(d5))
fact('D5.wedStoredHasHex', JSON.stringify(await p.evaluate(k => localStorage.getItem('raptor:' + k), WK + '#2')).includes('rocky'))

/* D6 — Delete Anvil (desks Wed / Thu, a sim seat Fri) */
const d6 = await T.S(p, 'D6', 'Admin → Users → Anvil → Delete, asked twice', async () => { fact('D6.armed', await del('shaft', 'Anvil')) }, { reload: true, page: 'admin' })
fact('D6.weekRowsWritten', weekRowsTouched(d6))
fact('D6.anvil', await onDays('shaft'))
await heads('D6')
fact('D6.list3', await changesList(L, p, THU))
await T.pic(p, 'D6-after-second-delete')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
