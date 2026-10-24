// WALKER 1 — scenario 20 (every Manning counter, Available P and Available W, and a renamed row) and scenario 21 (at a person's speed).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=20,21] node scripts/handpass/lw-night-w1-i.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-i v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s2[01]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s${o}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const AMB = { border: /229, 168, 59/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function setCounterAmber(w, ruleId, amber, red = null) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await openRows(w)
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  await P.locator(T('cform-amber')).fill(String(amber))
  if (red !== null) await P.locator(T('cform-red')).fill(String(red))
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('counter window stayed open: ' + (await L.sheetDump(P))?.text?.slice(0, 200))
}
async function setPoints(w, rowId, amberText, redText, newName = null) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await openRows(w)
  await L.press(w, T(`fly-name-${rowId}`)); await P.waitForSelector(T('cform-amber-pt'), { timeout: 4000 })
  if (newName !== null) await P.locator(T('cform-name')).fill(newName)
  await P.locator(T('cform-amber-pt')).fill(amberText); await P.locator(T('cform-red-pt')).fill(redText)
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('window stayed open')
}
async function readThresholds(w, ruleId) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await openRows(w)
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  const o = { amber: await P.locator(T('cform-amber')).inputValue(), red: await P.locator(T('cform-red')).inputValue() }
  await L.press(w, T('cform-cancel')); await P.waitForTimeout(400)
  await L.closeAny(w)
  for (const t of ['manning-info-close', 'counter-cancel']) if (await L.vis(P, T(t))) { await L.press(w, T(t)); await P.waitForTimeout(250) }
  return o
}
const cellOf = async (P, id, iso) => { const c = await H.rowCell(P, `count-${id}-${iso}`); return c }
const rowLabel = (P, rowTestid) => P.evaluate(sel => { const e = document.querySelector(sel); return e ? { text: e.textContent.trim(), visible: [...e.querySelectorAll('*')].filter(x => x.getBoundingClientRect().width > 1).map(x => x.textContent.trim()).filter(Boolean).slice(0, 4) } : null }, T(rowTestid))
const words = (name, lvl) => `This bid takes ${name} lower, still ${lvl}.`

