/* THE MOCK-UP FOR POSTING OUT, ACCOUNTS AND GUEST FLYERS (27 Sep 26) — his rulings D229, D280–D293. Pictures of the
   REAL app (the production build on 4174, a fresh demo world each time) with the proposed controls drawn into its own
   markup and classes, and — where the app can already do it — the real thing done through its own controls (a real
   post-out, a real switch-off, a real delete of a person). Nothing here is built; the page is
   docs/mock/post-out.html. Run from raptor-port/, the preview on 4174:
     node scripts/handpass/am/mk-post-out.mjs
   A RECORD once the page is approved: re-running it on a later build draws into screens that may have moved. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const OUT = 'docs/mock/img/post-out'
mkdirSync(OUT, { recursive: true })
const BASE = process.env.HP_URL || 'http://localhost:4174/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const done = []

async function open(w, h, scale = 1) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale })).newPage()
  await page.goto(BASE + '?fresh=1'); await page.waitForSelector('#luser')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return page
}
async function signIn(page, u, p = 'x') {
  if (!(await page.locator('#luser').count())) {
    for (const s of ['#logout', '#accOut', '#guestOut']) { const l = page.locator(s); if (await l.count() && await l.isVisible()) { await l.click(); break } }
    if (!(await page.locator('#luser').count())) { const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(300); await page.click('#drawerLogout') } }
    await page.waitForSelector('#luser')
  }
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(800)
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForTimeout(700) }
async function snap(page, name, target) {
  const f = `${OUT}/${name}.png`
  if (target) await page.locator(target).first().screenshot({ path: f })
  else await page.screenshot({ path: f })
  done.push(name); console.log('ok', name)
}
async function step(name, fn) { try { await fn() } catch (e) { console.log('FAILED', name, String(e.message || e).slice(0, 200)) } }
/* the app's own message pop-up (the probe bridge's window.toast → HOOKS.toast) */
const toast = (page, text, warn) => page.evaluate(({ text, warn }) => { window.toast(text, warn ? 'warn' : undefined) }, { text, warn })

/* ---------- 1 · The post-out sheet: WHICH posting is it? (D229, D283) ---------- */
const OUTCOMES = `
  <div class="bidsheet-row postout mk-out" style="flex-direction:column;align-items:stretch;gap:6px">
    <span class="lab">What is this posting?</span>
    <button class="pchip on" style="text-align:left">✓ Overseas to another squadron<br><span class="note">On the date: archived on Quals · account suspended. Back later: restore and enable.</span></button>
    <button class="pchip" style="text-align:left">Leaving flying for good<br><span class="note">On the date: deleted — account and person. Old schedules show an empty seat.</span></button>
    <button class="pchip" style="text-align:left">Another workplace, still flies with us<br><span class="note">On the date: becomes SANS. Stays on the roster and can sign in.</span></button>
    <button class="pchip" disabled style="text-align:left;opacity:.45">Transfer to another squadron<br><span class="note">Comes with the shared database.</span></button>
  </div>`
async function drawSheet(page) {
  await page.evaluate(html => {
    const chip = document.querySelector('[data-testid="po-archive"]'); if (!chip) throw new Error('no po-archive')
    const row = chip.closest('.bidsheet-row'); const tmp = document.createElement('div'); tmp.innerHTML = html
    row.after(...tmp.childNodes); chip.remove()
    const c = document.querySelector('[data-testid="po-confirm"]'); c.textContent = 'Post out from 14 Oct 2026'
    const note = c.parentElement.querySelector('.note'); if (note) note.textContent = 'Nothing changes until that day. On it, the app does what the posting says — each step can also be done by hand.'
  }, OUTCOMES)
}
async function openPostOut(page) {
  await go(page, 'leavewar'); await page.waitForTimeout(1200)
  const m = page.locator('[data-testid="month-OCT"]'); if (await m.count()) { await m.click(); await page.waitForTimeout(900) }
  await page.locator('[data-testid="cell-rocky-2026-10-14"]').click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="bid-postout"]').click(); await page.waitForTimeout(300)
  await page.fill('[data-testid="po-date"]', '2026-10-14')
}
await step('1 sheet desktop', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a')
  await openPostOut(page); await drawSheet(page); await page.waitForTimeout(200)
  await snap(page, 'desktop-1-postout-sheet')
})
await step('1 sheet phone', async () => {
  const page = await open(390, 844); await signIn(page, 'ad', 'a')
  await openPostOut(page); await drawSheet(page)
  await page.evaluate(() => { const s = document.querySelector('[data-testid="po-confirm"]'); s && s.scrollIntoView({ block: 'end' }) }); await page.waitForTimeout(200)
  await snap(page, 'phone-1-postout-sheet')
})

