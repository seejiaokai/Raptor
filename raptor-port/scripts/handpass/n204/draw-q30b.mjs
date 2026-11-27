// draw-q30b - card 30 redrawn (chat 204, 27 Nov 26): a medical still open when the man moves, and how it will look under
// his D2834 ("anything that's outstanding that is not closed will need to be transferred with the person to the next sqn").
// Brief docs/superpowers/briefs/2026-11-27-msq-s1-q30b-redraw-brief.md, as changed by the orchestrator's message of 27 Nov.
// The BUILT app in dist, served at 4741; nothing here writes the app's code. Every picture is the app's own, reached by
// real presses, except:
//   - NO SCREEN SAVES A MOVE OF SQUADRON: Quill's move 142 -> 149 from Thu 16 Jul is written as SETUP into the browser's
//     saved data (his home rows), as the walk libraries and draw-q30-31 do it;
//   - a picture named "-will-...-drawn" is DRAWN by changing the page only (a control or a card hidden), said in its caption.
// Two worlds, each made on Wed 15 Jul 2026 09:00 (Singapore) and pictured on Thu 16 Jul 09:00, the move's first day:
//   OPEN    Quill's OML 6-9 Jul (the seed's) still waits for its upchit at the move.
//   CLOSED  Hunter (142's admin) upchits it on Wed 15 Jul, before the move, from 142's Medical tab; then the move.
// Each picture at a desktop's 1536x864 (Chromium) and a phone's 390x844 (WebKit, touch), both at 2x, the teal ring.
//   node raptor-port/scripts/handpass/n204/draw-q30b.mjs        (ONLY=k149,k149up,h142,c149,c142,sched  SZ=d,p  FRESH=1)
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { FACT, wait, vis, boxOf, barSq, words, curPage, tring, untring, toastNow } from './q2425-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4741/'
const OUT = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/q30b'); mkdirSync(OUT, { recursive: true })
const TMP = resolve(ROOT, '.tmp/n204-q30b'); mkdirSync(TMP, { recursive: true })
const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 390, h: 844, eng: 'webkit' } }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SZS = (process.env.SZ || 'd,p').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const SETUP_AT = '2026-07-15T09:00:00+08:00', SHOT_AT = '2026-07-16T09:00:00+08:00', MOVE_DAY = '2026-07-16', EVE = '2026-07-15'
console.log('draw-q30b v1 (27 Nov 26)')

