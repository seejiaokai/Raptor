/* RE-WALK — [STANDBY-FLIES] only what the walk's fixes touched (19 Oct 26), on the fixed build. Assertions of the RIGHT
   behaviour: a PASS means correct. (1) the phone week (402): the Flies chip under the badge, smaller, no word broken
   inside either (D1066, walker B F1); (2) the wave head says "· flies" on a flying AVALON (walker B / C); (3) the board's
   chip by keyboard: Enter, then Enter again with no re-Tab, ticks and unticks (walker A F2); (4) the changes window
   after a hand tick says "ticked to fly" / "Flies" and heads it "standby role" (walkers A F1, C F1).
   Run: HP_URL=http://localhost:4322 node scripts/handpass/sf-rewalk.mjs
   Pictures: docs/img/handpass/2026-10-19-standby-flies/rewalk/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('sf-rewalk v1')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4322'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/rewalk')
mkdirSync(OUT, { recursive: true })
const DI = 5
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = [], res = []
const ok = (name, cond, seen) => { res.push(`${cond ? 'PASS' : 'FAIL'} — ${name}${seen ? ` (${seen})` : ''}`) }
async function login(ctx) {
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(BASE + '/')
  const html = await p.content(); console.log('bundle', (html.match(/index-[A-Za-z0-9_-]+\.js/) || [])[0])
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  return p
}
async function setUp(p) {
  return p.evaluate((DI) => {
    window.addWave(DI, 'sc'); window.addWave(DI, 'avalon')
    const ws = window.DAYS[DI].waves, gi = ws.findIndex(w => w.kind === 'sc'), ai = ws.findIndex(w => w.kind === 'avalon')
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special), used = new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    ;[[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]].forEach(([li, r]) => { window.fillSlot(`${DI}.${gi}.${li}.${r}.p`, pick('FCP')); window.fillSlot(`${DI}.${gi}.${li}.${r}.w`, pick('RCP')) })
    window.fillSlot(`${DI}.${ai}.0.0.p`, pick('FCP'))
    return { gi, ai }
  }, DI)
}
try {
  { /* 1, 2 — the phone week */
    const ctx = await browser.newContext({ viewport: { width: 402, height: 1400 }, deviceScaleFactor: 3, hasTouch: true, colorScheme: 'dark' })
    const p = await login(ctx); const { gi, ai } = await setUp(p)
    await p.evaluate(([DI, gi, ai]) => { const ws = window.DAYS[DI].waves; ws[gi].formations[0].rl = '06:30'; ws[gi].formations[1].aircraft[2].fly = true; ws[ai].formations[0].rl = '18:30'; window.afterSchedMutate() }, [DI, gi, ai])
    await p.waitForTimeout(700)
    const badge = p.locator(`#page-editsched [data-sarole="${DI}.${gi}.0.0"]`).first()
    await badge.evaluate(e => { const d = e.closest('.day'); if (d) d.scrollIntoView({ block: 'nearest', inline: 'start' }); e.scrollIntoView({ block: 'start', inline: 'nearest' }); window.scrollBy(0, -100) })
    await p.waitForTimeout(300)
    const m = await p.evaluate(([DI, gi]) => {
      const b = document.querySelector(`#page-editsched [data-sarole="${DI}.${gi}.0.0"]`), c = b.parentElement.querySelector('.saflies.on')
      const rb = b.getBoundingClientRect(), rc = c.getBoundingClientRect(), fb = parseFloat(getComputedStyle(b).fontSize), fc = parseFloat(getComputedStyle(c).fontSize)
      const oneLine = (e) => { const r = e.getBoundingClientRect(); return r.height < parseFloat(getComputedStyle(e).fontSize) * 2.2 }
      return { under: rc.top >= rb.bottom - 1, smaller: fc < fb, whole: oneLine(b) && oneLine(c), fb, fc }
    }, [DI, gi])
    ok('1 phone week: the chip under the badge, smaller, neither broken', m.under && m.smaller && m.whole, JSON.stringify(m))
    const top = await badge.boundingBox()
    await p.screenshot({ path: resolve(OUT, 'R-1-phone-week.png'), clip: { x: 0, y: Math.max(0, top.y - 80), width: 402, height: 900 } })
    const tag = await p.evaluate(([DI, ai]) => { const w = window.DAYS[DI].waves[ai]; const el = [...document.querySelectorAll('#page-editsched .satag')].map(x => x.textContent); return el }, [DI, ai])
    ok('2 the AVALON wave head says "standalone · flies"', tag.some(t => /standalone · flies/.test(t)), tag.join(' | '))
    await ctx.close()
  }
  { /* 3, 4 — the desktop board: the keyboard, then the changes window */
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' })
    const p = await login(ctx); const { gi } = await setUp(p)
    await p.evaluate(DI => window.openScheduler(DI), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
    const key = `${DI}.${gi}.1.2`
    await p.locator(`#sbBoard [data-safly="${key}"]`).first().focus()
    await p.keyboard.press('Enter'); await p.waitForTimeout(400)
    const after1 = await p.evaluate(k => ({ fly: !!window.DAYS[+k.split('.')[0]].waves[+k.split('.')[1]].formations[1].aircraft[2].fly, focused: document.activeElement && document.activeElement.getAttribute('data-safly') }), key)
    await p.keyboard.press('Enter'); await p.waitForTimeout(400)
    const after2 = await p.evaluate(k => ({ fly: !!window.DAYS[+k.split('.')[0]].waves[+k.split('.')[1]].formations[1].aircraft[2].fly, focused: document.activeElement && document.activeElement.getAttribute('data-safly') }), key)
    ok('3 Enter ticks and keeps the keyboard on the chip; a second Enter unticks', after1.fly && after1.focused === key && !after2.fly, JSON.stringify([after1, after2]))
    await p.keyboard.press('Enter'); await p.waitForTimeout(400)   // ticked again, for the changes window
    const chip = await p.locator(`#sbBoard [data-safly="${key}"]`).first().boundingBox()
    await p.screenshot({ path: resolve(OUT, 'R-3-board-ticked.png'), clip: { x: 0, y: Math.max(0, chip.y - 200), width: 1440, height: 420 } })
    /* the changes window, opened through the app (its own toggle) */
    const opened = await p.evaluate(() => { const b = document.querySelector('[data-hist], #sbHist, [title*="History"], [aria-label*="History"]'); if (b) { b.click(); return true } return false })
    await p.waitForTimeout(900)
    /* "New to you" never lists one's own changes: the "All changes" tab, by its own control */
    await p.getByText(/^All changes/).first().click(); await p.waitForTimeout(700)
    const txt = await p.evaluate(() => document.body.innerText)
    ok('4 the changes window names the tick (Flies / ticked to fly) under "standby role"', /standby role/i.test(txt) && /Flies|ticked to fly/.test(txt) && !/stores[^\n]*Flies/.test(txt), `opened ${opened}`)
    await p.screenshot({ path: resolve(OUT, 'R-4-changes.png'), fullPage: false })
    await ctx.close()
  }
} finally {
  await browser.close()
  res.forEach(r => console.log(r))
  console.log('page errors', errors.length, errors.slice(0, 3).join(' | '))
}
