/* msq-w3-fixread v1 — walker W3, the re-walk of the fix read's fixes (18 Nov 26).
   usage: MSQ_DIST=<frozen> MSQ_BUNDLE=<bundle> MSQ_WHO=w3 MSQ_RUN=fx-d|fx-p node scripts/handpass/msq/msq-w3-fixread.mjs [phone]
   ONLY=F1,F2 limits the orders */
const phone = process.argv.includes('phone')
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || (phone ? 'fx-p' : 'fx-d')
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
const P = phone ? 'phone' : 'desktop'
const ONLY = (process.env.ONLY || 'F1,F2,F3,F4').split(',')
say('msq-w3-fixread v1', P, 'only', ONLY.join(','))
const click = async (w, loc) => { if (w.phone) await loc.tap(); else await loc.click() }
const wins = []
const TODAY = '2026-11-18'
/* open a person's Post out sheet on a day, pick the chip; returns the sheet's own words */
async function postOutSheet(w, pid, iso, chip) {
  const page = w.page
  const cell = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  if (!(await cell.count())) return { ok: false, text: 'no grid cell for ' + pid + ' on ' + iso }
  await cell.scrollIntoViewIfNeeded().catch(() => {})
  await click(w, cell); await sleep(900)
  await page.locator('button:visible', { hasText: '⋯' }).last().click({ timeout: 4000 }).catch(() => {}); await sleep(600)
  const po = page.locator('button:visible', { hasText: /^Post out/ }).first()
  if (!(await po.count())) return { ok: false, text: 'no Post out in the ⋯ list' }
  await click(w, po); await sleep(700)
  const ch = page.locator('button:visible', { hasText: new RegExp('^(✓ )?' + chip) }).first()
  if (await ch.count()) { const already = /^✓/.test((await ch.textContent()).trim()); if (!already) { await click(w, ch); await sleep(800) } }
  const text = await page.evaluate(() => {
    const e = [...document.querySelectorAll('button')].find(b => /^Post out$/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 2)
    let box = e; for (let i = 0; i < 8 && box && box.parentElement && !/PO FROM/i.test(box.innerText || ''); i++) box = box.parentElement
    return (box?.innerText || '(sheet not found)').replace(/\s+/g, ' ').trim()
  })
  return { ok: true, text }
}
function finishAll(w) { wins.push(w) }

async function openUsers(w, cs) {
  const page = w.page
  await X.L.go(page, 'admin'); await sleep(900)
  const f = page.locator('input[aria-label="Find a callsign or sign-in"]')
  if (w.phone) {
    await X.pic(w, 'f1-00-phone-admin')
    say('phone admin visible buttons', await page.evaluate(() => [...document.querySelectorAll('button,a,[role=tab]')].filter(b => b.getBoundingClientRect().width > 2 && b.getBoundingClientRect().top < 874).map(b => (b.getAttribute('aria-label') || b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 25)).filter(Boolean).join(' | ')))
    if (!(await f.isVisible())) {
      const t = page.locator('button:visible', { hasText: /^Users/ }).first()
      if (await t.count()) { await t.tap(); await sleep(800) }
    }
  }
  await f.fill(cs); await sleep(600)
  const pid = await U.pidOf(page, cs)
  const tap = page.locator(`.acc-row[data-person="${pid}"] .acc-tap`).first()
  if (!(await tap.count())) return { pid, opened: false }
  await click(w, tap); await sleep(700)
  return { pid, opened: true }
}
const refusal = t => {
  const m = t.match(/He is 14\d.s\. Only an admin of 14\d can change (his account|him)\./)
  return m ? m[0] : null
}
/* every visible button / input / select inside the open row's editor, read from the screen */
const controls = (page, pid) => page.evaluate(pid => {
  const out = []
  const root = document.querySelector(`.acc-row[data-person="${pid}"]`)
  const scope = root ? [root, root.nextElementSibling, root.parentElement].filter(Boolean) : []
  const seen = new Set()
  for (const s of scope) for (const e of s.querySelectorAll('button,input,select,[role=button]')) {
    if (seen.has(e)) continue; seen.add(e)
    const r = e.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    out.push({ tag: e.tagName, id: e.id || '', label: (e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 40), cls: String(e.className).slice(0, 40) })
  }
  return out
}, pid)