const browsers = {}
async function mk(sz, storageState, clock) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, timezoneId: 'Asia/Singapore', ...(storageState ? { storageState } : {}) })
  await ctx.clock.install({ time: new Date(clock) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
async function run(key, sz, fn, storageState) {
  const s = await mk(sz, storageState, SHOT_AT)
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP}/${key}-error.png` }).catch(() => {}) } finally { FACT(`${key}.errs`, s.errs); await s.ctx.close().catch(() => {}) }
}
async function signIn(s, u, p) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(700)
}
async function hit(s, l, ms = 400) {
  l = typeof l === 'string' ? vis(s, l).first() : l
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await s.page.waitForTimeout(ms)
}
async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20)); await s.page.waitForTimeout(400)
  }
}
async function go(s, name) {
  const tab = vis(s, `#topnav a[data-page="${name}"]`)
  if (await tab.count()) { await hit(s, tab.first(), 700); return }
  await hit(s, '#burger', 400)
  await hit(s, `#drawerNav a[data-page="${name}"]`, 700)
  await shut(s)
}
const sqMark = s => boxOf(s, s.desk ? '.topbar .mark' : '.topbar .mark, .drawer-sqn .mark')
async function shownMark(s) {
  const m = await sqMark(s); if (!m) return null
  const ok = await s.page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('.topbar .mark, .drawer-sqn .mark'), [m.x + m.w / 2, m.y + m.h / 2])
  return ok ? m : null
}
async function sshot(s, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  const n = `${name}-${s.desk ? 'desktop' : 'phone'}`
  await page.screenshot({ path: `${OUT}/${n}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${n}-crop.png`, clip })
    FACT(`${n}.crop`, clip)
  }
  console.log('  picture q30b/' + n + '.png' + (rects.length ? ' + -crop' : ''))
}
/* the app's own passing note held up once it comes (its see-through level only), so a picture can be taken of it */
const holdToast = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return false
  window.__q30hold?.disconnect()
  const put = () => { if (t.textContent.trim() && t.style.opacity !== '1') t.style.opacity = '1' }
  window.__q30hold = new MutationObserver(put); window.__q30hold.observe(t, { attributes: true, childList: true, subtree: true, characterData: true, attributeFilter: ['style', 'class'] })
  return true
})
const dropToast = s => s.page.evaluate(() => { window.__q30hold?.disconnect(); const t = document.querySelector('#toastEl'); if (t) { t.style.opacity = '0' } })
const winNow = s => s.page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]')
  const sv = document.querySelector('#inpEditSave')
  const r = w?.getBoundingClientRect()
  return {
    open: !!w && r.width > 0,
    band: document.querySelector('[data-testid="inped-moveband"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
    saveDrawn: !!sv, saveInert: !!sv?.closest('[inert]'), saveDisabled: !!sv?.disabled,
    type: document.querySelector('#inpEditType')?.value ?? null,
    remarks: document.querySelector('#inpEditRmk')?.value ?? null,
    words: (w?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 360),
  }
})
const cards = s => s.page.evaluate(() => [...document.querySelectorAll('.medcard')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.dataset.medcard, sec: e.closest('.medsec')?.querySelector('.medsec-h')?.textContent?.trim() ?? null, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100) })))
const sections = s => s.page.evaluate(() => [...document.querySelectorAll('.medsec-h')].map(e => e.textContent.replace(/\s+/g, ' ').trim()))
const cardSel = iid => `.medcard[data-medcard="${iid}"]`
const viewer = s => s.page.evaluate(() => {
  const p = document.querySelector('#docViewPop'); if (!p || p.hidden) return null
  return { title: document.querySelector('#docViewTitle')?.textContent?.trim(), upchit: !!document.querySelector('#docViewUpchit'), edit: !!document.querySelector('#docViewEdit'), words: p.innerText.replace(/\s+/g, ' ').trim().slice(0, 240) }
})

/* SETUP: a move of squadron as the walk libraries write it (no screen saves one) */
const writeHome = (s, m) => s.page.evaluate(m => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('raptor:settings/home:'))
  const has = keys.some(k => { try { return JSON.parse(localStorage.getItem(k)).pid === m.pid } catch { return false } })
  const id = n => 'h' + (Date.now() + n).toString(36) + Math.random().toString(36).slice(2, 6)
  const out = []
  if (!has) { const a = id(0); localStorage.setItem('raptor:settings/home:' + a, JSON.stringify({ id: a, pid: m.pid, unit: m.from, from: '2026-01-01' })); out.push(a) }
  const b = id(1); localStorage.setItem('raptor:settings/home:' + b, JSON.stringify({ id: b, pid: m.pid, unit: m.to, from: m.day })); out.push(b)
  return { hadRow: has, wrote: out }
}, m)

