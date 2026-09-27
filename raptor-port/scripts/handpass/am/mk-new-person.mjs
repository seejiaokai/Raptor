/* THE MOCK-UP FOR D214 (26 Sep 26) — "create him right here", and the person's own sign-up asking
   the same things. Pictures of the REAL app (the production build on 4173) with the proposed fields
   drawn into its own markup and classes — nothing is built yet. Desktop 1440×900 and phone 390×844.
   Output: docs/mock/img/new-person-account/*.png; the page is docs/mock/new-person-account.html.
   Run from raptor-port/: node scripts/handpass/am/mk-new-person.mjs

   A RECORD, NOT A TOOL TO RE-RUN (Fable's code read #4, 26 Sep 26). It drew the proposal on
   the app as it was BEFORE [ACCOUNTS-NEW-PERSON] was built — the old sign-up's Name box
   (#accFull) among them. The build has since replaced those screens with the real thing, so
   run now it stops at #accFull, and drawing the proposal into the built screens would picture
   neither. The approved design (D224) is the page and its pictures, which stay as drawn. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const OUT = 'docs/mock/img/new-person-account'
mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })

async function open(w, h) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage()
  await page.goto(BASE); await page.waitForSelector('#luser')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return page
}
async function signIn(page, u, p = 'x') {
  if (!(await page.locator('#luser').count())) {
    for (const s of ['#logout', '#accOut', '#guestOut']) { const l = page.locator(s); if (await l.count() && await l.isVisible()) { await l.click(); break } }
    await page.waitForSelector('#luser')
  }
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(700)
}

/* the sign-up card: callsign, initials, pilot / WSO / personnel, CAT (the Name box gives way to
   initials — the Quals row has no name field) */
const SIGNUP = `
  <label for="accCs">Displayed callsign/name</label><input id="accCs" value="Viper" autocomplete="off">
  <label for="accIni">Initials</label><input id="accIni" value="JKB" autocomplete="off">
  <label for="accSeat">Pilot, WSO or personnel</label>
  <select id="accSeat" class="mk-sel"><option>Pilot</option><option>WSO</option><option>Personnel (ground crew)</option></select>
  <label for="accCat">CAT</label>
  <select id="accCat" class="mk-sel"><option>C</option></select>
  <div class="err" id="accErr"></div>`
async function drawSignup(page) {
  await page.evaluate(html => {
    const f = document.getElementById('accForm')
    const from = f.querySelector('label[for="accCs"]'), to = f.querySelector('#accErr')
    let n = from; const kill = []; while (n && n !== to) { kill.push(n); n = n.nextElementSibling } kill.push(to)
    const tmp = document.createElement('div'); tmp.innerHTML = html
    for (const c of [...tmp.childNodes]) f.insertBefore(c, kill[0])
    kill.forEach(k => k.remove())
    const cs = getComputedStyle(f.querySelector('#accCs'))
    for (const s of f.querySelectorAll('.mk-sel')) Object.assign(s.style, { background: cs.backgroundColor, border: cs.border, borderRadius: cs.borderRadius,
      padding: cs.padding, color: cs.color, font: cs.font, width: '100%', boxSizing: 'border-box', marginBottom: cs.marginBottom })
  }, SIGNUP)
}

/* Admin → Users: the new-person fields, the app's own .mfield / .adm-2col / .abtn */
const seg = on => `<div class="acc-acts" style="margin:0 0 10px"><button class="abtn${on === 'roster' ? ' primary' : ''}">On the roster</button><button class="abtn${on === 'new' ? ' primary' : ''}">New person</button></div>`
const NEWP = (cs, ini, seat, cat) => `
  <div class="adm-2col" style="display:flex;gap:10px">
    <div class="mfield"><label>Callsign/Name</label><input value="${cs}"></div>
    <div class="mfield"><label>Initials</label><input value="${ini}"></div></div>
  <div class="adm-2col" style="display:flex;gap:10px">
    <div class="mfield"><label>Pilot, WSO or personnel</label><select><option>${seat}</option></select></div>
    <div class="mfield"><label>CAT</label><select><option>${cat}</option></select></div></div>`

