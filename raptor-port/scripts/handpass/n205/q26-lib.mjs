// q26-lib - question 26 on the one questions page (chat 205, 27 Nov 26): one row open at a time on Admin -> Users, and
// one "Give access" form at a time. Helpers copied from q22-lib.mjs (not edited there) and n204/q-lib.mjs (the probe).
// The BUILT app, a COPY of dist (.tmp/n205-q26-dist, so a later build cannot change it under the pictures), served at 4761;
// d = desktop Chromium 1280x800, p = his iPhone 402 x 874, WebKit with touch - both at deviceScaleFactor 2.
// THE WORLD, made through the app's own controls: two strangers ask for access to 149 on the sign-in screen (the access
// form filled and sent, then signed out) - "Nova" first, then "Ace". Kestrel (149's admin) is the one who presses.
// THE NOTE IS THE APP'S OWN, RAISED BY ITS OWN CODE. No door of Admin -> Users raises it (that is what the question asks),
// so a small probe is added to the page as it loads, in this browser only: the served index chunk is fetched and one line
// appended - `window.__q26 = { at: <toastAt> }` - its name read off the built file by guardSay's shape (guardSay hands its
// words to toastAt). The script calls the app's own toastAt(words, { under: <the control pressed>, edge: 'left',
// below: 'self', names: <the open work's Save / Cancel> }) - so the look is the grey "Blocked:" note's and the place is
// placeToast's own rule (an upright phone: the foot; a desktop: under the control pressed, never over the named controls).
// Only the note's fade is held (its opacity), so it can be pictured.
// THE MARK: a teal dashed ring - 2px #0D9488, 4px clear of the part.
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const URL_ = process.env.Q26_URL || 'http://localhost:4761/'
export const DRAWN = resolve(ROOT, 'docs/mock/2026-11-25-msq-pick-guard-q3/drawn'); mkdirSync(DRAWN, { recursive: true })
export const TMP = resolve(ROOT, '.tmp/n205-q26'); mkdirSync(TMP, { recursive: true })
export const WORLD = resolve(TMP, 'state-world.json')
export const TEAL = '#0D9488'
export const SIZES = { d: { desk: true, w: 1280, h: 800, eng: 'chromium' }, p: { desk: false, w: 402, h: 874, eng: 'webkit' } }
export const USERS = { saber: ['ad', 'a'], kestrel: ['ad9', 'a9'] }
export const ERRS = []
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
export const want = k => !ONLY.length || ONLY.includes(k)

/* the probe: the served copy's index chunk, toastAt found by guardSay's shape */
const ASSETS = resolve(ROOT, '.tmp/n205-q26-dist/assets')
const INDEX = readdirSync(ASSETS).find(f => /^index-.*\.js$/.test(f))
const SRC = readFileSync(resolve(ASSETS, INDEX), 'utf8')
const ID = '[A-Za-z_$][A-Za-z0-9_$]*'
const m = new RegExp(`function ${ID}\\(e,t,n,r=\\{\\}\\)\\{let i=${ID}\\(e\\.id\\);if\\(!i\\)return;let a=${ID}\\(e\\.reason,i,t,n\\);if\\(a\\)\\{if\\(typeof document>\`u\`\\)\\{${ID}\\.toast\\(a,\`blocked\`\\);return\\}(${ID})\\(a,`).exec(SRC)
const AT = m?.[1]
if (!AT) throw new Error(`the probe could not find toastAt in ${INDEX}`)
const PATCHED = SRC + `\n;window.__q26={at:${AT}};\n`
console.log(`q26-lib v1 ${URL_} chunk ${INDEX} toastAt=${AT}`)