/* the Medical tab, "as of" a day picked on its own calendar */
async function medical(s, k, iso) {
  if (await curPage(s) !== 'inputs') { await go(s, 'inputs'); await wait(s, 700) }
  if (!(await vis(s, '#medView').count())) await hit(s, '#inMedBtn', 800)
  await hit(s, '#medCalBtn', 500)
  if (!(await vis(s, `[data-medday="${iso}"]`).count())) await hit(s, '#medCalNext', 400)
  if (!(await vis(s, `[data-medday="${iso}"]`).count())) await hit(s, '#medCalPrev', 400)
  await hit(s, vis(s, `[data-medday="${iso}"]`).first(), 800)
  FACT(`${k}.asOf`, (await words(s, '#medCalBtn'))[0] || '')
  FACT(`${k}.sections`, await sections(s))
  const cs = await cards(s); FACT(`${k}.cards`, cs)
  return cs
}
const quillOml = cs => cs.find(c => /Quill/.test(c.words) && /OML/.test(c.words))
const quillUp = cs => cs.find(c => /Quill/.test(c.words) && c.sec && /Complete/i.test(c.sec))
async function ringCard(s, iid) {
  await s.page.locator(cardSel(iid)).first().scrollIntoViewIfNeeded(); await wait(s, 300)
  return tring(s, await boxOf(s, cardSel(iid)), 'the card')
}
async function openViewer(s, iid, k) {
  await hit(s, s.page.locator(cardSel(iid)).first(), 900)
  const v = await viewer(s); FACT(`${k}.viewer`, v); return v
}
async function editOpen(s, k) {
  await hit(s, '#docViewEdit', 1000)
  const w = await winNow(s); FACT(`${k}.window`, { ...w, squadron: await barSq(s) })
  if (!w.open) throw new Error('the Input window did not open')
  return w
}
async function typeRemark(s, text) {
  const rmk = vis(s, '#inpEditRmk').first(); await rmk.click(); await s.page.keyboard.press('End'); await s.page.keyboard.type(text)
}
async function saveAndSee(s, k) {
  await holdToast(s)
  await hit(s, '#inpEditSave', 1400)
  const out = { toast: await toastNow(s), window: await winNow(s), sheet: await s.page.evaluate(() => [...document.querySelectorAll('[role="dialog"], .sheet, .airpop')].filter(e => e.getBoundingClientRect().height > 0 && !e.hidden).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200))) }
  FACT(`${k}.saved`, out)
  await s.page.screenshot({ path: `${TMP}/${k}-after-save.png` }).catch(() => {})
  return out
}
/* the upchit's own date box, set to a day on its calendar */
async function upDate(s, iso, k) {
  await hit(s, '#inpEditUpDate', 600)
  for (let i = 0; i < 3 && !(await vis(s, `.dcal-card [data-iso="${iso}"]`).count()); i++) await hit(s, vis(s, '.dcal-card [aria-label="Next month"]').first(), 300)
  await hit(s, vis(s, `.dcal-card [data-iso="${iso}"]`).first(), 600)
  FACT(`${k}.upDate`, (await words(s, '#inpEditUpDate'))[0] ?? null)
}
/* a confirming sheet, if one stands after Add: its words, then its own go-ahead pressed */
async function sheetGo(s, k) {
  const sh = await s.page.evaluate(() => [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(e => !e.hidden && e.getBoundingClientRect().height > 0 && e.id !== 'inpEditPop' && e.id !== 'docViewPop').map(e => ({ id: e.id, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300), btns: [...e.querySelectorAll('button')].map(b => b.id || b.textContent.trim()).slice(0, 8) })))
  FACT(`${k}.sheet`, sh)
  /* the "No medical document" sheet: file it without (its own "No document") */
  const nd = vis(s, 'button').filter({ hasText: /^No document$/ })
  if (await nd.count()) {
    await holdToast(s)
    await hit(s, nd.first(), 1400)
    FACT(`${k}.noDoc`, { toast: await toastNow(s), window: (await winNow(s)).open })
    await s.page.screenshot({ path: `${TMP}/${k}-after-nodoc.png` }).catch(() => {})
    const more = await s.page.evaluate(() => [...document.querySelectorAll('.airpop, [role="dialog"]')].filter(e => !e.hidden && e.getBoundingClientRect().height > 0 && e.id !== 'docViewPop').map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300)))
    FACT(`${k}.more`, more)
  }
  /* the upchit's own summary sheet: its "Save upchit" (pictured first, where the caller names a picture) */
  const su = vis(s, 'button').filter({ hasText: /^Save upchit$/ })
  if (await su.count()) {
    if (s.shotSheet) {
      const card = await s.page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Save upchit' && x.getBoundingClientRect().height > 0); const c = b?.closest('.airpop-box, [role="dialog"], .sheet, .airpop > div'); const r = (c || b).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
      const r = await tring(s, await boxOf(s, 'button:has-text("Save upchit")').catch(() => null) || card, 'go')
      await sshot(s, s.shotSheet, [card, r]); await untring(s)
    }
    await holdToast(s)
    await hit(s, su.first(), 1400)
    FACT(`${k}.saveUpchit`, { toast: await toastNow(s), window: (await winNow(s)).open })
    await s.page.screenshot({ path: `${TMP}/${k}-after-saveupchit.png` }).catch(() => {})
  }
  return sh
}

