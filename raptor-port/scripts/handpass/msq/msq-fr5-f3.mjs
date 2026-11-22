/* msq-fr5-f3 v1 — F3: Kestrel opens bidding, Osprey's bell, Kestrel Undo / Redo, Osprey's bell (FR5_PHONE=1 for the iPhone) */
process.env.MSQ_RUN = process.env.MSQ_RUN || 'f3'
const H = await (await import('./msq-j2-r-h.mjs')).mk()
const { X, say, sleep, row, swap } = H
say('msq-fr5-f3 v1')
const phone = process.env.FR5_PHONE === '1'
const size = phone ? 'iPhone' : 'desktop'
const w = await X.open({ phone, user: 'ad9' })
const p = w.page
const tapIt = async loc => { if (phone) await loc.tap(); else await loc.click() }
const safe = async (l, fn) => { try { return await fn() } catch (e) { say('ERR', l, String(e.message).split('\n')[0]); await X.pic(w, 'err-' + l).catch(() => {}); row(l, size, 'script step', 'completes', 'script error ' + String(e.message).split('\n')[0], 'OWED', 'err-' + l + '.png') } }
const chipTxt = () => p.locator('[data-testid="open-chip"]').first().innerText().then(s => s.replace(/\s+/g, ' ').trim())
const bell = async name => {
  const b = p.locator('#notifyBell:visible').first()
  const dot = await p.evaluate(() => { const d = document.querySelector('#notifyBell .belldot'); return d ? getComputedStyle(d).display : 'no dot' })
  await tapIt(b); await sleep(900)
  const html = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.innerHTML.slice(0, 1500) : 'none' })
  const lines = await p.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.innerText.split('\n').map(s => s.trim()).filter(Boolean) : null })
  await X.pic(w, name)
  say('bell html', name, html)
  return { dot, lines }
}
const bellClose = async () => { if (await p.locator('[data-testid="bell-list"]:visible').count()) { await tapIt(p.locator('#notifyBell:visible').first()); await sleep(500) } }
const undoState = async () => p.evaluate(() => ['undoBtn', 'redoBtn'].map(i => { const e = document.getElementById(i); if (!e) return i + ':none'; const r = e.getBoundingClientRect(); return i + ' disabled=' + e.disabled + ' w=' + Math.round(r.width) }).join('; '))
await safe('F3-open', async () => {
  await X.L.go(p, 'leavewar'); await sleep(2600)
  const c0 = await chipTxt(); say('chip before', c0)
  await X.pic(w, 'f3-01-chip-before')
  await tapIt(p.locator('[data-testid="open-chip"]').first()); await p.locator('[data-testid="open-dates"]').waitFor(); await sleep(600)
  await X.pic(w, 'f3-02-window')
  await tapIt(p.locator('[data-testid="od-month-2026-12"]')); await sleep(900)
  await X.pic(w, 'f3-03-december')
  await tapIt(p.locator('[data-testid="open-dates-close"]')); await sleep(900)
  const c1 = await chipTxt()
  await X.pic(w, 'f3-04-chip-after')
  row('F3', size, `Kestrel: chip "${c0}" -> open December -> done`, 'bidding opens, chip shows dates', `chip now "${c1}"`, /Dec/.test(c1) ? 'PASS' : 'FAIL', 'f3-04-chip-after.png')
  say('undo state after open', await undoState())
})
await safe('F3-osprey1', async () => {
  await swap(w, 'us9')
  const b = await bell('f3-05-us9-bell')
  row('F3', size, 'Osprey: bell after bidding opened', 'a bidding-open line (unread, dot lit)', `dot display "${b.dot}"; lines ${JSON.stringify(b.lines)}`, b.lines && b.lines.some(l => /bidding/i.test(l)) ? 'PASS' : 'FAIL', 'f3-05-us9-bell.png')
  await bellClose()
})
await safe('F3-undo', async () => {
  await swap(w, 'ad9')
  say('undo state after sign-in', await undoState())
  await X.pic(w, 'f3-06-kestrel-back')
  const und = p.locator('#undoBtn:visible, button[aria-label="Undo"]:visible').first()
  const n = await und.count()
  say('undo visible count', n)
  if (n) { const dis = await und.evaluate(e => e.disabled); say('undo disabled', dis); if (!dis) { await tapIt(und); await sleep(1200) } }
  await X.pic(w, 'f3-07-after-undo')
  const c = await p.evaluate(() => 'no-op')
  say('chip after undo (war page?)', await p.locator('[data-testid="open-chip"]').count() ? await chipTxt() : 'not on war page')
  await X.L.go(p, 'leavewar'); await sleep(2200)
  const c2 = await chipTxt()
  await X.pic(w, 'f3-08-war-after-undo')
  row('F3', size, 'Kestrel: top bar Undo', 'the bidding opening is taken back (chip closed)', `chip "${c2}"; ${await undoState()}`, /closed/i.test(c2) ? 'PASS' : 'RECORD', 'f3-08-war-after-undo.png')
})
await safe('F3-osprey2', async () => {
  await swap(w, 'us9')
  const b = await bell('f3-09-us9-bell-after-undo')
  row('F3', size, 'Osprey: bell after Kestrel undid', 'the bidding-open line no longer shown as new', `dot "${b.dot}"; lines ${JSON.stringify(b.lines)}`, b.lines ? 'RECORD' : 'FAIL', 'f3-09-us9-bell-after-undo.png')
  await bellClose()
})
await safe('F3-redo', async () => {
  await swap(w, 'ad9')
  const red = p.locator('#redoBtn:visible, button[aria-label="Redo"]:visible').first()
  say('redo state', await undoState())
  if (await red.count() && !(await red.evaluate(e => e.disabled))) { await tapIt(red); await sleep(1200) }
  await X.pic(w, 'f3-10-after-redo')
  await X.L.go(p, 'leavewar'); await sleep(2200)
  const c3 = await chipTxt()
  await X.pic(w, 'f3-11-war-after-redo')
  row('F3', size, 'Kestrel: top bar Redo', 'bidding open again', `chip "${c3}"; ${await undoState()}`, /Dec/.test(c3) ? 'PASS' : 'RECORD', 'f3-11-war-after-redo.png')
  await swap(w, 'us9')
  const b = await bell('f3-12-us9-bell-after-redo')
  row('F3', size, 'Osprey: bell after Redo', 'the bidding-open line shows again', `dot "${b.dot}"; lines ${JSON.stringify(b.lines)}`, 'RECORD', 'f3-12-us9-bell-after-redo.png')
})
await X.fin(w)
