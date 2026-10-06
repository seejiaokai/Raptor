/* [BLANK-TIMES-ABSENCE] (D605) — the HOST's additions after the two code reads (Sol 6.1's absences against the
   roll-call): three readers nobody had walked. Every step asserts the RIGHT behaviour (a PASS means correct).
     H6 — the ALL AVAIL window as a reader of the new warning. Walker C found a man with a whole-day leave or course
          is not in the crowd at all; Sol: a whole-day ATT B man IS (grounded, not absent — he may do ground work), so
          seated on a blank flying line he must show in the window flagged, with the downchit sentence.
     H7 — a seat-to-seat drag between the two MAIN rows of ONE SC shift (the crew-rest question must not invent a second
          breach for a man who already has it, and must not lose it).
     H8 — the day-details window ("i" on the day's head): its issue lines carry the new warning.
     H9 — a Ground Programme item really named "Sim" and another named "duty" keep their names (Sol's F2).
   Env: HP_URL, HP_SHOTS, HP_OUT. Usage: node scripts/handpass/bta-host2.mjs [h6|h7|h8|h9|all] */
import * as X from './bta-C-lib.mjs'
const { B, L, W, K, ID, CSN, SEAT, MON, TUE, R, pic, picEl, sleep } = X
const which = process.argv[2] || 'all'

const win = p => p.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])')
  if (!w) return { open: false }
  return { open: true, title: (w.querySelector('.win-ttl')?.innerText || '').replace(/\s+/g, ' ').trim(),
    foot: (w.querySelector('.win-foot')?.textContent || '').replace(/\s+/g, ' ').trim(),
    text: (w.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 400),
    rows: [...w.querySelectorAll('.rpuck')].map(x => ({ id: x.dataset.awp, flag: x.classList.contains('clash') ? 'RED' : x.classList.contains('flagged') ? 'AMBER' : '', cls: String(x.className), why: (x.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200) })) }
})

