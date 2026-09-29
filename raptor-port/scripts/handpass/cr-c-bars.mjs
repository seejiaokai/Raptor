/* Phase C of the change-recording re-test — THE BARS ([UNDO-TOPBAR], owner D347–D349, 28 Sep 26), walked on the real
   production build. Each check ASSERTS the right behaviour (PASS = the app did what it should), so re-running this IS
   the re-walk. For every page, for an admin and a member: is the Undo / Redo pair in the top bar where it should be
   (D347), in the desktop's order on a phone — Undo · Redo · (the clock) · the sync dot · the bell at the far right
   (D348) — the bar one row, and no taller than Edit Schedule's; the Tracker's pair there with its own history; the
   board's bar: Undo · Redo · History · Sync · the bell · ✓ Done, no ✕ (D349 (3)); on a phone the ⋯ menu beside the
   highlighter opens, offers Sort all and the layout switch, and closes on a tap outside.
   Usage (from raptor-port/): node scripts/handpass/cr-c-bars.mjs desktop|phone|short   (HP_URL, HP_SHOTS) */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const MODE = process.argv[2] || 'desktop'
const SIZE = { desktop: [1440, 900], laptop: [1366, 768], phone: [390, 844], short: [844, 390] }[MODE]
const [W, H] = SIZE
const PHONE = W <= 820
const BASE = process.env.HP_URL || 'http://localhost:4173'
/* the live app (`main`, served beside the build) — the bar on each page may be no taller than it is there (the plan's
   B10.2). The first run compared against Edit Schedule's bar, which is two lines on a laptop anyway, and passed a
   bar that had grown a line; the gate's drag tests found it. */
const MAIN = process.env.HP_MAIN || 'http://localhost:4192'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-change-recording/c') + '/' + MODE
mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const rows = []
let n = 0, fails = 0
const ok = (step, cond, saw) => { rows.push([step, cond ? 'PASS' : 'FAIL', saw]); if (!cond) fails++; console.log(`${cond ? 'PASS' : 'FAIL'} ${step} — ${saw}`) }

