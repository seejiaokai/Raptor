// draw-q29 - question 29 (chat 204, 27 Nov 26): "could we go without the block" (brief
// docs/superpowers/briefs/2026-11-27-msq-s1-q29-draw-brief.md). The BUILT app in dist, served at 4741; nothing here writes
// the app's code, and no state is forced through the page: every picture is the app's own, reached by real presses.
// The one help: the grey note's fade is held (its opacity only, set back to 1 as the app fades it) so it can be pictured.
// Each at a desktop's 1536x864 (Chromium) and a phone's 390x844 (WebKit, touch), both at 2x.
//   row-today     Kestrel (149's admin) -> Admin -> Users -> Osprey's row -> "osprey" typed in its sign-in box, not saved
//                 -> 142 picked (desktop: the squadron menu; phone: the menu's squadron list): the grey note, 149 kept.
//   row-proposed  the same, then the row's Cancel, then 142 picked: 142 in view, no note - how the proposal would look.
//   window        Kestrel -> Edit Schedule -> a count chip -> "Who's available" open (picture) -> 142 picked (picture).
// The world (made once by presses, copied into each fresh browser): Saber makes 150 (first admin Kestrel) - three squadrons
// in the picker - and gives Kestrel Plan of 142 on Admin -> Users, so he may pick 142.
//   node raptor-port/scripts/handpass/n204/draw-q29.mjs        (ONLY=row-today,row-proposed,window  SZ=d,p  FRESH=1)
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'
import { FACT, wait, vis, boxOf, barSq, words, curPage, tring, untring, make150, give, toastNow, pick } from './q2425-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
const { chromium, webkit } = createRequire(resolve(ROOT, 'package.json'))('playwright')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL_ = 'http://localhost:4741/'
const OUT = resolve(ROOT, 'docs/mock/2026-11-26-msq-questions/q29'); mkdirSync(OUT, { recursive: true })
const TMP = resolve(ROOT, '.tmp/n204-q29'); mkdirSync(TMP, { recursive: true })
const SIZES = { d: { desk: true, w: 1536, h: 864, eng: 'chromium' }, p: { desk: false, w: 390, h: 844, eng: 'webkit' } }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SZS = (process.env.SZ || 'd,p').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
console.log('draw-q29 v1 (27 Nov 26)')