async function drawAdd(page) {
  await page.evaluate(({ seg, newp }) => {
    const pid = document.getElementById('accAddPid').closest('.mfield')
    const wrap = document.createElement('div')
    wrap.innerHTML = `<div class="mfield"><label>Person</label></div>` + seg + newp +
      `<p class="adm-note" style="margin:-2px 0 12px">Makes his row on Quals and his account together — the one place a new person is made. Leave the sign-in blank for someone who won't use the app (a SANS man). Flight and quals are set on Quals.</p>`
    pid.replaceWith(...wrap.childNodes)
    const b = document.getElementById('accAdd'); b.textContent = 'Add person and account'
    document.getElementById('accAddName').value = 'nomad2@mail'
    document.getElementById('accAddName').placeholder = 'name@mail (blank for someone who will not sign in)'
  }, { seg: seg('new'), newp: NEWP('Blaze', 'RTK', 'WSO', 'D') })
}
async function drawApprove(page) {
  await page.evaluate(({ seg, newp }) => {
    const box = document.querySelector('[data-approving]')
    const pid = box.querySelector('#apvPid').closest('.mfield')
    const note = box.querySelector('.adm-note')
    const wrap = document.createElement('div')
    wrap.innerHTML = `<div class="mfield"><label>Person</label></div>` + seg + newp +
      `<p class="adm-note" style="margin:-2px 0 12px">Filled from what he gave when he signed up — change anything before you give access.</p>`
    pid.replaceWith(...wrap.childNodes); note.remove()
    box.querySelector('#apvGo').textContent = 'Add person and give access'
    const sub = document.querySelector('[data-req] .acc-sub'); if (sub) sub.innerHTML = sub.innerHTML.replace(/asked as <b>[^<]*<\/b> · [^·]*·/, 'asked as <b>Viper</b> · JKB · Pilot · CAT C ·')
  }, { seg: seg('new'), newp: NEWP('Viper', 'JKB', 'Pilot', 'C') })
}
async function users(page) {
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
  if (!await page.locator('#admUsers').isVisible()) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(300) }
}

for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
  const page = await open(w, h)
  /* 1 — the person signs up */
  await signIn(page, 'viper@mail')
  await drawSignup(page)
  await page.screenshot({ path: `${OUT}/${tag}-1-signup.png` })
  /* a real request, so the admin's list has it (the typed callsign and name) */
  await page.evaluate(() => { document.getElementById('accForm').remove() })
  await page.reload(); await page.waitForSelector('#luser')
  await signIn(page, 'viper@mail')
  await page.fill('#accCs', 'Viper'); await page.fill('#accFull', 'JKB'); await page.click('#accSend'); await page.waitForTimeout(300)
  /* 2a — D216: the admin signs in to a lit bell and a toast when he taps it */
  await signIn(page, 'ad', 'a')
  await page.evaluate(() => { const b = document.getElementById('notifyBell'); if (b) b.classList.add('on') })
  await page.evaluate(() => window.toast && window.toast('1 waiting for access — opening Admin → Users'))
  await page.screenshot({ path: `${OUT}/${tag}-2a-bell.png` })
  /* 2 — the admin approves: the new-person fields, filled from the sign-up */
  await users(page)
  await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(300)
  await drawApprove(page)
  await page.locator('#admUsers').scrollIntoViewIfNeeded()
  await page.evaluate(() => document.querySelector('[data-approving]').scrollIntoView({ block: 'center' }))
  await page.screenshot({ path: `${OUT}/${tag}-2-approve.png` })
  await page.click('#apvCancel').catch(() => {})
  /* 3 — the admin adds a brand-new person himself */
  await page.reload(); await page.waitForSelector('#luser'); await signIn(page, 'ad', 'a'); await users(page)
  await drawAdd(page)
  await page.evaluate(() => document.getElementById('accAdd').scrollIntoView({ block: 'center' }))
  await page.screenshot({ path: `${OUT}/${tag}-3-add.png` })
  await page.close()
}
await browser.close()
console.log('done')