/* THE WORLDS */
const WORLD = { open: resolve(TMP, 'world-open.json'), closed: resolve(TMP, 'world-closed.json') }
async function makeWorld(kind) {
  if (existsSync(WORLD[kind]) && !process.env.FRESH) return WORLD[kind]
  const s = await mk('d', null, SETUP_AT)
  try {
    if (kind === 'closed') {
      /* Hunter, 142's admin, upchits Quill's OML on Wed 15 Jul from 142's Medical tab: the card, then its Upchit, Save */
      await signIn(s, 'ad2', 'a2')
      FACT('closed.bar', await barSq(s))
      const cs = await medical(s, 'closed.142', EVE)
      const c = quillOml(cs); if (!c) throw new Error('Quill\'s OML is not on 142\'s tab on 15 Jul')
      const v = await openViewer(s, c.iid, 'closed.142')
      if (!v?.upchit) throw new Error('no Upchit on the viewer')
      await hit(s, '#docViewUpchit', 1000)
      await upDate(s, EVE, 'closed')
      FACT('closed.upchitWindow', await winNow(s))
      await saveAndSee(s, 'closed.upchit')
      await sheetGo(s, 'closed.upchit')
      FACT('closed.after', await cards(s))
    }
    await s.page.goto(URL_); await s.page.waitForSelector('#luser', { timeout: 20000 })
    FACT(`${kind}.move`, await writeHome(s, { pid: 'nasty', from: 'u142', to: 'u149', day: MOVE_DAY }))
    writeFileSync(WORLD[kind], JSON.stringify(await s.ctx.storageState()))
    FACT(`${kind}.errs`, s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD[kind]
}

const W_OPEN = await makeWorld('open')
const W_CLOSED = (want('c149') || want('c142')) ? await makeWorld('closed') : null
try {
  for (const sz of SZS) {
    /* TODAY on 149: Kestrel, 149's own admin */
    if (want('k149')) await run(`k149-${sz}`, sz, async s => {
      const k = `k149.${sz}`
      await signIn(s, 'ad9', 'a9'); FACT(`${k}.bar`, await barSq(s))
      const c = quillOml(await medical(s, k, MOVE_DAY)); if (!c) throw new Error('Quill\'s OML is not on 149\'s tab')
      const r1 = await ringCard(s, c.iid)
      await sshot(s, 'q30b-today-149', [r1, await boxOf(s, '#medCalBtn'), await sqMark(s)]); await untring(s)
      await openViewer(s, c.iid, k)
      const ru = await boxOf(s, '#docViewUpchit'), re = await boxOf(s, '#docViewEdit')
      const r2 = ru ? await tring(s, ru, 'Upchit') : null, r3 = re ? await tring(s, re, 'Edit') : null
      await sshot(s, 'q30b-today-149-viewer', [r2, r3, await boxOf(s, '#docViewPop .docviewbox')]); await untring(s)
      await editOpen(s, k)
      const m = await shownMark(s), sv = await boxOf(s, '#inpEditSave'), ro = await boxOf(s, '[data-testid="inped-ro"]')
      FACT(`${k}.ro`, (await words(s, '[data-testid="inped-ro"]'))[0] ?? null)
      const ra = m ? await tring(s, m, 'sq') : null, rb = sv ? await tring(s, sv, 'Save') : null, rc = (!sv && ro) ? await tring(s, ro, 'ro') : null
      await sshot(s, 'q30b-today-149-open', [ra, rb, rc, await boxOf(s, '[data-testid="win-inputedit"]')]); await untring(s)
    }, W_OPEN)
    /* HOW IT WILL LOOK for Kestrel's window, reached by real presses today as Saber (master admin), 149 picked: live, Save */
    if (want('s149')) await run(`s149-${sz}`, sz, async s => {
      const k = `s149.${sz}`
      await signIn(s, 'ad', 'a')
      if (s.desk) {
        await hit(s, '#sqnMenuBtn', 450)
        await hit(s, vis(s, '#sqnMenu .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: /^149$/ }) }).first(), 900)
      } else {
        await hit(s, '#burger', 500)
        if (!(await vis(s, '#drawerSqnList .sqm-row').count()) && await s.page.locator('#drawerSqnBtn').count()) await hit(s, '#drawerSqnBtn', 450)
        await hit(s, vis(s, '#drawerSqnList .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: /^149$/ }) }).first(), 900)
        await shut(s)
      }
      FACT(`${k}.bar`, await barSq(s))
      const c = quillOml(await medical(s, k, MOVE_DAY)); if (!c) throw new Error('Quill\'s OML is not on 149\'s tab')
      await openViewer(s, c.iid, k)
      await editOpen(s, k)
      const m = await shownMark(s), sv = await boxOf(s, '#inpEditSave')
      const ra = m ? await tring(s, m, 'sq') : null, rb = sv ? await tring(s, sv, 'Save') : null
      await sshot(s, 'q30b-will-149-open', [ra, rb, await boxOf(s, '[data-testid="win-inputedit"]')]); await untring(s)
    }, W_OPEN)
    /* TODAY on 149: Kestrel closes it with the card's own Upchit (dated today, Thu 16 Jul, 149's day) */
    if (want('k149up')) await run(`k149up-${sz}`, sz, async s => {
      const k = `k149up.${sz}`
      await signIn(s, 'ad9', 'a9')
      const c = quillOml(await medical(s, k, MOVE_DAY)); if (!c) throw new Error('Quill\'s OML is not on 149\'s tab')
      await openViewer(s, c.iid, k)
      await hit(s, '#docViewUpchit', 1000)
      await upDate(s, MOVE_DAY, k)
      const w = await winNow(s); FACT(`${k}.window`, { ...w, squadron: await barSq(s) })
      const m = await shownMark(s), sv = await boxOf(s, '#inpEditSave')
      const ra = m ? await tring(s, m, 'sq') : null, rb = sv ? await tring(s, sv, 'Save') : null
      await sshot(s, 'q30b-today-149-upchit', [ra, rb, await boxOf(s, '[data-testid="win-inputedit"]')]); await untring(s)
      await saveAndSee(s, k)
      s.shotSheet = 'q30b-today-149-upchit-sheet'
      await sheetGo(s, k)
      await wait(s, 300)
      const toast = await toastNow(s)
      const after = await cards(s); FACT(`${k}.after`, after); FACT(`${k}.sections`, await sections(s))
      const u = quillUp(after)
      const tb = await boxOf(s, '#toastEl')
      const r1 = u ? await ringCard(s, u.iid) : null
      const rt = toast && tb ? await tring(s, tb, 'note') : null
      await sshot(s, 'q30b-today-149-upchit-saved', [r1, rt, await boxOf(s, '#medCalBtn')]); await untring(s); await dropToast(s)
    }, W_OPEN)
    /* TODAY on 142: Hunter, 142's own admin - as of Thu 16 Jul, then as of Wed 15 Jul, the window from there */
    if (want('h142')) await run(`h142-${sz}`, sz, async s => {
      const k = `h142.${sz}`
      await signIn(s, 'ad2', 'a2'); FACT(`${k}.bar`, await barSq(s))
      const cs16 = await medical(s, `${k}.16`, MOVE_DAY)
      FACT(`${k}.16.quill`, quillOml(cs16) ?? null)
      const secs = await s.page.evaluate(() => { const a = [...document.querySelectorAll('.medsec')]; if (!a.length) return null; const t = a[0].getBoundingClientRect(), b = a[a.length - 1].getBoundingClientRect(); return { x: t.left, y: t.top, w: t.width, h: Math.min(b.bottom, innerHeight) - t.top } })
      await sshot(s, 'q30b-today-142', [await boxOf(s, '#medCalBtn'), await sqMark(s), secs])
      const c = quillOml(await medical(s, `${k}.15`, EVE)); if (!c) throw new Error('Quill\'s OML is not on 142\'s tab as of 15 Jul')
      const r1 = await ringCard(s, c.iid)
      await sshot(s, 'q30b-today-142-15jul', [r1, await boxOf(s, '#medCalBtn'), await sqMark(s)]); await untring(s)
      const v = await openViewer(s, c.iid, k)
      const ru = await boxOf(s, '#docViewUpchit'), re = await boxOf(s, '#docViewEdit')
      const r2 = ru ? await tring(s, ru, 'Upchit') : null, r3 = re ? await tring(s, re, 'Edit') : null
      await sshot(s, 'q30b-today-142-viewer', [r2, r3, await boxOf(s, '#docViewPop .docviewbox')]); await untring(s)
      /* HOW IT WILL LOOK, drawn: from 142's history the card opens read only - its Upchit and Edit input hidden */
      await s.page.evaluate(() => { for (const id of ['docViewUpchit', 'docViewEdit']) { const e = document.getElementById(id); if (e) e.style.display = 'none' } })
      await sshot(s, 'q30b-will-142-viewer-drawn', [await boxOf(s, '#docViewPop .docviewbox')])
      await s.page.evaluate(() => { for (const id of ['docViewUpchit', 'docViewEdit']) { const e = document.getElementById(id); if (e) e.style.display = '' } })
      if (!v?.edit) return
      await editOpen(s, k)
      const m = await shownMark(s), sv = await boxOf(s, '#inpEditSave')
      const ra = m ? await tring(s, m, 'sq') : null, rb = sv ? await tring(s, sv, 'Save') : null
      await sshot(s, 'q30b-today-142-open', [ra, rb, await boxOf(s, '[data-testid="win-inputedit"]')]); await untring(s)
      await typeRemark(s, ' Seen by 142 doctor')
      await saveAndSee(s, k)
      if (!(await vis(s, '#docViewPop .docviewbox').count())) await openViewer(s, c.iid, `${k}.after`)
      FACT(`${k}.afterViewer`, await viewer(s))
      const sub = await boxOf(s, '#docViewPop .docview-sub')
      const rs = sub ? await tring(s, sub, 'remark') : null
      await sshot(s, 'q30b-today-142-save', [rs, await boxOf(s, '#docViewPop .docviewbox')]); await untring(s)
    }, W_OPEN)
    /* CLOSED before the move: 149's tab on Thu 16 Jul (Kestrel), today and as it will look */
    if (want('c149')) await run(`c149-${sz}`, sz, async s => {
      const k = `c149.${sz}`
      await signIn(s, 'ad9', 'a9')
      const cs = await medical(s, k, MOVE_DAY)
      const u = quillUp(cs); FACT(`${k}.quillUp`, u ?? null)
      const r1 = u ? await ringCard(s, u.iid) : null
      await sshot(s, 'q30b-closed-149-today', [r1, await boxOf(s, '#medCalBtn'), await sqMark(s)]); await untring(s)
      if (u) {
        const sec = await s.page.evaluate(sel => { const c = document.querySelector(sel)?.closest('.medsec'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, innerHeight - r.top) } }, cardSel(u.iid))
        /* the card hidden, the count put to 0 and the section's own empty words (as 149's tab says them with no upchit) in
           the look of the Pending section's empty line - the page only */
        FACT(`${k}.drawn`, await s.page.evaluate(sel => {
          const c = document.querySelector(sel); const sec = c?.closest('.medsec'); if (!c || !sec) return 'no card'
          const holder = c.parentElement
          for (const e of document.querySelectorAll(sel)) e.style.display = 'none'
          const n = sec.querySelector('.medsec-n'); if (n) n.textContent = '0'
          const pend = [...document.querySelectorAll('.medsec')].find(x => /Pending/i.test(x.querySelector('.medsec-h')?.textContent || ''))
          const empty = pend && [...pend.children].find(x => !x.classList.contains('medsec-h') && /Nobody/.test(x.textContent || ''))
          if (!empty) return 'no empty line to copy'
          const d = empty.cloneNode(true); d.textContent = 'No upchits in the past 30 days.'
          holder.style.display = 'none'; holder.parentElement.insertBefore(d, holder)
          return 'ok: ' + d.className
        }, cardSel(u.iid)))
        await sshot(s, 'q30b-will-closed-149-drawn', [sec, await boxOf(s, '#medCalBtn'), await sqMark(s)])
      }
    }, W_CLOSED)
    /* CLOSED before the move: 142's tab (Hunter), as of Wed 15 Jul - his history stays there */
    if (want('c142')) await run(`c142-${sz}`, sz, async s => {
      const k = `c142.${sz}`
      await signIn(s, 'ad2', 'a2')
      const cs = await medical(s, k, EVE)
      const u = quillUp(cs); FACT(`${k}.quillUp`, u ?? null)
      const r1 = u ? await ringCard(s, u.iid) : null
      await sshot(s, 'q30b-closed-142-15jul', [r1, await boxOf(s, '#medCalBtn'), await sqMark(s)]); await untring(s)
      const html = u ? await s.page.evaluate(sel => document.querySelector(sel)?.outerHTML ?? null, cardSel(u.iid)) : null
      const cs16 = await medical(s, `${k}.16`, MOVE_DAY); FACT(`${k}.16.quillUp`, quillUp(cs16) ?? null)
      await sshot(s, 'q30b-closed-142-today', [await boxOf(s, '#medCalBtn'), await sqMark(s), await boxOf(s, '.medsec:last-of-type')])
      /* HOW IT WILL LOOK, drawn: his closed upchit kept on 142's tab as of 16 Jul - the card copied from 142's own tab of
         15 Jul into Upchit Complete, its count raised by one (the page only) */
      if (html) {
        const put = await s.page.evaluate(html => {
          const sec = [...document.querySelectorAll('.medsec')].find(x => /Upchit Complete/i.test(x.querySelector('.medsec-h')?.textContent || ''))
          if (!sec) return 'no section'
          const first = sec.querySelector('.medcard')
          const t = document.createElement('template'); t.innerHTML = html; const c = t.content.firstElementChild; c.setAttribute('data-q30b', 'copied')
          if (first) first.parentElement.insertBefore(c, first); else return 'no card to stand beside'
          const n = sec.querySelector('.medsec-n'); if (n) n.textContent = String((+n.textContent || 0) + 1)
          return 'ok'
        }, html)
        FACT(`${k}.copied`, put)
        const cb = await boxOf(s, '[data-q30b="copied"]')
        const r2 = cb ? await tring(s, cb, 'card') : null
        await sshot(s, 'q30b-will-closed-142-drawn', [r2, await boxOf(s, '#medCalBtn'), await sqMark(s)]); await untring(s)
      }
    }, W_CLOSED)
    /* the schedule: Quill on 149's week, Thu 16 Jul, as Kestrel sees it */
    if (want('sched')) await run(`sched-${sz}`, sz, async s => {
      const k = `sched.${sz}`
      await signIn(s, 'ad9', 'a9')
      FACT(`${k}.page`, await curPage(s))
      const q = await s.page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /\bQuill\b/.test(e.textContent || '') && e.getBoundingClientRect().height > 0).slice(0, 12).map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className?.toString().slice(0, 60), par: e.parentElement?.className?.toString().slice(0, 60), text: (e.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 80), x: r.left, y: r.top, w: r.width, h: r.height } }))
      FACT(`${k}.quill`, q)
      FACT(`${k}.quillDays`, await s.page.evaluate(() => [...document.querySelectorAll('.puck')].filter(e => /\bQuill\b/.test(e.textContent || '')).map(e => { const d = e.closest('.day'); return { day: (d?.innerText || '').replace(/\s+/g, ' ').slice(0, 22), row: (e.closest('tr, .row, section')?.innerText || '').replace(/\s+/g, ' ').slice(0, 90) } })))
      /* Thursday 16 Jul, the move's first day: his puck and that day's Unavailable list */
      const thu = await s.page.evaluate(() => {
        const days = [...document.querySelectorAll('#vWeek .day')]
        const d = days.find(x => /Jul 16/.test(x.querySelector('h2, h3, .dh, header, .day-h')?.textContent || x.innerText.slice(0, 40)))
        if (!d) return { days: days.map(x => x.innerText.slice(0, 30)) }
        const p = [...d.querySelectorAll('.puck')].find(e => /\bQuill\b/.test(e.textContent || ''))
        d.scrollIntoView({ inline: 'start', block: 'nearest' })
        p?.scrollIntoView({ block: 'center', inline: 'nearest' })
        p?.setAttribute('data-q30b', 'puck'); d.setAttribute('data-q30b', 'day')
        const un = [...d.querySelectorAll('*')].find(e => e.children.length === 0 && /^UNAVAILABLE$/i.test((e.textContent || '').trim()))
        const box = un?.closest('section, .sec, .unav, div')?.parentElement
        box?.setAttribute('data-q30b', 'unav')
        return { found: !!p, puck: p?.innerText.replace(/\s+/g, ' ').trim(), puckCls: p?.className, unav: box?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), dayWords: d.innerText.replace(/\s+/g, ' ').slice(0, 400) }
      })
      FACT(`${k}.thu`, thu)
      await wait(s, 1500)
      const pb = await boxOf(s, '[data-q30b="puck"]'), ub = await boxOf(s, '[data-q30b="unav"]')
      const r1 = pb ? await tring(s, pb, 'puck') : null, r2 = ub ? await tring(s, ub, 'unav') : null
      await sshot(s, 'q30b-sched-149', [r1, r2, await sqMark(s)]); await untring(s)
    }, W_OPEN)
  }
} finally { await closeAll() }