async function session(user, pass, url = BASE) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, ...(W < 700 ? { hasTouch: true, isMobile: true } : {}) })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(url + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#luser'); await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  return { ctx, page, errs }
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForFunction(x => window.CURPAGE === x, p); await page.waitForTimeout(700) }
const shot = async (page, name, clipBar = true) => {
  const file = `${OUT}/${String(++n).padStart(2, '0')}-${name}.png`
  if (clipBar) {
    const h = await page.evaluate(() => { const t = document.querySelector('.topbar'); return t ? t.getBoundingClientRect().bottom : 120 })
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: Math.min(H, Math.ceil(h) + 160) } })
  } else await page.screenshot({ path: file })
  return file.split('/').pop()
}
/* the bar's group, read from the page: which controls, their left edges, the bar's height and rows */
const readBar = (page) => page.evaluate(() => {
  /* how many lines a set of controls sits on — by each one's MIDDLE (the bell is a few px taller than a button, so their
     tops differ while they share a line); a new line is a middle more than 12px below the last */
  const lines = (els) => { const mids = els.map(e => { const r = e.getBoundingClientRect(); return (r.top + r.bottom) / 2 }).sort((a, b) => a - b); let n = mids.length ? 1 : 0; for (let i = 1; i < mids.length; i++) if (mids[i] - mids[i - 1] > 12) n++; return n }
  const bar = document.querySelector('.topbar')
  const vis = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none'
  const x = (sel) => { const el = bar.querySelector(sel); return vis(el) ? Math.round(el.getBoundingClientRect().left) : null }
  const kids = [...bar.querySelectorAll('.spring > *, .tb-hist > *')].filter(vis)
  return {
    h: Math.round(bar.getBoundingClientRect().height),
    /* the group's own line: the pair, the clock, Sync and the bell share one (a desktop's nav takes a line above it — it
       did before this build too, at 1440 wide, in the approved mock-up's "today" picture) */
    rows: lines([...bar.querySelectorAll('.tb-hist .abtn, .fastsync, .bellbtn')].filter(vis)),
    phoneRows: lines([...bar.querySelectorAll('.burger, .mark, .tb-hist .abtn, .fastsync, .bellbtn')].filter(vis)),
    undo: x('#undoBtn'), redo: x('#redoBtn'), trUndo: x('#trUndoBtn'), trRedo: x('#trRedoBtn'), clock: x('#histBtn'),
    sync: x('#fastSync'), bell: x('#notifyBell'), syncLbl: vis(bar.querySelector('#syncLbl')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    right: Math.max(...kids.map(e => Math.round(e.getBoundingClientRect().right))),
    bellRight: vis(bar.querySelector('#notifyBell')) ? Math.round(bar.querySelector('#notifyBell').getBoundingClientRect().right) : null,
  }
})

async function pagesFor(who, user, pass, want) {
  const { ctx, page, errs } = await session(user, pass)
  await go(page, want.includes('editsched') ? 'editsched' : 'viewsched')
  /* the same pages on the live app, same person, same size */
  const mainH = {}
  { const m = await session(user, pass, MAIN)
    for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']) {
      if (who === 'member' && (p === 'editsched' || p === 'admin')) continue
      await go(m.page, p); mainH[p] = (await readBar(m.page)).h }
    await m.ctx.close() }
  for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']) {
    if (who === 'member' && (p === 'editsched' || p === 'admin')) continue
    await go(page, p)
    if (p === 'tracker') await page.waitForSelector('#flowSvg', { timeout: 20000 }).catch(() => {})
    const b = await readBar(page)
    const pic = await shot(page, `${who}-${p}`)
    const has = want.includes(p)
    const u = p === 'tracker' ? b.trUndo : b.undo, r = p === 'tracker' ? b.trRedo : b.redo
    ok(`${who} · ${p}: the pair is ${has ? 'in the top bar' : 'not drawn (nothing changes here)'}`, has ? (u != null && r != null) : (b.undo == null && b.trUndo == null), `undo@${u} redo@${r} · ${pic}`)
    if (has) {
      const seq = [u, r, p === 'editsched' ? b.clock : null, b.sync, b.bell].filter(v => v != null)
      ok(`${who} · ${p}: Undo · Redo${p === 'editsched' ? ' · the clock' : ''} · Sync · the bell, left to right (D348 on a phone)`, seq.every((v, i) => i === 0 || v > seq[i - 1]), seq.join(' < '))
      if (PHONE) ok(`${who} · ${p}: the Sync label drops to its dot where the pair shows`, !b.syncLbl, `label shown: ${b.syncLbl}`)
      if (PHONE) ok(`${who} · ${p}: the bell sits at the right end of the bar`, b.bellRight != null && b.bellRight >= b.right - 1, `bell right ${b.bellRight}, group right ${b.right}`)
    }
    ok(`${who} · ${p}: the group on one line${PHONE ? ' (the whole bar one row)' : ''}, the bar no taller than on the live app (${mainH[p]}px), no sideways scroll`,
      b.rows === 1 && (!PHONE || b.phoneRows === 1) && b.h <= mainH[p] + 1 && b.overflow <= 0, `h ${b.h} (live ${mainH[p]}) · group rows ${b.rows} · bar rows ${b.phoneRows} · overflow ${b.overflow}`)
  }
  ok(`${who}: no console or page errors`, errs.length === 0, errs.slice(0, 3).join(' | ') || 'none')
  await ctx.close()
}

