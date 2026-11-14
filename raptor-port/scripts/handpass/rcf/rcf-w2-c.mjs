console.log('rcf-w2-c v1 — W2 item 5 (S17 + S02 / F3), desktop then phone')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'c1'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/' + RUN)
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep, check, PASSIF, shot } = W
const { DI, readAll } = F
const browser = await W.launch()
const boxes = (page, gi, n, scope = '#schedBoard') => page.evaluate(([d, gi, n, scope]) => {
  const out = []
  for (let f = 0; f < n; f++) for (const k of ['to', 'ld']) {
    const els = [...document.querySelectorAll(`${scope} [data-bfld="ff:${d}.${gi}.${f}.${k}"]`)].filter(e => e.getBoundingClientRect().width > 0)
    const e = els[0]; if (!e) { out.push(`${f}.${k}:none`); continue }
    const cs = getComputedStyle(e)
    out.push(`${f}.${k}:"${e.value}" cls=[${String(e.className).replace(/\s+/g, ' ')}] border=${cs.borderColor} bg=${cs.backgroundColor}`)
  }
  return out
}, [DI, gi, n, scope])
const wbad = page => page.evaluate(d => [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .badtm`)].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName}.${String(e.className).replace(/\s+/g, '.')}"${(e.value || e.innerText || '').trim()}"`), DI)
const weekBoxes = (page, gi, n) => page.evaluate(([d, gi, n]) => {
  const out = []
  const day = document.querySelector(`#eWeek .day[data-day="${d}"]`)
  const els = day ? [...day.querySelectorAll('.tm, .tmb, [class*=samet], .warn-time')].filter(e => e.getBoundingClientRect().width > 0) : []
  return els.slice(0, 12).map(e => `${e.tagName}.${String(e.className).replace(/\s+/g, ' ')} "${(e.value || e.innerText || '').trim()}"`)
}, [DI, gi, n])
const crop = async (page, sel, name) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150); await l.screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }); return name + '.png' }
const warnCrop = (page, name) => page.locator('#schedBoard .sb-warn').first().screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }).then(() => name + '.png')

