/* walker TO — P2-17: every reader respects the publication boundary.
   Monday. (0) As the scenario is written — publish Monday while it carries a red reporting warning. (1) If that is
   refused: the four demo lines put in order and ONE line left that the app cannot read ("VL RALLY AT 25:70" — an amber
   reporting line), then published: Monday is out WITH a reporting warning. (2) The working copy corrected ("10:10 VL
   RALLY"), not amended. (3) The readers: View-only Sched (admin, and the member after a reload), the issued version's
   read-only look, the next-week peek (from the week of 6 Jul), the printed sheet, the CSV. (4) The amendment, and the
   readers again. */
import { readFileSync } from 'node:fs'
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DI = 0, BAD = 'VL RALLY AT 25:70', GOOD = '10:10 VL RALLY'
const sha = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(16) + '/' + s.length }
await T.run('P2-17', async p => {
  await W.toastSpy(p)
  /* ---------- readers ---------- */
  const viewRead = async () => { await T.toPage(p, 'viewsched'); await W.showDay(p, DI, '#vWeek'); await T.openList(p, '#vWeek', DI)
    const r = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; return { tag: t(d.querySelector('.verchip')), w1: t(d.querySelectorAll('.intimes')[0]), bar: t(d.querySelector(`[data-dwbox="${i}"] .daywarn`)) } }, DI)
    r.rep = T.fullStr(await T.linesFull(p, DI, /reporting|In-time \/ Rally/i, '#vWeek')); return r }
  const editRead = async () => { await T.toEdit(p); await W.showDay(p, DI); await T.openList(p, '#eWeek', DI); const w1 = await T.itRead(p, 'week', DI, 0); const h = await T.head(p, DI); const l = await T.listOf(p, DI); return { w1: w1.lines.join(' / '), fb: w1.fb, tag: h.tag, pend: h.pending, alpub: h.alpub, bar: l.bar, rep: T.fullStr(await T.linesFull(p, DI, /reporting|In-time \/ Rally/i)) } }
  const lookRead = async (re, name) => { const lk = await T.look(p, DI, re); if (lk.err) return { err: lk.err }
    await W.showDay(p, DI); const r = await p.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; const box = d.querySelector(`[data-dwbox="${i}"]`); return { bar: t(d.querySelector('.dprev-bar')), w1: t(d.querySelectorAll('.intimes, [data-intimes]')[0]), warn: t(box ? box.querySelector('.daywarn') : null), editable: d.querySelectorAll('[contenteditable="true"]').length } }, DI)
    await p.evaluate(i => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] .intimes, #eWeek .day[data-day="${i}"] [data-intimes]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, DI); await L.sleep(250)
    r.shot = await pic(p, name); r.label = lk.label; r.versions = lk.vs.map(v => v.label).join(', ')
    r.back = await T.backLive(p, DI); return r }
  const peekRead = async name => { await T.toPage(p, 'viewsched'); await p.locator('#page-viewsched [data-wk="06/07/2026"]:visible').first().click(); await L.sleep(900)
    const r = await p.evaluate(() => { const d = document.querySelector('#vWeek [data-peek-day="0"]'); if (!d) return { err: 'no next-week peek on the week of 6 Jul' }; const t = (d.innerText || '').replace(/\s+/g, ' '); d.scrollIntoView({ block: 'start', inline: 'start' }); return { head: t.slice(0, 60), hasIn: /IN TIME/i.test(t), hasBad: /25:70/.test(t), hasGood: /10:10/.test(t), warn: d.querySelectorAll('.daywarn, .witem').length, wave1: (/WAVE 1 .{0,120}/.exec(t) || [''])[0] } })
    await L.sleep(350); r.shot = await pic(p, name)
    await p.locator('#page-viewsched [data-wk="13/07/2026"]:visible').first().click(); await L.sleep(900); return r }
  const printRead = async name => { await T.toEdit(p); const n0 = p.frames().length
    const b = p.locator('#exportPdf:visible').first(); if (!(await b.count())) return { err: 'no print button on Edit Schedule' }
    await W.toasts(p); await b.click(); await L.sleep(1300)
    const fr = p.frames().filter(f => f !== p.mainFrame()).pop(); if (!fr) return { err: 'the print button made no sheet', said: await W.toasts(p) }
    const text = await fr.evaluate(() => document.body.innerText); const html = await fr.content()
    const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean)
    const mon = lines.slice(0, Math.max(40, lines.findIndex(s => /^Tuesday/i.test(s)) > 0 ? lines.findIndex(s => /^Tuesday/i.test(s)) : 200))
    const np = await p.context().newPage(); await np.setViewportSize({ width: 1200, height: 900 })
    await np.setContent(html.replace(/<head>/i, `<head><base href="${process.env.HP_URL}/">`), { waitUntil: 'load' }).catch(() => {}); await L.sleep(500)
    const shot = await pic(np, name); await np.close()
    return { said: (await W.toasts(p)).join(' | '), n: text.length, rep: lines.filter(s => /IN TIME|RALLY|recognised|out of order/i.test(s)).slice(0, 8).join(' / '), hasBad: /25:70/.test(text), hasGood: /10:10 VL RALLY/.test(text), head: lines.slice(0, 6).join(' · '), monHasWarn: mon.some(s => /recognised clock|issues?\b/i.test(s)), shot } }
  const csvRead = async () => { await T.toEdit(p); const b = p.locator('#exportSched:visible').first(); if (!(await b.count())) return { err: 'no CSV button on Edit Schedule' }
    const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null); await b.click(); const d = await dl; await L.sleep(300)
    if (!d) return { err: 'the CSV button started no download' }
    const txt = readFileSync(await d.path(), 'utf8'); const rows = txt.split(/\r?\n/).filter(Boolean)
    return { name: d.suggestedFilename(), head: rows[0], n: rows.length, mon: rows.filter(r => /^"Monday"/.test(r)).length, id: sha(txt), hasBad: /25:70/.test(txt), hasGood: /10:10 VL RALLY/.test(txt), hasIn: /IN TIME/i.test(txt), monText: rows.filter(r => /^"Monday"/.test(r)).join('\n') } }

  /* ---------- 0: as written — publish with a red reporting warning ---------- */
  const e0 = await editRead()
  await W.toasts(p)
  const pub0 = await T.pubOrig(p, DI); const said0 = await W.toasts(p); const h0 = await T.head(p, DI)
  await W.showDay(p, DI); const s0 = await pic(p, 'p217-0-publish-with-red-warning')
  const out0 = !/DRAFT/i.test(h0.tag)
  judge('P2-17.0', `SETUP as written: Monday as the demo has it — ${e0.rep.split(' | ').length} red reporting lines (${e0.rep.slice(0, 150)}…). The four sign-offs (${Object.values(pub0.s).join(', ')}), then "Publish day".`, [
    ['Monday is published with its reporting warning', out0, `the day's tag "${h0.tag}", Publish button ${h0.beak}; the app said: ${said0.join(' | ') || '(nothing)'}`],
  ], [s0])

  /* ---------- 1: a reporting warning the app lets out ---------- */
  await T.toEdit(p); await W.showDay(p, DI)
  if (!out0) {
    await T.itType(p, 'week', DI, 0, 0, '10:00H: FIRST WAVE VL IN TIME + WX/NOTAMS')
    await T.itType(p, 'week', DI, 0, 1, '11:00H: FIRST WAVE RU IN TIME + WX/NOTAMS')
    await T.itType(p, 'week', DI, 1, 0, '17:00H: NIGHT WAVE VL IN TIME + WX/NOTAMS')
    await T.itType(p, 'week', DI, 1, 1, '16:40H: NIGHT WAVE RU IN TIME + WX/NOTAMS')
  }
  await T.itAdd(p, 'week', DI, 0); await T.itType(p, 'week', DI, 0, 2, BAD)
  const e1 = await editRead()
  await W.toasts(p)
  const pub1 = out0 ? await T.pubAL(p, DI) : await T.pubOrig(p, DI); const said1 = await W.toasts(p); const h1 = await T.head(p, DI)
  await W.showDay(p, DI); await T.itShow(p, 'week', DI, 0); const s1 = await pic(p, 'p217-1-published-with-amber-reporting-line')
  const ISSUED = h1.tag
  const v1 = await viewRead(); await T.listShow(p, DI, /recognised clock/, '#vWeek'); const s1v = await pic(p, 'p217-1-view-issued')
  const c1 = await csvRead()
  judge('P2-17.1', `SETUP that the app allows: the four demo lines retyped in order (10:00 / 11:00 on wave 1, 17:00 / 16:40 on wave 2), a third line added to wave 1 and retyped "${BAD}" (the app cannot read a clock in it). Sign-offs + "${pub1.r.label}".`, [
    ['the working copy carries one reporting line in its list', /recognised clock/.test(e1.rep), `under the lines "${e1.fb}" · list: ${e1.rep} · bar "${e1.bar}"`],
    ['Monday is published with that reporting warning', !/DRAFT/i.test(h1.tag) && said1.some(s => /published/i.test(s)), `tag "${h1.tag}"; the app said: ${said1.join(' | ')}`],
    ['View-only Sched shows the issued wording and the warning', v1.w1.includes(BAD) && /recognised clock/.test(v1.rep), `wave 1 reads "${v1.w1}" · list: ${v1.rep} · bar "${v1.bar}"`],
  ], [s1, s1v])

  /* ---------- 2: correct the working copy, no amendment ---------- */
  await T.toEdit(p); await W.showDay(p, DI)
  await T.itType(p, 'week', DI, 0, 2, GOOD)
  const e2 = await editRead(); await T.listShow(p, DI, /In-time \/ Rally|reporting/i); const s2l = await pic(p, 'p217-2-working-copy-list-after-correction'); await T.itShow(p, 'week', DI, 0); const s2 = await pic(p, 'p217-2-working-copy-corrected')
  row('P2-17.2h', 'the working copy after the correction, in full', `wave 1 "${e2.w1}" · under it "${e2.fb}" · list lines about reporting: ${e2.rep} · bar "${e2.bar}" · tag "${e2.tag}" · count "${e2.pend}" · button "${e2.alpub}" — before the correction: under the lines "${e1.fb}" · list ${e1.rep} · bar "${e1.bar}"`, 'INFO', [s2l])
  judge('P2-17.2', `The working copy corrected, NOT amended: wave 1's third line retyped "${GOOD}" + Tab.`, [
    ['the working copy shows the corrected line, no reporting line in its list, and the day waits for an amendment', e2.w1.includes(GOOD) && !/recognised clock/.test(e2.rep) && /pending/i.test(e2.pend), `wave 1 "${e2.w1}" · under it "${e2.fb}" · list: ${e2.rep} · tag "${e2.tag}" · count "${e2.pend}" · button "${e2.alpub}"`],
  ], [s2])

  /* ---------- 3: every reader, before the amendment ---------- */
  const v2 = await viewRead(); await T.listShow(p, DI, /recognised clock/, '#vWeek'); const s3a = await pic(p, 'p217-3a-view-admin-before-amend')
  await T.reloadAs(p, 'm'); await L.sleep(400); await W.toastSpy(p)
  const m2 = await viewRead(); await T.listShow(p, DI, /recognised clock/, '#vWeek'); const s3b = await pic(p, 'p217-3b-view-member-before-amend')
  await T.reloadAs(p, 'a'); await L.sleep(400); await W.toastSpy(p)
  const lk2 = await lookRead(new RegExp(ISSUED.replace(/\s+/g, ' ?'), 'i'), 'p217-3c-issued-version-look')
  const pk2 = await peekRead('p217-3d-next-week-peek')
  const pr2 = await printRead('p217-3e-print-sheet-before-amend')
  const c2 = await csvRead()
  judge('P2-17.3', 'Every listed reader inspected with the correction pending: View-only Sched as the admin; as the member (reload, sign-in us); the issued version\'s read-only look from the day\'s version menu; the next-week peek (View-only Sched, week of 6 Jul); the printed sheet ("Export as PDF (print)" on Edit Schedule — the sheet the app hands the printer, read and re-drawn in a second tab for the picture); the CSV ("Export to Excel (CSV)" on Edit Schedule).', [
    ['View-only Sched (admin) keeps the issued wording and warning', v2.w1.includes(BAD) && !v2.w1.includes(GOOD) && /recognised clock/.test(v2.rep), `tag "${v2.tag}" · wave 1 "${v2.w1}" · list: ${v2.rep}`],
    ['View-only Sched (member) keeps the issued wording and warning', m2.w1.includes(BAD) && !m2.w1.includes(GOOD) && /recognised clock/.test(m2.rep), `tag "${m2.tag}" · wave 1 "${m2.w1}" · list: ${m2.rep}`],
    ['the issued version\'s look keeps its wording and is read-only', !lk2.err && lk2.w1.includes(BAD) && !lk2.w1.includes(GOOD) && lk2.editable === 0, lk2.err || `"${lk2.label}" (menu: ${lk2.versions}) · bar "${lk2.bar}" · wave 1 "${lk2.w1}" · its warning bar "${lk2.warn}" · boxes open for typing: ${lk2.editable}`],
    ['the next-week peek shows no pending wording', !pk2.err && !pk2.hasGood, pk2.err || `"${pk2.head}…" · any reporting line shown: ${pk2.hasIn ? 'yes' : 'none'} · "25:70" shown: ${pk2.hasBad} · "10:10" shown: ${pk2.hasGood} · warning lines shown: ${pk2.warn} · ${pk2.wave1}`],
    ['the printed sheet shows no pending wording', !pr2.err && !pr2.hasGood, pr2.err ? pr2.err + ' ' + (pr2.said || '') : `the app said "${pr2.said}" · sheet ${pr2.n} characters, begins "${pr2.head}" · reporting lines on it: ${pr2.rep || 'NONE'} · "25:70" on it: ${pr2.hasBad} · "10:10 VL RALLY" on it: ${pr2.hasGood}`],
    ['the CSV is unchanged by the pending correction and carries no pending wording', !c2.err && c2.id === c1.id && !c2.hasGood, c2.err || `${c2.name}: ${c2.n} rows (${c2.mon} for Monday), the same file as straight after publication (${c1.id} = ${c2.id}) · columns ${c2.head} · any reporting line in it: ${c2.hasIn ? 'yes' : 'none'}`],
  ], [s3a, s3b, lk2.shot, pk2.shot, pr2.shot].filter(Boolean))

  row('P2-17.3h', 'each reader before the amendment, in full', `VIEW-ONLY (admin): tag "${v2.tag}" · wave 1 "${v2.w1}" · reporting lines in its list: ${v2.rep} · bar "${v2.bar}" ||| VIEW-ONLY (member): tag "${m2.tag}" · wave 1 "${m2.w1}" · list: ${m2.rep} · bar "${m2.bar}" ||| ISSUED LOOK: ${lk2.err || `"${lk2.label}" (menu: ${lk2.versions}) · bar "${lk2.bar}" · wave 1 "${lk2.w1}" · its warning bar "${lk2.warn}" · boxes open for typing ${lk2.editable} · ${lk2.back}`} ||| PEEK: ${pk2.err || `"${pk2.head}" · reporting line shown: ${pk2.hasIn} · "25:70": ${pk2.hasBad} · "10:10": ${pk2.hasGood} · warning lines: ${pk2.warn} · ${pk2.wave1}`} ||| PRINT: ${pr2.err || `said "${pr2.said}" · ${pr2.n} characters · begins "${pr2.head}" · reporting lines on it: ${pr2.rep || 'NONE'} · a warning on Monday's part: ${pr2.monHasWarn}`} ||| CSV: ${c2.err || `${c2.name} ${c2.n} rows, ${c2.mon} Monday rows, ${c2.id}`}`, 'INFO')

  /* ---------- 4: amend, and the readers again ---------- */
  await W.toasts(p)
  const al = await T.pubAL(p, DI); const said4 = await W.toasts(p); const h4 = await T.head(p, DI)
  await W.showDay(p, DI); const s4 = await pic(p, 'p217-4-amended')
  const v4 = await viewRead(); await W.showDay(p, DI, '#vWeek'); const s4a = await pic(p, 'p217-4a-view-after-amend')
  const lkOld = await lookRead(new RegExp(ISSUED.replace(/\s+/g, ' ?'), 'i'), 'p217-4b-older-version-look')
  const pr4 = await printRead('p217-4c-print-sheet-after-amend')
  const c4 = await csvRead()
  await T.reloadAs(p, 'm'); await L.sleep(400)
  const m4 = await viewRead(); const s4d = await pic(p, 'p217-4d-view-member-after-amend')
  judge('P2-17.4', `Then amend: the four sign-offs (${Object.values(al.s).join(', ')}) + "${al.r.label || 'Publish AL'}"${al.r.pressed ? '' : ' (' + al.r.why + ')'}. The readers again.`, [
    ['the amendment goes out', al.r.pressed && h4.tag !== ISSUED && !/pending/i.test(h4.pending || ''), `tag "${ISSUED}" → "${h4.tag}", count "${h4.pending}"; the app said: ${said4.join(' | ') || '(nothing)'}`],
    ['View-only Sched (admin, then member) now shows the corrected wording and no reporting line', v4.w1.includes(GOOD) && !/recognised clock/.test(v4.rep) && m4.w1.includes(GOOD) && !/recognised clock/.test(m4.rep), `admin: tag "${v4.tag}" · "${v4.w1}" · list ${v4.rep} || member: tag "${m4.tag}" · "${m4.w1}" · list ${m4.rep}`],
    ['EXPECTED: the historical preview retains its version — the older version\'s look still reads the old wording', !lkOld.err && lkOld.w1.includes(BAD) && !lkOld.w1.includes(GOOD), lkOld.err || `"${lkOld.label}" (menu: ${lkOld.versions}) · bar "${lkOld.bar}" · wave 1 "${lkOld.w1}" · its warning bar "${lkOld.warn}"`],
    ['the CSV is still the same file (it carries no reporting lines; nothing else changed)', !c4.err && c4.id === c1.id, c4.err || `${c1.id} → ${c4.id} · ${c4.n} rows`],
  ], [s4, s4a, lkOld.shot, pr4.shot, s4d].filter(Boolean))
  row('P2-17.4h', 'each reader after the amendment, in full', `the day: tag "${h4.tag}", count "${h4.pending}", the app said ${said4.join(' | ')} ||| VIEW-ONLY (admin): tag "${v4.tag}" · wave 1 "${v4.w1}" · list: ${v4.rep} · bar "${v4.bar}" ||| VIEW-ONLY (member): tag "${m4.tag}" · wave 1 "${m4.w1}" · list: ${m4.rep} · bar "${m4.bar}" ||| OLDER VERSION LOOK: ${lkOld.err || `"${lkOld.label}" (menu: ${lkOld.versions}) · bar "${lkOld.bar}" · wave 1 "${lkOld.w1}" · its warning bar "${lkOld.warn}" · boxes open for typing ${lkOld.editable}`}`, 'INFO')
  row('P2-17.h', 'for the record: the printed sheet and the CSV at each stage', `print before the amendment: ${pr2.err || `reporting lines "${pr2.rep || 'none'}", 25:70 ${pr2.hasBad}, 10:10 ${pr2.hasGood}`} · print after: ${pr4.err || `reporting lines "${pr4.rep || 'none'}", 25:70 ${pr4.hasBad}, 10:10 ${pr4.hasGood}`} · CSV after publication ${c1.err || c1.id}, with the correction pending ${c2.err || c2.id}, after the amendment ${c4.err || c4.id}; its columns: ${c1.head || ''}; first Monday row: ${(c1.monText || '').split('\n')[0]}`, 'INFO')
})
