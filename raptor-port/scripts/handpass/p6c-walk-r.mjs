/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk R: the published record and the history around a request's row
   (1 Oct 26). Astra's scenario design §2 items 9, 14 and 20: an AL1 published then withdrawn (Unpublish), then the
   member edits his request — the working copy follows, the issued faces do not (D177 / D178), one pending, the four
   fallen (D103); the change history tells the edit as ONE request story, no line per re-made cell; a request handed from
   Bolt to Ridge, then Bolt deleted (Admin → Users) — Ridge's row stays. Run against this branch (HP_TAG=p6c) and the
   build before (c) (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileTimed, handOver, changesList, TAG } from './p6-lib.mjs'
import { rowsOf, noRid, reqOf, weekRows, IS_C, switchTo } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, FRI = 4, RANGER = 'bane', BOLT = 'yeti', RIDGE = 'razer'
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const faceText = () => p.evaluate(d => { const e = document.querySelector(`#vWeek .day[data-day="${d}"]`); return e ? e.innerText.replace(/\s+/g, ' ') : null }, THU)

/* R1 — a meeting for Ranger on Thursday; Thursday published; a day note typed and AL1 published; AL1 withdrawn */
let iid = null
await T.S(p, 'R1', 'Thursday: Ranger\'s meeting, published; a note, AL1 published; then Unpublish', async () => {
  iid = await fileTimed(L, p, { person: RANGER, type: 'Meeting', iso: '2026-07-16', from: '10:00', to: '11:00', remarks: 'P6C RECORD' })
  await W.toEdit(L, p); await W.showDay(p, THU)
  fact('R1.sign', await W.signDay(p, THU)); fact('R1.pub', await W.publishDay(p, THU))
  await W.weekText(p, `dn:${THU}.0`, 'P6C AL1 NOTE')
  fact('R1.sign2', await W.signDay(p, THU)); fact('R1.al1', await W.publishAL(p, THU))
  fact('R1.unpub', await W.unpublish(p, THU))
}, { reload: true })
fact('R1.head', await W.head(p, THU))

/* R2 — Ranger moves his meeting to 10:30: the working copy follows, one more pending, the issued faces keep 10:00 */
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
const r2 = await L.step(p, 'R2 Ranger moves his meeting to 10:30', async () => {
  if (!(await W2.openEdit(p, iid))) return fact('R2.save', 'no editor')
  await p.locator('#inBody tr.ined [data-ed="stime"]').fill('10:30'); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
  fact('R2.save', 'saved')
})
fact('R2.weekRowsWritten', weekRows(r2))
if (IS_C) L.check('R2 his edit wrote no week row', !weekRows(r2).length, weekRows(r2))
const rr2 = await rowFacts('R2', iid)
L.check('R2 the working copy\'s row reads 10:30', rr2.length === 1 && rr2[0].str === '10:30', rr2)
await L.go(p, 'viewsched')
const face = await faceText(); fact('R2.faceHas1030', /10:30/.test(face || '')); fact('R2.faceHasMeeting', /P6C RECORD/.test(face || ''))
await T.pic(p, 'R2-member-viewonly-face')

/* R3 — Saber: the day head, the pending list, and the change history's lines about the meeting */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
await W.toEdit(L, p); await W.showDay(p, THU)
const h3 = await W.head(p, THU); fact('R3.head', h3)
L.check('R3 Thursday reads pending and the four have fallen (D103)', /pending/.test(h3.pending) && W.signsEmpty(h3), h3)
fact('R3.list', await changesList(L, p, THU))
/* the whole history, grouped by item: every line about the meeting */
const c = p.locator(`#eWeek .day[data-day="${THU}"] .dpend`).first()
if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600) }
const all = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first()
if (await all.count()) { await all.click(); await L.sleep(300) }
const hist = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? [...w.querySelectorAll('.cw-l')].map(e => e.innerText.replace(/\s+/g, ' ')).filter(t => /Meeting|P6C RECORD|Ranger/.test(t)).slice(0, 20) : null })
fact('R3.historyLines', hist)
await T.pic(p, 'R3-history')
const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) }

/* R4 — a meeting for Bolt on Friday, Ridge on its row too is not needed: handed from Bolt to Ridge, then Bolt deleted */
let iid2 = null
await T.S(p, 'R4', 'a meeting for Bolt on Friday, handed to Ridge', async () => {
  iid2 = await fileTimed(L, p, { person: BOLT, type: 'Meeting', iso: '2026-07-17', from: '09:00', to: '10:00', remarks: 'P6C HANDED' })
  fact('R4.hand', await handOver(L, p, iid2, RIDGE))
}, { reload: false, page: 'inputs' })
await rowFacts('R4', iid2)
const r5 = await T.S(p, 'R5', 'Admin → Users → Bolt → Delete, asked twice', async () => {
  await L.go(p, 'admin')
  if (!(await p.locator('#accList').isVisible().catch(() => false))) { await p.locator('.adm-cat', { hasText: 'Users' }).first().click().catch(() => {}); await L.sleep(400) }
  await p.waitForSelector('#accList')
  await p.locator(`#accList [data-person="${BOLT}"] .acc-tap`).click(); await L.sleep(300)
  await p.locator('#accEdDel').click(); await L.sleep(200)
  fact('R5.armed', (await p.locator('#accEdDel').innerText()).trim())
  await p.locator('#accEdDel').click(); await L.sleep(900)
}, { reload: true, page: 'admin' })
fact('R5.weekRowsWritten', weekRows(r5))
const rr5 = await rowFacts('R5', iid2)
L.check('R5 Ridge\'s meeting stays on Friday after Bolt is deleted', rr5.length === 1 && rr5[0].who === RIDGE && rr5[0].di === FRI, rr5)

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
