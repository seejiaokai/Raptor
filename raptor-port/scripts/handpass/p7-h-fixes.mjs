/* [DB-READINESS] phase 7 — the HOST's re-walk of what the two final reads' fixes touched (1 Oct 26).
   F1 (Fable): the scheduler's man in a request row's NAME BOX survives the member's own edit of his request — on an
       unpublished Saturday and on a published one (where only the member's change may read pending) — and still earns;
       the same for a placeholder in the box.
   F3 (Fable): on a published day, a request row's crowd change not caused by an input reads "<ROW> · who it stands for" in
       the changes window and a tap goes to the row.
   Each fixture through the app's own controls. Env: HP_URL, HP_SHOTS, HP_OUT. */
import { boot, world, fact, saveFacts, fileTimed, oilButton, oilPucks, changesList } from './p6-lib.mjs'
import * as A from './p7-a-lib.mjs'
import { lwCell } from './lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const SAT = 5, TUE = 1

/* ---------- F1, a named man ---------- */
{
  const { browser, p, errors } = await world(L)
  const BLADE = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Blade'))
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Training', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'P7 F1' })
  await W.boardOn(p, SAT)
  let ri = await A.rowIdx(p, SAT, iid)
  await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first(), p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first())
  await L.settle(p)
  fact('F1.box.afterDrag', (await A.rowOf(p, SAT, iid))?.who)
  await W.boardOff(p)
  /* the member's own edit: his remarks, on the Inputs page */
  fact('F1.edit1', await W2.editRemarks(p, iid, 'bring the checklist'))
  await L.settle(p)
  const r1 = await A.rowOf(p, SAT, iid)
  fact('F1.row.afterEdit', { who: r1?.who, rmks: r1?.rmks })
  L.check('F1 unpublished: after the member edits his remarks the scheduler\'s man is still in the name box', r1?.who === BLADE && r1?.rmks === 'bring the checklist', r1)
  await W.boardOn(p, SAT)
  await oilButton(L, p)
  const pk1 = (await oilPucks(p)).filter(x => x.item === 'i:' + iid)
  fact('F1.oil.afterEdit', pk1)
  L.check('F1 unpublished: in OIL Earn he still earns from the row', pk1.some(x => x.who === BLADE && x.on), pk1)
  await L.shot(p, 'H-F1-1-unpublished-after-member-edit')
  await oilButton(L, p)
  /* publish, then the member edits again */
  fact('F1.sign', await W.signDay(p, SAT)); fact('F1.pub', await W.publishDay(p, SAT))
  await L.settle(p)
  await W.boardOff(p)
  fact('F1.edit2', await W2.editRemarks(p, iid, 'bring the checklist and a pen'))
  await L.settle(p)
  const r2 = await A.rowOf(p, SAT, iid)
  L.check('F1 published: the man is still in the box on the working copy', r2?.who === BLADE, r2)
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const ch = await changesList(L, p, SAT)
  fact('F1.published.pending', ch)
  const lines = (ch && ch.lines) || []
  L.check('F1 published: what reads pending is the member\'s change — no line takes Blade off the row', !lines.some(l => /Blade/.test(l) && /→|removed|off/.test(l)), lines)
  await L.shot(p, 'H-F1-2-published-after-member-edit')
  const lw = await lwCell(p, [A.RANGER, BLADE], '2026-07-18')
  fact('F1.leavewar', lw)
  L.check('F1 published: the Leave War still credits both men', /FO|HO/.test(JSON.stringify(lw.Blade)) && /FO|HO/.test(JSON.stringify(lw.Ranger)), lw)
  await L.shot(p, 'H-F1-3-leavewar')
  await L.reloadCompare(p, 'F1', 'a', { page: 'editsched' })
  fact('F1.errors', errors)
  await browser.close()
}

