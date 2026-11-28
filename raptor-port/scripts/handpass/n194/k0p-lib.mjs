// k0p-lib - section 1 (the guard rail) presser, chat 194, 26 Nov 26 (brief
// docs/superpowers/briefs/2026-11-26-msq-s1-k0p-brief.md). Self-contained helpers on the BUILT app served at 4741 (the
// n162/n166/n175 helpers hard-code 4700, so their bodies are copied here with the port and sizes of this brief):
//   d = desktop Chromium 1536x864, p = his iPhone's size, WebKit 390x844 with touch - both at deviceScaleFactor 2.
// THE WORLD (n176/world.mjs's, made again here because K2a removed Add a person's Home squadron box - his D2729 Q1 - so a
// man of 150 is added with 150 picked): Saber on 142 → Admin → Squadrons → + New squadron 150 (first admin Kestrel · 149)
// → pick 150 → Admin → Users → + Add a person: Mako (Pilot B, sign-in mako, Admin), Jackal (WSO C), Onyx (Pilot IP), Ace
// (Pilot B) then Ace archived; Kestrel's 150 line None; back on 142: Hunter Plan of 149, View of 150; 142's Ace archived.
// Pictures go to docs/img/handpass/2026-11-26-msq-s1-k0p/. Nothing here writes the app's code.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const URL_ = process.env.K0P_URL || 'http://localhost:4741/'
export const OUT = resolve(ROOT, 'docs/img/handpass/2026-11-26-msq-s1-k0p'); mkdirSync(OUT, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n194-k0p'); mkdirSync(TMP, { recursive: true })
export const WORLD = resolve(TMP, 'state-world.json')
export const TEAL = '#0D9488'
console.log('k0p-lib v1 ' + URL_)
export const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 390, h: 844, eng: 'webkit' } }
export const USERS = { saber: ['ad', 'a'], hunter: ['ad2', 'a2'], kestrel: ['ad9', 'a9'], ranger: ['us', 'us'], mako: ['mako', 'm'] }
export const ERRS = []
const browsers = {}
export async function mk(sz, { storageState, eng } = {}) {
  const S = SIZES[sz]; const E = eng || S.eng
  if (!browsers[E]) browsers[E] = await (E === 'webkit' ? webkit : chromium).launch()
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: E !== 'webkit' ? true : true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[E].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m); ERRS.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t); ERRS.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); ERRS.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
export function FACT(k, v) { console.log(`FACT ${k}=${JSON.stringify(v)}`) }
export const wait = (s, ms) => s.page.waitForTimeout(ms)
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function signIn(s, who, q = '') {
  const [u, p] = USERS[who]
  const { page } = s
  await page.goto(URL_ + q); await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(600)
}
export async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
export const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }
}, sel)
export const covered = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return 'not drawn'
  const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return `off screen at ${Math.round(x)},${Math.round(y)}`
  const t = document.elementFromPoint(x, y)
  return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName.toLowerCase()}${t?.id ? '#' + t.id : ''}${t?.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`
}, sel)
export const pageOn = s => s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
export const barSq = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 }
  const m = [...document.querySelectorAll('.topbar .mark, .drawer-sqn .mark')].find(shown)
  return m ? m.textContent.replace(/\s+/g, ' ').trim() : null
})
export const toastNow = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const c = getComputedStyle(t); return c.opacity === '0' || c.display === 'none' || c.visibility === 'hidden' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')
export async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    if (s.desk) await s.page.mouse.click(s.W - 8, 500); else await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20))
    await s.page.waitForTimeout(400)
  }
}
export async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 500); return }
  await hit(s, '#burger', 350)
  await hit(s, `#drawerNav a[data-page="${name}"]`, 500)
  await shut(s)
}
export async function tapAt(s, x, y) { if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await wait(s, 450) }
export async function tapCentre(s, sel) { const b = await boxOf(s, sel); if (!b) return null; await tapAt(s, b.x + b.w / 2, b.y + b.h / 2); return b }
/* the squadron pick, as a person makes it: the bar's picker (desktop) or ☰ → squadron line (phone) */
export async function pick(s, num) {
  const { page } = s
  if (s.desk) {
    await hit(s, '#sqnMenuBtn', 350)
    const row = page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first()
    await hit(s, row, 800)
  } else {
    await hit(s, '#burger', 350)
    if (!(await page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 350)
    const row = page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first()
    await hit(s, row, 800); await shut(s)
  }
  return barSq(s)
}
export async function usersTab(s) {
  if ((await pageOn(s)) !== 'page-admin') await go(s, 'admin')
  await wait(s, 300)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
}
export async function adminCat(s, label) {
  if ((await pageOn(s)) !== 'page-admin') await go(s, 'admin')
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + label) }).first(), 600)
}
export const windowsNow = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  const found = []
  for (const e of document.querySelectorAll('[role=dialog], [role=alertdialog], .floatwin, dialog[open], #dlgModal, .modal, .lwsheet, .sheet')) { if (!vis(e)) continue; if (found.some(o => o.contains(e))) continue; found.push(e) }
  return found.map(el => ({ what: (el.id ? '#' + el.id : '') + '.' + String(el.className).split(/\s+/).slice(0, 2).join('.'), words: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) }))
})
async function okDialogs(s) { for (let i = 0; i < 3; i++) { if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500) } }
const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
export async function give(s, pid, num, line) {
  await usersTab(s)
  const r = s.page.locator(`[data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click(); await s.page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = s.page.locator(lineBtn(num, line)); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await s.page.locator('#accEdSave').click(); await wait(s, 700); await okDialogs(s)
  return toastNow(s)
}
export async function archive(s, pid) {
  await usersTab(s)
  await hit(s, s.page.locator(`[data-person="${pid}"] .acc-tap`).first(), 700)
  await hit(s, '#accEdArchive', 900); await okDialogs(s)
  return toastNow(s)
}
export async function addPerson(s, cs, ini, seat, cat, signin = null, role = null) {
  const { page } = s
  await usersTab(s)
  if (!(await page.locator('#accAddBlock').count())) await hit(s, '#accAddOpen', 500)
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
  const sv = await page.evaluate(want => { const o = [...document.querySelector('#accAddSeat').options]; return (o.find(x => new RegExp('^' + want, 'i').test(x.textContent)) || o[1]).value }, seat === 'P' ? 'Pilot' : 'WSO')
  await page.selectOption('#accAddSeat', sv); await page.selectOption('#accAddCat', cat)
  if (signin) { await page.fill('#accAddName', signin); await wait(s, 200); if (role) await page.selectOption('#accAddRole', role) }
  await hit(s, '#accAdd', 800); await okDialogs(s)
  return toastNow(s)
}
export const rowsOf = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row[data-person]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.person + ':' + e.querySelector('.acc-name')?.textContent.trim()))
export async function makeWorld() {
  const s = await mk('d')
  try {
    await signIn(s, 'saber')
    await adminCat(s, 'Squadrons'); await hit(s, '#sqNew', 600)
    await s.page.fill('#sqNewNum', '150')
    await s.page.selectOption('#sqNewPlace', { index: 0 }).catch(() => {})
    FACT('world.newSqn.adminChoices', await s.page.evaluate(() => [...document.querySelector('#sqNewAdmin').options].map(o => o.textContent)))
    await s.page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' }).catch(e => FACT('world.newSqn.adminPickErr', String(e).slice(0, 120)))
    await hit(s, '#sqNewSave', 900); await okDialogs(s)
    FACT('world.newSqn', { toast: await toastNow(s), formStillOpen: !!(await vis(s, '#sqNewSave').count()) })
    FACT('world.archive.ace142', await archive(s, 'dj'))
    FACT('world.pick150', await pick(s, 150))
    for (const [cs, ini, seat, cat, sg, role] of [['Mako', 'MK', 'P', 'B', 'mako', 'admin'], ['Jackal', 'JK', 'W', 'C'], ['Onyx', 'OX', 'P', 'IP'], ['Ace', 'AC', 'P', 'B']]) FACT(`world.add.${cs}`, await addPerson(s, cs, ini, seat, cat, sg, role))
    await hit(s, '#accAddCancel', 400).catch(() => {})
    const rows = await rowsOf(s); FACT('world.150.rows', rows)
    const ace = rows.find(r => /:Ace$/.test(r))?.split(':')[0]; if (ace) FACT('world.archive.ace150', await archive(s, ace))
    const kes = rows.find(r => /:Kestrel/.test(r))?.split(':')[0]; if (kes) FACT('world.kestrel.none150', await give(s, kes, '150', 'none'))
    FACT('world.pick142', await pick(s, 142))
    FACT('world.hunter.plan149', await give(s, 'prowler', '149', 'plan'))
    FACT('world.hunter.view150', await give(s, 'prowler', '150', 'view'))
    await wait(s, 600); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
export async function world() { if (!existsSync(WORLD) || process.env.FRESH) await makeWorld(); return WORLD }
/* ---- pictures ---- */
export async function ring(s, b, tag = '') {
  return s.page.evaluate(([b, c, tag]) => {
    const d = document.createElement('div'); d.className = '__k0pring'; d.dataset.tag = tag
    Object.assign(d.style, { position: 'fixed', left: (b.x - 4) + 'px', top: (b.y - 4) + 'px', width: (b.w + 8) + 'px', height: (b.h + 8) + 'px', outline: `2px solid ${c}`, zIndex: 2147483647, pointerEvents: 'none', boxSizing: 'border-box', borderRadius: '4px' })
    document.body.appendChild(d)
  }, [b, TEAL, tag])
}
export const unring = s => s.page.evaluate(() => document.querySelectorAll('.__k0pring').forEach(e => e.remove()))
/* a picture: the whole screen <name>.png, and <name>-crop.png cut to the union of the boxes given */
export async function shot(s, name, rects = [], pad = 12) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  rects = rects.filter(Boolean)
  let clip = null
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${name}-crop.png`, clip })
  }
  console.log(`  picture ${name}.png${clip ? ' + -crop ' + JSON.stringify(clip) : ''}`)
  return clip
}
/* two pictures laid side by side in one image (drawn left, build right), each scaled to the same height, labelled */
export async function sideBySide(name, leftFile, rightFile, leftLabel, rightLabel) {
  const b = browsers.chromium || (browsers.chromium = await chromium.launch())
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  const d = f => 'data:image/png;base64,' + readFileSync(f).toString('base64')
  await p.setContent(`<html><body style="margin:0;background:#fff;font:14px system-ui"><div id="w" style="display:inline-flex;gap:24px;padding:16px;align-items:flex-start">
    <figure style="margin:0"><figcaption style="margin-bottom:6px;font-weight:600">${leftLabel}</figcaption><img id="a" src="${d(leftFile)}" style="border:1px solid #ccc"></figure>
    <figure style="margin:0"><figcaption style="margin-bottom:6px;font-weight:600">${rightLabel}</figcaption><img id="b" src="${d(rightFile)}" style="border:1px solid #ccc"></figure></div></body></html>`)
  await p.waitForTimeout(300)
  /* both at their natural pixel size halved (they are 2x pictures) so they read at screen size, side by side */
  const dims = await p.evaluate(() => { for (const i of document.querySelectorAll('img')) { i.style.width = (i.naturalWidth / 2) + 'px' } return [...document.querySelectorAll('img')].map(i => [i.naturalWidth, i.naturalHeight]) })
  const w = await p.locator('#w').boundingBox()
  await p.setViewportSize({ width: Math.ceil(w.width) + 2, height: Math.ceil(w.height) + 2 })
  await p.locator('#w').screenshot({ path: `${OUT}/${name}.png` })
  await ctx.close()
  console.log(`  picture ${name}.png (side by side) dims=${JSON.stringify(dims)}`)
  return dims
}
export const look = (s, sel) => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(n => n.getBoundingClientRect().width > 0); if (!e) return null; const c = getComputedStyle(e); return { text: e.textContent.trim().slice(0, 40), fontSize: c.fontSize, fontWeight: c.fontWeight, color: c.color, letterSpacing: c.letterSpacing, textTransform: c.textTransform, fontFamily: c.fontFamily.slice(0, 40) } }, sel)
