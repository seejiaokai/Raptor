/* Walker F — X-01 .. X-04 : Tab and the Blue/Red question; Tab through reporting lines; a failed save in the middle of Tab. */
import * as F from './stk-F-lib.mjs'
import * as X from './stk-F-fx.mjs'
const { row, judge, sleep, pic } = F
const ERRS = []
const errTxt = e => String(e.stack).split('\n').slice(0, 3).join(' <- ')
export const active = p => p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'body'; const k = e.dataset.txt || e.dataset.bfld || e.dataset.itline || (e.dataset.bombs && 'bombs:' + e.dataset.bombs) || (e.dataset.area && 'area:' + e.dataset.area) || (e.dataset.atime && 'atime:' + e.dataset.atime) || e.id || e.tagName; const r = e.getBoundingClientRect(); return { k, text: (e.value !== undefined ? e.value : e.textContent) || '', visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], caret: document.activeElement.isContentEditable || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA' } })
export const boxSel = (surf, key) => surf === 'board' ? `#schedBoard [data-bfld="${key}"]:visible, #schedBoard [data-txt="${key}"]:visible` : `#eWeek [data-txt="${key}"]:visible`
/* focus a box and replace its text, WITHOUT leaving it (the caller presses Tab) */
export async function typeIn(p, surf, key, text, { delay = 8, press = null } = {}) {
  const el = p.locator(boxSel(surf, key)).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(120)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay })
  return el
}
export async function relog(p) {
  await p.reload(); await p.waitForSelector('#luser', { state: 'visible', timeout: 15000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await sleep(600)
}
const DI = 4   // Friday: an empty flying day in the demo week

/* ---------------- X-01 ---------------- */
async function x01(surf, sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `X-01 (${surf}, ${sizeKey})`
  const pcs = []
  try {
    const checks = []
    checks.push(['Blue/Red tracking switched On on Logic', await X.tracking(p, true)])
    const fw = await X.flyWave(p, DI, {})
    checks.push(['a Friday flying wave made on the board (crew ' + fw.r1 + '/' + fw.r2 + ')', fw.r1 === 'bane' && fw.r2 === 'freak'])
    if (surf === 'week') { await X.boardOff(p); await F.go(p, 'editsched') }
    await typeIn(p, surf, `ff:${DI}.0.0.msn`, 'ACM'); await p.keyboard.press('Tab'); await sleep(300)
    const q0 = await p.locator('.mission-role-question').count()
    /* the Remarks box: type the cue, press Tab, and type at once */
    await typeIn(p, surf, `fr:${DI}.0.0.0`, 'DS for RU')
    await p.keyboard.press('Tab')
    await p.keyboard.type('X1', { delay: 15 })
    await sleep(500)
    const act = await active(p)
    const model = await X.day(p, DI)
    const rm = model[0].f[0].ac[0].rmks
    const qn = await p.locator('.mission-role-question').count()
    const qbox = await p.evaluate(() => { const q = document.querySelector('.mission-role-question'); if (!q) return null; const r = q.getBoundingClientRect(); const f = document.querySelector('[data-role-ui]'); return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), w: Math.round(r.width) } })
    const rmkBox = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } }, surf === 'board' ? `#schedBoard [data-bfld="fr:${DI}.0.0.0"]` : `#eWeek [data-txt="fr:${DI}.0.0.0"]`)
    pcs.push(await pic(p, `x01-${surf}-${sizeKey}`))
    checks.push(['no question before the Remarks edit (after Mission ACM alone)', q0 === 0, 'questions: ' + q0])
    checks.push(['Remarks saved as typed: "' + rm + '"', rm === 'DS for RU'])
    checks.push(['exactly ONE question appeared', qn === 1, 'questions: ' + qn + ' ' + JSON.stringify(qbox)])
    checks.push(['the question sits below the Remarks row of the formation', !!qbox && !!rmkBox && qbox.top >= rmkBox.bottom - 2, JSON.stringify({ q: qbox, remarks: rmkBox })])
    checks.push(['typing stayed in the destination box (the next box after Remarks) — "X1" went there', act !== 'body' && /bombs/.test(act.k) && /X1/.test(act.text), JSON.stringify(act)])
    checks.push(['the first keystroke was not consumed (text is exactly X1)', act !== 'body' && act.text.trim() === 'X1', JSON.stringify(act.text)])
    await p.keyboard.press('Escape')
    await X.later(p)
    judge(id, `tracking On; Friday ACM formation; typed "DS for RU" into Remarks, Tab, typed "X1" at once` + (surf === 'board' ? ' (board)' : ' (edit week)'), checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `x01-err-${surf}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-02 ---------------- */
async function x02(surf) {
  const c = await F.open('desk'); const { p } = c
  const id = `X-02 (${surf}, desk)`
  const pcs = []
  try {
    const checks = []
    const fw = await X.flyWave(p, DI, { to: '12:00', ld: '13:00' })
    checks.push(['Friday wave made (TO 12:00, LD 13:00; brief left blank → suggested brief 09:40)', fw.r1 === 'bane'])
    if (surf === 'week') { await X.boardOff(p); await F.go(p, 'editsched') }
    const itSel = (i) => surf === 'board' ? `#schedBoard [data-itline="${DI}|0|${i}"]:visible` : `#eWeek [data-itline="${DI}|0|${i}"]:visible`
    const addSel = surf === 'board' ? `#schedBoard [data-itadd="${DI}|0"]:visible` : `#eWeek .day[data-day="${DI}"] [data-itadd="${DI}|0"]:visible`
    /* the wave starts with one line (the app's own); the + In-time / Rally button adds the second */
    let lines0 = await X.ensureLines(p, surf, DI, 1)
    const addBtn = p.locator(addSel).first(); await addBtn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await addBtn.click(); await sleep(400)
    const lines1 = await p.evaluate(d => window.DAYS[d].waves[0].intimes.slice(), DI)
    checks.push(['In-time line present, then "+ In-time / Rally" added a second', lines0.length >= 1 && lines1.length === lines0.length + 1, JSON.stringify({ before: lines0, after: lines1 })])
    /* edit: line 0 = In-time 08:00, line 1 = Rally 10:00 (AFTER the 09:40 suggested brief → red) */
    const l0 = p.locator(itSel(0)).first(); await l0.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await l0.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('08:00 IN TIME', { delay: 8 })
    const n0 = await p.evaluate(() => window.commandStreamLen())
    await p.keyboard.press('Tab'); await sleep(350)
    let a1 = await active(p)
    checks.push(['Tab from line 1 lands in line 2 (the next reporting line)', a1 !== 'body' && /itline/.test(JSON.stringify(a1.k)) || (a1 !== 'body' && String(a1.k).includes('|0|1')), JSON.stringify(a1)])
    await p.keyboard.press('Control+A'); await p.keyboard.type('10:00 RALLY', { delay: 8 })
    await p.keyboard.press('Tab'); await sleep(500)
    const a2 = await active(p)
    const w1 = (await X.warns(p, DI)).filter(w => /rally|suggested brief/i.test(w.msg))
    const feed = await p.evaluate(() => [...document.querySelectorAll('.itfeed, .itwarn, .intime-note, [class*=itnote], [class*=rally]')].map(e => e.innerText.trim()).filter(Boolean).slice(0, 4))
    pcs.push(await pic(p, `x02-${surf}-outoforder`))
    const lines2 = await p.evaluate(d => window.DAYS[d].waves[0].intimes.slice(), DI)
    checks.push(['both lines committed as typed', /08:00/.test(lines2[0] || '') && /10:00/.test(lines2[1] || ''), JSON.stringify(lines2)])
    checks.push(['a red warning names the Rally/brief pair and says "suggested brief"', w1.some(w => w.sev === 'hard' && /suggested brief/i.test(w.msg)), JSON.stringify(w1.map(w => w.sev + ' ' + w.msg))])
    checks.push(['Tab after line 2 left the lines for the next box (not stuck / not blank)', a2 !== 'body', JSON.stringify(a2)])
    const cmds1 = await p.evaluate(() => window.commandStreamLen())
    checks.push(['each commit made exactly one command (2 edits → +2)', cmds1 - n0 === 2, `n0=${n0} now=${cmds1}`])
    /* correct the Rally (Shift+Tab back into it): 09:30 */
    await p.keyboard.press('Shift+Tab'); await sleep(300)
    const a3 = await active(p)
    checks.push(['Shift+Tab goes back to the Rally line (line 2)', a3 !== 'body' && String(a3.k).includes(`${DI}|0|1`), JSON.stringify(a3)])
    await p.keyboard.press('Control+A'); await p.keyboard.type('09:30 RALLY', { delay: 8 })
    await p.keyboard.press('Shift+Tab'); await sleep(500)
    const a4 = await active(p)
    const w2 = (await X.warns(p, DI)).filter(w => /rally|suggested brief/i.test(w.msg))
    const lines3 = await p.evaluate(d => window.DAYS[d].waves[0].intimes.slice(), DI)
    pcs.push(await pic(p, `x02-${surf}-corrected`))
    checks.push(['Rally corrected to 09:30 and committed; focus moved back to line 1', /09:30/.test(lines3[1] || '') && a4 !== 'body' && String(a4.k).includes(`${DI}|0|0`), JSON.stringify({ lines3, a4: a4.k })])
    checks.push(['the red warning is gone (no stale warning)', w2.length === 0, JSON.stringify(w2.map(w => w.msg))])
    const cmds2 = await p.evaluate(() => window.commandStreamLen())
    checks.push(['correction made exactly one more command', cmds2 - cmds1 === 1, `now=${cmds2} was ${cmds1}`])
    judge(id, `Friday wave, In-time 08:00 and Rally 10:00 (brief blank): Tab through, read the warning, Shift+Tab back and corrected to 09:30` + ` (${surf})`, checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `x02-err-${surf}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- X-04 ---------------- */
async function x04(surf) {
  const c = await F.open('desk'); const { p } = c
  const id = `X-04 (${surf}, desk)`
  const pcs = []
  try {
    const checks = []
    const fw = await X.flyWave(p, DI, {})
    checks.push(['Friday wave made', fw.r1 === 'bane'])
    if (surf === 'week') { await X.boardOff(p); await F.go(p, 'editsched') }
    await F.breakStorage(p)
    const steps = [['cs', `ff:${DI}.0.0.cs`, 'ABX'], ['msn', `ff:${DI}.0.0.msn`, 'BFM'], ['br', `ff:${DI}.0.0.br`, '09:30']]
    const trace = []
    let el = await typeIn(p, surf, steps[0][1], steps[0][2], { delay: 30 })
    for (let i = 0; i < steps.length; i++) {
      if (i > 0) await p.keyboard.type(steps[i][2], { delay: 120 })   // slow, so the band lands in the middle of this typing
      const before = await F.look(p, '.topbar > .savestat')
      await p.keyboard.press('Tab'); await sleep(i === 0 ? 700 : 150)
      const a = await active(p)
      const fl = await p.evaluate(() => !!document.querySelector('.topbar > .savestat.failed, .saveband'))
      trace.push({ edit: steps[i][0], then: a === 'body' ? 'body' : a.k, visible: a !== 'body' && a.visible, bandUp: fl })
    }
    await sleep(1500)
    const up = await p.waitForSelector('.topbar > .savestat.failed', { timeout: 12000 }).then(() => true, () => false)
    const model = await X.day(p, DI)
    const f0 = model[0].f[0]
    pcs.push(await pic(p, `x04-${surf}-failed`))
    checks.push(['the three edits are all in the schedule (cs, mission, brief)', f0.cs === 'ABX' && f0.msn === 'BFM' && /09:?30/.test(f0.br || ''), JSON.stringify({ cs: f0.cs, msn: f0.msn, br: f0.br })])
    checks.push(['each Tab moved focus to the next box, and it stayed visible (focus trace)', trace.every(t => t.then !== 'body' && t.visible), JSON.stringify(trace)])
    checks.push(['the warning band came up during the sequence', up, 'band during trace: ' + JSON.stringify(trace.map(t => t.bandUp))])
    /* restore on the Retry press, then reload */
    await F.fixOnRetryPress(p)
    const retrySel = (await p.locator('#schedBoard .saveband button:visible').count()) ? '#schedBoard .saveband button' : '.topbar > .savestat button'
    await F.pressRetry(c, retrySel)
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat') && !document.querySelector('.saveband'), null, { timeout: 9000 }).then(() => true, () => false)
    checks.push(['Retry with storage restored saved: the warning went', gone])
    await sleep(800)
    await relog(p)
    const after = await X.day(p, DI)
    const g0 = after[0] && after[0].f[0]
    pcs.push(await pic(p, `x04-${surf}-reloaded`))
    checks.push(['after a reload and sign-in, all three values are still there', !!g0 && g0.cs === 'ABX' && g0.msn === 'BFM' && /09:?30/.test(g0.br || ''), JSON.stringify(g0 && { cs: g0.cs, msn: g0.msn, br: g0.br })])
    judge(id, `storage refusing from the first commit; Tab through callsign → mission → brief (typed slowly so the band lands mid-typing); Retry; reload (${surf})`, checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `x04-err-${surf}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

const only = (process.env.F_ONLY || '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
if (want('1')) { await x01('week', 'desk'); await x01('board', 'desk') }
if (want('1') || want('1p')) await x01('board', 'phone')
if (want('2')) { await x02('week'); await x02('board') }
if (want('4')) { await x04('week'); await x04('board') }
console.log('ERRORS', ERRS.length ? ERRS.join(' | ') : 'none')
F.savePart('x1-' + (process.env.F_RUN || 'x'), { errors: ERRS, pics: F.pics })