for (const phone of (process.env.PHONE_ONLY ? [true] : [false, true])) {
  const sz = phone ? 'P' : 'D'
  const { page } = await W.world(browser, { phone })
  const bane = await W.pid(page, 'Ranger'), stiff = await W.pid(page, 'Saber'), wolf = await W.pid(page, 'Havoc')
  await W.openBoard(page, DI)
  const gi = await W.addWave(page, DI, '')
  await W.setF(page, `ff:${DI}.${gi}.0.cs`, 'VL'); await W.setF(page, `ff:${DI}.${gi}.0.to`, '1500'); await W.setF(page, `ff:${DI}.${gi}.0.ld`, '1500')
  await W.press(page, `[data-gline="${DI}.${gi}"]`); await sleep(400)
  await W.setF(page, `ff:${DI}.${gi}.1.cs`, 'VL'); await W.setF(page, `ff:${DI}.${gi}.1.to`, '1500'); await W.setF(page, `ff:${DI}.${gi}.1.ld`, '1500')
  await W.press(page, `[data-gline="${DI}.${gi}"]`); await sleep(400)
  await W.setF(page, `ff:${DI}.${gi}.2.cs`, 'AX'); await W.setF(page, `ff:${DI}.${gi}.2.to`, '1500'); await W.setF(page, `ff:${DI}.${gi}.2.ld`, '1500')
  console.log(sz, 'formations', JSON.stringify(await page.evaluate(([d, gi]) => window.DAYS[d].waves[gi].formations.map(f => [f.cs, f.to, f.ld]), [DI, gi])))
  const r1 = await L.put(page, `[data-slot="${DI}.${gi}.0.0.p"]`, [bane])
  const r2 = await L.put(page, `[data-slot="${DI}.${gi}.1.0.p"]`, [stiff]); const r3 = await L.put(page, `[data-slot="${DI}.${gi}.2.0.p"]`, [wolf]); console.log('r3', r3)
  console.log(sz, 'put', r1, r2)
  await W.openWarnFold(page)
  let o = await readAll(page, bane, sz + ' built')
  const same = o.lines.filter(l => /same|T\/O|take-off|landing|time/i.test(l) && !/not published/.test(l))
  console.log(sz, 'same-time-ish lines', JSON.stringify(same))
  const b0 = await boxes(page, gi, 3)
  const wb0 = await wbad(page)
  console.log(sz, 'boxes before hide', JSON.stringify(b0))
  const pic0 = await warnCrop(page, `s17-${sz}-0-list`); await shot(page, `s17-${sz}-0-board`)
  const ixl = same.find(l => /same/i.test(l)) || same[0]
  if (!ixl) { check(`S17.${sz}.0 fixture`, 'NOT WALKED', 'no same-time warning line appeared: ' + JSON.stringify(o.lines), pic0); await page.close(); continue }
  const ix = Number(ixl.split(':')[0])
  /* hide */
  await W.hideIx(page, DI, ix)
  await shot(page, `s17-${sz}-1-hidden-immediate`)
  await sleep(500)
  o = await readAll(page, bane, sz + ' same-time hidden')
  const b1 = await boxes(page, gi, 3)
  const w1 = await wbad(page)
  console.log(sz, 'boxes after hide', JSON.stringify(b1))
  console.log(sz, 'WEEK boxes after hide', JSON.stringify(w1))
  const plain = s => !/badtm/.test(s), amber = s => /badtm/.test(s)
  PASSIF(`S17.${sz}.1b BOTH VL lines' amber time boxes plain on the BOARD; the AX line keeps its own`, b1.slice(0, 4).every(plain) && b1.slice(4, 6).every(amber), b1.map(s => s.split(' border')[0]).join(' | '))
  PASSIF(`S17.${sz}.1c the same on the WEEK (amber time boxes left: only the two AX boxes expected; before the hide: ${wb0.length})`, wb0.length === 6 && w1.length === 2, `before hide ${wb0.length} amber boxes: ${wb0.join(' | ')} ## after hide ${w1.length}: ${w1.join(' | ')}`)
  const amberCount = arr => arr.filter(s => /amber|warn|adv|sametime|same/i.test(s.split(' cls=')[1] || '')).length
  const hidLines = o.lines.filter(l => /HID/.test(l))
  check(`S17.${sz}.1 hide the same-time warning: list shows it struck`, hidLines.length ? 'PASS' : 'FAIL', JSON.stringify(o.lines), `s17-${sz}-0-list.png`)
  await warnCrop(page, `s17-${sz}-1-list`)
  await shot(page, `s17-${sz}-1-board`)
  /* which line carries which box class? print classes per formation */
  check(`S17.${sz}.2 (record) time-box classes before / after the hide`, 'RECORD', 'before: ' + b0.join(' || ') + ' ## after: ' + b1.join(' || '), `s17-${sz}-1-board.png`)
  await crop(page, `#schedBoard [data-bfld="ff:${DI}.${gi}.0.to"]`, `s17-${sz}-1-line0-time`)
  /* reset (↺) */
  const ixh = Number((o.lines.find(l => /HID/.test(l)) || '0').split(':')[0])
  await W.hideIx(page, DI, ixh)
  await sleep(500)
  o = await readAll(page, bane, sz + ' same-time reset')
  const b2 = await boxes(page, gi, 3)
  const w2 = await wbad(page)
  console.log(sz, 'boxes after reset', JSON.stringify(b2))
  PASSIF(`S17.${sz}.3b after ↺ Reset: both VL lines amber again (board and week)`, b2.slice(0, 4).every(amber) && w2.length === 6, 'board ' + b2.map(s => s.split(' border')[0]).join(' | ') + ' ## week ' + w2.length + ': ' + w2.join(' | '))
  check(`S17.${sz}.3 ↺ Reset: warning live again`, o.lines.some(l => /:live/.test(l) && /same/i.test(l)) ? 'PASS' : 'FAIL', JSON.stringify(o.lines) + ' ## boxes: ' + b2.join(' || '), `s17-${sz}-3-reset-board.png`)
  await shot(page, `s17-${sz}-3-reset-board`)
  await page.close()
}
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify({ results: W.results, errors: W.errorsAll }, null, 1))
console.log('ERRORS', JSON.stringify(W.errorsAll.slice(0, 5)))
await browser.close()
console.log('DONE', W.results.filter(r => r.verdict === 'PASS').length + '/' + W.results.length)
