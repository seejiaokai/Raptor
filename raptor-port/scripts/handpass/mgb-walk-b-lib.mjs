// Walker B of the member / guest build bug check (5 Nov 26): shared set-up. Its own contexts (any size), the storage
// refuser (same wrapper as mg1105-lib.mjs / e2e/save-note.spec.ts), the OIL-bar route copied from e2e/oilwait.spec.ts.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = process.env.MG_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-member-guest-build/walk-b')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
export const URL = 'http://localhost:4251/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const results = [], errs = []
export const say = (l) => { results.push(l); console.log(l) }
export const note = (id, what) => say(`NOTE ${id} — ${typeof what === 'string' ? what : JSON.stringify(what)}`)
export const check = (id, name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${id} ${name} — saw ${JSON.stringify(got)}`)
export const notWalked = (id, why) => say(`NOT WALKED ${id} — ${why}`)

const COUNTER = () => {
  const w = window
  if (w.__lsWrap) return
  w.__lsWrap = true; w.__lsLog = []; w.__lsRefuse = false
  const set = Storage.prototype.setItem, rem = Storage.prototype.removeItem
  Storage.prototype.setItem = function (k, v) {
    const ok = !w.__lsRefuse
    w.__lsLog.push({ op: 'set', k: String(k), ok })
    if (!ok) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError')
    return set.call(this, k, v)
  }
  Storage.prototype.removeItem = function (k) {
    const ok = !w.__lsRefuse
    w.__lsLog.push({ op: 'remove', k: String(k), ok })
    if (!ok) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError')
    return rem.call(this, k)
  }
}
const browsers = {}
async function browserFor(kind) {
  if (!browsers[kind]) browsers[kind] = await (kind === 'chromium' ? chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) : webkit.launch())
  return browsers[kind]
}
/* kind 'desktop' = Chromium w x h; 'phone' = WebKit, mobile, touch */
export async function openAt(kind, w, h) {
  const phone = kind === 'phone'
  const b = await browserFor(phone ? 'webkit' : 'chromium')
  const ctx = await b.newContext({ viewport: { width: w, height: h }, ...(phone ? { isMobile: true, hasTouch: true } : {}), deviceScaleFactor: 2, acceptDownloads: true })
  await serveFrozen(ctx, URL)
  await ctx.addInitScript(COUNTER)
  const page = await ctx.newPage()
  const tag = `${kind}${w}x${h}`
  page.on('pageerror', e => errs.push(`[${tag}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${tag}] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${tag}] HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { if (d.type() === 'beforeunload') d.accept().catch(() => {}); else { errs.push(`[${tag}] dialog ${d.type()} ${d.message()}`); d.dismiss().catch(() => {}) } })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  return { ctx, page, tap: phone, tag }
}
export async function pinToday(page) {
  await page.evaluate(() => { if (typeof window.lwSetMemberToday === 'function') window.lwSetMemberToday('2000-01-01') })
}
export async function signIn(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(900)
}
export async function signOut(page) {
  const vis = async (sel) => page.locator(sel).first().isVisible().catch(() => false)
  for (const sel of ['#logout', '#guestOut', '#accOut']) if (await vis(sel)) { await page.locator(sel).first().click(); await page.waitForTimeout(700); return }
  const burger = page.locator('#burger')
  if (await burger.isVisible().catch(() => false)) { await burger.click(); await page.waitForTimeout(400) }
  await page.getByRole('button', { name: /Log ?out|Sign out/i }).first().click()
  await page.waitForTimeout(700)
}
export const refuse = (page, on) => page.evaluate(on => { window.__lsRefuse = on }, on)
export const go = async (page, to) => { await page.evaluate(p => window.go(p), to); await page.waitForFunction(p => window.CURPAGE === p, to).catch(() => {}); await page.waitForTimeout(450) }
export const shot = (page, name, clip) => page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) })
export async function finish(name) {
  for (const b of Object.values(browsers)) await b.close().catch(() => {})
  const lines = [...results, ...errs.map(e => 'BROWSER ' + e)]
  writeFileSync(join(OUT, `results-${name}.txt`), lines.join('\n') + '\n')
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT WALKED')).length} NOT WALKED · ${errs.length} browser errors`)
  if (errs.length) console.log(errs.join('\n'))
}