/* ---------- 2 · Overseas: archived, account SUSPENDED; the editor's Suspend / Enable / Delete account (D280, D285) ---------- */
await step('2 accounts', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a'); await go(page, 'admin')
  /* the REAL switch-off first (the act "Suspend" names), then the words drawn in */
  await page.click('[data-acct="achex"] .acc-tap'); await page.click('#accEdOnOff'); await page.waitForTimeout(300)
  await page.click('[data-acct="achex"] .acc-tap'); await page.waitForTimeout(200)
  await page.evaluate(() => {
    const row = document.querySelector('[data-acct="achex"]')
    for (const t of row.querySelectorAll('.acc-tag')) if (/switched off/.test(t.textContent)) t.textContent = 'suspended'
    const sub = row.querySelector('.acc-sub'); if (sub && !/archived/.test(sub.textContent)) sub.insertAdjacentHTML('beforeend', '<span class="acc-tag" style="color:#f0c36d">archived callsign</span>')
    document.getElementById('accEdOnOff').textContent = 'Enable'
    const cancel = document.getElementById('accEdCancel')
    cancel.insertAdjacentHTML('beforebegin', '<button class="abtn danger" id="mkDel">Delete account</button>')
    row.scrollIntoView({ block: 'center' })
  })
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.opacity = '0' })
  await snap(page, 'desktop-2-suspended', '#accList')
  /* the delete asks twice and says what goes */
  await page.evaluate(() => {
    const b = document.getElementById('mkDel'); b.textContent = 'Tap again to delete Hex'
    b.style.cssText = 'background:rgba(240,85,95,.18);color:#fff;border-color:#f0555f'
    b.closest('.acc-edit').insertAdjacentHTML('beforeend', '<p class="adm-note acc-note" style="color:#FBB4B9">Deletes Hex for good — his account, his Quals row, his inputs and his Leave War leave and OIL. Old schedules show an empty seat where he flew. This cannot be undone.</p>')
  })
  await snap(page, 'desktop-2b-delete-confirm', '[data-acct="achex"]')
  /* his sign-in, suspended — the REAL switched-off screen, its words changed */
  await signIn(page, 'hex')
  await page.evaluate(() => {
    const h = document.querySelector('#accessOff .acc-h'); if (h) h.textContent = 'Your access is suspended'
    const p = document.querySelector('#accessOff .acc-p'); if (p) p.textContent = 'An admin has suspended this account. Ask an admin to enable it when you are back.'
  })
  await snap(page, 'desktop-2c-signin-suspended', '#accessOff .login-card')
})

