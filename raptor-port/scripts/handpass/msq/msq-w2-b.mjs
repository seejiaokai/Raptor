/* msq-w2-b v1 — W2: T3 (the bell) and T4 (the Tracker) in one fresh desktop world. usage: node scripts/handpass/msq/msq-w2-b.mjs */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'b-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w2-b v1 desktop')
const w = await X.open({ phone: false, user: 'us9' })
const { page } = w
const swap = async user => { const r = await X.signOut(w); await X.login(page, user); return r }
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
async function calPick(iso) {
  const cal = page.locator('.dcal:visible').last()
  for (let i = 0; i < 30; i++) {
    if (await cal.locator(`[data-iso="${iso}"]`).count()) break
    const m = await cal.getAttribute('data-month')
    await cal.locator(m < iso.slice(0, 7) ? '[data-testid$="-next"]' : '[data-testid$="-prev"]').first().click()
    await sleep(220)
  }
  await cal.locator(`[data-iso="${iso}"]`).first().click()
  await sleep(400)
}
// ---------- T3
await X.L.go(page, 'inputs'); await sleep(1200)
await safe('list', async () => { await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(700) })
await page.getByRole('button', { name: /\+ Input/ }).first().click(); await sleep(900)
await safe('type', async () => { await page.locator('#inpEditType').selectOption({ label: 'Other' }) })
await sleep(400)
await calPick('2026-12-14')
await X.pic(w, 't3-01-us9-filled')
await page.getByRole('button', { name: /^\s*Add\s*$/ }).first().click(); await sleep(1200)
await safe('alldates', async () => { await page.getByRole('button', { name: /→/ }).first().click(); await sleep(500); await page.getByRole('button', { name: /All dates/ }).first().click(); await sleep(700) })
await X.pic(w, 't3-02-us9-list')
const filed = await U.bodyText(page)
row('T3', 'desktop', 'us9 files Other on Mon 14 Dec 2026 for himself', 'input is on his list', `Osprey: ${/Osprey/.test(filed)}; 14 Dec: ${/14 Dec/.test(filed)}`, /Osprey/.test(filed) && /14 Dec/.test(filed) ? 'PASS' : 'BLOCKED', 't3-02-us9-list.png')
const bell = async () => {
  await page.locator('#notifyBell').click(); await sleep(1100)
  const t = await page.evaluate(() => {
    let e = document.elementFromPoint(1037, 80)
    if (!e) return 'no element'
    for (let i = 0; i < 8; i++) { const p = e.parentElement; if (!p) break; const r = p.getBoundingClientRect(); if (r.width > 600 || r.top > 140 && false) break; e = p }
    return e.innerText.replace(/\s+/g, ' ').trim()
  })
  return t
}
const bellClose = async () => { await page.locator('#notifyBell').click().catch(() => {}); await sleep(500) }
for (const u of ['ad', 'ad2', 'ad9']) {
  await swap(u); await X.L.go(page, 'editsched'); await sleep(900)
  const t = await bell()
  await X.pic(w, `t3-03-${u}-bell`)
  const badge = await page.evaluate(() => (document.querySelector('#notifyBell')?.innerText || '') + '|' + (document.querySelector('#notifyBell')?.className || ''))
  say('BELL', u, t, 'badge:', badge)
  const about = /Osprey|14 Dec|Other/i.test(t)
  row('T3', 'desktop', `${u} opens the bell`, u === 'ad9' ? 'RECORD lines' : 'no line about Osprey input', `lines: "${t}"; mentions Osprey/14 Dec/Other: ${about}`, u === 'ad9' ? 'RECORD' : about ? 'FAIL' : 'PASS', `t3-03-${u}-bell.png`)
  await bellClose()
}
// ---------- T4
const trk = async () => page.evaluate(() => {
  const t = document.querySelector('#page-tracker').innerText.replace(/\s+/g, ' ')
  const sel = id => { const s = document.getElementById(id); return s ? [...s.options].map(o => o.text.trim()).join('/') + ' [now ' + (s.selectedOptions[0]?.text || '') + ']' : '' }
  return { course: sel('courseSel'), students: sel('activeSel'), overall: (t.match(/OVERALL[^%]*%[^A-Z]*[A-Z ]*\d*[^A-Z]*REMAINING/i) || [''])[0].slice(0, 200), done: (t.match(/(\d+) DONE/i) || [])[1] }
})
const openStudent = async () => {
  const pt = await page.evaluate(() => { const e = [...document.querySelectorAll('#page-tracker *')].find(e => e.children.length <= 2 && /^1\s*STUDENT A/i.test(e.textContent.trim()) && e.offsetWidth > 1 && e.tagName !== 'OPTION' && e.tagName !== 'SELECT'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + 20, r.top + r.height / 2, e.tagName, e.className] })
  say('student chip', JSON.stringify(pt))
  if (pt) { await page.mouse.click(pt[0], pt[1]); await sleep(900) }
}
await swap('ad'); await X.L.go(page, 'tracker'); await sleep(2500)
const t0 = await trk()
say('AD TRACKER', JSON.stringify(t0))
await X.pic(w, 't4-01-ad-tracker')
await safe('stu', openStudent)
await X.pic(w, 't4-02-ad-student')
await page.mouse.click(515, 180); await sleep(1300)
await X.pic(w, 't4-03-ad-ball-window')
const marked = await safe('mark', async () => { await page.getByRole('button', { name: /^\s*Marginal\s*$/ }).first().click(); await sleep(900); return true })
await X.pic(w, 't4-04-ad-after-mark')
await safe('closewin', async () => { await page.getByRole('button', { name: /^\s*Close\s*$/ }).first().click(); await sleep(700) })
await X.pic(w, 't4-05-ad-window-closed')
const t1 = await trk()
say('AD AFTER', JSON.stringify(t1))
row('T4', 'desktop', 'ad opens Tracker, taps ST-01 on the chart, presses Marginal for STUDENT A, Close', 'RECORD course, students; mark taken', `before: ${JSON.stringify(t0)}; after: ${JSON.stringify(t1)}; marked: ${marked}`, marked ? 'RECORD' : 'BLOCKED', 't4-01-ad-tracker.png, t4-04-ad-after-mark.png, t4-05-ad-window-closed.png')
await swap('ad9'); await X.L.go(page, 'tracker'); await sleep(2500)
const t9 = await trk()
await X.pic(w, 't4-06-ad9-tracker')
say('AD9 TRACKER', JSON.stringify(t9))
await page.mouse.click(515, 180); await sleep(1300)
await X.pic(w, 't4-07-ad9-ball-window')
await safe('close9', async () => { await page.getByRole('button', { name: /^\s*Close\s*$/ }).first().click(); await sleep(700) })
const same = t9.done === t1.done && Number(t1.done) > Number(t0.done)
row('T4', 'desktop', 'ad9 opens Tracker', "149's own course; ad's mark NOT on 149's student", `ad9: ${JSON.stringify(t9)}; ad's done count: ${t0.done} -> ${t1.done}; ad9 done: ${t9.done}`, Number(t1.done) > Number(t0.done) ? (t9.done === t0.done ? 'PASS' : 'FAIL') : 'RECORD', 't4-06-ad9-tracker.png, t4-07-ad9-ball-window.png')
await swap('ad'); await X.L.go(page, 'tracker'); await sleep(2500)
const t2 = await trk()
await X.pic(w, 't4-08-ad-again')
row('T4', 'desktop', 'ad signs in again, opens Tracker', "ad's mark still there", `${JSON.stringify(t2)}`, t2.done === t1.done ? 'PASS' : 'FAIL', 't4-08-ad-again.png')
await X.fin(w)