/* ---- the OIL-bar route (e2e/oilwait.spec.ts, first test) ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const SAT = '2026-07-18', SAT_DI = 5
async function fileIt(p, tap, iso, spec) {
  const press = (sel) => (tap ? p.locator(sel).tap() : p.locator(sel).click())
  await go(p, 'inputs')
  if ((await p.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') await press('#inCalBtn')
  await p.waitForSelector('#inpCal', { state: 'visible' })
  for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(at < want ? '#icNext' : '#icPrev'); await p.waitForTimeout(450)
  }
  await p.locator(`[data-icday="${iso}"]`).focus()
  await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]', { state: 'visible' })
  await press('#icPopAdd')
  await p.waitForSelector('#inpEditPop #inpEditType', { state: 'visible' })
  await p.selectOption('#inpEditPop #inpEditType', spec.type)
  await p.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  const ad = p.locator('#inpEditPop #inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.click()
  await p.fill('#inpEditPop #inpEditStart', spec.from); await p.fill('#inpEditPop #inpEditEnd', spec.to)
  await p.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  await press('#inpEditSave')
  await p.waitForTimeout(500)
  if (await p.locator('[data-testid="oilconf"]').count()) { await press('[data-testid="oil-yes"]'); await press('[data-testid="oilconf-save"]') }
  await p.waitForSelector('#inpEditPop', { state: 'hidden' })
  await p.locator('[data-testid="win-inputsday-x"]').click()
  await p.waitForTimeout(300)
}
const ground = (p) => p.evaluate(di => (window.DAYS[di].ground || []).map(r => `${r.prog}:${r.who}`), SAT_DI)
/* signed in as admin on a fresh page; leaves the OIL bar up on the Scheduler Board. opts.dragSize: set viewport for the drag.
   Returns true when the bar is up. */
export async function oilBarUp(page, tap, opts = {}) {
  const press = (sel) => (tap ? page.locator(sel).tap() : page.locator(sel).click())
  await pinToday(page)
  await signIn(page, 'ad', 'a')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
  if (opts.band) await raiseBand(page, tap)
  await fileIt(page, tap, SAT, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  await go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await page.evaluate(di => { const w = window; w.DAYS[di].ground.push({ prog: 'Hangar open day', str: '13:00', end: '15:00', who: '', rmks: '' }); w.afterSchedMutate(); w.fillSlot(`g:${di}.${w.DAYS[di].ground.length - 1}.+`, 'nick'); w.afterSchedMutate() }, SAT_DI)
  const before = await ground(page)
  const from = `#sbBoard [data-slot="g:${SAT_DI}.1"] .puck`, to = `#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`
  const vp = page.viewportSize()
  if (opts.dragSize) await page.setViewportSize(opts.dragSize)
  await page.waitForTimeout(300)
  await page.locator(to).evaluate(e => e.scrollIntoView({ block: 'center' }))
  const fb = await page.locator(from).boundingBox(), tb = await page.locator(to).boundingBox()
  await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await page.mouse.down()
  await page.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
  await page.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
  await page.mouse.up()
  await page.waitForSelector('[data-testid="oilconf-lead"]', { timeout: 6000 })
  if (opts.dragSize) await page.setViewportSize(vp)
  await page.waitForTimeout(300)
  if (opts.cancelByKey) { await page.locator('[data-testid="oilconf-cancel"]').focus(); await page.keyboard.press('Enter') } else await press('[data-testid="oilconf-cancel"]')
  if (opts.onTap) await opts.onTap()
  const up = await page.waitForSelector('[data-testid="oilbar"]', { timeout: 5000 }).then(() => true, () => false)
  return { up, before, after: await ground(page) }
}
/* measure the bar */
export const barFacts = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-testid="oilbar"]')
  if (!b) return null
  const r = b.getBoundingClientRect(), msg = b.querySelector('[data-testid="oilbar-text"]'), sign = b.querySelector('.sv-sign, .oil-sign, svg')
  const kids = [...b.children].map(k => { const q = k.getBoundingClientRect(); return { tag: k.tagName + '.' + k.className, l: Math.round(q.left), r: Math.round(q.right), t: Math.round(q.top), h: Math.round(q.height), cut: k.scrollWidth > k.clientWidth + 0.5 } })
  const m = msg.getBoundingClientRect()
  const sr = sign ? sign.getBoundingClientRect() : null
  return {
    cls: b.className, h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), vw: innerWidth, scrollW: document.documentElement.scrollWidth,
    pastRight: Math.max(...kids.map(k => k.r)) > innerWidth + 0.5, msgCut: msg.scrollWidth > msg.clientWidth + 0.5, msgH: Math.round(m.height), msgText: msg.textContent, oneLine: new Set(kids.map(k => k.t + k.h / 2)).size <= 2,
    kids, sign: sr ? { w: Math.round(sr.width), h: Math.round(sr.height), l: Math.round(sr.left), r: Math.round(sr.right) } : null,
    active: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName) : null,
    parent: (b.closest('.sb-top') && 'sb-top') || (b.closest('.topbar') && 'topbar') || b.parentElement.className,
  }
})

