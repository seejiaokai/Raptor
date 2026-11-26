// q22-lib - question 22 (22A, 22B) on the one questions page (chat 205, 27 Nov 26; card
// docs/superpowers/briefs/2026-11-27-msq-s2-questions-card-22.md): the shared helpers, copied from n199/s2q-lib.mjs
// (not edited there). The BUILT app (yesterday's dist) served at 4745; d = desktop Chromium 1280x800, p = the phone at
// 402 x 874 (his iPhone; the coordinator's correction of 27 Nov 26), WebKit with touch - both at deviceScaleFactor 2.
// THE WORLD, made through the app's own controls as Saber (master admin): "+ New squadron" 151, Kestrel (149's admin)
// its first admin (he is given Plan of 151 and stays at home); Hunter (142's admin) given Plan of 149; on 149 Merlin given
// a sign-in "merlin" and Osprey made an admin. Nothing here writes the app's code.
// THE MARK: a teal dashed ring - 2px #0D9488, 4px clear of the part (n199's).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
export const URL_ = process.env.Q22_URL || 'http://localhost:4745/'
export const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn'); mkdirSync(DRAWN, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n205-q22'); mkdirSync(TMP, { recursive: true })
export const WORLD = resolve(TMP, 'state-world.json')
export const TEAL = '#0D9488'
export const SIZES = { d: { desk: true, w: 1280, h: 800, eng: 'chromium' }, p: { desk: false, w: 402, h: 874, eng: 'webkit' } }
export const USERS = { saber: ['ad', 'a'], hunter: ['ad2', 'a2'], kestrel: ['ad9', 'a9'], osprey: ['us9', 'us9'] }
export const ERRS = []
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
export const want = k => !ONLY.length || ONLY.includes(k)
console.log('q22-lib v1 ' + URL_)
const browsers = {}
export async function mk(sz, { storageState, h } = {}) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit : chromium).launch()
  const H = h || S.h
  const opts = S.desk ? { viewport: { width: S.w, height: H }, deviceScaleFactor: 2 } : { viewport: { width: S.w, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H }
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
export const pidOf = (s, callsign) => s.page.evaluate(c => {
  const r = [...document.querySelectorAll('#page-admin .acc-row[data-person]')].find(e => e.querySelector('.acc-name')?.firstChild?.textContent.trim() === c)
  return r ? r.dataset.person : null
}, callsign)
export const rowText = (s, pid) => s.page.evaluate(p => document.querySelector(`#page-admin .acc-row[data-person="${p}"] .acc-main`)?.innerText.replace(/\s+/g, ' ').trim() || null, pid)
export async function makeWorld() {
  const s = await mk('d')
  try {
    await signIn(s, 'saber')
    await adminCat(s, 'Squadrons'); await hit(s, '#sqNew', 600)
    await s.page.fill('#sqNewNum', '151')
    await s.page.selectOption('#sqNewPlace', { index: 0 }).catch(() => {})
    FACT('world.newSqn.adminChoices', await s.page.evaluate(() => [...(document.querySelector('#sqNewAdmin')?.options || [])].map(o => o.textContent)))
    await s.page.selectOption('#sqNewAdmin', { label: 'Kestrel · 149' }).catch(e => FACT('world.newSqn.adminPickErr', String(e).slice(0, 120)))
    await hit(s, '#sqNewSave', 900); await okDialogs(s)
    FACT('world.newSqn', { toast: await toastNow(s) })
    FACT('world.pick142', await pick(s, 142))
    FACT('world.hunter.plan149', await give(s, 'prowler', '149', 'plan'))
    FACT('world.pick149', await pick(s, 149)); await usersTab(s); await wait(s, 400)
    await openRow(s, 'mer9'); await s.page.fill('#accGiveName', 'merlin'); await wait(s, 200)
    await hit(s, '#accGive', 800); await okDialogs(s); FACT('world.merlin.signIn', await toastNow(s))
    await usersTab(s); await openRow(s, 'osp9'); await s.page.selectOption('#accEdRole', 'admin'); await wait(s, 200)
    await hit(s, '#accEdSave', 800); await okDialogs(s); FACT('world.osprey.admin', await toastNow(s))
    FACT('world.149.rows', await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="acc-groups"] .acc-row[data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70)).slice(0, 16)))
    FACT('world.pick142b', await pick(s, 142))
    await wait(s, 600); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
export async function world() { if (!existsSync(WORLD) || process.env.FRESH) await makeWorld(); return WORLD }
export async function run(key, sz, fn, opts = {}) {
  const s = await mk(sz, { storageState: await world(), ...opts })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
export const tring = (s, b, clear = 4) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__q22ring'; Object.assign(d.style, { position: 'fixed', boxSizing: 'border-box', left: (b.x - g - 2) + 'px', top: (b.y - g - 2) + 'px', width: (b.w + 2 * g + 4) + 'px', height: (b.h + 2 * g + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, clear])
export async function shot(s, name, clip) {
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
  await s.page.waitForTimeout(250)
  await s.page.screenshot({ path: `${DRAWN}/${name}.png`, ...(clip ? { clip } : {}) })
  if (clip) FACT(`${name}.clip`, clip)
  console.log(`  picture ${name}.png`)
}
export const linesOf = (s, sel) => s.page.evaluate(sel => {
  const t = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!t) return null
  const rg = document.createRange(); rg.selectNodeContents(t)
  const tops = []; for (const q of rg.getClientRects()) { if (q.width < 2) continue; const m = q.top + q.height / 2; if (!tops.some(y => Math.abs(y - m) < q.height * 0.6)) tops.push(m) }
  return tops.length
}, sel)
/* The real passing note, held on screen (its fade's opacity kept at 1) and, when `words` is given, only its words
   replaced - the box, colour and place stay the app's own from the real refusal. */
export const holdNote = (s, words) => s.page.evaluate(words => {
  const t = document.getElementById('toastEl'); if (!t) return null
  if (!t.__held) { t.__held = true; new MutationObserver(() => { if (t.style.opacity !== '1') t.style.opacity = '1' }).observe(t, { attributes: true, attributeFilter: ['style'] }) }
  t.style.opacity = '1'
  if (words != null) { if (t.dataset.face) return { error: 'note is not the plain face: ' + t.dataset.face }; t.textContent = words }
  const q = t.getBoundingClientRect(), c = getComputedStyle(t)
  return { words: t.innerText.replace(/\s+/g, ' ').trim(), box: { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) }, border: c.borderColor, color: c.color, fontSize: c.fontSize, fontFamily: c.fontFamily.slice(0, 60) }
}, words)