const browsers = {}
export async function mk(sz, { storageState, h } = {}) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const H = h || S.h
  const opts = S.desk ? { viewport: { width: S.w, height: H }, deviceScaleFactor: 2 } : { viewport: { width: S.w, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, ...(storageState ? { storageState } : {}) })
  await ctx.route(`**/assets/${INDEX}`, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: PATCHED }))
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H }
  page.on('pageerror', e => { const t = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(t); ERRS.push(t) })
  page.on('console', c => { if (c.type() === 'error') { const t = `CONSOLE [${sz}] ${c.text().slice(0, 200)}`; console.log(t); ERRS.push(t) } })
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
  if (!(await page.evaluate(() => !!window.__q26))) throw new Error('the probe is not on the page')
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
export async function usersTab(s) {
  if ((await pageOn(s)) !== 'page-admin') await go(s, 'admin')
  await wait(s, 300)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
}
export const toastNow = s => s.page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const c = getComputedStyle(t); return c.opacity === '0' || c.display === 'none' ? '' : t.innerText.replace(/\s+/g, ' ').trim() }).catch(() => '')
/* a stranger asks for access to 149 on the sign-in screen, through the access form, then signs out */
async function ask(s, login, cs, ini) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', login); await page.fill('#lpass', 'x')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accForm', { timeout: 15000 })
  const sq = await page.evaluate(() => [...document.querySelector('#accSqn')?.options || []].map(o => ({ v: o.value, t: o.textContent.trim() })))
  FACT(`world.${cs}.squadrons`, sq)
  const o = sq.find(o => /149/.test(o.t)); if (!o) throw new Error('149 is not offered on the access form')
  await page.selectOption('#accSqn', o.v)
  await page.fill('#accCs', cs); await page.fill('#accIni', ini)
  const seat = await page.evaluate(() => [...document.querySelector('#accSeat').options].map(o => o.value).find(v => v)); if (seat) await page.selectOption('#accSeat', seat)
  const cat = await page.evaluate(() => { const e = document.querySelector('#accCat'); return e ? [...e.options].map(o => o.value).find(v => v) : null }); if (cat) await page.selectOption('#accCat', cat)
  await page.click('#accSend'); await wait(s, 900)
  FACT(`world.${cs}.asked`, { err: await page.locator('#accErr').textContent().catch(() => null), waiting: await page.locator('#accAsked').textContent().catch(() => null) })
  await page.click('#accOut'); await wait(s, 800)
}
export async function makeWorld() {
  const s = await mk('d')
  try {
    await ask(s, 'nova@mail', 'Nova', 'NV')
    await ask(s, 'ace@mail', 'Ace', 'AC')
    await wait(s, 400); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
export async function world() { if (!existsSync(WORLD) || process.env.FRESH) await makeWorld(); return WORLD }
export async function run(key, sz, fn, opts = {}) {
  const s = await mk(sz, { storageState: await world(), ...opts })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
/* the mark: a teal dashed ring, 2px, `clear` px clear of the part */
export const tring = (s, b, clear = 4) => b && s.page.evaluate(([b, c, g]) => { const d = document.createElement('div'); d.className = '__q26ring'; Object.assign(d.style, { position: 'fixed', boxSizing: 'border-box', left: (b.x - g - 2) + 'px', top: (b.y - g - 2) + 'px', width: (b.w + 2 * g + 4) + 'px', height: (b.h + 2 * g + 4) + 'px', border: '2px dashed ' + c, borderRadius: '8px', zIndex: 2147483646, pointerEvents: 'none' }); document.body.appendChild(d) }, [b, TEAL, clear])
export async function shot(s, name, clip) {
  if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
  await s.page.waitForTimeout(250)
  await s.page.screenshot({ path: `${DRAWN}/${name}.png`, ...(clip ? { clip } : {}) })
  if (clip) FACT(`${name}.clip`, clip)
  console.log(`  picture ${name}.png`)
}
/* THE APP'S OWN NOTE: toastAt(words, at) - the control pressed found by `underSel`, the open work's buttons by `namesSel` -
   then its fade held */
export async function raise(s, words, underSel, namesSel) {
  const r = await s.page.evaluate(([words, underSel, namesSel]) => {
    window.__q26.at(words, { under: () => document.querySelector(underSel), edge: 'left', below: 'self', names: namesSel })
    const t = document.getElementById('toastEl')
    return { words: t?.textContent.replace(/\s+/g, ' ').trim(), face: t?.dataset.face || null }
  }, [words, underSel, namesSel])
  await wait(s, 400)
  const n = await s.page.evaluate(() => {
    const t = document.getElementById('toastEl'); t.getAnimations?.().forEach(a => a.finish())
    const put = () => { if (t.style.opacity !== '1') t.style.opacity = '1' }
    put(); window.__q26hold?.disconnect(); window.__q26hold = new MutationObserver(put); window.__q26hold.observe(t, { attributes: true, attributeFilter: ['style'] })
    const q = t.getBoundingClientRect(), c = getComputedStyle(t)
    return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, box: { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) }, bg: c.backgroundColor, border: c.borderColor }
  })
  await wait(s, 150)
  if (n.face !== 'blocked' || n.words !== words) throw new Error('the note did not draw the words: ' + JSON.stringify({ raised: r, now: n }))
  return n
}
