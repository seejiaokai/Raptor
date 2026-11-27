// draw-q30-31 - questions 30 and 31 (chat 204, 27 Nov 26): step K10's two findings (brief
// docs/superpowers/briefs/2026-11-27-msq-s1-q30-31-draw-brief.md). The BUILT app in dist, served at 4741; nothing here writes
// the app's code. Every picture is the app's own, reached by real presses, except:
//   - NO SCREEN SAVES A MOVE OF SQUADRON (the posting sheet is not built): Nasty's move 142 -> 149 and Osprey's 149 -> 150,
//     each from Thu 16 Jul, are written as SETUP into the browser's saved data, as the walk libraries and draw-q25 do it
//     (his home rows: the old squadron from 1 Jan, the new from Thu 16 Jul);
//   - q30-149-proposed is DRAWN by hiding Nasty's OML card on the page (its display only), said so in its caption.
// The page clock is installed (Singapore time, left running): the world is made on Wed 15 Jul 2026 09:00, every picture is
// taken on Thu 16 Jul 2026 09:00, the first day of both moves (as the K10 tests' pastMidnight reaches it).
// Each picture at a desktop's 1536x864 (Chromium) and a phone's 390x844 (WebKit, touch), both at 2x, the teal ring.
//   q30   Saber picks 149 -> Inputs -> Medical -> "as of" Thu 16 Jul -> Nasty's OML card; the card -> "Edit input"; then 142.
//   q31   Kestrel filed a Training for Osprey (Mon 27 Jul); Saber changed its remarks (Kestrel's bell gets the line); Osprey
//         moved to 150. Kestrel signs in on 149 -> the bell -> the line; proposed: he picks 150 -> Inputs -> the Training.
//   node raptor-port/scripts/handpass/n204/draw-q30-31.mjs        (ONLY=q30,q31  SZ=d,p  FRESH=1)
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { FACT, wait, vis, boxOf, barSq, words, curPage, tring, untring, make150, toastNow } from './q2425-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4741/'
const MOCK = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions')
const OUT = { q30: resolve(MOCK, 'q30'), q31: resolve(MOCK, 'q31') }
for (const d of Object.values(OUT)) mkdirSync(d, { recursive: true })
const TMP = resolve(ROOT, '.tmp/n204-q30-31'); mkdirSync(TMP, { recursive: true })
const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 390, h: 844, eng: 'webkit' } }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SZS = (process.env.SZ || 'd,p').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const SETUP_AT = '2026-07-15T09:00:00+08:00', SHOT_AT = '2026-07-16T09:00:00+08:00', MOVE_DAY = '2026-07-16'
const TRAINING_DAY = '2026-07-27'
console.log('draw-q30-31 v1 (27 Nov 26)')

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
  hook(s)
  return s
}
function hook(s) {
  const { page, sz } = s
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
}
async function freshTab(s) { await s.page.close(); s.page = await s.ctx.newPage(); hook(s) }
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
/* the squadron picked as a person picks it: the top bar's menu on a desktop; ☰ and its squadron list on a phone */
async function pickAs(s, num, k) {
  if (s.desk) {
    await hit(s, '#sqnMenuBtn', 450)
    FACT(`${k}.list`, await words(s, '#sqnMenu .sqm-row'))
    const row = vis(s, '#sqnMenu .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: new RegExp('^' + num + '$') }) }).first()
    await hit(s, row, 900)
  } else {
    await hit(s, '#burger', 500)
    if (!(await vis(s, '#drawerSqnList .sqm-row').count()) && await s.page.locator('#drawerSqnBtn').count()) await hit(s, '#drawerSqnBtn', 450)
    FACT(`${k}.list`, await words(s, '#drawerSqnList .sqm-row'))
    const row = vis(s, '#drawerSqnList .sqm-row').filter({ has: s.page.locator('.sqm-num', { hasText: new RegExp('^' + num + '$') }) }).first()
    await hit(s, row, 900)
    await shut(s)
  }
  FACT(`${k}.picked`, { want: num, bar: await barSq(s) })
}
const sqMark = s => boxOf(s, s.desk ? '.topbar .mark' : '.topbar .mark, .drawer-sqn .mark')
async function sshot(s, q, name, rects, pad = 14) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT[q]}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT[q]}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + q + '/' + name + '.png' + (rects.length ? ' + -crop' : ''))
}
/* the Input window as it stands: open, its band, its Save live (not inside an inert, not disabled) */
const winNow = s => s.page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]')
  const sv = document.querySelector('#inpEditSave')
  const r = w?.getBoundingClientRect()
  return {
    open: !!w && r.width > 0,
    title: (w?.querySelector('#inpEditTitle, .inped-title, h2, h3')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    band: document.querySelector('[data-testid="inped-moveband"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
    ro: document.querySelector('[data-testid="inped-ro"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
    saveDrawn: !!sv, saveInert: !!sv?.closest('[inert]'), saveDisabled: !!sv?.disabled,
    windowInert: !!w?.closest('[inert]') || !!w?.querySelector('[inert]'),
    person: document.querySelector('#inpEditPerson')?.selectedOptions?.[0]?.textContent ?? document.querySelector('#inpEditPersonFixed, .pp .inped-v')?.textContent ?? null,
    type: document.querySelector('#inpEditType')?.value ?? null,
    remarks: document.querySelector('#inpEditRmk')?.value ?? null,
    words: (w?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300),
  }
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
const unitIdOf = (s, num) => s.page.evaluate(num => {
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith('raptor:settings/unit:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v && String(v.num) === String(num)) return v.id } catch {}
  }
  return null
}, num)
const listRows = s => s.page.evaluate(() => [...document.querySelectorAll('#inBody [data-iid], #inList [data-iid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.dataset.iid, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) })))
async function toList(s) {
  await go(s, 'inputs'); await wait(s, 700)
  if (await vis(s, '#inMemberMode[aria-selected="false"]').count()) await hit(s, '#inMemberMode', 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn', 600)
}

/* THE WORLD, made once by presses on Wed 15 Jul (copied into each fresh browser): Saber makes 150, first admin Kestrel;
   Kestrel files a Training for Osprey on Mon 27 Jul; Saber, 149 picked, changes its remarks (its filer, Kestrel, is told);
   then the two moves are written as setup, each from Thu 16 Jul */
const WORLD = resolve(TMP, 'state-world.json'), IDS = resolve(TMP, 'ids.json')
let ID = {}
async function world() {
  if (existsSync(WORLD) && existsSync(IDS) && !process.env.FRESH) { ID = JSON.parse((await import('node:fs')).readFileSync(IDS, 'utf8')); return WORLD }
  const s = await mk('d', null, SETUP_AT)
  try {
    await signIn(s, 'ad', 'a')
    await make150(s, 'world')
    ID.u150 = await unitIdOf(s, 150); FACT('world.u150', ID.u150)
    if (!ID.u150) throw new Error('150 was not made')
    FACT('world.kestrelLines', await s.page.evaluate(() => document.querySelector('[data-person="kes9"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null))
    /* Kestrel files the Training for Osprey, through the Inputs page's "+ Input" */
    await freshTab(s)
    await signIn(s, 'ad9', 'a9')
    FACT('world.kestrelIn', await barSq(s))
    await toList(s)
    const before = new Set((await listRows(s)).map(r => r.iid))
    await hit(s, '#inNew', 900)
    await s.page.selectOption('#inpEditPerson', 'osp9')
    await s.page.selectOption('#inpEditType', 'Training'); await wait(s, 300)
    await hit(s, `[data-testid="inpEdCal-day-${TRAINING_DAY}"]`, 400)
    FACT('world.filing', await winNow(s))
    await hit(s, '#inpEditSave', 1200)
    FACT('world.filed.toast', await toastNow(s))
    const after = await listRows(s)
    const made = after.find(r => !before.has(r.iid))
    FACT('world.filed', made ?? after.slice(0, 6))
    if (!made) throw new Error('the Training was not filed')
    ID.training = made.iid
    /* Saber, 149 picked, changes its remarks: Kestrel, its filer, is told on his bell */
    await freshTab(s)
    await signIn(s, 'ad', 'a')
    await s.page.evaluate(() => { document.getElementById('sqnMenuBtn') })
    await pickAs(s, 149, 'world.saber')
    await toList(s)
    await hit(s, s.page.locator(`#inBody [data-iid="${ID.training}"], #inList [data-iid="${ID.training}"]`).first(), 900)
    const rmk = vis(s, '#inpEditRmk').first(); await rmk.click(); await s.page.keyboard.type('Moved to the afternoon slot')
    FACT('world.saberChange', await winNow(s))
    await hit(s, '#inpEditSave', 1200)
    FACT('world.saberChange.toast', await toastNow(s))
    /* the two moves, as setup (no screen saves one), on the sign-in page of a fresh tab */
    await freshTab(s)
    await s.page.goto(URL_); await s.page.waitForSelector('#luser', { timeout: 20000 })
    FACT('world.moveNasty', await writeHome(s, { pid: 'nasty', from: 'u142', to: 'u149', day: MOVE_DAY }))
    FACT('world.moveOsprey', await writeHome(s, { pid: 'osp9', from: 'u149', to: ID.u150, day: MOVE_DAY }))
    ID.notices = await s.page.evaluate(() => Object.keys(localStorage).filter(k => /notice/i.test(k)).slice(0, 40))
    writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
    writeFileSync(IDS, JSON.stringify(ID))
    FACT('world.ids', ID)
    FACT('world.errs', s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}

/* the Medical tab, "as of" Thu 16 Jul */
async function medical(s, k) {
  await go(s, 'inputs'); await wait(s, 700)
  await hit(s, '#inMedBtn', 800)
  const asOf = (await words(s, '#medCalBtn'))[0] || ''
  FACT(`${k}.asOfBefore`, asOf)
  await hit(s, '#medCalBtn', 500)
  const day = vis(s, `[data-medday="${MOVE_DAY}"]`)
  if (!(await day.count())) { await hit(s, '#medCalNext', 400) }
  await hit(s, vis(s, `[data-medday="${MOVE_DAY}"]`).first(), 800)
  FACT(`${k}.asOf`, (await words(s, '#medCalBtn'))[0] || '')
  const cards = await s.page.evaluate(() => [...document.querySelectorAll('.medcard')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ iid: e.dataset.medcard, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 100) })))
  FACT(`${k}.cards`, cards)
  const nasty = cards.find(c => /Nasty/i.test(c.words) && /OML/.test(c.words)) || cards.find(c => /Nasty/i.test(c.words))
  FACT(`${k}.nastyCard`, nasty ?? null)
  return nasty
}
const cardSel = iid => `.medcard[data-medcard="${iid}"]`

const W_ = await world()
try {
  for (const sz of SZS) {
    const n = sz === 'd' ? 'desktop' : 'phone'
    if (want('q30')) await run(`q30-${n}`, sz, async s => {
      const k = `q30.${sz}`
      await signIn(s, 'ad', 'a')
      FACT(`${k}.clock`, await s.page.evaluate(() => new Date().toString()))
      await pickAs(s, 149, k)
      const card = await medical(s, `${k}.149`)
      if (!card) throw new Error('Nasty\'s card is not on 149\'s Medical tab')
      const cb = await boxOf(s, cardSel(card.iid))
      await s.page.locator(cardSel(card.iid)).first().scrollIntoViewIfNeeded(); await wait(s, 300)
      const cb2 = await boxOf(s, cardSel(card.iid))
      const r1 = await tring(s, cb2 || cb, 'the card')
      await sshot(s, 'q30', `q30-149-today-${n}`, [r1, await boxOf(s, '#medCalBtn'), await sqMark(s)])
      await untring(s)
      /* proposed: the same tab with that card hidden on the page - DRAWN; the crop the section that held it */
      const secOf = await s.page.evaluate(sel => { const c = document.querySelector(sel)?.closest('.medsec'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, innerHeight - r.top) } }, cardSel(card.iid)).catch(() => null)
      FACT(`${k}.section`, secOf)
      await s.page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) e.style.display = 'none' }, cardSel(card.iid))
      await wait(s, 300)
      FACT(`${k}.proposed149.cards`, await s.page.evaluate(() => [...document.querySelectorAll('.medcard')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60))))
      await sshot(s, 'q30', `q30-149-proposed-${n}`, [await boxOf(s, '#medCalBtn'), await sqMark(s), secOf])
      await s.page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) e.style.display = '' }, cardSel(card.iid))
      await wait(s, 300)
      /* the card pressed, then "Edit input" */
      await hit(s, s.page.locator(cardSel(card.iid)).first(), 900)
      FACT(`${k}.viewer`, { edit: !!(await boxOf(s, '#docViewEdit')), words: (await words(s, '.docview, [data-testid="docview"], #docView')).map(w => w.slice(0, 160)) })
      await hit(s, '#docViewEdit', 1000)
      const w = await winNow(s); FACT(`${k}.window`, { ...w, squadron: await barSq(s), page: await curPage(s) })
      if (!w.open) throw new Error('the Input window did not open')
      const m = await sqMark(s), sv = await boxOf(s, '#inpEditSave')
      const ra = m ? await tring(s, m, 'the squadron') : null
      const rb = sv ? await tring(s, sv, 'Save') : null
      await sshot(s, 'q30', `q30-149-today-open-${n}`, [ra, rb, await boxOf(s, '[data-testid="win-inputedit"]')])
      await untring(s)
      /* 142's Medical tab, the same day */
      await hit(s, '#inpEditCancel', 700)
      if (await vis(s, '#docViewClose, .docview .xbtn, [aria-label="Close"]').count()) await hit(s, vis(s, '#docViewClose, .docview .xbtn').first(), 500).catch(() => {})
      FACT(`${k}.closed`, { window: (await winNow(s)).open, viewer: !!(await boxOf(s, '#docViewEdit')) })
      await pickAs(s, 142, `${k}.to142`)
      const c142 = await medical(s, `${k}.142`)
      const r3 = c142 ? await tring(s, await boxOf(s, cardSel(c142.iid)), 'the card') : null
      await sshot(s, 'q30', `q30-142-today-${n}`, [r3, await boxOf(s, '#medCalBtn'), await sqMark(s)])
      await untring(s)
    }, W_)
    if (want('q31')) await run(`q31-${n}`, sz, async s => {
      const k = `q31.${sz}`
      await signIn(s, 'ad9', 'a9')
      FACT(`${k}.in`, { bar: await barSq(s), clock: await s.page.evaluate(() => new Date().toString()) })
      await hit(s, '#notifyBell', 800)
      const lines = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="bell-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.dataset.testid, words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) })))
      FACT(`${k}.lines`, lines)
      const line = lines.find(l => /Osprey/.test(l.words) && /Training|Sim|27/.test(l.words)) || lines.find(l => /Osprey/.test(l.words))
      if (!line) throw new Error('no line about Osprey\'s Training on Kestrel\'s bell')
      const lb = await boxOf(s, `[data-testid="${line.id}"]`)
      const r1 = await tring(s, lb, 'the line')
      await sshot(s, 'q31', `q31-bell-${n}`, [r1, await boxOf(s, '#notifyBell'), await sqMark(s)])
      await untring(s)
      await hit(s, s.page.locator(`[data-testid="${line.id}"]`).first(), 1200)
      const w = await winNow(s); FACT(`${k}.today`, { ...w, squadron: await barSq(s), page: await curPage(s), toast: await toastNow(s) })
      if (!w.open) throw new Error('the line opened no window')
      const m = await sqMark(s), sv = await boxOf(s, '#inpEditSave')
      const ra = m ? await tring(s, m, 'the squadron') : null
      const rb = sv ? await tring(s, sv, 'Save') : null
      await sshot(s, 'q31', `q31-today-open-${n}`, [ra, rb, await boxOf(s, '[data-testid="win-inputedit"]')])
      await untring(s)
      /* proposed, by real presses: the window closed by its own Cancel, 150 picked, Inputs, the Training opened */
      await hit(s, '#inpEditCancel', 700)
      await pickAs(s, 150, `${k}.to150`)
      await toList(s)
      const rows = await listRows(s); FACT(`${k}.150list`, rows.slice(0, 12))
      const row = rows.find(r => r.iid === ID.training)
      if (!row) throw new Error('the Training is not on 150\'s Inputs list')
      await hit(s, s.page.locator(`#inBody [data-iid="${ID.training}"], #inList [data-iid="${ID.training}"]`).first(), 1000)
      const w2 = await winNow(s); FACT(`${k}.proposed`, { ...w2, squadron: await barSq(s), page: await curPage(s) })
      if (!w2.open) throw new Error('the Training\'s window did not open on 150')
      const m2 = await sqMark(s), sv2 = await boxOf(s, '#inpEditSave')
      const rc = m2 ? await tring(s, m2, 'the squadron') : null
      const rd = sv2 ? await tring(s, sv2, 'Save') : null
      await sshot(s, 'q31', `q31-proposed-open-${n}`, [rc, rd, await boxOf(s, '[data-testid="win-inputedit"]')])
      await untring(s)
    }, W_)
  }
} finally { await closeAll() }
