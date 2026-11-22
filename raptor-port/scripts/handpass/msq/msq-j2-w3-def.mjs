/* msq-j2-w3-def v1 — W3-D, E, F-probe (world 2): the master archives a 149 man by touch; 142's plain admin refused; 149's admin round */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'de1'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, U, say, sleep, row } = H
say('msq-j2-w3-def v1')
const w = await X.open({ phone: true, user: 'ad' })
const { page } = w
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const FIND = 'input[aria-label="Find a callsign or sign-in"]'
const openUsers = async cs => {
  await X.L.go(page, 'admin'); await sleep(1000)
  const f = page.locator(FIND)
  if (!(await f.isVisible())) { const t = page.locator('button:visible', { hasText: /^Users/ }).first(); if (await t.count()) { await t.tap(); await sleep(800) } }
  await f.fill(cs); await sleep(700)
  const pid = await U.pidOf(page, cs)
  const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
  if (!(await tap.count())) return { pid, opened: false }
  await tap.tap(); await sleep(900)
  return { pid, opened: true }
}
const controls = pid => page.evaluate(pid => {
  const root = document.querySelector(`.acc-row[data-person="${pid}"]`)
  const scope = root ? [root, root.nextElementSibling, root.parentElement].filter(Boolean) : []
  const seen = new Set(), out = []
  for (const s of scope) for (const e of s.querySelectorAll('button,input,select,[role=button]')) {
    if (seen.has(e)) continue; seen.add(e)
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
    out.push(`${e.tagName}#${e.id || ''}[${(e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 30)}]@${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`)
  }
  return out
}, pid)
const cells = async (pid, isos) => page.evaluate(([pid, isos]) => isos.map(i => { const c = document.querySelector(`[data-testid="cell-${pid}-${i}"]`); return i.slice(5) + '=' + (c ? (c.innerText.replace(/\s+/g, ' ').trim() || '·') + (c.className ? '{' + String(c.className).replace(/\s+/g, '.').slice(0, 40) + '}' : '') : 'nocell') }).join(' '), [pid, isos])
const ISOS = ['2026-11-10', '2026-11-15', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-23', '2026-11-30']
const warLook = async (user, cs, tag) => {
  await X.L.go(page, 'leavewar'); await sleep(2800)
  const pid = await U.pidOf(page, cs)
  const c = page.locator(`[data-testid="cell-${pid}-2026-11-19"]`).first()
  say(cs, 'cell 19 Nov count', await c.count())
  await X.pic(w, tag + '-lw-first')
  if (await c.count()) { await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(600) }
  await X.pic(w, tag + '-lw-at-19nov')
  const sig = await cells(pid, ISOS)
  say(cs, 'ROW CELLS', sig)
  return sig
}
/* ---- D */
let condor
await safe('D master archives Condor', async () => {
  const o = await openUsers('Condor')
  await X.pic(w, 'd01-condor-row-opened')
  say('Condor controls', JSON.stringify(await controls(o.pid)))
  const arch = page.getByRole('button', { name: /^Archive/ }).locator('visible=true').first()
  say('archive box', arch ? await arch.evaluate(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') }).catch(() => 'none') : 'none')
  await arch.tap(); await sleep(1200)
  await X.pic(w, 'd02-after-archive')
  const t = await U.bodyText(page)
  say('USERS TEXT', t.slice(0, 700))
  row('W3-D', 'iPhone', 'ad (master) Admin -> Users -> Condor -> Archive', 'Condor in the Archived fold', `${(t.match(/Archived · \d+/) || ['(no Archived count)'])[0]}; ${(t.match(/Condor[^.]{0,80}archived[^.]{0,60}/i) || ['(no toast)'])[0]}; ${(t.match(/Archived 19 Nov[^.]{0,30}/) || ['(no archived-on line)'])[0]}`, /Archived 19 Nov|Archived · \d/.test(t) ? 'PASS' : 'FAIL', 'd02-after-archive.png')
  // open the Archived fold
  const fold = page.locator('button:visible, summary:visible, [role=button]:visible', { hasText: /^Archived/ }).first()
  if (await fold.count()) { await fold.tap(); await sleep(800) }
  await page.locator(FIND).fill('Condor').catch(() => {}); await sleep(600)
  await X.pic(w, 'd03-archived-fold')
  const t2 = await U.bodyText(page)
  row('W3-D', 'iPhone', 'the Archived fold, with Condor', 'Condor listed under Archived', (t2.match(/.{0,60}Condor.{0,100}/) || ['(Condor not found in words)'])[0], /Condor/.test(t2) ? 'PASS' : 'FAIL', 'd03-archived-fold.png')
})
await H.swap(w, 'ad9')
await safe('D ad9 looks at the war', async () => {
  condor = await warLook('ad9', 'Condor', 'd04')
  row('W3-D', 'iPhone', "ad9 opens 149's Leave War, Condor's row around Thu 19 Nov", 'months before 19 Nov kept; from 19 Nov posted out (hatched PO)', condor, 'RECORD', 'd04-lw-at-19nov.png')
})
await safe('D heron', async () => {
  const o = await openUsers('Heron')
  await X.pic(w, 'd05-heron-row')
  const arch = page.getByRole('button', { name: /^Archive/ }).locator('visible=true').first()
  await arch.tap(); await sleep(1200)
  await X.pic(w, 'd06-heron-archived')
  const t = await U.bodyText(page)
  row('W3-D', 'iPhone', 'ad9 Admin -> Users -> Heron -> Archive (his own man)', 'Heron archived', (t.match(/Archived 19 Nov[^.]{0,30}/) || ['(no archived-on line)'])[0] + ' ; ' + (t.match(/Archived · \d+/) || [''])[0], /Archived 19 Nov|Archived · \d/.test(t) ? 'PASS' : 'FAIL', 'd06-heron-archived.png')
  const heron = await warLook('ad9', 'Heron', 'd07')
  const norm = s => (s || '').replace(/\{[^}]*\}/g, '')
  row('W3-D', 'iPhone', "the war: Heron's row looks the same as Condor's at Thu 19 Nov", "the same shape as Condor's", `Heron: ${heron} || Condor: ${condor}`, norm(heron) === norm(condor) ? 'PASS' : 'FAIL', 'd07-lw-at-19nov.png vs d04-lw-at-19nov.png')
})
/* ---- E */
await H.swap(w, 'ad2')
await safe('E', async () => {
  const o = await openUsers('Osprey')
  await X.pic(w, 'e01-osprey-row')
  const ctl = await controls(o.pid)
  say('Osprey controls', JSON.stringify(ctl))
  const before = await page.locator(`.acc-row[data-person="${o.pid}"]`).first().innerText().catch(() => '').then(s => s.replace(/\s+/g, ' '))
  for (const [name, exp] of [['Suspend', "He is 149's. Only an admin of 149 can change his account."], ['Archive', "He is 149's. Only an admin of 149 can change him."]]) {
    const b = page.getByRole('button', { name: new RegExp('^' + name) }).locator('visible=true').first()
    if (!(await b.count())) { row('W3-E', 'iPhone', `ad2 presses ${name} on Osprey`, exp, `no ${name} button; controls: ${ctl.join(' | ')}`, 'RECORD', 'e01-osprey-row.png'); continue }
    await b.tap(); await sleep(150); await X.pic(w, 'e-' + name + '-tap'); await sleep(1100)
    await X.pic(w, 'e-' + name)
    const t = await U.bodyText(page)
    const m = t.match(/He is 14\d.s\. Only an admin of 14\d can change (his account|him)\./)
    const box = m ? await page.evaluate(() => { const es = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /He is 14\d.s\. Only an admin/.test(e.textContent) && e.getBoundingClientRect().width > 2); const e = es[0]; if (!e) return 'no leaf'; const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} ${r.right <= 402 && r.left >= 0 && r.bottom <= 874 && r.top >= 0 ? 'inside' : 'OUTSIDE'}` }) : 'n/a'
    row('W3-E', 'iPhone', `ad2 presses ${name} on Osprey`, exp, `${m ? m[0] : 'no refusal words; page tail: ' + t.slice(-200)}; words box: ${box}`, m && m[0] === exp && /inside/.test(box) ? 'PASS' : 'FAIL', 'e-' + name + '.png')
    await page.getByRole('button', { name: /^(Cancel|Close|No|Keep)/ }).locator('visible=true').first().tap({ timeout: 1500 }).catch(() => {}); await sleep(500)
  }
  await X.L.go(page, 'admin'); await sleep(900)
  await page.locator(FIND).fill('Osprey'); await sleep(700)
  const after = (await page.locator(`.acc-row[data-person="${o.pid}"]`).first().innerText().catch(() => '(none)')).replace(/\s+/g, ' ')
  await X.pic(w, 'e-osprey-after')
  row('W3-E', 'iPhone', 'Osprey looked at afterwards', 'unchanged', `before: ${before.slice(0, 120)} || after: ${after.slice(0, 120)}`, after.slice(0, 80) === before.slice(0, 80) || /Osprey/.test(after) ? 'RECORD' : 'FAIL', 'e-osprey-after.png')
})
/* ---- F: the plain-user round for 149's admin on the phone */
await H.swap(w, 'ad9')
const closeBy = async re => { const c = page.getByRole('button', { name: re }).locator('visible=true').first(); if (await c.count()) { await c.tap(); return true } return false }
const CLOSE = /^\W*(close|done|back)\W*$|✕|×/i
const insideBox = sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} ${(r.left >= 0 && r.top >= 0 && r.right <= 402 && r.bottom <= 874) ? 'inside' : 'OUTSIDE'}` }, sel)
await safe('F1 users row typing', async () => {
  const o = await openUsers('Falcon')
  await X.pic(w, 'f01-falcon-row')
  const inp = page.locator('#accGiveName, #accEdName').first()
  say('sign-in box', await inp.evaluate(e => e.id))
  await inp.tap(); await page.keyboard.type('zzztyped'); await sleep(400)
  await X.pic(w, 'f02-typed')
  const v1 = await inp.inputValue()
  await page.locator('#accEdCancel').tap(); await sleep(700)
  await X.pic(w, 'f03-after-cancel')
  const rowOpen = await page.locator('#accGiveName:visible, #accEdName:visible').count()
  const o2 = await openUsers('Falcon')
  const inp2 = page.locator('#accGiveName, #accEdName').first()
  const v2 = await inp2.inputValue()
  await X.pic(w, 'f04-reopened')
  row('W3-F', 'iPhone', "ad9 opens Falcon's row, types in his sign-in box, presses Cancel, reopens", 'row closes on Cancel; reopened box empty', `typed: "${v1}"; editor still open after Cancel: ${rowOpen}; reopened value: "${v2}"`, rowOpen === 0 && v2 === '' ? 'PASS' : 'FAIL', 'f03-after-cancel.png, f04-reopened.png')
  await page.locator('#accEdCancel').tap().catch(() => {}); await sleep(500)
})
await safe('F2 post-in calendar', async () => {
  await X.L.go(page, 'admin'); await sleep(900)
  await page.locator('.adm-cat', { hasText: /^Users/ }).first().tap(); await sleep(1000)
  const b = page.locator('#accAddPostIn')
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(500)
  await X.pic(w, 'f05-add-person-form')
  const label0 = await b.textContent()
  await b.tap(); await sleep(150); await X.pic(w, 'f06-postin-tap'); await sleep(900); await X.pic(w, 'f06-postin-open')
  const cal = await page.evaluate(() => { const c = [...document.querySelectorAll('.dcal, .dcal-pop, [class*=datecal], [class*=dcal]')].filter(e => e.getBoundingClientRect().width > 150).map(e => { const r = e.getBoundingClientRect(); return `${e.className.slice(0, 30)}:${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} ${(r.left >= 0 && r.top >= 0 && r.right <= 402 && r.bottom <= 874) ? 'inside' : 'OUTSIDE'}` }); return c.join(' | ') })
  say('calendar boxes', cal)
  row('W3-F', 'iPhone', "ad9 opens Add a person's post-in calendar", 'opens, fully inside the 402 x 874 screen', cal || '(no calendar box found)', /OUTSIDE/.test(cal) ? 'FAIL' : (cal ? 'PASS' : 'FAIL'), 'f06-postin-open.png')
  await page.touchscreen.tap(30, 300); await sleep(900)
  await X.pic(w, 'f07-after-outside-tap')
  const open2 = await page.locator('.dcal-d:visible').count()
  row('W3-F', 'iPhone', 'taps outside the calendar (30,300)', 'calendar closes', `day buttons still on screen: ${open2}`, open2 === 0 ? 'PASS' : 'FAIL', 'f07-after-outside-tap.png')
  await page.locator('#accAddPostIn').evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  await page.locator('#accAddPostIn').tap(); await sleep(1000)
  await X.pic(w, 'f08-reopened')
  const d = page.locator('.dcal-d[aria-label^="Mon 23 Nov 2026"], .dcal-d:visible').first()
  const dl = await d.getAttribute('aria-label').catch(() => null)
  say('day to pick', dl, await d.evaluate(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}` }).catch(() => ''))
  await d.tap(); await sleep(900)
  await X.pic(w, 'f09-day-picked')
  const label1 = await page.locator('#accAddPostIn').textContent()
  row('W3-F', 'iPhone', 'reopens the post-in calendar and picks a day', 'the box shows the picked day', `before: "${label0.trim()}"; picked ${dl}; after: "${label1.trim()}"`, label1 !== label0 ? 'PASS' : 'RECORD', 'f09-day-picked.png')
})
await safe('F3 war', async () => {
  await X.L.go(page, 'leavewar'); await sleep(2800)
  await X.pic(w, 'f10-war')
  const tapRow = async (what, name, fn) => { await fn(); await sleep(100); await X.pic(w, name + '-tap'); await sleep(900); await X.pic(w, name) }
  // MY LEAVE
  await tapRow('myleave', 'f11-myleave', () => page.locator('.myleave:visible, [class*=myleave]:visible').first().tap())
  const mlBox = await page.evaluate(() => [...document.querySelectorAll('[class*=win], [role=dialog], [class*=sheet]')].filter(e => e.getBoundingClientRect().width > 150 && e.getBoundingClientRect().height > 100).map(e => { const r = e.getBoundingClientRect(); return `${e.className.slice(0, 24)}:${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}` }).slice(0, 4).join(' | '))
  const ok1 = await closeBy(CLOSE); await sleep(800); await X.pic(w, 'f12-myleave-closed')
  row('W3-F', 'iPhone', 'MY LEAVE: open, close by its own control', 'opens inside the screen, closes', `boxes: ${mlBox}; close pressed: ${ok1}`, ok1 ? 'RECORD' : 'FAIL', 'f11-myleave.png, f12-myleave-closed.png')
  // a name's window
  const pt = await page.evaluate(() => { const e = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'Kestrel' && e.offsetWidth > 1 && e.getBoundingClientRect().top > 100 && e.getBoundingClientRect().left < 380); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
  say('Kestrel point', JSON.stringify(pt))
  await tapRow('name', 'f13-name-window', () => page.touchscreen.tap(pt[0], pt[1]))
  const ok2 = await closeBy(CLOSE); await sleep(800); await X.pic(w, 'f14-name-closed')
  row('W3-F', 'iPhone', "a name's window: open by tapping his name, close by its X", 'opens, closes', `close pressed: ${ok2}`, ok2 ? 'RECORD' : 'FAIL', 'f13-name-window.png, f14-name-closed.png')
  // a day cell window and its dots list
  const kid = await U.pidOf(page, 'Kestrel')
  const cell = page.locator(`[data-testid="cell-${kid}-2026-11-25"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(600)
  await X.pic(w, 'f15-cell-in-view')
  await tapRow('cell', 'f16-day-window', () => cell.tap())
  const dots = page.locator('button:visible', { hasText: '⋯' }).last()
  say('dots count', await dots.count(), await dots.evaluate(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}` }).catch(() => ''))
  if (await dots.count()) { await tapRow('dots', 'f17-dots-list', () => dots.tap()) }
  const listBox = await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /^(Attach|Other|Post out|Post in)/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2).map(b => { const r = b.getBoundingClientRect(); return b.textContent.trim().slice(0, 12) + ':' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom) }).join(' | '))
  const ok3 = await closeBy(CLOSE); await sleep(800); await X.pic(w, 'f18-day-closed')
  const win2 = await page.locator('button:visible', { hasText: /^Approve|^Refuse|Whole day/ }).count()
  row('W3-F', 'iPhone', 'a day cell -> its window -> its dots list -> close', 'window opens inside the screen, list opens, closes', `dots list entries: ${listBox}; close pressed: ${ok3}; window buttons still on screen after: ${win2}`, ok3 ? 'RECORD' : 'FAIL', 'f16-day-window.png, f17-dots-list.png, f18-day-closed.png')
  // foot of the page
  const sc = await page.evaluate(() => { const s = document.scrollingElement; const a = s.scrollTop; s.scrollTo(0, s.scrollHeight); return { a, h: s.scrollHeight } })
  await sleep(900)
  const sc2 = await page.evaluate(() => ({ now: document.scrollingElement.scrollTop, bar: (() => { const b = document.querySelector('#burger'); const r = b.getBoundingClientRect(); return `${Math.round(r.top)},${Math.round(r.bottom)}` })() }))
  await X.pic(w, 'f19-foot')
  row('W3-F', 'iPhone', "scrolls the page to its very foot (script scroll, not a finger: WebKit)", 'page moves; the top bar stays', `scrollTop ${sc.a} -> ${sc2.now} of ${sc.h}; burger button top,bottom ${sc2.bar}`, sc2.now > sc.a && /^[0-9],|^[0-9]{2},/.test(sc2.bar) ? 'PASS' : 'RECORD', 'f19-foot.png')
  await page.evaluate(() => document.scrollingElement.scrollTo(0, 0)); await sleep(800); await X.pic(w, 'f20-back-top')
  // bell
  await page.locator('#notifyBell').tap(); await sleep(150); await X.pic(w, 'f21-bell-tap'); await sleep(900); await X.pic(w, 'f21-bell')
  await page.locator('#notifyBell').tap(); await sleep(800); await X.pic(w, 'f22-bell-closed')
  const bellOpen = await page.locator('.bell-list:visible').count()
  row('W3-F', 'iPhone', 'the bell: open and close', 'opens, closes by the bell', `bell list still shown after second tap: ${bellOpen}`, bellOpen === 0 ? 'PASS' : 'FAIL', 'f21-bell.png, f22-bell-closed.png')
})
await X.fin(w)