/* ---------- F1, a placeholder in the box ---------- */
{
  const { browser, p, errors } = await world(L)
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Training', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'P7 F1b' })
  await W.boardOn(p, SAT)
  const ri = await A.rowIdx(p, SAT, iid)
  await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="allavail"]:visible`).first(), p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first())
  await L.settle(p)
  const before = await A.chips(p, '#schedBoard', iid)
  fact('F1b.chip.before', before)
  await W.boardOff(p)
  fact('F1b.edit', await W2.editRemarks(p, iid, 'bring the checklist'))
  await L.settle(p)
  const r = await A.rowOf(p, SAT, iid)
  L.check('F1b: the placeholder is still in the name box after the member\'s edit', r?.who === 'allavail', r)
  await W.boardOn(p, SAT)
  const after = await A.chips(p, '#schedBoard', iid)
  fact('F1b.chip.after', after)
  L.check('F1b: and it still wears its count', after.length > 0 && before.length > 0 && after[0].txt === before[0].txt, { before, after })
  await L.shot(p, 'H-F1b-placeholder-after-member-edit')
  fact('F1b.errors', errors)
  await browser.close()
}

/* ---------- F3: the changes window's line for a request row's crowd change ---------- */
{
  const { browser, p, errors } = await world(L)
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: '2026-07-14', from: '10:00', to: '11:00', remarks: 'P7 F3' })
  await W.boardOn(p, TUE)
  const ri = await A.rowIdx(p, TUE, iid)
  const S = await import('./seat-lib.mjs')
  fact('F3.put', await S.handPut(p, `g:1.${ri}.+`, 'allavail'))
  await L.settle(p)
  fact('F3.sign', await W.signDay(p, TUE)); fact('F3.pub', await W.publishDay(p, TUE))
  await L.settle(p)
  /* a change that is NOT an input: take a man off a flying line that overlaps 10:00–11:00, so he joins the crowd */
  const seat = await p.evaluate(() => {
    const d = window.DAYS[1]
    for (const [gi, w] of (d.waves || []).entries()) for (const [li, f] of (w.formations || []).entries()) {
      const to = String(f.to || '').replace(':', ''), ld = String(f.ld || '').replace(':', '')
      if (!to || !ld || f.cx) continue
      if (+to < 1100 && +ld > 1000) for (const [ai, ac] of (f.aircraft || []).entries()) if (ac.p && window.PEOPLE[ac.p]) return { key: `1.${gi}.${li}.${ai}.p`, who: ac.p, cs: window.PEOPLE[ac.p].cs, line: f.cs, to: f.to, ld: f.ld }
    }
    return null
  })
  fact('F3.seat', seat)
  if (seat) {
    const pk = p.locator(`#schedBoard [data-slot="${seat.key}"] .puck:visible`).first()
    await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    await pk.click({ button: 'right' }); await L.sleep(700)
    await L.settle(p)
  }
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, TUE)
  const ch = await changesList(L, p, TUE)
  fact('F3.pending', ch)
  const lines = (ch && ch.lines) || []
  L.check('F3: the request row\'s crowd change is named by its row', lines.some(l => /PERSONAL · who it stands for/.test(l)), lines)
  L.check('F3: and never "A placeholder"', !lines.some(l => /A placeholder/.test(l)), lines)
  /* the line can be tapped: open the window again and tap it */
  const c = p.locator(`#eWeek .day[data-day="${TUE}"] .dpend`).first()
  if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600) }
  const out = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
  if (await out.count()) { await out.click(); await L.sleep(300) }
  const line = p.locator('.chgwin:not([hidden]) button', { hasText: 'who it stands for' }).first()
  const tappable = await line.count()
  if (tappable) { await line.click(); await L.sleep(300) }
  const flash = await p.evaluate(() => { const e = document.querySelector('.chgflash'); return e ? (e.closest('.day[data-day]') || {}).dataset?.day ?? 'flashed' : null })
  fact('F3.tap', { tappable, flash })
  L.check('F3: the line is a button, and a tap takes the schedule to the row', !!tappable && flash != null, { tappable, flash })
  await L.shot(p, 'H-F3-changes-window')
  fact('F3.errors', errors)
  await browser.close()
}
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
const bad = L.save({})
process.exit(0)