if (ONLY.includes('F1')) {
  const w = await X.open({ phone, user: 'ad2' }); finishAll(w)
  const { page } = w
  const o = await openUsers(w, 'Osprey')
  await X.pic(w, 'f1-01-osprey-row-opened')
  const ctl = await controls(page, o.pid)
  say('F1 controls', JSON.stringify(ctl))
  say('F1 opened', o.opened, 'pid', o.pid)
  const full0 = (await U.bodyText(page))
  say('F1 body after open:', full0.slice(0, 1500))
  row('F1', P, 'ad2 searches Osprey and opens his row', 'his row opens', 'opened: ' + o.opened + '; controls: ' + ctl.map(c => c.label || c.id).join(' | '), o.opened ? 'RECORD' : 'FAIL', 'f1-01-osprey-row-opened.png')
  let i = 0
  const bad = /member-writes-own|You can only edit your own row|That did not save|\[|\bp[0-9a-f]{6,}/i
  for (const c of ctl) {
    if (c.tag === 'INPUT' && !/callsign|name/i.test(c.label + c.id)) continue
    i++
    const sel = c.id ? '#' + c.id : null
    const loc = sel ? page.locator(sel).first() : page.getByRole('button', { name: c.label, exact: true }).first()
    if (!(await loc.count())) continue
    const before = await U.bodyText(page)
    try {
      if (c.tag === 'INPUT') {
        await loc.fill('Osprey'); await sleep(200)
      } else if (c.tag === 'SELECT') {
        const opts = await loc.evaluate(s => [...s.options].map(o => o.value))
        const other = opts.find(v => v !== '' ) ; say('F1 select', c.id, opts.join(','))
        await loc.selectOption(opts[opts.length - 1]).catch(() => {})
      } else await click(w, loc)
    } catch (e) { say('press failed', c.label, e.message.slice(0, 80)) }
    await sleep(800)
    const nm = `f1-02-${String(i).padStart(2, '0')}-${(c.label || c.id).replace(/[^a-z0-9]+/gi, '-').slice(0, 20)}`
    await X.pic(w, nm)
    const t = await U.bodyText(page)
    const ref = refusal(t)
    const newText = t.length > before.length ? t.replace(before.slice(0, 0), '').slice(-500) : t.slice(-500)
    row('F1', P, `ad2 on Osprey's row: ${c.tag} "${c.label || c.id}"`, 'not offered, or the exact 149 refusal',
      ref ? ref : 'no exact refusal; bad words: ' + (bad.test(t) ? 'YES ' + (t.match(bad) || [''])[0] : 'none') + ' ; tail: ' + newText,
      ref ? 'PASS' : 'RECORD', nm + '.png')
    /* leave any confirm/dialog without confirming */
    await page.getByRole('button', { name: /^(Cancel|Close|No|Keep)/ }).first().click({ timeout: 800 }).catch(() => {})
    await sleep(400)
  }
  await X.L.go(page, 'admin'); await sleep(800)
  await page.locator('input[aria-label="Find a callsign or sign-in"]').fill('Osprey'); await sleep(600)
  const rowText = (await page.locator(`.acc-row[data-person="${o.pid}"]`).first().innerText().catch(() => '(none)')).replace(/\s+/g, ' ')
  await X.pic(w, 'f1-03-osprey-after')
  row('F1', P, 'Osprey checked afterwards', 'unchanged: callsign Osprey, still a member', rowText.slice(0, 200), /Osprey/.test(rowText) ? 'RECORD' : 'FAIL', 'f1-03-osprey-after.png')
  await X.fin(w)
}

if (ONLY.includes('F2') && !phone) {
  const w = await X.open({ phone, user: 'ad' }); finishAll(w)
  const { page } = w
  const o = await openUsers(w, 'Kestrel')
  await X.pic(w, 'f2-01-kestrel-row')
  const ctl = await controls(page, o.pid)
  say('F2 controls', JSON.stringify(ctl))
  const lock = "Kestrel is 149's last admin. Make another admin of 149 first."
  const arch = page.getByRole('button', { name: /^Archive/ }).first()
  if (await arch.count()) {
    await click(w, arch); await sleep(900)
    await X.pic(w, 'f2-02-archive')
    const t = await U.bodyText(page)
    row('F2', P, 'ad presses Archive on Kestrel', lock, t.includes(lock) ? lock : t.slice(-400), t.includes(lock) ? 'PASS' : 'FAIL', 'f2-02-archive.png')
    await page.getByRole('button', { name: /^(Cancel|Close|No|Keep)/ }).first().click({ timeout: 800 }).catch(() => {})
  } else row('F2', P, 'ad presses Archive on Kestrel', lock, 'no Archive button; controls: ' + ctl.map(c => c.label || c.id).join(' | '), 'RECORD', 'f2-01-kestrel-row.png')
  const sel = page.locator('#accEdRole')
  if (await sel.count()) {
    await sel.selectOption('main'); await page.locator('#accEdSave').click(); await sleep(800)
    await X.pic(w, 'f2-03-role-member')
    const t = await U.bodyText(page)
    row('F2', P, 'ad sets Kestrel to Member and saves', lock, t.includes(lock) ? lock : t.slice(-400), t.includes(lock) ? 'PASS' : 'FAIL', 'f2-03-role-member.png')
    await page.getByRole('button', { name: 'Cancel', exact: true }).first().click().catch(() => {}); await sleep(400)
  } else row('F2', P, 'ad sets Kestrel to Member', lock, 'no role box', 'RECORD', 'f2-01-kestrel-row.png')
  // Leave War, 149: this build draws no schedules menu (the "142 ▾" is not there), so say so and go in as 149's own admin
  await X.L.go(page, 'leavewar').catch(e => say('go leavewar', e.message.slice(0, 80))); await sleep(2000)
  await X.pic(w, 'f2-04-leavewar-142')
  await page.locator('.mark').first().click().catch(() => {}); await sleep(600)
  await X.pic(w, 'f2-05-top-left-clicked')
  const caret = await page.evaluate(() => (document.querySelector('.topbar .mark')?.textContent || '') + ' | buttons with ▾ in top bar: ' + [...document.querySelectorAll('.topbar button')].filter(b => /▾/.test(b.textContent)).map(b => b.textContent.trim()).join(','))
  row('F2', P, 'ad looks for the schedules menu ("142 ▾") at the top left of the Leave War, and clicks the "142 TALON" mark', 'a menu offering 149', 'no menu opened; top-left reads: ' + caret, 'RECORD', 'f2-05-top-left-clicked.png')
  await X.fin(w)
  const w2 = await X.open({ phone, user: 'ad9' }); finishAll(w2)
  const pg = w2.page
  await X.L.go(pg, 'leavewar'); await sleep(2500)
  await X.pic(w2, 'f2-06-ad9-leavewar')
  const k = await postOutSheet(w2, o.pid, TODAY, 'Overseas Sqn')
  await X.pic(w2, 'f2-07-kestrel-postout-sheet')
  const words = "Kestrel is 149's last admin. The posting waits until 149 has another admin."
  row('F2', P, "ad9 (149's only admin, in 149's Leave War) opens Kestrel's Post out, Overseas Sqn, today", words,
    k.ok ? (k.text.includes(words) ? words : 'sheet text: ' + k.text) : 'could not reach: ' + k.text, k.ok ? (k.text.includes(words) ? 'PASS' : 'FAIL') : 'RECORD', 'f2-07-kestrel-postout-sheet.png')
  say('F2 last-admin-who-can-sign-in words present:', /last admin who can sign in/.test(k.text))
  await pg.locator('button:visible', { hasText: /^Post out$/ }).last().click().catch(() => {}); await sleep(1000)
  await X.pic(w2, 'f2-08-after-post-out')
  const after = await U.bodyText(pg)
  const near = (after.match(/.{0,80}(waits|posting out|last admin).{0,120}/i) || ['(nothing about a waiting posting on screen)'])[0]
  row('F2', P, 'ad9 presses Post out for Kestrel', "the posting waits: his row says the posting waits (or the sheet refuses in the same words)", near, /waits/i.test(after) ? 'PASS' : 'RECORD', 'f2-08-after-post-out.png')
  await X.fin(w2)
}

if (ONLY.includes('F3') && !phone) {
  const w = await X.open({ phone, user: 'ad2' }); finishAll(w)
  const { page } = w
  await X.L.go(page, 'leavewar'); await sleep(2500)
  const sab = await U.pidOf(page, 'Saber')
  const s = await postOutSheet(w, sab, TODAY, 'Delete')
  await X.pic(w, 'f3-01-saber-delete-chip')
  const mw = "Saber is a master admin, so he can't be deleted"
  row('F3', P, "ad2 opens Saber's Post out, picks the Delete chip", mw, s.ok ? (s.text.includes(mw) ? mw : 'sheet text: ' + s.text) : s.text, s.ok ? (s.text.includes(mw) ? 'PASS' : 'FAIL') : 'RECORD', 'f3-01-saber-delete-chip.png')
  const sabLeft = await page.evaluate(id => !!document.querySelector('[data-person="' + id + '"]'), sab)
  say('F3 saber row still on the grid', sabLeft)
  await page.locator('button:visible', { hasText: /^Post out$/ }).last().click({ timeout: 3000 }).catch(e => say('F3 saber Post out press', e.message.slice(0, 60))); await sleep(900)
  await X.pic(w, 'f3-02-saber-after-post-out-press')
  const t2 = await U.bodyText(page)
  say('F3 after Saber press tail', t2.slice(-300))
  const stillThere = await page.evaluate(id => !!document.querySelector('[data-person="' + id + '"]'), sab)
  row('F3', P, 'ad2 presses Post out on the master (Delete chip) and, if asked, confirms', 'refused / nothing saved: Saber stays on the grid, page alive', 'Saber on grid: ' + stillThere + '; words: ' + ((t2.match(/.{0,60}master admin.{0,80}/) || ['(no master-admin words after the press)'])[0]), stillThere ? 'PASS' : 'FAIL', 'f3-02-saber-after-post-out-press.png')
  // Rocky
  await page.reload(); await sleep(1500); await X.login(page, 'ad2').catch(() => {})
  await X.L.go(page, 'leavewar'); await sleep(2500)
  let rname = 'Rocky'
  let rid = await U.pidOf(page, rname)
  if (!rid) { say('F3 no Rocky in this world; using Ranger (142 member)'); rname = 'Ranger'; rid = await U.pidOf(page, rname) }
  const r = await postOutSheet(w, rid, TODAY, 'Delete')
  await X.pic(w, 'f3-03-rocky-delete-sheet')
  say('F3 rocky sheet', r.ok, r.text.slice(0, 300))
  for (let i = 1; i <= 2; i++) {
    const b = page.locator('button:visible', { hasText: /^(Post out|Tap again|Delete —|Really|Confirm|Yes)/ }).last()
    if (!(await b.count())) break
    if (i > 1) {
      const d = page.locator('button:visible', { hasText: /^Delete$/ }).last()
      if (!(await d.count())) break
      say('F3 rocky card Delete press', i)
      await d.click({ timeout: 3000 }).catch(e => say('press fail', e.message.slice(0, 60))); await sleep(1200)
      await X.pic(w, 'f3-04-rocky-press-' + i)
      continue
    }
    say('F3 rocky press', i, (await b.textContent()).trim())
    await b.click({ timeout: 3000 }).catch(e => say('press fail', e.message.slice(0, 60))); await sleep(900)
    await X.pic(w, 'f3-04-rocky-press-' + i)
  }
  await sleep(1200)
  await X.pic(w, 'f3-05-rocky-after')
  const alive = await page.evaluate(() => document.body.innerText.length > 200)
  const rockyRow = await page.evaluate(id => { const t = document.querySelector('[data-person="' + id + '"]'); return t ? (t.closest('tr')?.textContent || '').replace(/\s+/g, ' ').slice(0, 120) : '(no row for him on the grid)' }, rid)
  row('F3', P, "ad2 posts " + rname + " (a 142 member; Rocky is not in this world if Ranger) out with Delete today, confirms as asked", "Rocky's posting runs (he posts out / leaves the roster); page not frozen or blank", 'page alive: ' + alive + '; Rocky: ' + rockyRow, alive ? 'RECORD' : 'FAIL', 'f3-05-rocky-after.png')
  await X.fin(w)
}

/* F4 */
if (ONLY.includes('F4')) {
  const WED = 2
  async function addGround(w, name, cs, di) {
    await X.W.board(w, di); await sleep(600)
    await X.W.press(w, `[data-gradd="${di}"]`, { scope: 'board' }); await sleep(600)
    const n = (await U.groundNames(w.page, di)).length - 1
    await X.W.typeIn(w, `[data-bfld="gr:${di}.${n}.prog"]`, name)
    const id = await U.pidOf(w.page, cs)
    const r = await X.W.seat(w, `[data-fill="g:${di}.${n}.+"]`, id)
    await X.W.closeBoard(w); await sleep(600)
    return r
  }
  const w = await X.open({ phone, user: 'ad9' }); const { page } = w
  const swap = async user => { await X.signOut(w); await X.login(page, user) }
  const clock = async () => page.evaluate(() => { const b = document.querySelector('#histBtn'); return b ? (b.getAttribute('aria-label') || '') + ' | text:' + b.textContent.replace(/\s+/g, ' ').trim() : '(no clock)' })
  const winText = () => page.evaluate(() => (document.querySelector('.chgwin[role=dialog], .chgwin') ?.textContent || '').replace(/\s+/g, ' ').trim())
  await X.L.go(page, 'editsched'); await sleep(2000)
  await addGround(w, 'F4 149 LINE', 'Kestrel', WED)
  await X.L.go(page, 'editsched'); await sleep(1500)
  await X.pic(w, 'f4-01-ad9-added')
  row('F4', P, 'ad9 adds ground row "F4 149 LINE" on Wed with Kestrel', 'row on screen', ((await U.bodyText(page)).includes('F4 149 LINE') ? 'row "F4 149 LINE" on screen' : 'row not on screen'), (await U.bodyText(page)).includes('F4 149 LINE') ? 'PASS' : 'FAIL', 'f4-01-ad9-added.png')
  await swap('ad2')
  await X.L.go(page, 'editsched'); await sleep(2000)
  await addGround(w, 'F4 142 LINE', 'Hunter', WED)
  await X.L.go(page, 'editsched'); await sleep(1500)
  await X.pic(w, 'f4-02-ad2-added')
  row('F4', P, 'ad2 adds ground row "F4 142 LINE" on Wed with Hunter', 'row on screen', ((await U.bodyText(page)).includes('F4 142 LINE') ? 'row "F4 142 LINE" on screen' : 'row not on screen'), (await U.bodyText(page)).includes('F4 142 LINE') ? 'PASS' : 'FAIL', 'f4-02-ad2-added.png')
  await swap('ad')
  await X.L.go(page, 'editsched'); await sleep(2000)
  await X.pic(w, 'f4-03-ad-clock-before')
  const c0 = await clock()
  say('F4 ad clock before', c0)
  const hb = page.locator('#histBtn')
  if (w.phone) await hb.tap(); else await hb.click()
  await sleep(1000)
  await X.pic(w, 'f4-04-ad-changes-window')
  const t0 = await winText()
  say('F4 ad window', t0.slice(0, 600))
  row('F4', P, 'ad (master, 142) opens the changes window', 'the 142 line is listed as new; nothing of 149 ("F4 149 LINE", Kestrel)', t0.slice(0, 400), /F4 142 LINE/.test(t0) && !/F4 149 LINE/.test(t0) ? 'PASS' : (t0 ? 'FAIL' : 'RECORD'), 'f4-04-ad-changes-window.png')
  const mark = page.getByRole('button', { name: /Mark all as seen/i }).first()
  if (await mark.count()) { if (w.phone) await mark.tap(); else await mark.click(); await sleep(900) }
  else say('F4 no Mark all as seen button')
  await X.pic(w, 'f4-05-ad-after-mark-all')
  const t1 = await winText(), c1 = await clock()
  row('F4', P, 'ad presses "Mark all as seen"', 'nothing new is listed; the clock count drops', 'window: ' + t1.slice(0, 250) + ' ; clock before: ' + c0 + ' ; after: ' + c1, (await mark.count()) !== undefined && c1 !== c0 ? 'PASS' : 'RECORD', 'f4-05-ad-after-mark-all.png')
  await page.keyboard.press('Escape').catch(() => {}); await sleep(500)
  row('F4', P, 'ad switches to 149 with the "142 ▾" schedules menu', 'menu offers 149', 'this build draws no such menu at the top left (see F2 row); steps 4 and 5 cannot be done as ad. The 149 side is checked as 149\'s own admin below.', 'RECORD', 'f2-05-top-left-clicked.png (desktop F2)')
  // reload and sign in again as ad: still nothing new
  await page.reload(); await sleep(1500)
  await X.login(page, 'ad').catch(() => {})
  await X.L.go(page, 'editsched'); await sleep(1500)
  await X.pic(w, 'f4-06-ad-after-reload')
  const c2 = await clock()
  row('F4', P, 'ad reloads and signs in again (142)', 'still nothing new', 'clock: ' + c2, c2 === c1 ? 'PASS' : 'RECORD', 'f4-06-ad-after-reload.png')
  await swap('ad9')
  await X.L.go(page, 'editsched'); await sleep(2000)
  await X.pic(w, 'f4-07-ad9-clock')
  const c9 = await clock()
  if (w.phone) await page.locator('#histBtn').tap(); else await page.locator('#histBtn').click()
  await sleep(1000)
  await X.pic(w, 'f4-08-ad9-changes-window')
  const t9 = await winText()
  row('F4', P, 'ad9 (149) opens his changes window (his own 149 line was made by himself)', '149 line shown; nothing of 142 ("F4 142 LINE", Hunter)', 'clock: ' + c9 + ' ; window: ' + t9.slice(0, 350), !/F4 142 LINE/.test(t9) && t9 ? 'PASS' : (t9 ? 'FAIL' : 'RECORD'), 'f4-08-ad9-changes-window.png')
  await X.fin(w)
}
