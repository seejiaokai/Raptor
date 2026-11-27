// s2q-lib - section 2's three questions for him (chat 199, 26 Nov 26; brief
// docs/superpowers/briefs/2026-11-26-msq-s2-questions-brief.md): the shared helpers. Self-contained, as n194/k0p-lib is
// (the n175/n176 helpers hard-code 4700 and their world scripts no longer work): the BUILT app served at 4745 (this
// section's port), d = desktop Chromium 1440x900, p = his iPhone's size, WebKit 402x874 with touch (n175's phone, his
// iPhone's letters) - both at deviceScaleFactor 2.
// THE WORLD (k0p-lib makeWorld's, made again here through the app's own controls), then, as Saber, on 149: Merlin given a
// sign-in "merlin" (a 149 member with a sign-in, for question A) and Osprey made an admin of 149 (a second 149 admin, for
// question B). Pictures go to docs/mock/2026-11-25-msq-pick-guard-q3/drawn/q13-*, q14-*, q15-* (the questions' numbers on
// the one questions page; first written as 10-12 / A-C). Nothing here writes the app's code.
// THE MARK: what would be new in the app wears a teal dashed ring - 2px #0D9488, 4px clear of the part (draw-s2-lib's).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const URL_ = process.env.S2Q_URL || 'http://localhost:4745/'
export const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn'); mkdirSync(DRAWN, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n199-s2q'); mkdirSync(TMP, { recursive: true })
export const WORLD = resolve(TMP, 'state-world.json')
export const TEAL = '#0D9488'
export const COL = { '142': '#F28C28', '149': '#D4AF37', '150': '#3B82F6' }   /* round 5's sample colours (D2638), as s2-33 */
export const SIZES = { d: { desk: true, w: 1440, h: 900, eng: 'chromium' }, p: { desk: false, w: 402, h: 874, eng: 'webkit' } }
export const USERS = { saber: ['ad', 'a'], hunter: ['ad2', 'a2'], kestrel: ['ad9', 'a9'] }
export const ERRS = []
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), SZ = (process.env.SZ || '').split(',').filter(Boolean)
export const want = (k, sz) => (!ONLY.length || ONLY.includes(k)) && (!SZ.length || SZ.includes(sz))
console.log('s2q-lib v1 ' + URL_)
const browsers = {}
export async function mk(sz, { storageState } = {}) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit : chromium).launch()
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 } : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); ERRS.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); ERRS.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); ERRS.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
export function FACT(k, v) { console.log(`FACT ${k}=${JSON.stringify(v)}`) }
export const wait = (s, ms) => s.page.waitForTimeout(ms)
export const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
export async function signIn(s, who) {
  const [u, p] = USERS[who]; const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
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
export const box = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
}, sel)
export const words = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
export const pageOn = s => s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
export const barSq = s => s.page.evaluate(() => { const m = [...document.querySelectorAll('.topbar .mark, .drawer-sqn .mark')].find(e => e.getBoundingClientRect().width > 1); return m ? m.textContent.replace(/\s+/g, ' ').trim() : null })
export const toastNow = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const c = getComputedStyle(t); return c.opacity === '0' || c.display === 'none' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')
export async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    if (s.desk) await s.page.mouse.click(s.W - 8, 500); else await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20))
    await wait(s, 400)
  }
}
export async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 500); return }
  await hit(s, '#burger', 350); await hit(s, `#drawerNav a[data-page="${name}"]`, 500); await shut(s)
}
/* the squadron pick, as a person makes it: the bar's picker (desktop) or ☰ → squadron line (phone) */
export async function pick(s, num) {
  const { page } = s
  if (s.desk) { await hit(s, '#sqnMenuBtn', 350); await hit(s, page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first(), 800) }
  else {
    await hit(s, '#burger', 350)
    if (!(await page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 350)
    await hit(s, page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first(), 800); await shut(s)
  }
  return barSq(s)
}
export async function usersTab(s) {
  if ((await pageOn(s)) !== 'page-admin') await go(s, 'admin')
  await wait(s, 300)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
}
async function adminCat(s, label) {
  if ((await pageOn(s)) !== 'page-admin') await go(s, 'admin')
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + label) }).first(), 600)
}
export async function okDialogs(s) { for (let i = 0; i < 3; i++) { if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 500) } }
const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
export async function openRow(s, pid) {
  const r = s.page.locator(`#page-admin [data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); if (s.desk) await r.click(); else await r.tap()
  await s.page.waitForSelector('.acc-row.od-row-on .acc-edit', { timeout: 8000 }); await wait(s, 400)
}
async function give(s, pid, num, line) {
  await usersTab(s); await openRow(s, pid)
  const b = s.page.locator(lineBtn(num, line)); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await s.page.locator('#accEdSave').click(); await wait(s, 700); await okDialogs(s)
  return toastNow(s)
}
async function archive(s, pid) { await usersTab(s); await openRow(s, pid); await hit(s, '#accEdArchive', 900); await okDialogs(s); return toastNow(s) }
async function addPerson(s, cs, ini, seat, cat, signin = null, role = null) {
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
const rowsOf = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin .acc-row[data-person]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.person + ':' + e.querySelector('.acc-name')?.textContent.trim()))
export async function makeWorld() {
  const s = await mk('d')
  try {
    await signIn(s, 'saber')
    /* k0p-lib makeWorld's steps, unchanged */
    await adminCat(s, 'Squadrons'); await hit(s, '#sqNew', 600)
    await s.page.fill('#sqNewNum', '150')
    await s.page.selectOption('#sqNewPlace', { index: 0 }).catch(() => {})
    await s.page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' }).catch(e => FACT('world.newSqn.adminPickErr', String(e).slice(0, 120)))
    await hit(s, '#sqNewSave', 900); await okDialogs(s)
    FACT('world.newSqn', { toast: await toastNow(s) })
    FACT('world.archive.ace142', await archive(s, 'dj'))
    FACT('world.pick150', await pick(s, 150))
    for (const [cs, ini, seat, cat, sg, role] of [['Mako', 'MK', 'P', 'B', 'mako', 'admin'], ['Jackal', 'JK', 'W', 'C'], ['Onyx', 'OX', 'P', 'IP'], ['Ace', 'AC', 'P', 'B']]) FACT(`world.add.${cs}`, await addPerson(s, cs, ini, seat, cat, sg, role))
    await hit(s, '#accAddCancel', 400).catch(() => {})
    const rows = await rowsOf(s)
    const ace = rows.find(r => /:Ace$/.test(r))?.split(':')[0]; if (ace) FACT('world.archive.ace150', await archive(s, ace))
    const kes = rows.find(r => /:Kestrel/.test(r))?.split(':')[0]; if (kes) FACT('world.kestrel.none150', await give(s, kes, '150', 'none'))
    FACT('world.pick142', await pick(s, 142))
    FACT('world.hunter.plan149', await give(s, 'prowler', '149', 'plan'))
    FACT('world.hunter.view150', await give(s, 'prowler', '150', 'view'))
    /* this section's two: on 149, Merlin a sign-in (Member), Osprey an admin */
    FACT('world.pick149', await pick(s, 149)); await usersTab(s); await wait(s, 400)
    await openRow(s, 'mer9'); await s.page.fill('#accGiveName', 'merlin'); await wait(s, 200)
    await hit(s, '#accGive', 800); await okDialogs(s); FACT('world.merlin.signIn', await toastNow(s))
    await usersTab(s); await openRow(s, 'osp9'); await s.page.selectOption('#accEdRole', 'admin'); await wait(s, 200)
    await hit(s, '#accEdSave', 800); await okDialogs(s); FACT('world.osprey.admin', await toastNow(s))
    FACT('world.149.rows', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60)).slice(0, 14)))
    FACT('world.pick142b', await pick(s, 142))
    await wait(s, 600); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
export async function world() { if (!existsSync(WORLD) || process.env.FRESH) await makeWorld(); return WORLD }
/* one picture's run, in a fresh browser holding the world */
export async function run(key, sz, fn) {
  const s = await mk(sz, { storageState: await world() })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}

/* ---- the marks and the pictures ---- */
export const tring = (s, b, clear = 4) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__s2qring'; Object.assign(d.style, { position: 'fixed', boxSizing: 'border-box', left: (b.x - g - 2) + 'px', top: (b.y - g - 2) + 'px', width: (b.w + 2 * g + 4) + 'px', height: (b.h + 2 * g + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, clear])
/* `<name>.png` the whole screen, `<name>-crop.png` cut to the union of the boxes given */
export async function shot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${DRAWN}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${DRAWN}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log(`  picture ${name}.png`)
}
/* the lines a block's words take */
export const linesOf = (s, sel) => s.page.evaluate(sel => {
  const t = document.querySelector(sel); if (!t) return null
  const rg = document.createRange(); rg.selectNodeContents(t)
  const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
  return tops.length
}, sel)
/* THE APP'S PASSING NOTE, drawn with its own box and rules (ui/toast.ts toast + placeToast, copied): kind 'warn' (amber
   border and words) or 'blocked' (the "no entry" sign, the lead bold, the rest quieter - ui/scheduler/28-blocked.css) */
export const note = (s, msg, kind) => s.page.evaluate(([msg, kind]) => {
  let t = document.getElementById('toastEl')
  if (!t) { t = document.createElement('div'); t.id = 'toastEl'; t.setAttribute('aria-hidden', 'true'); document.body.appendChild(t) }
  t.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:540;pointer-events:none;background:var(--panel-2);border:1px solid var(--edge-2);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 20px 50px -20px rgba(0,0,0,.8);overflow-wrap:anywhere'
  if (kind === 'blocked') {
    t.dataset.face = 'blocked'
    const i = msg.indexOf(':'), lead = msg.slice(0, i + 1), rest = msg.slice(i + 1).trim()
    const sign = document.createElement('span'); sign.className = 'bk-sign'; sign.setAttribute('aria-hidden', 'true')
    const w = document.createElement('span'); w.className = 'bk-words'; const b = document.createElement('b'); b.textContent = lead; w.appendChild(b)
    const r = document.createElement('span'); r.className = 'bk-rest'; r.textContent = ' ' + rest; w.appendChild(r)
    t.replaceChildren(sign, w)
  } else { delete t.dataset.face; t.textContent = msg }
  t.style.opacity = '1'
  const phone = innerWidth <= 620
  if (phone) t.dataset.wide = '1'; else delete t.dataset.wide
  t.style.left = phone ? '12px' : '50%'; t.style.right = phone ? '12px' : ''; t.style.transform = phone ? 'none' : 'translateX(-50%)'; t.style.textAlign = phone ? 'center' : ''
  t.dataset.at = 'foot'; t.style.top = ''; t.style.bottom = '26px'
  const tint = kind === 'warn' ? 'var(--adv)' : null
  t.style.borderColor = tint || 'var(--edge-2)'; t.style.color = tint || 'var(--ink)'
  /* held for the picture: a fade an earlier real note set going does not take it away */
  if (!t.__held) { t.__held = true; new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }).observe(t, { attributes: true, attributeFilter: ['style'] }) }
  const q = t.getBoundingClientRect(); return { words: t.innerText.replace(/\s+/g, ' ').trim(), box: { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) }, border: getComputedStyle(t).borderColor, color: getComputedStyle(t).color }
}, [msg, kind])
export const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')
