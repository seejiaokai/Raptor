/* walker B, script 6: P2-17 (every reader respects the publication boundary), P2-18 (reporting survives plans, templates and
   week travel). */
import { readFileSync } from 'node:fs'
import * as K from './stk-B-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'
const dump = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.offsetParent !== null).map(e => e.tagName + ' ' + Object.entries(e.dataset).map(([k, v]) => k + '=' + v).join(',') + ':' + (e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 60)), sel)

async function weekTo(p, wk) {
  await B.toEdit(p)
  await p.locator(`[data-wk="${wk}"]:visible`).first().click(); await sleep(900)
  await p.waitForFunction(w => window.CURWEEK === w || String(window.CURWEEK).replace(/\//g, '-') === w.replace(/\//g, '-'), wk, { timeout: 8000 }).catch(() => {})
  await sleep(500)
}
async function pbPic(p, rootSel, name) {
  await p.evaluate(sel => { const d = document.querySelector(sel); if (!d) return; const el = [...d.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'PB'); if (el) el.scrollIntoView({ block: 'center', inline: 'center' }) }, rootSel)
  await sleep(400)
  return B.pic(p, name)
}
async function csv(p) {
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), p.locator('#exportSched').click()])
  const path = await dl.path(); return { name: dl.suggestedFilename(), text: readFileSync(path, 'utf8') }
}
async function printHtml(p) {
  await p.locator('#exportPdf').click(); await sleep(1500)
  return p.evaluate(() => { const fs = [...document.querySelectorAll('iframe[srcdoc]')]; const f = fs[fs.length - 1]; return f ? f.srcdoc : null })
}
const grep = (t, re, n = 140) => { const m = re.exec(t || ''); return m ? t.slice(Math.max(0, m.index - 60), m.index + n).replace(/\s+/g, ' ') : null }

