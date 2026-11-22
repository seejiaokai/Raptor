/* msq-host-rewalk v2 — the re-walk after the full check's fixes (18 Nov 26), on the fixed frozen build: R1 the change
   history keeps each squadron's own lines (the "N new" count, the clock's count and the changes window); R2 Admin →
   Users refuses another squadron's account and the last-admin lock, with its words; R3 sign-out while a save waits.
   usage: MSQ_DIST=<frozen folder> MSQ_BUNDLE=<index-….js> MSQ_RUN=rewalk-d|rewalk-p node scripts/handpass/msq/msq-host-rewalk.mjs [phone] */
const phone = process.argv.includes('phone')
process.env.MSQ_WHO = 'host'
process.env.MSQ_RUN = process.env.MSQ_RUN || (phone ? 'rewalk-p' : 'rewalk-d')
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
const P = phone ? 'phone' : 'desktop'
say('msq-host-rewalk v2', P)
const w = await X.open({ phone, user: 'ad' })
const { page } = w
const swap = async user => { const so = await X.signOut(w); await X.login(page, user); return so }
/* what one day's head says (its "N new" / "N changes" chip and its state) and the clock's count, read off the screen */
/* v2: the chip itself, not the head's first 70 letters (v1 cut the chip off and read before the week was repainted —
   its picture showed "3 changes" where its row read none), and the clock by its spoken words: the button shows only an icon */
/* v3: by the day's own name — `#vWeek .day` is not one element a day, so v2's third one was not Wednesday; returned as
   an array whose [2] is Wednesday, as the rows read it */
const heads = async () => page.evaluate(() => {
  const want = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return want.map(n => {
    /* the day's name as drawn — visible, anywhere on the page (the heads may sit outside #vWeek) */
    const hd = [...document.querySelectorAll('body *')].find(e => e.children.length === 0 && e.textContent.trim() === n &&
      e.getClientRects().length > 0)
    /* the day's own column: the widest ancestor whose text names no other day */
    const others = want.filter(o => o !== n)
    let box = hd
    while (box && box.parentElement && box.parentElement !== document.body &&
      !others.some(o => box.parentElement.textContent.includes(o))) box = box.parentElement
    const chip = box ? box.querySelector('.dpend') : null
    return hd ? (chip ? chip.textContent.replace(/\s+/g, ' ').trim() : '(no chip)') : '(no ' + n + ')'
  })
})
const clock = async () => page.evaluate(() => (document.querySelector('#histBtn')?.getAttribute('aria-label') || '').trim())
async function addGround(name, cs, di) {
  await X.W.board(w, di); await sleep(600)
  await X.W.press(w, `[data-gradd="${di}"]`, { scope: 'board' }); await sleep(600)
  const n = (await U.groundNames(page, di)).length - 1
  await X.W.typeIn(w, `[data-bfld="gr:${di}.${n}.prog"]`, name)
  const id = await U.pidOf(page, cs)
  const r = await X.W.seat(w, `[data-fill="g:${di}.${n}.+"]`, id)
  await X.W.closeBoard(w); await sleep(600)
  return r
}

// ---- R1: the change history, one squadron's lines only
await X.L.go(page, 'editsched'); await sleep(2000)
/* v2: every read AFTER its picture — in this headless run the page repaints only when a frame is drawn, and the picture
   draws one: v1 read the screen before it, and its rows missed what its own pictures show */
await X.pic(w, `r1-01-ad-week-before`)
const h0 = await heads(), c0 = await clock()
await swap('ad9')
await X.L.go(page, 'editsched'); await sleep(2000)
await addGround('R149 HIST', 'Kestrel', 2)
await X.L.go(page, 'editsched'); await sleep(2000)
await X.pic(w, `r1-02-ad9-week-after-add`)
const h9 = await heads(), c9 = await clock()
const chips9 = await page.evaluate(() => [...document.querySelectorAll('.dpend')].map(e => e.textContent.replace(/\s+/g, ' ') + '@' + (e.closest('[class*=day]')?.className || '?')).join(' | '))
row('R1', P, 'ad9 adds ground row "R149 HIST" on Wed 15 Jul', "149's Wed 15 counts the change", `Wed: ${h9[2]}; all heads: ${h9.join(', ')}; chips: ${chips9}; clock: ${c9}`,
  /R149 HIST/.test(await U.bodyText(page)) ? 'RECORD' : 'FAIL', 'r1-02-ad9-week-after-add.png')
await swap('ad')
await X.L.go(page, 'editsched'); await sleep(2000)
await X.pic(w, `r1-03-ad-week-after-149-change`)
const h1 = await heads(), c1 = await clock()
row('R1', P, "ad (142) looks at the week after 149's change", `142's day heads and clock as before: Wed "${h0[2]}", clock "${c0}"`,
  `Wed: ${h1[2]}; clock: ${c1}`, h1[2] === h0[2] && c1 === c0 ? 'PASS' : 'FAIL', 'r1-03-ad-week-after-149-change.png')
