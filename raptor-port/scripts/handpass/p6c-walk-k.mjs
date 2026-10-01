/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk K: a DEAD kept row beside the request's real row (1 Oct 26).
   Astra's scenario design §2 items 2, 3 and 10 (docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-check-scenarios-
   astra.md): a published day's version loaded back after its request moved away leaves that version's row there, kept
   (D363) — a DEAD row once the request stands on another day. It is not the request's row: a tap on the request's line
   in the changes window goes to its real row; a retype to a leave takes the real row and says so; a load of the real
   day's issue puts its issued filing back (D98). Run against this branch (HP_TAG=p6c) and the build before (c)
   (HP_TAG=base — which has no kept rows, so its facts show the old behaviour, not the same setup). */
import { boot, world, fact, saveFacts, fileTimed, dropLanded, accBtn, TAG } from './p6-lib.mjs'
import { rowsOf, noRid, reqOf } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const WED = 2, THU = 3, RANGER = 'bane'
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const loadIssued = async (di) => {
  await W.toEdit(L, p); await W.showDay(p, di)
  const ver = await p.evaluate(d => window.dayCurVer(d), di)
  const menu = p.locator(`#eWeek [data-planmenu="${di}"]:visible`).first()
  if (!(await menu.count())) return 'no plan selector'
  await menu.click(); await L.sleep(400)
  const pv = p.locator(`[data-planpv="${ver}"]:visible`).first()
  if (!(await pv.count())) return 'no issued version'
  await pv.click(); await L.sleep(500)
  const said = []
  for (let i = 0; i < 2; i++) { const b = p.locator(`[data-restore="${di}"]:visible`).first(); if (!(await b.count())) break; said.push((await b.innerText()).trim()); await b.click(); await L.sleep(700) }
  return said
}
const setType = async (iid, t) => { if (!(await W2.openEdit(p, iid))) return 'no editor'; await p.locator('#inBody tr.ined [data-ed="type"]').selectOption(t); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
  for (let i = 0; i < 3; i++) { const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await L.sleep(500); continue } break }
  return 'saved' }

/* K1 — the dead row made through the app: a meeting on Wednesday, Wednesday published, the meeting moved to next week,
   Wednesday's issue loaded back (its row returns, kept), the meeting moved to Thursday (it lands there) */
let iid = null
await T.S(p, 'K1', 'a meeting for Ranger on Wednesday; Wednesday published; moved to Wed 22 Jul; Wednesday\'s issue loaded back; moved to Thursday', async () => {
  iid = await fileTimed(L, p, { person: RANGER, type: 'Meeting', iso: '2026-07-15', from: '10:00', to: '11:00', remarks: 'P6C KEPT' })
  await W.toEdit(L, p); await W.showDay(p, WED)
  fact('K1.sign', await W.signDay(p, WED)); fact('K1.pub', await W.publishDay(p, WED))
  fact('K1.away', await W2.redate(p, iid, '2026-07-22', '2026-07-22'))
  fact('K1.load', await loadIssued(WED))
  fact('K1.back', await W2.redate(p, iid, '2026-07-16', '2026-07-16'))
}, { reload: true })
const r1 = await rowFacts('K1', iid)
fact('K1.toasts', await W.toasts(p))
await W.toEdit(L, p); await W.showDay(p, WED); await T.pic(p, 'K1-dead-wed-live-thu')

/* K2 — the changes window, opened from Wednesday's count: the request's line goes to Thursday's real row */
await W.toEdit(L, p); await W.showDay(p, WED)
const c = p.locator(`#eWeek .day[data-day="${WED}"] .dpend`).first()
if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600) }
const all = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first()
if (await all.count()) { await all.click(); await L.sleep(300) }
const line = p.locator('.chgwin:not([hidden]) button.cw-l', { hasText: /P6C KEPT|Meeting/ }).first()
fact('K2.lines', await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? [...w.querySelectorAll('.cw-l')].map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 12) : null }))
let landed = null
if (await line.count()) {
  await line.click(); await L.sleep(150)
  landed = await p.evaluate(() => { const e = document.querySelector('.chgflash'); if (!e) return null; const d = e.closest('.day[data-day]'); return { day: d ? +d.dataset.day : null, text: (e.innerText || e.value || '').slice(0, 80) } })
  await T.pic(p, 'K2-changes-jump')
}
fact('K2.landed', landed)
L.check('K2 the request\'s line goes to Thursday — its real row — never Wednesday\'s dead row', !!landed && landed.day === THU, landed)
const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) }

/* K3 — Thursday: ✕ (taken off), published; → Unavail; Thursday's issue loaded back: "taken off" again (D98) */
await T.S(p, 'K3', 'Thursday: ✕ on its row, Thursday published, then → Unavail on its card', async () => {
  fact('K3.x', await dropLanded(L, p, THU, iid))
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, THU)
  fact('K3.sign', await W.signDay(p, THU)); fact('K3.pub', await W.publishDay(p, THU))
  fact('K3.unavail', await accBtn(L, p, THU, iid, 'u'))
  await W.boardOff(p)
}, { reload: false })
fact('K3.acc', (await reqOf(p, iid))?.acc)
await T.S(p, 'K3b', 'Thursday\'s issue loaded back onto the working copy', async () => { fact('K3b.load', await loadIssued(THU)) }, { reload: true })
fact('K3b.toasts', await W.toasts(p))
const a3 = (await reqOf(p, iid))?.acc; fact('K3b.acc', a3)
L.check('K3b the issued filing is back — taken off (D98); the dead Wednesday row did not stop it', a3 === 'r', a3)
await rowFacts('K3b', iid)

/* K4 — Accept it back on Thursday, then retype it to a leave: the Thursday row goes, and the app says so */
await T.S(p, 'K4', 'Thursday: Accept on its card', async () => { fact('K4.acc', await accBtn(L, p, THU, iid, 'g')); await W.boardOff(p) }, { reload: false })
await rowFacts('K4', iid)
const k5 = await L.step(p, 'K5 the meeting retyped to Local leave', async () => fact('K5.save', await setType(iid, 'LL')))
const t5 = await W.toasts(p); fact('K5.toasts', t5)
const r5 = await rowFacts('K5', iid)
L.check('K5 Thursday\'s row is gone, Wednesday\'s dead row stays', !r5.some(r => r.di === THU) && r5.some(r => r.di === WED && r.kept), r5)
L.check('K5 the app says the row has been removed — once', t5.filter(m => /does not go on the Ground Programme — its row has been removed/.test(m)).length === 1, t5)
await L.reloadCompare(p, 'K5 reload', 'a', { page: 'editsched' })

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