for (const size of SIZES) {
  const phone = size === 'phone'
  const w = await H.startWorld(size)
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}) } }

  await sc(20, async () => {
    const counters = [
      { id: 'sets', day: '2026-12-08', bidders: ['Ridge', 'Echo', 'Cutter'] },
      { id: 'ip', day: '2026-12-09', bidders: ['Hunter'] },
      { id: 'iwso', day: '2026-12-10', bidders: ['Basher'] },
      { id: 'opsp', day: '2026-12-11', bidders: ['Gambit'] },
      { id: 'opsw', day: '2026-12-14', bidders: ['Cutter'] },
      { id: 'sxo', day: '2026-12-15', bidders: ['Anvil'] },
    ]
    for (const c of counters) {
      try {
        await P.evaluate(() => window.scrollTo(0, 0))
        await H.availP(w, c.day)
        const lab = (await rowLabel(P, `manning-info-${c.id}`))
        const orig = await readThresholds(w, c.id)
        const v = Number((await cellOf(P, c.id, c.day)).text)
        await setCounterAmber(w, c.id, v + 1)
        const before = await cellOf(P, c.id, c.day)
        if (H.levelOf(before) !== 'amber') throw new Error(`${c.id} on ${c.day}: ${before.text} is ${H.levelOf(before)}, not amber (amber below ${v + 1})`)
        let used = null, seen = null, after = null, b = null, k = null
        for (const who of c.bidders) {
          const r = await H.bidType(w, ids[who], c.day, { type: 'LL', inView: true, approve: false, name: `s20-${size}-${c.id}-after-tap` })
          seen = r.seen; k = r.k; used = who
          after = await cellOf(P, c.id, c.day)
          b = await H.bubbleNow(P)
          if (Number(after.text) < v) break
          await H.dismissBubble(w)
        }
        const moved = Number(after.text) < v
        const pic = await H.cropPic(w, `s20-${size}-${c.id}-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`count-${c.id}-${c.day}`)])
        const name = (lab?.text || '').replace(/\s+/g, ' ')
        judge(`S20 counter ${c.id} (row "${name}") amber, one bid lowers it`, size, [
          ['LL pending on the cell', !!k && k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k)],
          [`the counter fell (${before.text} → ${after.text}) by ${used}`, moved, `${before.text} → ${after.text}`],
          ['still amber', H.levelOf(after) === 'amber', H.levelOf(after)],
          ['a bubble is up', b.where !== 'none', H.bubbleLine(b)],
          [`words name the row's own name "${name}" and say still amber`, b.text.toLowerCase() === words(name, 'amber').toLowerCase(), `"${b.text}" vs "${words(name, 'amber')}"`],
          ['amber colour (not red)', b.level === 'amber' && AMB.border.test(b.border || ''), `${b.level} ${b.border}`],
          ['box inside the screen', !!b.inside, JSON.stringify(b.rect)],
        ], `row label as drawn: ${JSON.stringify(lab)}; ${before.text} → ${after.text} (${H.levelOf(after)}) by ${used}; right after: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}`, [`s20-${size}-${c.id}-after-tap.png`, pic].filter(Boolean))
        await H.dismissBubble(w)
        await setCounterAmber(w, c.id, orig.amber, orig.red)
      } catch (e) { rec(`S20 counter ${c.id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 400)); await H.closeAll(w).catch(() => {}) }
    }
    /* a red variant on IP: amber below v+2, red below v+1 → the bid goes "lower, still red" */
    try {
      const day = '2026-12-16'
      await P.evaluate(() => window.scrollTo(0, 0)); await H.availP(w, day)
      const v = Number((await cellOf(P, 'ip', day)).text)
      const origIp = await readThresholds(w, 'ip')
      await setCounterAmber(w, 'ip', v + 2, v + 1)
      const before = await cellOf(P, 'ip', day)
      if (H.levelOf(before) !== 'red') throw new Error(`IP ${before.text} is ${H.levelOf(before)}, not red`)
      const r = await H.bidType(w, ids.Trident, day, { type: 'LL', inView: true, approve: false, name: `s20-${size}-ip-red-after-tap` })
      const b = await H.bubbleNow(P), after = await cellOf(P, 'ip', day)
      const pic = await H.cropPic(w, `s20-${size}-ip-red-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`count-ip-${day}`)])
      judge('S20 counter ip red, one bid lowers it', size, [
        [`the counter fell ${before.text} → ${after.text}, still red`, Number(after.text) === v - 1 && H.levelOf(after) === 'red', `${after.text} ${H.levelOf(after)}`],
        ['a bubble is up with the row’s name and "still red", in red', b.text === 'This bid takes IP lower, still red.' && b.level === 'red' && RED.border.test(b.border || '') && RED.bg.test(b.bg || '') && RED.ink.test(b.color || ''), `${H.bubbleLine(b)}`],
      ], `${before.text} red → ${after.text} ${H.levelOf(after)}; ${H.bubbleLine(b)}`, [`s20-${size}-ip-red-after-tap.png`, pic].filter(Boolean))
      await H.dismissBubble(w)
      await setCounterAmber(w, 'ip', origIp.amber, origIp.red)
    } catch (e) { rec('S20 counter ip red', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 400)); await H.closeAll(w).catch(() => {}) }
    /* Available P and Available W at amber */
    for (const q of [{ row: 'availp', rid: 'avail-p', req: 'p', day: '2026-12-17', who: 'Ridge', name: 'Available P' }, { row: 'availw', rid: 'avail-w', req: 'w', day: '2026-12-18', who: 'Echo', name: 'Available W' }]) {
      try {
        await P.evaluate(() => window.scrollTo(0, 0))
        const a0 = await (async () => { await L.reachCell(w, 'bane', q.day); if (!(await P.locator(T(`${q.rid}-${q.day}`)).count())) await openRows(w); return (await P.locator(T(`${q.rid}-${q.day}`)).first().innerText()).trim() })()
        await H.setReq(w, q.day, Number(a0) - 4, q.req)
        await setPoints(w, q.rid, '+ 6', '+ 0')
        const rl = await rowLabel(P, `fly-name-${q.rid}`)
        const before = await H.rowCell(P, `${q.rid}-${q.day}`)
        if (H.levelOf(before) !== 'amber') throw new Error(`${q.name} on ${q.day}: ${before.text} is ${H.levelOf(before)}, not amber`)
        const r = await H.bidType(w, ids[q.who], q.day, { type: 'LL', inView: true, approve: false, name: `s20-${size}-${q.row}-after-tap` })
        const b = await H.bubbleNow(P), after = await H.rowCell(P, `${q.rid}-${q.day}`)
        const pic = await H.cropPic(w, `s20-${size}-${q.row}-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`${q.rid}-${q.day}`)])
        judge(`S20 ${q.name} amber, one ${q.who === 'Echo' ? 'WSO' : 'pilot'} bid lowers it`, size, [
          ['LL pending', r.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(r.k)],
          [`${q.name} fell ${before.text} → ${after.text}, still amber`, Number(after.text) === Number(before.text) - 1 && H.levelOf(after) === 'amber', `${after.text} ${H.levelOf(after)}`],
          [`words "${words(q.name, 'amber')}"`, b.text === words(q.name, 'amber'), b.text],
          ['amber colour', b.level === 'amber' && AMB.border.test(b.border || ''), `${b.level} ${b.border}`],
          ...(q.who === 'Echo' ? [['a WSO’s bid does not name Available P', !/Available P/.test(b.text || ''), b.text]] : []),
        ], `row label as drawn on the ${size}: ${JSON.stringify(rl)}; ${before.text} → ${after.text}; right after: ${H.bubbleLine(r.seen)}; settled: ${H.bubbleLine(b)}`, [`s20-${size}-${q.row}-after-tap.png`, pic].filter(Boolean))
        await H.dismissBubble(w)
      } catch (e) { rec(`S20 ${q.name}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 400)); await H.closeAll(w).catch(() => {}) }
    }
    /* Available P renamed: the bubble uses the new name; the phone's row label vs the bubble */
    try {
      const day = '2026-12-21'
      await P.evaluate(() => window.scrollTo(0, 0))
      const a0 = await (async () => { await L.reachCell(w, 'bane', day); if (!(await P.locator(T(`avail-p-${day}`)).count())) await openRows(w); return (await P.locator(T(`avail-p-${day}`)).first().innerText()).trim() })()
      await H.setReq(w, day, Number(a0) - 4, 'p')
      const NEW = 'Pilots on the ground'
      await setPoints(w, 'avail-p', '+ 6', '+ 0', NEW)
      await P.waitForTimeout(400)
      const lab = await rowLabel(P, 'fly-name-avail-p')
      const before = await H.rowCell(P, `avail-p-${day}`)
      const r = await H.bidType(w, ids.Ridge, day, { type: 'LL', inView: true, approve: false, name: `s20-${size}-renamed-after-tap` })
      const b = await H.bubbleNow(P), after = await H.rowCell(P, `avail-p-${day}`)
      const pic = await H.cropPic(w, `s20-${size}-renamed-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T('fly-name-avail-p'), T(`avail-p-${day}`)])
      judge('S20 Available P renamed: the bubble uses the new name', size, [
        ['the row was renamed (its label shows the new name or its short form)', /Pilots on the ground|AVAIL P|Avail P/i.test(JSON.stringify(lab)), JSON.stringify(lab)],
        [`words "${words(NEW, 'amber')}"`, b.text === words(NEW, 'amber'), b.text],
        ['Available P fell and stands amber', Number(after.text) === Number(before.text) - 1 && H.levelOf(after) === 'amber', `${before.text} ${H.levelOf(before)} → ${after.text} ${H.levelOf(after)}`],
      ], `row label as drawn on the ${size}: ${JSON.stringify(lab)}; bubble: ${H.bubbleLine(b)}`, [`s20-${size}-renamed-after-tap.png`, pic].filter(Boolean))
      await H.dismissBubble(w)
    } catch (e) { rec('S20 renamed', size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 400)); await H.closeAll(w).catch(() => {}) }
  })
  rec('errors-20', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`i-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
