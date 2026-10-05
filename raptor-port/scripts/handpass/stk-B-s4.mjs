/* walker B, script 4: H-01 (no negative work hours), H-06 (words typed on Logic drawn as words), H-07 (a Logic change is one
   undo step), H-08 (the new timing warning can be hidden). Each in its own fresh world. */
import * as K from './stk-B-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'
const mins = s => { const m = /^(-)?(\d+)h(\d+)?/.exec(s || ''); return m ? (m[1] ? -1 : 1) * (+m[2] * 60 + (+m[3] || 0)) : null }
async function mkFri(p, cs, to, ld, crew) {
  const DI = 4
  const { gi, label } = await K.addFlyWave(p, DI)
  await K.ff(p, DI, gi, 0, 'cs', cs); await K.ff(p, DI, gi, 0, 'msn', 'BFM'); await K.ff(p, DI, gi, 0, 'to', to); await K.ff(p, DI, gi, 0, 'ld', ld)
  if (crew) { await K.seat(p, DI, gi, 0, 0, 'p', crew[0]); await K.seat(p, DI, gi, 0, 0, 'w', crew[1]) }
  return { gi, label }
}

async function h01() {
  const DI = 0
  const { browser, p, errors } = await K.fresh()
  try {
    await K.boardTo(p, DI)
    const pre = await p.evaluate(() => { const w = window.DAYS[0].waves[1]; return { intimes: w.intimes.slice(), f: w.formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft.map(a => a.p + '+' + a.w).join(',')}`) } })
    const crew = ['casper', 'shrek']   /* RU of the night wave: 19:20-20:45, line "1620H" */
    const names = await K.cs(p, crew)
    const H0 = await K.hours(p, names, 'h01-0-before')
    const allNeg0 = H0.all.filter(x => /=-/.test(x))
    const pa = await K.picEl(p, '#schedBoard [data-itline="0|1|1"]', 'h01-a-line-before', { pad: 70 })
    await K.ff(p, DI, 1, 1, 'to', '10:00'); await K.ff(p, DI, 1, 1, 'ld', '11:25')
    const pb = await K.picEl(p, '#schedBoard [data-itline="0|1|1"]', 'h01-b-line-after', { pad: 70 })
    const hdr = await p.evaluate(() => { const b = document.querySelector('#schedBoard [data-itadd="0|1"]'); const h = b && (b.closest('.sb-wh, .sb-wave, .sb-gh, .gh, .sb-panel, .sb-grp') || b.parentElement.parentElement); return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 260) : null })
    const lines = await K.linesOnScreen(p, 'board', DI, 1)
    const wl = await K.warnsFull(p, DI)
    await B.boardOpenFold(p)
    const bw = await B.readBoard(p)
    const pw = await K.picEl(p, '#schedBoard .sb-warn', 'h01-c-warnings', { pad: 6, maxH: 600 })
    const H1 = await K.hours(p, names, 'h01-1-after')
    const neg = H1.all.filter(x => /=-/.test(x) || /^-/.test((x.split('=')[1] || '')))
    const widest = H1.all.slice(0, 3)
    const fb = await K.feedback(p, 'board', DI, 1)
    R('H-01', `Monday board: night wave RU (crew ${names.join('+')}), take-off/landing 19:20/20:45 -> 10:00/11:25, line left as it was`,
      `before the change the lines were ${JSON.stringify(pre.intimes)}; after: board lines ${JSON.stringify(lines)}, wave header "${hdr}", reporting feedback "${fb}"; Monday warnings ${JSON.stringify(wl.map(x => x.sev + ' ' + x.code + ': ' + x.msg.slice(0, 110)))}; Work hours ${names.map(n => `${n} ${H0.h[n]}->${H1.h[n]}`).join(', ')}; negative figures in the chart before: ${JSON.stringify(allNeg0)}, after: ${JSON.stringify(neg)}; longest three bars ${JSON.stringify(widest)}`,
      neg.length === 0 && wl.length ? 'PASS' : 'FAIL', [pa, pb, pw, H0.shot, H1.shot])
  } catch (e) { R('H-01', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h01-X')]) }
  R('H-01.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h06() {
  const DI = 4
  const { browser, p, errors } = await K.fresh()
  const XSS = '<b>BOLD</b> & "QUOTES" <img src=x onerror=alert(1)>'
  try {
    const l = await K.logicSet(p, 'reportText', XSS)
    const lv = await K.logicRead(p, 'reportText')
    const w = await mkFri(p, 'XS', '12:00', '13:00', ['taipan', 'mamba'])
    await K.itAdd(p, 'week', DI, w.gi)
    const stored = await K.itLines(p, DI, w.gi)
    const probeLine = (surf) => p.evaluate(([s, i, g]) => {
      const root = s === 'board' ? document.querySelector('#schedBoard') : s === 'view' ? document.querySelector(`#vWeek .day[data-day="${i}"]`) : document.querySelector(`#eWeek .day[data-day="${i}"]`)
      if (!root) return { err: 'no root' }
      const sel = s === 'view' ? '.intimes' : `[data-itline="${i}|${g}|0"]`
      const el = root.querySelector(sel)
      if (!el) return { err: 'no line element' }
      return { text: el.textContent.trim(), kids: [...el.querySelectorAll('b,img,script,svg,iframe')].filter(x => !(x.tagName === 'B' && /^\d\d:\d\d[HL]?$/.test(x.textContent.trim()))).map(x => x.tagName), html: el.innerHTML.slice(0, 200) }
    }, [surf, DI, w.gi])
    await B.toEdit(p); await W.showDay(p, DI)
    const wk = await probeLine('week')
    const pw = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${w.gi}|0"]`, 'h06-a-week', { pad: 50 })
    await K.boardTo(p, DI)
    const bd = await probeLine('board')
    const pb = await K.picEl(p, `#schedBoard [data-itline="${DI}|${w.gi}|0"]`, 'h06-b-board', { pad: 60 })
    /* the wave's header on the board also prints the clock/words? read the whole wave header text */
    const hdr = await p.evaluate(([i, g]) => { const b = document.querySelector(`#schedBoard [data-itadd="${i}|${g}"]`); const h = b && (b.closest('.sb-panel, .sb-grp') || b.parentElement.parentElement); return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 260) : null }, [DI, w.gi])
    /* publish so View-only Sched, the printed sheet and the changes window carry it */
    const pub = await K.publishOrig(p, DI)
    await B.toEdit(p)
    await L.go(p, 'viewsched'); await B.openList(p, '#vWeek', DI); await W.showDay(p, DI, '#vWeek')
    const vw = await probeLine('view')
    const vtxt = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 1200) : null }, DI)
    const pv = await K.picEl(p, `#vWeek .day[data-day="${DI}"]`, 'h06-c-viewonly', { pad: 6, maxH: 700 })
    await B.toEdit(p)
    /* the changes window */
    await p.locator('#histBtn').click(); await sleep(700)
    { const t = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'All changes' }).first(); if (await t.count()) { await t.click(); await sleep(500) } }
    const chg = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? { text: w.innerText.replace(/\s+/g, ' ').slice(0, 800), kids: [...w.querySelectorAll('b,img,script,iframe')].map(x => x.tagName) } : null })
    const pc = await K.pic(p, 'h06-d-changes')
    await p.keyboard.press('Escape'); const x = p.locator('.chgwin:not([hidden]) .win-x').first(); if (await x.count()) await x.click().catch(() => {}); await sleep(300)
    /* the print preview: the app prints through a hidden frame; read what it holds */
    await p.locator('#exportPdf').click(); await sleep(1200)
    const print = await p.evaluate(() => { const f = document.querySelector('iframe[srcdoc]'); return f ? { len: f.srcdoc.length, hasWords: /BOLD/.test(f.srcdoc), hasRawTag: f.srcdoc.includes('<b>BOLD</b>'), hasImg: /<img src=x/.test(f.srcdoc), hasEscaped: /&lt;b&gt;BOLD/.test(f.srcdoc), hasFriday: /Friday|Fri /.test(f.srcdoc) } : null })
    /* reload and look at the week again */
    await K.boardTo(p, DI); await B.toEdit(p)
    await B.reloadAs(p, 'a'); await sleep(500); await B.toEdit(p); await W.showDay(p, DI)
    const lv2 = await K.logicRead(p, 'reportText'); await B.toEdit(p); await W.showDay(p, DI)
    const wk2 = await probeLine('week')
    const pr = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-itline="${DI}|${w.gi}|0"]`, 'h06-e-reloaded', { pad: 50 })
    const asText = o => o && !o.err && o.text.endsWith(XSS) && o.kids.length === 0
    const ok = asText(wk) && asText(bd) && asText(wk2) && lv2 === XSS
    R('H-06', 'Logic: button words set to the markup-and-quotes string; "+ In-time / Rally" on a new Friday wave; looked at the week, the board, View-only Sched (after publishing), the changes window and the print frame; reloaded',
      `Logic box after typing "${lv}" (typed: "${XSS}"); stored line ${JSON.stringify(stored)}; week ${JSON.stringify(wk)}; board ${JSON.stringify(bd)}; View-only Sched ${JSON.stringify(vw)}; changes window ${JSON.stringify(chg)}; print frame ${JSON.stringify(print)}; after reload Logic reads "${lv2}", week ${JSON.stringify(wk2)}; publish ${JSON.stringify(pub.r)}`,
      ok ? 'PASS' : 'FAIL', [pw, pb, pv, pc, pr])
  } catch (e) { R('H-06', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h06-X')]) }
  R('H-06.err', 'browser errors (a native dialog or a 404 for the image would show here)', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h07() {
  const { browser, p, errors } = await K.fresh()
  try {
    await B.toEdit(p)
    await K.boardTo(p, 0); await B.toEdit(p)    /* a first real write is not needed for Undo to be offered; look at its state */
    const vals = async () => ({ lead: await K.logicRead(p, 'reportLead'), words: await K.logicRead(p, 'reportText'), track: await trackState() })
    const trackState = async () => { await L.go(p, 'logic'); return p.evaluate(() => { const e = document.querySelector('#lgMissionMix'); if (!e) return null; const a = e.getAttribute('aria-checked'); return a != null ? a === 'true' : !!e.checked }) }
    const v0 = await vals()
    const steps = []
    const topBar = async () => p.evaluate(() => ({ undo: (document.querySelector('#undoBtn') || {}).title, redo: (document.querySelector('#redoBtn') || {}).title, undoOff: (document.querySelector('#undoBtn') || {}).disabled, redoOff: (document.querySelector('#redoBtn') || {}).disabled }))
    await W.toastSpy(p)
    const change = {
      lead: async () => { const c = await K.logicSet(p, 'reportLead', '2h'); return c },
      words: async () => { const c = await K.logicSet(p, 'reportText', 'WALK WORDS'); return c },
      track: async () => { await L.go(p, 'logic'); const ro = await p.evaluate(() => { const e = document.querySelector('#lgMissionMix'); return !e || e.getAttribute('aria-disabled') === 'true' || e.classList.contains('lg-switch-read') }); if (ro) { await p.locator('#lgEdit').click(); await sleep(500) } await p.locator('#lgMissionMix').click(); await sleep(500); const d = p.locator('#lgDone:visible').first(); if (await d.count()) { await d.click(); await sleep(400) } return 'switch pressed' },
    }
    for (const k of ['lead', 'words', 'track']) {
      const before = await vals()
      const c = await change[k]()
      const mid = await vals()
      const bar1 = await topBar()
      const u = await W.door(p, 'top', 'undo')
      const afterU = await vals()
      const bar2 = await topBar()
      const r = await W.door(p, 'top', 'redo')
      const afterR = await vals()
      const p1 = await K.pic(p, `h07-${k}`)
      steps.push({ k, before, mid, afterU, afterR, undoTitleBefore: bar1.undo, undo: { present: u.present, pressed: u.pressed, toasts: u.toasts }, redo: { pressed: r.pressed, toasts: r.toasts, title: r.title }, redoTitleAfterUndo: bar2.redo, p1 })
    }
    const onlyOne = (s, key) => { const ks = ['lead', 'words', 'track']; return ks.every(x => (x === key ? JSON.stringify(s.afterU[x]) === JSON.stringify(s.before[x]) && JSON.stringify(s.mid[x]) !== JSON.stringify(s.before[x]) : JSON.stringify(s.afterU[x]) === JSON.stringify(s.mid[x]))) }
    for (const s of steps) {
      const key = s.k
      const reverted = JSON.stringify(s.afterU[key]) === JSON.stringify(s.before[key]) && JSON.stringify(s.mid[key]) !== JSON.stringify(s.before[key])
      const restored = JSON.stringify(s.afterR[key]) === JSON.stringify(s.mid[key])
      R('H-07.' + key, `changed the ${key === 'lead' ? 'nominal report (3h -> 2h)' : key === 'words' ? 'button words (-> WALK WORDS)' : 'Track Blue/RED sorties switch (off -> on)'}, then top-bar Undo, then Redo`,
        `before ${JSON.stringify(s.before)}; after the change ${JSON.stringify(s.mid)}; the Undo button said "${s.undoTitleBefore}"; pressed ${JSON.stringify(s.undo)}; after Undo ${JSON.stringify(s.afterU)}; the Redo button then said "${s.redoTitleAfterUndo}"; Redo ${JSON.stringify(s.redo)} -> ${JSON.stringify(s.afterR)}`,
        reverted && restored ? 'PASS' : 'FAIL', [s.p1])
    }
    /* all three changed, then a reload and a fresh sign-in */
    const now = await vals()
    await B.reloadAs(p, 'a'); await sleep(500)
    const after = await vals()
    const p2 = await K.pic(p, 'h07-reloaded')
    R('H-07.reload', 'with all three changed (2h, WALK WORDS, switch on), reloaded and signed in again', `before the reload ${JSON.stringify(now)}; after ${JSON.stringify(after)}`, JSON.stringify(now) === JSON.stringify(after) && now.lead !== v0.lead && now.track === true ? 'PASS' : 'FAIL', [p2])
  } catch (e) { R('H-07', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h07-X')]) }
  R('H-07.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

async function h08() {
  const DI = 4
  const { browser, p, errors } = await K.fresh()
  try {
    const w = await mkFri(p, 'TS', '12:00', '13:00', ['taipan', 'mamba'])
    await K.itAdd(p, 'week', DI, w.gi); await K.itSet(p, 'week', DI, w.gi, 0, '10:00 RALLY')
    await B.toEdit(p); await B.openList(p, '#eWeek', DI)
    const l0 = await B.readList(p, '#eWeek', DI)
    const p0 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-dwbox="${DI}"]`, 'h08-a-flagged', { pad: 8, maxH: 400 })
    const hasX = (l0.lines || []).some(x => /rally/i.test(x.text) && x.btn === '✕')
    const pr = await B.hide(p, DI, /rally/i)
    const l1 = await B.readList(p, '#eWeek', DI)
    const rl1 = (l1.lines || []).find(x => /rally/i.test(x.text))
    const p1 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-dwbox="${DI}"]`, 'h08-b-hidden', { pad: 8, maxH: 400 })
    await B.reloadAs(p, 'a'); await sleep(500); await B.toEdit(p); await B.openList(p, '#eWeek', DI)
    const l2 = await B.readList(p, '#eWeek', DI); const rl2 = (l2.lines || []).find(x => /rally/i.test(x.text))
    const p2 = await K.picEl(p, `#eWeek .day[data-day="${DI}"] [data-dwbox="${DI}"]`, 'h08-c-after-reload', { pad: 8, maxH: 400 })
    const ag = await B.again(p, DI, /rally/i)
    const l3 = await B.readList(p, '#eWeek', DI); const rl3 = (l3.lines || []).find(x => /rally/i.test(x.text))
    R('H-08.a', 'unpublished Friday with one Rally-after-brief warning (TS 12:00, "10:00 RALLY"): tapped X on it, reloaded, tapped the undo arrow',
      `flagged: bar "${l0.bar}", the line has "${(l0.lines.find(x => /rally/i.test(x.text)) || {}).btn}" (X present: ${hasX}); after X (${pr}): bar "${l1.bar}", line struck=${rl1 && rl1.struck} hid=${rl1 && rl1.hid} btn "${rl1 && rl1.btn}"; after reload: bar "${l2.bar}", line struck=${rl2 && rl2.struck} btn "${rl2 && rl2.btn}"; after the undo arrow (${ag}): bar "${l3.bar}", line struck=${rl3 && rl3.struck} btn "${rl3 && rl3.btn}"`,
      hasX && rl1 && rl1.struck && rl2 && rl2.struck && rl3 && !rl3.struck && /1 issue|1 warning/.test(l3.bar) && !/1 issue/.test(l1.bar) ? 'PASS' : 'FAIL', [p0, p1, p2])
    /* publish with the warning showing, then hide it */
    const pub = await K.publishOrig(p, DI)
    const h1 = await B.head(p, DI)
    await B.toEdit(p); await B.openList(p, '#eWeek', DI)
    const l4 = await B.readList(p, '#eWeek', DI)
    const pr2 = await B.hide(p, DI, /rally/i)
    const h2 = await B.head(p, DI)
    const l5 = await B.readList(p, '#eWeek', DI); const rl5 = (l5.lines || []).find(x => /rally/i.test(x.text))
    const au = await B.auth(p, DI)
    const p3 = await K.picEl(p, `#eWeek .day[data-day="${DI}"]`, 'h08-d-published-hidden', { pad: 6, maxH: 800 })
    /* the published face: as the member on View-only Sched */
    const mem = await B.member(p, DI, [], 'h08-e-member-face')
    const memRally = (mem.list.lines || []).find(x => /rally/i.test(x.text))
    await B.admin(p)
    /* amend: sign four, Publish AL1 */
    const al = await K.publishAL(p, DI)
    const h3 = await B.head(p, DI)
    const mem2 = await B.member(p, DI, [], 'h08-f-member-after-AL')
    const memRally2 = (mem2.list.lines || []).find(x => /rally/i.test(x.text))
    await B.admin(p)
    R('H-08.b', 'published Friday with the warning showing (signed, Publish day); tapped X on the line on the working copy; read the day\'s bar; read the published face as the member; then signed and Published AL1',
      `after publish: tag "${h1.tag}", edit-list bar "${l4.bar}"; after X (${pr2}): chip "${h2.pending}", working line struck=${rl5 && rl5.struck}, bar "${l5.bar}", changes window "${au.win && au.win.out ? au.win.out.out.map(o => o.where + ' ' + o.chg).join(' || ') : 'none'}"; member's published face: bar "${mem.list.bar}", Rally line ${memRally ? `struck=${memRally.struck} "${memRally.text.slice(0, 60)}"` : 'absent'}; after AL1 (${JSON.stringify(al.r)}, tag "${h3.tag}"): member bar "${mem2.list.bar}", Rally line ${memRally2 ? `struck=${memRally2.struck}` : 'absent'}`,
      h2.pending && /1 pending/.test(h2.pending) && memRally && !memRally.struck ? 'PASS' : 'FAIL', [p3, mem.shot, mem2.shot].filter(Boolean))
  } catch (e) { R('H-08', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h08-X')]) }
  R('H-08.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'all' || which === 'h01') await h01()
if (which === 'all' || which === 'h06') await h06()
if (which === 'all' || which === 'h07') await h07()
if (which === 'all' || which === 'h08') await h08()
B.savePart('s4' + which)