if (!phone) {
  await page.locator('#histBtn').click(); await sleep(900)
  await X.pic(w, `r1-04-ad-changes-window`)
  const win = await page.evaluate(() => (document.querySelector('.chgwin.bar[role=dialog]')?.textContent || '').replace(/\s+/g, ' '))
  row('R1', P, "ad opens the changes window (the clock)", 'nothing of 149: no "R149 HIST", no Kestrel', win.slice(0, 300),
    win && !/R149 HIST|Kestrel/.test(win) ? 'PASS' : 'FAIL', 'r1-04-ad-changes-window.png')
  await page.keyboard.press('Escape'); await sleep(500)
}
await swap('ad9')
await X.L.go(page, 'editsched'); await sleep(2000)
await X.pic(w, `r1-05-ad9-week-again`)
const h9b = await heads(), c9b = await clock()
row('R1', P, 'ad9 signs in again', "149's own count still there", `Wed: ${h9b[2]}; clock: ${c9b}`,
  h9b[2] === h9[2] && c9b === c9 ? 'PASS' : 'FAIL', 'r1-05-ad9-week-again.png')

if (!phone) {
  // ---- R2: Admin → Users — another squadron's accounts, and the last-admin lock, refused with their words
  async function tryRole(cs, role, label) {
    await X.L.go(page, 'admin'); await sleep(800)
    await page.locator('input[aria-label="Find a callsign or sign-in"]').fill(cs); await sleep(500)
    const pid = await U.pidOf(page, cs)
    const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
    if (!(await tap.count())) return { opened: false, text: '(no row for ' + cs + ')' }
    await tap.click(); await sleep(600)
    const sel = page.locator('#accEdRole')
    if (!(await sel.count())) { await X.pic(w, `r2-${label}-row`); return { opened: false, text: '(no role box)' } }
    await sel.selectOption(role); await page.locator('#accEdSave').click(); await sleep(700)
    const text = await U.bodyText(page)
    await X.pic(w, `r2-${label}`)
    /* his role as the row's own badge says it once the refused save is cancelled */
    await page.getByRole('button', { name: 'Cancel', exact: true }).first().click().catch(() => {}); await sleep(500)
    const now = ((await page.locator(`.acc-row[data-person="${pid}"]`).first().innerText().catch(() => '')).match(/ADMIN|MEMBER/i) || ['(not read)'])[0]
    return { opened: true, text, now }
  }
  await swap('ad')
  let r = await tryRole('Kestrel', 'main', 'ad-demotes-kestrel')
  const lockWords = "Kestrel is 149's last admin. Make another admin of 149 first."
  row('R2', P, "ad (master) sets Kestrel, 149's only admin, to Member and saves", 'refused: "' + lockWords + '"',
    r.text.includes(lockWords) ? lockWords : r.text.slice(0, 200), r.text.includes(lockWords) ? 'PASS' : 'FAIL', 'r2-ad-demotes-kestrel.png')
  await swap('ad2')
  r = await tryRole('Kestrel', 'main', 'ad2-demotes-kestrel')
  /* v2: the refusal's own words — v1's loose match found "squadron" in another page's hidden text */
  const m = r.text.match(/He is 149.s. Only an admin of 149 can change his account\./)
  row('R2', P, "ad2 (a plain 142 admin) sets Kestrel (149) to Member and saves", 'refused, with its reason; Kestrel still Admin',
    r.opened ? (m ? m[0] : r.text.slice(0, 200)) + ' · his badge: ' + r.now : r.text,
    r.opened ? (m && /admin/i.test(r.now) ? 'PASS' : 'FAIL') : 'RECORD', 'r2-ad2-demotes-kestrel.png')
  await swap('ad9')
  r = await tryRole('Ranger', 'admin', 'ad9-promotes-ranger')
  const m2 = r.text.match(/He is 142.s. Only an admin of 142 can change his account\./)
  row('R2', P, "ad9 (149's admin) sets Ranger (142) to Admin and saves", 'refused, with its reason; Ranger still Member',
    r.opened ? (m2 ? m2[0] : r.text.slice(0, 200)) + ' · his badge: ' + r.now : r.text,
    r.opened ? (m2 && /member/i.test(r.now) ? 'PASS' : 'FAIL') : 'RECORD', 'r2-ad9-promotes-ranger.png')
}
await X.fin(w)

if (!phone) {
  // ---- R3: sign-out while a save waits (?savefail refuses every save in this one tab — D1666)
  const w3 = await X.open({ phone: false, user: null })
  await w3.page.goto(X.BASE + '/?savefail'); await sleep(800)
  await X.login(w3.page, 'ad9')
  const before = w3.loads
  w.page = w3.page
  const ww = w3
  await X.W.board(ww, 2); await sleep(600)
  await X.W.press(ww, '[data-gradd="2"]', { scope: 'board' }); await sleep(600)
  const n = (await U.groundNames(w3.page, 2)).length - 1
  await X.W.typeIn(ww, `[data-bfld="gr:2.${n}.prog"]`, 'R3 WAITING')
  await sleep(900)
  await X.W.closeBoard(ww); await sleep(600)
  const band = /Not saved/.test(await U.bodyText(w3.page))
  await X.pic(ww, 'r3-01-ad9-not-saved-band')
  const so = await X.signOut(ww)
  await X.pic(ww, 'r3-02-after-sign-out')
  row('R3', 'desktop', 'ad9, every save refused, makes a change then signs out', 'the "Not saved" band; no reload while the save waits (the reload is owed)',
    `band: ${band}; reloaded: ${so.reloaded} (loads ${before} → ${w3.loads})`, band && !so.reloaded ? 'PASS' : 'FAIL', 'r3-01-ad9-not-saved-band.png, r3-02-after-sign-out.png')
  await X.fin(w3)
}