/* ---- helpers added for the scenario scripts ---- */
/* count amber-ish pixels in a box of the page (judged by pixels, lesson 22): returns { amber, total } */
export async function amberIn(ctx, page, box) {
  const buf = await page.screenshot({ clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, box.width), height: Math.max(1, box.height) } })
  const p2 = await ctx.newPage()
  const r = await p2.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    let amber = 0
    for (let i = 0; i < d.length; i += 4) if (d[i] > 170 && d[i + 1] > 120 && d[i + 2] < 140 && d[i] - d[i + 2] > 80) amber++
    return { amber, total: c.width * c.height }
  }, buf.toString('base64'))
  await p2.close()
  return r
}
/* raise the failed-save band the way mgb-look.mjs does: admin, refuse, flip the guest switch twice on Admin -> Users */
export async function raiseBand(page, tap) {
  await refuse(page, true)
  await go(page, 'admin')
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  const sw = page.locator('#admGuestView')
  await sw.click(); await page.waitForTimeout(300); await sw.click(); await page.waitForTimeout(1500)
}
/* facts of the failed-save strip, wherever it is: bar band (.topbar > .savestat.failed) or .saveband */
export const stripFacts = (page, sel) => page.evaluate(sel => {
  const b = document.querySelector(sel)
  if (!b) return null
  const r = b.getBoundingClientRect(), cs = getComputedStyle(b), msg = b.querySelector('.sv-msg'), lead = b.querySelector('.sv-msg b'), btn = b.querySelector('button')
  const br = btn.getBoundingClientRect(), mr = msg.getBoundingClientRect(), sign = b.querySelector('.sv-sign'), sr = sign ? sign.getBoundingClientRect() : null
  const rest = b.querySelector('.sv-rest')
  return {
    h: Math.round(r.height), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), vw: innerWidth,
    lead: lead && lead.textContent, leadWeight: lead && getComputedStyle(lead).fontWeight, retryRightGap: Math.round(innerWidth - br.right), retryBg: getComputedStyle(btn).backgroundColor, retryW: Math.round(br.width), retryIn: br.left >= 0 && br.right <= innerWidth,
    wordsLeft: Math.round(mr.left), wordsCut: msg.scrollWidth > msg.clientWidth + 0.5 || (rest && rest.scrollWidth > rest.clientWidth + 0.5),
    restText: rest && rest.textContent, restW: rest && Math.round(rest.getBoundingClientRect().width),
    sign: sr ? { x: sr.x, y: sr.y, w: sr.width, h: sr.height } : null, signBg: sign ? getComputedStyle(sign).backgroundColor + '|' + getComputedStyle(sign).backgroundImage.slice(0, 60) : null,
    shadow: cs.boxShadow, edgeTop: cs.borderTopColor, edgeBottom: cs.borderBottomColor, bg: cs.backgroundColor,
    btnShadow: getComputedStyle(btn).boxShadow,
  }
}, sel)