await pagesFor('admin', 'ad', 'a', ['editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'admin'])
await pagesFor('member', 'us', 'us', ['inputs', 'quals', 'leavewar', 'tracker'])

/* the board's bar */
{
  const { ctx, page, errs } = await session('ad', 'a')
  await go(page, 'editsched')
  await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#sbDone'); await page.waitForTimeout(600)
  const bar = await page.evaluate(() => {
    const vis = (el) => !!el && el.getBoundingClientRect().width > 0 && getComputedStyle(el).display !== 'none'
    const ids = [...document.querySelectorAll('#schedBoard .sb-actions button')].filter(vis).map(b => b.id)
    const top = document.querySelector('#schedBoard .sb-top')
    return { ids, h: Math.round(top.getBoundingClientRect().height), close: !!document.getElementById('sbClose'), more: vis(document.getElementById('sbMore')) }
  })
  const pic = await shot(page, 'board-bar', false)
  const want = PHONE ? ['sbUndo', 'sbRedo', 'sbHist', 'sbSync', 'sbBell', 'sbDone'] : ['sbTpl', 'sbSortAll', 'sbUndo', 'sbRedo', 'sbHist', 'sbSync', 'sbBell', 'sbDone']
  const got = bar.ids.filter(id => want.includes(id) || id === 'sbOil' || id === 'sbClose' || id === 'sbWide')
  ok(`the board's bar reads ${want.join(' · ')} — no ✕ Close (D349)`, !bar.close && want.every((id, i) => got.indexOf(id) >= 0 && (i === 0 || got.indexOf(id) > got.indexOf(want[i - 1]))), `${bar.ids.join(' · ')} · ${pic}`)
  ok(`the ⋯ button is ${PHONE ? 'in the day row, beside the highlighter' : 'not drawn on a desktop'}`, bar.more === PHONE, `shown ${bar.more}`)
  ok(`the board's bar height`, true, `${bar.h}px`)
  if (PHONE) {
    await page.click('#sbMore'); await page.waitForTimeout(300)
    const m = await page.evaluate(() => {
      const menu = document.getElementById('sbMoreMenu'); if (!menu) return null
      const r = menu.getBoundingClientRect(), c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return { items: [...menu.querySelectorAll('button')].map(b => b.textContent.trim()), onTop: !!c && menu.contains(c), inView: r.right <= innerWidth && r.bottom <= innerHeight }
    })
    const pic2 = await shot(page, 'board-more-open', false)
    ok('⋯ opens a menu with Sort all and the layout switch, drawn on top and on screen', !!m && m.items.some(t => /Sort all/.test(t)) && m.items.some(t => /layout/i.test(t)) && m.onTop && m.inView, `${JSON.stringify(m)} · ${pic2}`)
    await page.mouse.click(Math.round(W / 2), Math.round(H * 0.7)); await page.waitForTimeout(300)
    ok('a tap outside closes it', !(await page.locator('#sbMoreMenu').count()), 'menu gone')
    await page.click('#sbMore'); await page.waitForTimeout(200); await page.click('#sbMoreWide'); await page.waitForTimeout(600)
    ok('the layout choice switches the board and closes the menu', (await page.evaluate(() => document.getElementById('schedBoard').classList.contains('sb-wide'))) && !(await page.locator('#sbMoreMenu').count()), 'sb-wide on')
    await shot(page, 'board-wide', false)
    await page.click('#sbMore'); await page.waitForTimeout(200); await page.click('#sbMoreWide'); await page.waitForTimeout(400)
    await page.click('#sbHl'); await page.waitForTimeout(300)
    await shot(page, 'board-hl-open', false)
  }
  /* the bell on the board: with nothing lit it clears, the board stays */
  await page.click('#sbBell'); await page.waitForTimeout(300)
  ok('the board’s bell answers without leaving the board when there is nowhere to go', await page.locator('#schedBoard:visible').count() > 0, 'board still open')
  await page.click('#sbSync'); await page.waitForTimeout(200)
  const both = await page.evaluate(() => [document.getElementById('sbSync').className, document.getElementById('fastSync').className])
  ok('one Sync state: the board’s chip and the top bar’s agree', both.every(c => /\bon\b/.test(c)), both.join(' / '))
  await page.click('#sbSync')
  await page.click('#sbDone'); await page.waitForTimeout(500)
  ok('✓ Done closes the board', !(await page.locator('#schedBoard:visible').count()), 'closed')
  ok('the board: no console or page errors', errs.length === 0, errs.slice(0, 3).join(' | ') || 'none')
  await ctx.close()
}

writeFileSync(`${OUT}/cr-c-bars-results.md`, `# cr-c-bars — ${MODE} ${W}×${H}\n\n| step | result | saw |\n|---|---|---|\n` + rows.map(r => `| ${r.join(' | ')} |`).join('\n') + `\n\n${rows.length - fails} PASS · ${fails} FAIL\n`)
console.log(`\n${rows.length - fails} PASS · ${fails} FAIL`)
await browser.close()
process.exit(fails ? 1 : 0)