const browsers = {}
async function mk(sz, storageState) {
  const S = SIZES[sz]
  if (!browsers[S.eng]) browsers[S.eng] = await (S.eng === 'webkit' ? webkit.launch() : chromium.launch(LAUNCH))
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browsers[S.eng].newContext({ ...opts, timezoneId: 'Asia/Singapore', ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  const s = { ctx, page, sz, desk: S.desk, W: S.w, H: S.h, errs: [] }
  page.on('pageerror', e => { const m = `PAGEERROR [${sz}] ${String(e).slice(0, 200)}`; console.log(m); s.errs.push(m) })
  page.on('console', m => { if (m.type() === 'error') { const t = `CONSOLE [${sz}] ${m.text().slice(0, 200)}`; console.log(t); s.errs.push(t) } })
  page.on('response', r => { if (r.status() >= 400) { const t = `HTTP${r.status()} [${sz}] ${r.url().slice(0, 120)}`; console.log(t); s.errs.push(t) } })
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return s
}
async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close().catch(() => {}); delete browsers[k] } }
async function run(key, sz, fn, storageState) {
  const s = await mk(sz, storageState)
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
async function users(s) {
  if (await curPage(s) !== 'admin') { await go(s, 'admin'); await wait(s, 700) }
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }).first(), 800)
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
  }
}
/* the grey note's fade held off (opacity only - its words, place and look are the app's), set before the press */
const holdNote = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return false
  const put = () => { t.getAnimations?.().forEach(a => a.finish()); if (t.textContent.trim() && t.style.opacity !== '1') t.style.opacity = '1' }
  window.__q29hold?.disconnect(); window.__q29hold = new MutationObserver(put); window.__q29hold.observe(t, { attributes: true, childList: true, subtree: true, characterData: true })
  return true
})
const noteNow = s => s.page.evaluate(() => {
  const t = document.querySelector('#toastEl'); if (!t) return null
  const b = t.getBoundingClientRect(), c = getComputedStyle(t)
  return { words: t.textContent.replace(/\s+/g, ' ').trim(), face: t.dataset.face || null, at: t.dataset.at || null, opacity: c.opacity, shown: b.width > 1 && c.display !== 'none' && c.visibility !== 'hidden' && c.opacity !== '0', box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
})
const rowState = s => s.page.evaluate(() => {
  const r = document.querySelector('.acc-row.od-row-on'), i = document.querySelector('#accEdName')
  return { open: !!r && r.getBoundingClientRect().width > 0, who: r?.querySelector('.acc-name')?.textContent.trim() ?? null, typed: i ? i.value : null }
})
const state = async s => ({ squadron: await barSq(s), page: await curPage(s), row: await rowState(s), note: await noteNow(s), toast: await toastNow(s) })
const sqMark = s => boxOf(s, s.desk ? '.topbar .mark' : '.topbar .mark, .drawer-sqn .mark')

/* the world: 150 made by Saber (first admin Kestrel), then Kestrel given Plan of 142 on Admin -> Users */
const WORLD = resolve(TMP, 'state-world.json')
async function world() {
  if (existsSync(WORLD) && !process.env.FRESH) return WORLD
  const s = await mk('d')
  try {
    await signIn(s, 'ad', 'a')
    await make150(s, 'world')
    await users(s)
    if (!(await s.page.locator('[data-person="kes9"] .acc-tap').count())) { FACT('world.kestrelRow', 'not on 142\'s Users - 149 picked first'); await pick(s, 149) }
    FACT('world.kestrelPlan142', await give(s, 'kes9', '142', 'plan'))
    FACT('world.kestrelLines', await s.page.evaluate(() => document.querySelector('[data-person="kes9"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null))
    /* then Kestrel, at a desk, drags ALL AVAIL from the crew palette onto Monday's SDO on 149's Edit Schedule, so the
       week carries a count chip that opens "Who's available" (149's demo week has none; a press on the cell's "+ add" does
       not arm a cell that already holds a man, so the drag is the person's way) */
    await s.page.close(); s.page = await s.ctx.newPage()   /* a fresh tab: the sign-in page again, the saved data kept */
    await signIn(s, 'ad9', 'a9')
    FACT('world.kestrelIn', await barSq(s))
    await go(s, 'editsched'); await wait(s, 1000)
    const slot = vis(s, '.page.on [data-fill="d:0.0.0.+"]').first(); await slot.scrollIntoViewIfNeeded()
    const sb = await slot.boundingBox(), pb = await s.page.locator('.rpuck[data-person="allavail"]').first().boundingBox()
    const from = { x: pb.x + pb.width / 2, y: pb.y + pb.height / 2 }, to = { x: sb.x + sb.width - 20, y: sb.y + sb.height / 2 }
    await s.page.mouse.move(from.x, from.y); await s.page.mouse.down()
    for (let i = 1; i <= 12; i++) { await s.page.mouse.move(from.x + (to.x - from.x) * i / 12, from.y + (to.y - from.y) * i / 12); await wait(s, 40) }
    await s.page.mouse.up(); await wait(s, 900)
    FACT('world.allAvailOnMondaySDO', { cell: (await slot.innerText()).replace(/\s+/g, ' ').trim(), chips: await vis(s, '.page.on [data-oilsent]').count() })
    writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
    FACT('world.errs', s.errs)
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}

async function openOsprey(s, k) {
  await signIn(s, 'ad9', 'a9')
  FACT(`${k}.signedIn`, { squadron: await barSq(s) })
  await users(s)
  await hit(s, s.page.locator('[data-person="osp9"] .acc-tap').first(), 700)
  await s.page.waitForSelector('#accEdName', { timeout: 8000 })
  await s.page.fill('#accEdName', 'osprey'); await wait(s, 300)
  FACT(`${k}.typed`, await rowState(s))
}
async function sshot(s, name, rects, pad = 14, whole = true) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(300)
  if (whole) await page.screenshot({ path: `${OUT}/${name}.png` })
  rects = (rects || []).filter(Boolean)
  if (rects.length) {
    const L = Math.min(...rects.map(r => r.x)), T = Math.min(...rects.map(r => r.y)), R = Math.max(...rects.map(r => r.x + r.w)), B = Math.max(...rects.map(r => r.y + r.h))
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad)
    const clip = { x, y, width: Math.max(20, Math.min(s.W, R + pad) - x), height: Math.max(20, Math.min(s.H, B + pad) - y) }
    await page.screenshot({ path: `${OUT}/${name}-crop.png`, clip })
    FACT(`${name}.crop`, clip)
  }
  console.log('  picture ' + name + (whole ? '.png' : '') + (rects.length ? ' + -crop' : ''))
}

const W_ = await world()
try {
  for (const sz of SZS) {
    const n = sz === 'd' ? 'desktop' : 'phone'
    if (want('row-today')) await run(`q29-row-today-${n}`, sz, async s => {
      const k = `rowToday.${sz}`
      await openOsprey(s, k)
      await holdNote(s)
      await pickAs(s, 142, k)
      if (!s.desk) await wait(s, 300)
      const st = await state(s); FACT(`${k}.after`, st)
      /* on a phone, the menu may stay open over the page; picture it as it stands */
      const note = st.note?.shown ? st.note.box : null
      /* the row's head and its sign-in box (the whole open row runs the page's height) */
      const row = await boxOf(s, '#accEdName')
      const head = await boxOf(s, '.acc-row.od-row-on .acc-main')
      const ctl = await boxOf(s, s.desk ? '#sqnMenuBtn' : '#burger')
      const ring = note ? await tring(s, note, 'the note') : null
      await sshot(s, `q29-row-today-${n}`, [ring, row, head, ctl, await sqMark(s)])
      await untring(s)
    }, W_)
    if (want('row-proposed')) await run(`q29-row-proposed-${n}`, sz, async s => {
      const k = `rowProp.${sz}`
      await openOsprey(s, k)
      await hit(s, '#accEdCancel', 600)
      FACT(`${k}.cancelled`, await rowState(s))
      await pickAs(s, 142, k)
      if (!s.desk) await shut(s)
      await wait(s, 600)
      const st = await state(s); FACT(`${k}.after`, st)
      const m = await sqMark(s)
      const ring = m ? await tring(s, m, 'the squadron in view') : null
      /* the same frame as the "today" crop: the top bar down to the Users list's first rows, Osprey's row closed */
      /* (142's list has no Osprey; the frame is the top bar and the list's first rows, as wide as the "today" crop) */
      const frame = s.desk ? { x: 16, y: 0, w: 1000, h: 500 } : { x: 0, y: 0, w: s.W, h: 420 }
      await sshot(s, `q29-row-proposed-${n}`, [ring, await boxOf(s, s.desk ? '#sqnMenuBtn' : '#burger'), frame])
      await untring(s)
    }, W_)
    if (want('window')) await run(`q29-window-${n}`, sz, async s => {
      const k = `window.${sz}`
      await signIn(s, 'ad9', 'a9')
      await go(s, 'editsched'); await wait(s, 900)
      let chip = vis(s, '.page.on [data-oilsent]')
      FACT(`${k}.chipsFound`, await chip.count())
      if (!(await chip.count())) {
        /* no count chip on 149's week: ALL AVAIL placed by presses in Monday's first duty's "+ add" slot (the k3 walk
           used a wave's slot; 149's waves have none free), then its count chip pressed */
        const slot = vis(s, '.page.on [data-fill="d:0.0.0.+"]').first()
        FACT(`${k}.slot`, (await slot.innerText()).replace(/\s+/g, ' ').trim())
        /* a press on the cell's free end, clear of Merlin's puck (the "+ add" strip is drawn there) */
        await slot.scrollIntoViewIfNeeded()
        const sb = await slot.boundingBox()
        FACT(`${k}.slotBox`, sb)
        if (s.desk) await s.page.mouse.click(sb.x + sb.width - 12, sb.y + sb.height / 2); else await s.page.touchscreen.tap(sb.x + sb.width - 12, sb.y + sb.height / 2)
        await wait(s, 700)
        FACT(`${k}.armed`, await s.page.evaluate(() => [...document.querySelectorAll('.armed, [data-armed], .arm')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className.toString().slice(0, 60))))
        let pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ })
        if (!(await pal.count())) { const t = vis(s, '.ros-tab, [title="Aircrew palette"], .crewtab').first(); if (await t.count()) await hit(s, t, 700); pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ }) }
        await hit(s, pal.first(), 900)
        FACT(`${k}.placedAllAvail`, true)
        chip = vis(s, '.page.on [data-oilsent]')
      }
      await hit(s, chip.first(), 1000)
      const win = await boxOf(s, '.availwin')
      FACT(`${k}.open`, { squadron: await barSq(s), page: await curPage(s), window: win, words: (await words(s, '.availwin')).map(w => w.slice(0, 160)) })
      if (!win) throw new Error('"Who\'s available" did not open')
      const r1 = await tring(s, win, 'the window')
      await sshot(s, `q29-window-open-${n}`, [r1, await boxOf(s, s.desk ? '#sqnMenuBtn' : '#burger'), await sqMark(s)])
      await untring(s)
      await holdNote(s)
      await pickAs(s, 142, k)
      if (!s.desk) await shut(s)
      await wait(s, 700)
      const st = await state(s)
      FACT(`${k}.after`, { ...st, windowStillOpen: !!(await boxOf(s, '.availwin')) })
      const m = await sqMark(s)
      const r2 = m ? await tring(s, m, 'the squadron in view') : null
      await sshot(s, `q29-window-after-${n}`, [r2, await boxOf(s, s.desk ? '#sqnMenuBtn' : '#burger')])
      await untring(s)
    }, W_)
  }
} finally { await closeAll() }
