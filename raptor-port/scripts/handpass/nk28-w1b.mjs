// W1 part B: scenarios 3 (board), 6 (changes + ALL AVAIL windows), 4 (OIL tracker). Version: nk28-w1b v1
console.log('nk28-w1b v3' + (process.env.W1_PLAIN ? ' (PLAIN control run)' : ''))
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
const w = await world({ locked: !process.env.W1_PLAIN }); const p = w.page
await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'editsched')
const bandOf = sel => vis(p, sel)
const winsNow = () => p.evaluate(() => [...document.querySelectorAll('[class*=win], [class*=Win]')].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 120 && r.height > 80 && cs.visibility !== 'hidden' && cs.display !== 'none' && (cs.position === 'fixed' || cs.position === 'absolute') }).map(e => ({ cls: String(e.className).slice(0, 40), l: Math.round(e.getBoundingClientRect().left), t: Math.round(e.getBoundingClientRect().top), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })))

// ---- 3 board
await p.locator('.dt.sb-open').first().click(); await sleep(1500)
const sb = await bandOf('.sb-top > .saveband, .sb-top .saveband'), top = await vis(p, '.sb-top')
const firstRow = await p.evaluate(() => { const top = document.querySelector('.sb-top'); const bb = top.getBoundingClientRect(); let best = null; const root = top.parentElement; for (const e of root.querySelectorAll('*')) { if (top.contains(e) || e.closest('.topbar') || e.closest('.sb-top')) continue; const r = e.getBoundingClientRect(); if (r.width < 60 || r.height < 10 || r.top < bb.top - 1 || r.left < 0 || r.left > 700) continue; if (r.top > innerHeight) continue; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue; if (!best || r.top < best.t) best = { t: Math.round(r.top * 10) / 10, txt: e.textContent.trim().slice(0, 25), cls: String(e.className).slice(0, 25) } } return best })
const behind = await p.evaluate(() => { const b = document.querySelector('.topbar > .savestat.nokeep'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 3, r.top + r.height / 2); return e ? (e.closest('.topbar') ? 'TOPBAR BAND ON TOP' : 'covered by ' + e.tagName + '.' + String(e.className).slice(0, 20)) : 'none' })
const pic3 = await shot(p, '03-board', { clip: { x: 0, y: 0, width: 1536, height: 300 } })
const oneLine = await p.evaluate(() => { const e = document.querySelector('.sb-top .saveband'); const t = new Set(); for (const k of e.querySelectorAll('b, .sv-rest')) for (const r of k.getClientRects()) t.add(Math.round(r.top / 4)); return t.size })
ok('3 board band in its own bar', !!sb && !sb.btn && sb.text.replace(/\s*—\s*/, ' | ') === 'Not kept | this browser loses your work on a reload' && oneLine === 1 && sb.l <= 1 && sb.r >= 1535, JSON.stringify({ sb: sb && { t: sb.t, b: sb.b, l: sb.l, r: sb.r, h: sb.h }, boardBar: top && { t: top.t, b: top.b }, oneLine, topbarBand: behind }), pic3)
ok('3 board first row not covered', !!sb && !!firstRow && firstRow.t >= sb.b - 0.5, JSON.stringify({ bandB: sb && sb.b, firstRow }), pic3)
await p.click('#sbDone'); await sleep(1100)
const b2 = await vis(p, '.topbar > .savestat.nokeep'); const pic3b = await shot(p, '03-after-done', { clip: { x: 0, y: 0, width: 1536, height: 220 } })
ok('3 ✓ Done: band back in the bar', !!b2 && (await p.evaluate(() => !document.querySelector('.sb-top') || document.querySelector('.sb-top').getBoundingClientRect().width === 0 || getComputedStyle(document.querySelector('.sb-top')).visibility === 'hidden')), JSON.stringify(b2 && { t: b2.t, b: b2.b, text: b2.text }), pic3b)

// ---- 6 changes window
const bandB = ((await vis(p, '.topbar > .savestat.nokeep')) || { b: 56 }).b
await p.click('#histBtn'); await sleep(1000)
const wins = await winsNow(); const cw = await vis(p, '.chgwin')
const pic6 = await shot(p, '06-changes-open')
ok('6 changes window head below band', !!cw && cw.t >= bandB - 0.5 && !!(await vis(p, '.topbar > .savestat.nokeep')) && (await p.evaluate(() => { const b = document.querySelector('.topbar > .savestat.nokeep').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 3, b.top + b.height / 2); return !!e.closest('.topbar') })), JSON.stringify({ bandB, win: cw && { t: cw.t, b: cw.b, l: cw.l, r: cw.r } }), pic6)
// move it, close by X, reopen
const head = await p.locator('.chgwin').first().boundingBox()
const grip = { x: head.x + 14, y: head.y + 20 }
await p.mouse.move(grip.x, grip.y); await p.mouse.down(); await p.mouse.move(grip.x - 300, grip.y + 140, { steps: 12 }); await p.mouse.up(); await sleep(500)
const moved = await vis(p, '.chgwin'); const pic6b = await shot(p, '06-changes-moved')
await p.locator('.chgwin button[aria-label*=lose], .chgwin .x, .chgwin button').filter({ hasText: /✕|×|x/i }).first().click().catch(() => {}); await sleep(500)
const closed = await vis(p, '.chgwin')
await p.click('#histBtn'); await sleep(900)
const re = await vis(p, '.chgwin'); const pic6c = await shot(p, '06-changes-reopened')
ok('6 changes window moved keeps its place when reopened', !!moved && !!re && Math.abs(re.l - moved.l) <= 2 && Math.abs(re.t - moved.t) <= 2 && !closed && moved.t !== cw.t, JSON.stringify({ first: cw && [cw.l, cw.t], moved: moved && [moved.l, moved.t], closedAfterX: !closed, reopened: re && [re.l, re.t] }), pic6c)
{ const h2 = await p.locator('.chgwin').first().boundingBox(); await p.mouse.move(h2.x + 14, h2.y + 20); await p.mouse.down(); await p.mouse.move(h2.x - 200, h2.y + 220, { steps: 12 }); await p.mouse.up(); await sleep(400)
  const m2 = await vis(p, '.chgwin'); await p.click('#histBtn'); await sleep(500); const c2 = await vis(p, '.chgwin'); await p.click('#histBtn'); await sleep(700); const r2 = await vis(p, '.chgwin')
  note('6 changes window: moved, closed with its clock button, reopened', JSON.stringify({ moved: m2 && [m2.l, m2.t], closed: !c2, reopened: r2 && [r2.l, r2.t] })) }