async function h6() {
  const { browser, p, errors } = await K.fresh()
  try {
    const f = await X.fileInput(p, { type: 'ATT B', di: TUE, allday: true, remarks: 'Grounded' })
    const m = await K.addFlyWave(p, TUE)
    const s = await K.seat(p, TUE, m.gi, 0, 0, SEAT, ID)
    const mine = (await X.fullWarnsX(p, TUE)).filter(w => /Downchit|leave|clash|tasked/i.test(w.msg)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
    R('H6.0', `${CSN}: ATT B all Tuesday (asked ${f.asked.join(',') || 'nothing'}); "+ Wave", seated on its blank line (took ${s.took})`, `his warnings: ${JSON.stringify(mine)}`,
      mine.some(t => /Downchit but planned to fly this line/.test(t)) ? 'PASS' : 'FAIL', [await pic(p, 'h6-0-seated')])
    const g = await X.groundRow(p, TUE, 'LATER BRIEF', '15:00', '16:00', false)
    const rid = await p.evaluate(([i, r]) => (window.DAYS[i].ground[r] || {}).rid || null, [TUE, g.ri])
    const put = await K.handPut(p, `g:${TUE}.${g.ri}.+`, 'allavail')
    await K.boardTo(p, TUE)
    const chip = p.locator(`#schedBoard [data-oilsent="r:${rid}"]:visible`).first()
    if (!(await chip.count())) { R('H6.1', `ALL AVAIL placed on a 15:00–16:00 ground row (took ${put.took})`, 'no count chip drawn for the row', 'NOT WALKED', [await pic(p, 'h6-1-nochip')]); return }
    await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const chipTxt = (await chip.innerText()).trim()
    await chip.click(); await sleep(600)
    const w = await win(p)
    const me = (w.rows || []).find(r => r.id === ID)
    R('H6.1', `ALL AVAIL placed on a Ground Programme row LATER BRIEF 15:00–16:00 (took ${put.took}); its count chip "${chipTxt}" pressed → the window`,
      `window "${w.title}" · ${w.rows ? w.rows.length : 0} men · his row: ${me ? `flag ${me.flag || 'none'} · "${me.why}"` : 'NOT IN THE CROWD'} · flagged rows ${(w.rows || []).filter(r => r.flag).length}`,
      me && me.flag ? 'PASS' : 'FAIL', [await pic(p, 'h6-1-window')])
    if (me) {
      await p.locator(`.availwin .rpuck[data-awp="${ID}"] .puck`).first().click({ timeout: 4000 }).catch(() => {}); await sleep(500)
      const w2 = await win(p); const toast = await X.toastNow(p)
      const said = (w2.foot || '') + ' ' + (toast || '') + ' ' + (w2.text || '')
      R('H6.2', 'his row in the window tapped', `foot "${w2.foot}" · toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'none'}`, /Downchit but planned to fly this line/.test(said) ? 'PASS' : 'FAIL', [await pic(p, 'h6-2-tapped')])
    }
  } catch (e) { R('H6', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h6-X')]) }
  R('H6.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h7() {
  const { browser, p, errors } = await K.fresh()
  try {
    const m = await X.mondayLate(p)
    const sc = await K.addStandby(p, TUE, 'sc')
    await K.ff(p, TUE, sc.gi, 0, 'to', '13:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '19:00'); await K.ff(p, TUE, sc.gi, 0, 'br', '05:00')
    const sib = await K.seat(p, TUE, sc.gi, 0, 0, 'w', X.COBRA)          /* Cobra in the first MAIN row's REAR seat — the sibling */
    const me = await K.seat(p, TUE, sc.gi, 0, 0, 'p', ID)               /* X in that row's front seat */
    const src = X.key(TUE, sc.gi, 0, 0, 'p'), dst = X.key(TUE, sc.gi, 0, 1, 'p')
    const before = await X.restWarns(p, TUE)
    R('H7.0', `${CSN} lands 22:30 Monday (seated ${m.took}); Tuesday SC, shift ${await X.shiftNow(p, TUE, sc.gi)} — Cobra seated ${sib.took}, ${CSN} seated ${me.took} in the first MAIN row`,
      `his crew-rest warnings: ${X.shortWarns(before)}`, before.length === 1 && /clear at 12:30/.test(before[0].msg) ? 'PASS' : 'FAIL', [await pic(p, 'h7-0-seated')])
    const held = await X.dragSeat(p, src, dst, 'h7-1-held', { drop: false })
    R('H7.1', 'his puck dragged from the first MAIN row to the SECOND MAIN row of the same shift and held there', `bubble: ${JSON.stringify(held.bubble || held.err)}`,
      held.bubble && held.bubble.ghost && !/breaks|NaN/i.test(held.bubble.why || '') ? 'PASS' : (held.err ? 'NOT WALKED' : 'FAIL'), [held.shot])
    const dropped = await X.dragSeat(p, src, dst, 'h7-2-drop', { drop: true })
    const after = await X.restWarns(p, TUE)
    const where = `first MAIN front "${await X.holds(p, src)}" · second MAIN front "${await X.holds(p, dst)}"`
    R('H7.2', 'the same drag, dropped', `${where} · the app said ${dropped.toast ? '"' + dropped.toast.slice(0, 160) + '"' : 'nothing'} · his crew-rest warnings: ${X.shortWarns(after)}`,
      (await X.holds(p, dst)) === ID && after.length === 1 && after[0].msg === before[0].msg ? 'PASS' : (dropped.err ? 'NOT WALKED' : 'FAIL'), [dropped.shot, await pic(p, 'h7-2-after')])
  } catch (e) { R('H7', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h7-X')]) }
  R('H7.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h8() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.fileInput(p, { type: 'OL', di: TUE, allday: true, remarks: 'Abroad' })
    const m = await K.addFlyWave(p, TUE)
    const s = await K.seat(p, TUE, m.gi, 0, 0, SEAT, ID)
    await W.boardOff(p).catch(() => {}); await B.toEdit(p); await W.showDay(p, TUE)
    const b = p.locator(`#eWeek .day[data-day="${TUE}"] [data-dayinfo="${TUE}"]`).first()
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await b.click(); await sleep(700)
    const out = await p.evaluate(cs => { const mm = document.querySelector('#dayPop'); if (!mm || !mm.getBoundingClientRect().width) return { none: true }
      const t = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : ''
      return { sev: t(mm.querySelector('.dip-sev')), lines: [...mm.querySelectorAll('.dip-list .witem')].map(e => t(e)).filter(x => x.includes(cs)) } }, CSN)
    await p.evaluate(() => { const h = [...document.querySelectorAll('#dayPop .dip-h')].find(e => /issues/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await sleep(250)
    R('H8.1', `${CSN}: OL all Tuesday, seated on a new blank line (took ${s.took}); the day's "i" pressed on Edit Schedule — the day-details window`,
      out.none ? 'the window did not open' : `its count line "${out.sev}" · lines naming him: ${JSON.stringify(out.lines)}`,
      !out.none && out.lines.some(t => /On leave but planned to fly this line/.test(t)) ? 'PASS' : 'FAIL', [await pic(p, 'h8-1-daydetails')])
  } catch (e) { R('H8', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h8-X')]) }
  R('H8.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h9() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.fileInput(p, { type: 'LL', di: TUE, allday: true, remarks: 'Off' })
    const a = await X.groundRow(p, TUE, 'Sim', '', '', false); const pa = await K.handPut(p, `g:${TUE}.${a.ri}.+`, ID)
    const b = await X.groundRow(p, TUE, 'duty', '', '', false); const pb = await K.handPut(p, `g:${TUE}.${b.ri}.+`, ID)
    const rows = await p.evaluate(([i, r1, r2]) => [r1, r2].map(r => { const x = window.DAYS[i].ground[r]; return `"${x.prog}" ${x.str || '—'}–${x.end || '—'}` }).join(' · '), [TUE, a.ri, b.ri])
    const s1 = await X.seeWeek(p, TUE, 'h9-1', { prev: -1 })
    const l1 = (s1.list.full || []).filter(x => x.text.includes(CSN) && /tasked/.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, ''))
    R('H9.1', `${CSN}: LL all Tuesday; two Ground Programme items named ${rows}, no times, he is put on both (took ${pa.took}, ${pb.took})`, `lines naming him: ${JSON.stringify(l1)}`,
      l1.length === 2 && l1.some(t => /tasked — Sim( |$)/.test(t)) && l1.some(t => /tasked — duty( |$)/.test(t)) ? 'PASS' : 'FAIL', s1.pics)
    await K.boardTo(p, TUE)
    await W.boardText(p, `gr:${TUE}.${a.ri}.str`, '09:00'); await W.boardText(p, `gr:${TUE}.${a.ri}.end`, '10:00')
    await W.boardText(p, `gr:${TUE}.${b.ri}.str`, '11:00'); await W.boardText(p, `gr:${TUE}.${b.ri}.end`, '12:00')
    const s2 = await X.seeWeek(p, TUE, 'h9-2', { prev: -1 })
    const l2 = (s2.list.full || []).filter(x => x.text.includes(CSN) && /tasked/.test(x.text)).map(x => x.text.replace(/ ✕| ↺/g, ''))
    R('H9.2', 'hours typed on both (09:00–10:00, 11:00–12:00)', `lines naming him: ${JSON.stringify(l2)}`,
      l2.length === 2 && l2.some(t => /tasked — Sim( |$)/.test(t)) && l2.some(t => /tasked — duty( |$)/.test(t)) ? 'PASS' : 'FAIL', s2.pics)
  } catch (e) { R('H9', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h9-X')]) }
  R('H9.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'h6' || which === 'all') await h6()
if (which === 'h7' || which === 'all') await h7()
if (which === 'h8' || which === 'all') await h8()
if (which === 'h9' || which === 'all') await h9()
B.savePart('bta-host2')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