async function p217() {
  const DI = 0
  const WK = '20/07/2026'
  const { browser, p, errors } = await K.fresh()
  try {
    await weekTo(p, WK)
    const wkNow = await p.evaluate(() => window.CURWEEK)
    const pre = await p.evaluate(() => window.DAYS[0].waves.map(w => w.label + ':' + w.formations.map(f => f.cs + ' ' + f.to).join(',')))
    const w = await K.addFlyWave(p, DI)
    await K.ff(p, DI, w.gi, 0, 'cs', 'PB'); await K.ff(p, DI, w.gi, 0, 'msn', 'BFM'); await K.ff(p, DI, w.gi, 0, 'to', '12:00'); await K.ff(p, DI, w.gi, 0, 'ld', '13:00')
    await K.seat(p, DI, w.gi, 0, 0, 'p', 'taipan'); await K.seat(p, DI, w.gi, 0, 0, 'w', 'mamba')
    await K.itAdd(p, 'week', DI, w.gi); await K.itSet(p, 'week', DI, w.gi, 0, '10:00 RALLY')
    const wl0 = (await K.warnsFull(p, DI)).filter(x => /REPORT/.test(x.code)).map(x => x.msg)
    const pub = await K.publishOrig(p, DI)
    const h1 = await B.head(p, DI)
    /* correct the working copy WITHOUT amending: the rally to 09:30 and the Mission to ACM */
    await K.itSet(p, 'week', DI, w.gi, 0, '09:30 RALLY')
    await K.ff(p, DI, w.gi, 0, 'msn', 'ACM')
    await B.toEdit(p); await W.showDay(p, DI)
    const h2 = await B.head(p, DI)
    const wlWork = (await K.warnsFull(p, DI)).filter(x => /REPORT/.test(x.code)).map(x => x.msg)
    await B.openList(p, '#eWeek', DI)
    const workList = await B.readList(p, '#eWeek', DI)
    R('P2-17.a', `next week (${wkNow}) Monday: new wave PB 12:00, "10:00 RALLY" (red warning ${JSON.stringify(wl0)}), signed and published; then the working copy corrected to "09:30 RALLY" and Mission ACM, NOT amended`,
      `week had waves before: ${JSON.stringify(pre)}; publish ${JSON.stringify(pub.r)} tag "${h1.tag}"; working copy now: chip "${h2.pending}", warnings ${JSON.stringify(wlWork)}, Edit-week list bar "${workList.bar}"`, 'RECORDED', [])
    /* READER 1: View-only Sched, as admin */
    await L.go(p, 'viewsched'); await B.openList(p, '#vWeek', DI)
    const vA = await B.readList(p, '#vWeek', DI)
    const vAtxt = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { rally: (/\d\d:\d\d[HL]? ?RALLY/i.exec(t) || [])[0] || null, msn: ((/\bPB\s+(BFM|ACM)\b/.exec(t) || [])[1] || 'no PB row') } }, DI)
    const pv = await pbPic(p, `#vWeek .day[data-day="${DI}"]`, 'p17-b-viewonly-admin-PBrow')
    /* READER 2: the member on View-only Sched */
    await B.reloadAs(p, 'm'); await sleep(500)
    await p.evaluate(w => window.loadWeek(w), WK); await sleep(900)
    if ((await p.evaluate(() => window.CURPAGE)) !== 'viewsched') await L.go(p, 'viewsched')
    await B.openList(p, '#vWeek', DI)
    const vM = await B.readList(p, '#vWeek', DI)
    const vMtxt = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { rally: (/\d\d:\d\d[HL]? ?RALLY/i.exec(t) || [])[0] || null, msn: ((/\bPB\s+(BFM|ACM)\b/.exec(t) || [])[1] || 'no PB row') } }, DI)
    const pm = await pbPic(p, `#vWeek .day[data-day="${DI}"]`, 'p17-c-viewonly-member-PBrow')
    R('P2-17.b', 'View-only Sched on the working-copy-corrected day, as the admin and then as the member (week Jul 20 loaded)',
      `admin: bar "${vA.bar}", ${JSON.stringify(vAtxt)}; member: bar "${vM.bar}", ${JSON.stringify(vMtxt)}`,
      /10:00/.test(vAtxt.rally || '') && vAtxt.msn === 'BFM' && /10:00/.test(vMtxt.rally || '') && vMtxt.msn === 'BFM' && /1 issue/.test(vM.bar) ? 'PASS' : 'FAIL', [pv, pm])
    /* READER 2b: the member's next-week peek (View-only Sched, current week) */
    await p.locator('[data-wk="13/07/2026"]:visible').first().click(); await sleep(1000)
    await p.evaluate(() => { const e = document.querySelector('#vWeek .day.peek'); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(600)
    const peekMT = await p.evaluate(() => { const e = document.querySelector('#vWeek .day.peek'); return e ? e.innerText : null })
    const peekM = peekMT == null ? null : { pb: (/\bPB\s+(BFM|ACM)\b/.exec(peekMT.replace(/\s+/g, ' ')) || [])[1] || 'no PB row', len: peekMT.length }
    const ppm = await K.picEl(p, '#vWeek .day.peek', 'p17-c2-peek-member', { pad: 6, maxH: 700 })
    R('P2-17.c2', 'the member, View-only Sched on the current week: the next-week peek for Monday 20 Jul while the working copy (ACM) is corrected but not amended (issued: BFM)', JSON.stringify(peekM), 'RECORDED', [ppm])
    await B.admin(p)
    await p.evaluate(w => window.loadWeek(w), WK); await sleep(900); await B.toEdit(p)
    /* READER 3: the next-week peek, from the current week */
    await weekTo(p, '13/07/2026')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day.peek'); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(600)
    const peek = await p.evaluate(() => { const e = document.querySelector('#eWeek .day.peek'); if (!e) return null; const t = e.innerText.replace(/\s+/g, ' '); return { text: t.slice(0, 900), rally: (/\d\d:\d\d[HL]? ?RALLY/i.exec(t) || [])[0] || null, msn: ((/\bPB\s+(BFM|ACM)\b/.exec(t) || [])[1] || 'no PB row') } })
    const pp = await K.picEl(p, '#eWeek .day.peek', 'p17-d-peek', { pad: 6, maxH: 700 })
    R('P2-17.c', 'back on the current week, the next-week peek column for Monday 20 Jul', JSON.stringify(peek), 'RECORDED', [pp])
    /* READER 4: print and CSV, for the week with the day */
    await weekTo(p, WK)
    const html = await printHtml(p)
    const cs1 = await csv(p)
    const pbOf = h => { const m = /<b>PB<\/b><span class="msn">(\w+)</.exec(h || ''); return m ? m[1] : 'no PB row' }
    const pr = { hasPB: /<b>PB<\/b>/.test(html || ''), pbMission: pbOf(html), rally: grep(html, /RALLY/i) }
    const cv = { name: cs1.name, lines: cs1.text.split(/\r?\n/).length, PB: cs1.text.split(/\r?\n/).filter(l => /PB/.test(l)).slice(0, 3), hasRally: /RALLY|in-?time/i.test(cs1.text), head: cs1.text.split(/\r?\n/)[0].slice(0, 160) }
    R('P2-17.d', 'print frame and CSV export for the week Jul 20 (working copy corrected, not amended)', `print ${JSON.stringify(pr)}; CSV ${JSON.stringify(cv)}`, 'RECORDED', [])
    /* amend, then every reader again */
    const al = await K.publishAL(p, DI)
    const h3 = await B.head(p, DI)
    const html2 = await printHtml(p); const cs2 = await csv(p)
    const pr2 = { pbMission: pbOf(html2) }
    const cv2 = { PB: cs2.text.split(/\r?\n/).filter(l => /PB/.test(l)).slice(0, 3) }
    /* the older version: Original still reads as issued */
    const lk = await B.look(p, DI, /Original|ORIG/i)
    const oldTxt = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { rally: (/\d\d:\d\d[HL]? ?RALLY/i.exec(t) || [])[0] || null, msn: ((/\bPB\s+(BFM|ACM)\b/.exec(t) || [])[1] || 'no PB row'), warn: /later than suggested brief/.test(t) } }, DI)
    const po = await K.picEl(p, `#eWeek .day[data-day="${DI}"]`, 'p17-e-old-version', { pad: 6, maxH: 700 })
    await B.backLive(p, DI)
    await L.go(p, 'viewsched'); await B.openList(p, '#vWeek', DI)
    const vAfter = await B.readList(p, '#vWeek', DI)
    const vAfterTxt = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const t = d ? d.innerText.replace(/\s+/g, ' ') : ''; return { rally: (/\d\d:\d\d[HL]? ?RALLY/i.exec(t) || [])[0] || null, msn: ((/\bPB\s+(BFM|ACM)\b/.exec(t) || [])[1] || 'no PB row') } }, DI)
    const pa = await pbPic(p, `#vWeek .day[data-day="${DI}"]`, 'p17-f-viewonly-after-AL-PBrow')
    R('P2-17.e', 'signed and published AL1; then print, CSV, the Original version look on Edit Schedule, and View-only Sched again',
      `AL1 ${JSON.stringify(al.r)} tag "${h3.tag}"; print after: ${JSON.stringify(pr2)}; CSV after: ${JSON.stringify(cv2)}; look at Original ${JSON.stringify({ ok: !lk.err, label: lk.label })}: ${JSON.stringify(oldTxt)}; View-only now: bar "${vAfter.bar}", ${JSON.stringify(vAfterTxt)}`,
      oldTxt.msn === 'BFM' && /10:00/.test(oldTxt.rally || '') && vAfterTxt.msn === 'ACM' && /09:30/.test(vAfterTxt.rally || '') ? 'PASS' : 'FAIL', [po, pa])
  } catch (e) { R('P2-17.X', 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await pic(p, 'p17-X')]) }
  R('P2-17.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function p218() {
  const DI = 4, DJ = 5
  const { browser, p, errors } = await K.fresh()
  try {
    const crew = ['taipan', 'mamba', 'boosh', 'beams']
    const names = await K.cs(p, crew)
    const H0 = await K.hours(p, names, 'p18-0-base')
    const w = await K.addFlyWave(p, DI)
    await K.ff(p, DI, w.gi, 0, 'cs', 'RP'); await K.ff(p, DI, w.gi, 0, 'msn', 'BFM'); await K.ff(p, DI, w.gi, 0, 'to', '12:00'); await K.ff(p, DI, w.gi, 0, 'ld', '13:00')
    await K.seat(p, DI, w.gi, 0, 0, 'p', crew[0]); await K.seat(p, DI, w.gi, 0, 0, 'w', crew[1])
    await K.addLine(p, DI, w.gi)
    await K.ff(p, DI, w.gi, 1, 'cs', 'RP2'); await K.ff(p, DI, w.gi, 1, 'msn', 'BFM'); await K.ff(p, DI, w.gi, 1, 'to', '12:00'); await K.ff(p, DI, w.gi, 1, 'ld', '13:00')
    await K.seat(p, DI, w.gi, 1, 0, 'p', crew[2]); await K.seat(p, DI, w.gi, 1, 0, 'w', crew[3])
    for (let i = 0; i < 3; i++) await K.itAdd(p, 'week', DI, w.gi)
    await K.itSet(p, 'week', DI, w.gi, 0, '08:00 RP IN TIME'); await K.itSet(p, 'week', DI, w.gi, 1, '09:00 IN TIME'); await K.itSet(p, 'week', DI, w.gi, 2, '09:30 RALLY')
    const L0 = await K.itLines(p, DI, w.gi)
    const H1 = await K.hours(p, names, 'p18-1-day')
    const d = (a, b) => names.map(c => `${c} ${a[c] || '-'}->${b[c] || '-'}`).join(', ')
    R('P2-18.a', 'Friday wave RP (crew Cobra+Sidewinder) and RP2 (Havoc+Comet), both 12:00-13:00; lines "08:00 RP IN TIME" (specific), "09:00 IN TIME" (general), "09:30 RALLY" (general)',
      `lines ${JSON.stringify(L0)}; Work hours ${d(H0.h, H1.h)} (RP crew should start 08:00, RP2 crew 09:00)`, 'RECORDED', [H1.shot])
    /* save as a day template */
    await B.toEdit(p); await W.showDay(p, DI)
    await p.locator(`#eWeek [data-daytplopen="${DI}"]`).first().click(); await sleep(400)
    await p.locator('[data-daytplsave]').first().click(); await sleep(600)
    await p.locator('button', { hasText: /^Done$/ }).last().click(); await sleep(700)
    /* save as a plan (+ Alt Plan), then change the plan and come back to the live copy */
    await B.toEdit(p); await W.showDay(p, DI)
    await p.locator(`#eWeek [data-planmenu="${DI}"]:visible`).first().click(); await sleep(400)
    await p.locator('[data-plandup]').first().click(); await sleep(900)
    const inPlan = await K.itLines(p, DI, w.gi)
    const planHead = await p.evaluate(i => (document.querySelector(`#eWeek [data-planmenu="${i}"]`) || {}).innerText, DI)
    await K.itSet(p, 'week', DI, w.gi, 0, '07:00 RP IN TIME')
    const planEdited = await K.itLines(p, DI, w.gi)
    const pickPlan = async (id) => { await B.toEdit(p); await W.showDay(p, DI); await p.locator(`#eWeek [data-planmenu="${DI}"]:visible`).first().click(); await sleep(400); const menu = await dump(p, '.wavemenu button'); await p.locator(`[data-plansel="${id}"]`).first().click(); await sleep(1000); const head = await p.evaluate(i => (document.querySelector(`#eWeek [data-planmenu="${i}"]`) || {}).innerText, DI); return { menu, head: (head || '').replace(/\s+/g, ' ') } }
    const toA = await pickPlan('dr1'); const lineA = await K.itLines(p, DI, w.gi)
    const pPl = await K.picEl(p, dayBoxSel(DI, w.gi), 'p18-b-plan-A', { pad: 50 })
    const hA = await K.hours(p, names, 'p18-b-hours-A')
    const toB = await pickPlan('dr2'); const lineB = await K.itLines(p, DI, w.gi)
    const pPl2 = await K.picEl(p, dayBoxSel(DI, w.gi), 'p18-b-plan-B', { pad: 50 })
    const hB = await K.hours(p, names, 'p18-b-hours-B')
    const toA2 = await pickPlan('dr1'); const lineA2 = await K.itLines(p, DI, w.gi)
    R('P2-18.b', 'saved the day as a template (Template 1) and as a plan (+ Alt Plan = Plan B, which becomes the live one); in Plan B retyped line 1 to "07:00 RP IN TIME"; chose Plan A, then Plan B, then Plan A again from the plans menu',
      `Plan B at creation: ${JSON.stringify(inPlan)} (selector "${(planHead || '').replace(/\s+/g, ' ')}"); Plan B after the edit: ${JSON.stringify(planEdited)}; plan menu: ${JSON.stringify(toA.menu)}; Plan A chosen (${toA.head}): ${JSON.stringify(lineA)}, Work hours ${d(H1.h, hA.h)}; Plan B chosen (${toB.head}): ${JSON.stringify(lineB)}, Work hours ${d(hA.h, hB.h)}; Plan A again (${toA2.head}): ${JSON.stringify(lineA2)}`,
      JSON.stringify(inPlan) === JSON.stringify(L0) && JSON.stringify(lineA) === JSON.stringify(L0) && JSON.stringify(lineB) === JSON.stringify(planEdited) && JSON.stringify(lineA2) === JSON.stringify(L0) ? 'PASS' : 'FAIL', [pPl, pPl2, hA.shot, hB.shot])
    /* apply the template to Saturday */
    await B.toEdit(p); await W.showDay(p, DJ)
    await p.locator(`#eWeek [data-daytplopen="${DJ}"]`).first().click(); await sleep(400)
    await p.locator('[data-daytplpick]').first().click(); await sleep(1200)
    const asked = await dump(p, 'button')
    const confirmBtn = asked.filter(x => /Apply|Replace|Yes|Confirm|OK/i.test(x)).slice(0, 4)
    const sat = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => `${f.cs} ${f.to}-${f.ld}`).join(',') + ' lines ' + JSON.stringify(w.intimes)), DJ)
    const satCrew = await p.evaluate(i => JSON.stringify(window.DAYS[i].waves.map(w => w.formations.map(f => f.cs + ':' + f.aircraft.map(a => (a.p || '-') + '+' + (a.w || '-')).join(',')))), DJ)
    const satWarn = await K.warns(p, DJ)
    const H2 = await K.hours(p, names, 'p18-2-after-template')
    const pS = await K.picEl(p, `#eWeek .day[data-day="${DJ}"] [data-itline^="${DJ}|"]`, 'p18-c-saturday', { pad: 70 })
    R('P2-18.c', 'applied Template 1 to Saturday', `Saturday now ${JSON.stringify(sat)}; Saturday crew after the copy ${satCrew}; Saturday warnings ${JSON.stringify(satWarn.filter(x => /REPORT/.test(x)))}; Work hours (both days now) ${d(H1.h, H2.h)}; buttons seen after the pick: ${JSON.stringify(confirmBtn)}`, 'RECORDED', [pS, H2.shot])
    /* Undo / Redo of the application */
    const u = await W.door(p, 'top', 'undo')
    const afterU = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ' lines ' + JSON.stringify(w.intimes)), DJ)
    const fri = await K.itLines(p, DI, w.gi)
    const r = await W.door(p, 'top', 'redo')
    const afterR = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ' lines ' + JSON.stringify(w.intimes)), DJ)
    R('P2-18.d', 'top-bar Undo then Redo after applying the template', `Undo: ${JSON.stringify({ title: u.title, toasts: u.toasts })} -> Saturday ${JSON.stringify(afterU)}, Friday lines ${JSON.stringify(fri)}; Redo: ${JSON.stringify({ title: r.title, toasts: r.toasts })} -> Saturday ${JSON.stringify(afterR)}`,
      afterU.length === 0 && JSON.stringify(fri) === JSON.stringify(L0) && afterR.length === 1 ? 'PASS' : 'FAIL', [])
    /* the history's words for it */
    await p.locator('#histBtn').click(); await sleep(700)
    { const t = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first(); if (await t.count()) { await t.click(); await sleep(500) } }
    { const t = p.locator('.chgwin:not([hidden]) button', { hasText: /^Sat$/ }).first(); if (await t.count()) { await t.click(); await sleep(500) } }
    const hist = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 900) : null })
    const phist = await K.pic(p, 'p18-d-history')
    { const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) await x.click().catch(() => {}); await sleep(300) }
    R('P2-18.d2', 'Changes window, All changes, Saturday', String(hist), 'RECORDED', [phist])
    /* week travel */
    await weekTo(p, '20/07/2026'); await weekTo(p, '13/07/2026')
    await B.toEdit(p); await W.showDay(p, DJ)
    const sat2 = await K.itLines(p, DJ, 0).catch(() => null); const fri2 = await K.itLines(p, DI, w.gi)
    const H3 = await K.hours(p, names, 'p18-3-after-travel')
    const pT = await K.picEl(p, `#eWeek .day[data-day="${DJ}"] [data-itline^="${DJ}|"]`, 'p18-e-after-travel', { pad: 70 })
    R('P2-18.e', 'visited next week (Jul 20) and came back to Jul 13', `Friday lines ${JSON.stringify(fri2)}, Saturday lines ${JSON.stringify(sat2)}; Work hours ${d(H2.h, H3.h)}`,
      JSON.stringify(fri2) === JSON.stringify(L0) && sat2 && sat2.length === 3 && JSON.stringify(H2.h) === JSON.stringify(H3.h) ? 'PASS' : 'FAIL', [pT, H3.shot])
  } catch (e) { R('P2-18.X', 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await pic(p, 'p18-X')]) }
  R('P2-18.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
const dayBoxSel = (di, gi) => `#eWeek .day[data-day="${di}"] [data-itline="${di}|${gi}|0"]`

if (which === 'all' || which === 'p17') await p217()
if (which === 'all' || which === 'p18') await p218()
B.savePart('s6' + which)
