// W1 part D: scenario 5 (medical view) and 7 (an input's own window, a question box). Version: nk28-w1d v2
console.log('nk28-w1d v2')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
const w = await world({}); const p = w.page
await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'inputs')
await p.click('#inMedBtn'); await sleep(900)
await p.locator('.medcard', { hasText: 'Zenith' }).first().click(); await sleep(1200)
const band = await vis(p, '.topbar > .savestat.nokeep'), bar = await vis(p, '.topbar'), dv = await vis(p, '#docViewPop')
const under = await p.evaluate(() => { const b = document.querySelector('.topbar > .savestat.nokeep').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 3, b.top + b.height / 2); return e ? (e.closest('.topbar') ? 'band on top (topbar)' : 'covered by ' + e.tagName + '.' + String(e.className).slice(0, 20)) : 'none' })
const pic5 = await shot(p, '05-medical-viewer')
ok('5 medical document view: band above it, not covered', !!band && !!dv && dv.t >= band.b - 0.5 && under.startsWith('band on top'), JSON.stringify({ band: band && [band.t, band.b], viewer: dv && [dv.l, dv.t, dv.r, dv.b], probeAtBand: under, barBottom: bar && bar.b }), pic5)
note('5 which surface', 'the opened document viewer (#docViewPop): from Inputs → Medical → the Zenith card (2 documents); it stands below the top bar and the band, grey over the page behind; the band is the top bar\'s own (no separate band under a viewer bar)')
// 7: Edit input
await p.locator('button', { hasText: 'Edit input' }).first().click(); await sleep(1300)
const pic7 = await shot(p, '07-input-window')
const fx = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 150 && r.height > 100 && cs.position === 'fixed' && cs.visibility !== 'hidden' }).map(e => (e.id ? '#' + e.id : '') + '.' + String(e.className).slice(0, 30) + ' ' + [Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().right), Math.round(e.getBoundingClientRect().bottom)].join(',')).join(' | '))
const bandNow = await p.evaluate(() => { const b = document.querySelector('.topbar > .savestat.nokeep'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 3, r.top + r.height / 2); const bar = document.querySelector('.topbar'); const e2 = document.elementFromPoint(700, 20); return { atBand: e ? e.tagName + '.' + String(e.className).slice(0, 30) : 'none', topbarClickable: !!(e2 && bar.contains(e2)), atBarMid: e2 ? e2.tagName + '.' + String(e2.className).slice(0, 30) : 'none' } })
note('7 input window: what is at the top', JSON.stringify({ fixedSurfaces: fx, probe: bandNow, bandStillInDom: true }), pic7)
// question box: type in a box then press the X
const ta = p.locator('textarea:visible, input[type=text]:visible').first()
let q = 'no editable box found'
try {
  const n = await p.locator('textarea:visible').count()
  if (n) { await p.locator('textarea:visible').first().fill('walk edit'); await sleep(300) }
  await p.keyboard.press('Escape'); await sleep(900)
  const pic7b = await shot(p, '07-question-box')
  q = await p.evaluate(() => document.body.innerText.match(/lose them\?|Close it and lose[^\n]*/i)?.[0] || 'no question text found')
  const fx2 = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 80 && r.height > 40 && ['fixed', 'absolute'].includes(getComputedStyle(e).position) && /lose them|Keep editing|Close it/i.test(e.textContent) && e.textContent.length < 400 }).map(e => String(e.className).slice(0, 30) + ' ' + [Math.round(e.getBoundingClientRect().left), Math.round(e.getBoundingClientRect().top), Math.round(e.getBoundingClientRect().right), Math.round(e.getBoundingClientRect().bottom)].join(',')).join(' | '))
  note('7 question box ("Close it and lose them?")', JSON.stringify({ text: q, surfaces: fx2 }), pic7b)
} catch (e) { ok('7 question box', null, 'could not raise: ' + String(e.message).split('\n')[0]) }
if (w.errors.length) note('page errors', w.errors.join(' | '))
finish('results-d.json')
await L.closeAll()