/* ---------- 3 · He's back: Restore on Quals, with the prompt (D284) ---------- */
await step('3 back', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a'); await go(page, 'quals')
  await page.click('#qViewW').catch(() => {}); await page.waitForTimeout(300)
  await page.evaluate(() => {
    const tr = [...document.querySelectorAll('#qtbl tbody tr')].find(r => (r.querySelector('.qname')?.textContent || '').trim() === 'Hex')
    if (!tr) throw new Error('no Hex row')
    tr.style.outline = '2px solid #3cc6e6'; tr.style.outlineOffset = '-2px'
    tr.scrollIntoView({ block: 'center' })
    const wrap = document.querySelector('.qwrap')
    wrap.insertAdjacentHTML('beforebegin', `<div class="adm-note" style="margin:8px 0;padding:10px 12px;border:1px solid #3cc6e6;border-radius:10px;background:rgba(60,198,230,.08);color:#e8edf2;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <span><b>Hex is back.</b> His quals and CAT are as he left them — check them now.</span>
      <button class="abtn primary">Check Hex's quals</button><button class="abtn">Later</button></div>`)
  })
  await snap(page, 'desktop-3-back')
})

/* ---------- 4 · Another workplace, still flies: SANS (D283) ---------- */
await step('4 sans', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a')
  /* the REAL post-out on the Leave War (archive off), so his row greys from the date as today */
  await openPostOut(page)
  await page.locator('[data-testid="po-archive"]').click(); await page.locator('[data-testid="po-confirm"]').click(); await page.waitForTimeout(700)
  await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300)
  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="row-rocky"]'); if (!r) throw new Error('no row')
    const cs = r.querySelector('.cs'); if (cs) cs.insertAdjacentHTML('afterend', '<span style="margin-left:4px;font:600 9px/1 system-ui;padding:2px 4px;border-radius:4px;background:#7c5cc4;color:#fff">SANS</span>')
    r.scrollIntoView({ block: 'center' })
  })
  await snap(page, 'desktop-4a-sans-off')
})
await step('4b sans on', async () => {
  /* Show SANS on (the REAL switch): from the date he rides the SANS group, tracked — his row drawn there (a fresh
     world, no post-out, so the row is the clean one he would have from that day) */
  const page = await open(1440, 900); await signIn(page, 'ad', 'a')
  /* he IS SANS from the date — made so the way an admin would today: the SANS tick on his Quals row (the real write) */
  await go(page, 'quals'); await page.click('#qViewW'); await page.waitForTimeout(200)
  await page.click('#qEdit'); await page.waitForTimeout(300)
  await page.evaluate(() => { const c = document.querySelector('#qtbl [data-q="rocky|san"]'); if (!c) throw new Error('no SANS cell'); c.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
  await page.waitForTimeout(300); await page.click('#qSave').catch(() => {}); await page.waitForTimeout(300)
  await go(page, 'leavewar'); await page.waitForTimeout(1200)
  const m = page.locator('[data-testid="month-OCT"]'); if (await m.count()) { await m.click(); await page.waitForTimeout(900) }
  await page.click('[data-testid="settings-open"]'); await page.waitForTimeout(300)
  await page.click('[data-testid="sans-toggle"]'); await page.waitForTimeout(300); await page.keyboard.press('Escape'); await page.waitForTimeout(900)
  await page.evaluate(() => {
    const r = document.querySelector('[data-testid="row-rocky"]'); if (!r) throw new Error('no row')
    r.style.outline = '2px solid #3cc6e6'; r.style.outlineOffset = '-2px'
    r.scrollIntoView({ block: 'center' })
  })
  await snap(page, 'desktop-4b-sans-on')
})

/* ---------- 5 · Leaving flying for good: deleted (D287) — the REAL delete of a person, before and after ---------- */
await step('5 delete', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a')
  /* the flying line Vector sits on (Tuesday's RU), the same rectangle before and after */
  const rect = await page.evaluate(() => {
    const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Vector')
    const d = [...document.querySelectorAll('#vWeek .day')][1]
    const p = d.querySelector(`.puck[data-person="${id}"]`); if (!p) throw new Error('Vector not on Tuesday')
    p.scrollIntoView({ block: 'center' })
    const pb = p.getBoundingClientRect(), db = d.getBoundingClientRect()
    /* every scroller that moved, so the after-picture can stand in the same place */
    const scrolled = [document.scrollingElement, ...document.querySelectorAll('*')].filter(e => e && (e.scrollTop || e.scrollLeft)).map((e, i) => { e.setAttribute('data-mk-scroll', String(i)); return [i, e.scrollTop, e.scrollLeft] })
    return { clip: { x: db.x + 2, y: Math.max(0, pb.y - 70), width: db.width - 4, height: 150 }, scrolled }
  })
  const box = async name => { await page.screenshot({ path: `${OUT}/${name}.png`, clip: rect.clip }); done.push(name); console.log('ok', name) }
  await box('desktop-5a-before-delete')
  /* the delete, and the day redrawn in place (no page change, so every scroller stays where it was) */
  await page.evaluate(() => { const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Vector'); delete window.PEOPLE[id]; window.afterSchedMutate() })
  await page.waitForTimeout(800)
  await page.evaluate(sc => { for (const [i, t, l] of sc) { const e = i === 0 ? document.scrollingElement : document.querySelector(`[data-mk-scroll="${i}"]`); if (e) { e.scrollTop = t; e.scrollLeft = l } } }, rect.scrolled)
  await page.waitForTimeout(300)
  await box('desktop-5b-after-delete')
})

/* ---------- 6 · Names: an archived man's callsign may go to someone new (D286) ---------- */
await step('6 names', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a'); await go(page, 'admin')
  await page.evaluate(() => { const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ace'); window.PEOPLE[id].archived = true })
  await signIn(page, 'ace2@mail'); await page.fill('#accCs', 'Ace'); await page.fill('#accIni', 'AJ'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signIn(page, 'ad', 'a'); await page.evaluate(() => { const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ace'); window.PEOPLE[id].archived = true })
  await go(page, 'quals'); await go(page, 'admin')
  await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(250)
  if (await page.locator('#apvModeNew').count()) await page.click('#apvModeNew')
  await page.evaluate(() => {
    const n = document.getElementById('apvNote')
    if (n) n.innerHTML = 'An archived man already has the callsign <b>Ace</b> — this is someone new. If the archived Ace is ever restored, one of the two must be renamed first.'
    document.querySelector('[data-approving]').scrollIntoView({ block: 'center' })
  })
  await snap(page, 'desktop-6a-approve-archived-name', '[data-approving]')
  /* Restore while the name is in use: refused, with the reason */
  await go(page, 'quals')
  await page.click('#qArchToggle'); await page.waitForTimeout(250)
  await page.evaluate(() => { const l = document.querySelector('[data-testid="qarchlist"]'); l && l.scrollIntoView({ block: 'center' }) })
  await toast(page, 'Ace is taken on the roster — rename one of them before restoring', true)
  await snap(page, 'desktop-6b-restore-refused')
})

/* ---------- 7 · The admin's member view: tap the badge (D292) ---------- */
await step('7 member view', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a')
  await page.evaluate(() => { const b = document.getElementById('roleBadge'); b.style.cursor = 'pointer'; b.title = 'Switch to the member view'; b.style.outline = '2px solid #3cc6e6' })
  await snap(page, 'desktop-7a-badge-admin', '.topbar')
  await page.evaluate(() => window.raptorRole && window.raptorRole('main')); await page.waitForTimeout(500)
  await page.evaluate(() => {
    const b = document.getElementById('roleBadge'); if (b) { b.textContent = 'Saber · Member'; b.className = 'abtn rolechip main'; b.style.outline = '2px solid #3cc6e6'; b.title = 'Back to the admin view' }
    /* a member's tabs: no Edit Schedule, no Admin */
    for (const p of ['editsched', 'admin']) for (const a of document.querySelectorAll(`.topbar [data-page="${p}"]`)) a.style.display = 'none'
  })
  await snap(page, 'desktop-7b-badge-member', '.topbar')
  const ph = await open(390, 844); await signIn(ph, 'ad', 'a')
  await ph.click('#burger'); await ph.waitForTimeout(400)
  await ph.evaluate(() => {
    const a = document.getElementById('drawerAcct')
    a.insertAdjacentHTML('afterend', '<button class="abtn" style="width:100%;margin:6px 0 10px">Switch to the member view</button>')
  })
  await snap(ph, 'phone-7c-drawer-switch')
})

/* ---------- 8 · Guest flyers from another community (later — D288, D289): the mark on a puck ---------- */
await step('8 guest pucks', async () => {
  const page = await open(1440, 900, 2); await signIn(page, 'ad', 'a')
  await page.evaluate(() => {
    /* a real puck that wears a warning chip, to see what the mark shares its corner with */
    const warned = [...document.querySelectorAll('#vWeek .puck.sm')].find(p => p.children.length > 2 && p.querySelector('.nm'))
    const chip = warned ? [...warned.children].find(c => !c.classList.contains('nm') && !c.classList.contains('role')) : null
    const chipHTML = chip ? chip.outerHTML : ''
    const puck = (cs, cat, cls = '', extra = '', w = '') => `<span class="puck sm ${cls}" style="position:relative">${w}<span class="nm">${cs}</span><span class="role q-${cat.toLowerCase()}">${cat}</span>${extra}</span>`
    const tri = '<span style="position:absolute;top:0;left:0;width:0;height:0;border-top:9px solid #f5a524;border-right:9px solid transparent;border-top-left-radius:3px"></span>'
    const bar = '<span style="position:absolute;left:3px;right:3px;top:-2px;height:3px;border-radius:2px;background:#f5a524"></span>'
    const dot = '<span style="position:absolute;top:-4px;left:-4px;width:9px;height:9px;border-radius:50%;background:#f5a524;box-shadow:0 0 0 2px #15181d"></span>'
    const row = (label, a, b) => `<div style="display:flex;align-items:center;gap:14px;margin:0 0 12px"><span style="width:250px;color:#aeb8c3;font:13px system-ui">${label}</span><span style="display:flex;gap:10px">${a}${b}</span></div>`
    const html = `<div id="mkGuests" style="position:fixed;left:40px;top:120px;z-index:999;background:#15181d;border:1px solid #262b33;border-radius:12px;padding:18px 20px;width:760px">
      <div style="font:600 13px system-ui;color:#e8edf2;margin:0 0 14px">Two men called Viper on one schedule — ours, and a guest from the F-16 community</div>
      ${row('Today (ours)', puck('Viper', 'C'), puck('Crusader', 'B'))}
      ${row('A · orange corner on a guest', puck('Viper', 'C', '', tri), puck('Crusader', 'B', '', tri))}
      ${row('B · orange line along the top', puck('Viper', 'C', '', bar), puck('Crusader', 'B', '', bar))}
      ${row('C · orange dot on the corner', puck('Viper', 'C', '', dot), puck('Crusader', 'B', '', dot))}
      ${chipHTML ? row('With a warning chip — A · B · C', puck('Viper', 'C', '', tri, chipHTML) + puck('Viper', 'C', '', bar, chipHTML), puck('Viper', 'C', '', dot, chipHTML)) : ''}
      <div style="font:13px system-ui;color:#aeb8c3;margin:14px 0 8px">Where there is room — the lists, the pickers, a tap or hover — the full name:</div>
      <div style="display:flex;gap:18px;align-items:center;font:13px system-ui;color:#e8edf2">
        <span>${puck('Viper', 'C', '', tri)}</span><span><b>Viper · F-16</b> <span style="color:#aeb8c3">— a guest flyer from the F-16 community</span></span></div>
    </div>`
    document.body.insertAdjacentHTML('beforeend', html)
  })
  await snap(page, 'desktop-8-guest-marks', '#mkGuests')
})

console.log(`\n${done.length} pictures: ${done.join(', ')}`)
await browser.close()