await p.keyboard.press('Escape'); await sleep(400)
const afterEsc = await vis(p, '.chgwin')
note('6 Escape on the changes window', 'window ' + (afterEsc ? 'still shown' : 'closed'))
if (afterEsc) await p.click('#histBtn'), await sleep(500)

// ---- 6 ALL AVAIL window
await p.evaluate(() => { const e = [...document.querySelectorAll('.puck.allavail')].filter(x => !x.closest('.rpuck'))[3]; e.scrollIntoView({ block: 'center', inline: 'center' }) }); await sleep(900)
const cntEl = p.locator('.availpuck:visible, .aacount:visible, [class*=availcnt]:visible, [class*=avcnt]:visible')
const cnt = await cntEl.count(); let pkBox = null
const cands = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left > 0 && r.left < 1100 && r.top > 150 && r.top < 860 && /^\d+$/.test(e.textContent.trim()) && e.children.length === 0 && e.parentElement && /ALL AVAIL/.test(e.parentElement.textContent) && e.parentElement.getBoundingClientRect().width < 260 }).map(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height, cls: String(e.className) } }))
console.log('count chips', JSON.stringify(cands))
if (cands.length) pkBox = cands[0]
else { const pk = await p.evaluate(() => { const e = [...document.querySelectorAll('.puck.allavail')].filter(x => { const r = x.getBoundingClientRect(); return r.left > 0 && r.left < 1100 && r.top > 150 && !x.closest('.rpuck') })[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height } }); pkBox = pk }
if (!pkBox) ok('6 ALL AVAIL window', null, 'no ALL AVAIL count chip on screen')
else {
  const chip = pkBox.cls !== undefined ? pkBox : { x: pkBox.x + pkBox.width + 6, y: pkBox.y, width: 20, height: pkBox.height }
  await p.mouse.click(chip.x + chip.width / 2, chip.y + chip.height / 2); await sleep(900)
  const wn = await winsNow(); const pica = await shot(p, '06-allavail-open')
  console.log('windows after click', JSON.stringify(wn))
  const aw0 = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 150 && r.height > 120 && /ALL AVAIL/i.test(e.textContent) && e.textContent.length < 3000 && /fixed|absolute/.test(getComputedStyle(e).position) }).map(e => String(e.className).slice(0, 30) + '@' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top)).join(' | '))
  console.log('positioned elements naming ALL AVAIL:', aw0)
  const aw = await vis(p,'.aawin, .allavail-win, .aaw, [class*=aaw], [class*=avwin], [class*=avail][class*=win]')
  if (!aw) ok('6 ALL AVAIL window', null, 'tap on ALL AVAIL puck on Saturday duty: no window found; windows ' + JSON.stringify(wn), pica)
  else ok('6 ALL AVAIL window head below band', aw.t >= bandB - 0.5, JSON.stringify({ bandB, win: [aw.l, aw.t, aw.r, aw.b] }), pica)
}
await p.keyboard.press('Escape'); await sleep(300)

// ---- 4 OIL tracker
await tab(p, 'leavewar')
await p.locator('.intab', { hasText: 'OIL' }).first().click(); await sleep(1600)
const ob = await p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: e.className, par: (e.parentElement.id + '.' + e.parentElement.className).slice(0, 30), t: Math.round(e.getBoundingClientRect().top * 10) / 10, b: Math.round(e.getBoundingClientRect().bottom * 10) / 10, covered: (() => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 3, r.top + r.height / 2); return !(x && e.contains(x)) })() })))
note('4 OIL tab bands', JSON.stringify(ob))
const oilBand = await vis(p, '.oil-top .saveband')
const oilFirst = await p.evaluate(() => { const top = document.querySelector('.oil-top'); const bb = top.querySelector('.saveband').getBoundingClientRect(); let best = null; for (const e of top.parentElement.querySelectorAll('*')) { if (e.closest('.saveband') || e.closest('.topbar')) continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.top < bb.bottom - 40 || r.top > bb.bottom + 200) continue; const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) continue; if (!best || r.top < best.t) best = { t: Math.round(r.top * 10) / 10, txt: e.textContent.trim().slice(0, 20) } } return best })
ok('4 OIL tracker band under its bar, not covered', !!oilBand && !oilBand.btn && !!oilFirst && oilFirst.t >= oilBand.b - 0.5 && !ob.find(x => x.cls === 'saveband').covered, JSON.stringify({ band: oilBand && [oilBand.t, oilBand.b, oilBand.l, oilBand.r], first: oilFirst, topbarBandCovered: ob.find(x => x.cls.includes('nokeep')).covered }), 'w1/04-oil-tab.png')
await shot(p, '04-oil-tab', { clip: { x: 0, y: 0, width: 1536, height: 300 } })
if (w.errors.length) note('page errors', w.errors.join(' | '))
finish('results-b.json')
await L.closeAll()
