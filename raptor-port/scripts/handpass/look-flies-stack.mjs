/* LOOK — [STANDBY-FLIES] the MAIN / SPARE badge and the Flies chip on Edit Schedule's week at his iPhone's width (402,
   three times its density), after walker B found them squeezed into broken words ("M/AI/N", "✓/FLI/ES"). His message,
   19 Oct 26: "Maybe stack it vertically and make it smaller? Or flies becomes a tick with F". Three options on the real
   app (the fixed build, served apart from the walk): 1 — stacked, as built (the chip under the badge, same size); 2 —
   stacked and smaller (drawn in: the chip's letters ~20% smaller); 3 — a tick with F beside the badge (drawn in: the chip
   reads "✓F"). The SC AM shift has R 06:30 typed (all four rows fly); PM has one SPARE ticked by hand.
   Run: HP_URL=http://localhost:4323 node scripts/handpass/look-flies-stack.mjs
   Pictures: docs/img/handpass/2026-10-19-standby-flies/stack/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

console.log('look-flies-stack v1')
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4323'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-standby-flies/stack')
mkdirSync(OUT, { recursive: true })
const DI = 5
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 1400 }, deviceScaleFactor: 3, isMobile: false, hasTouch: true, colorScheme: 'dark' })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto(BASE + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  const gi = await p.evaluate((DI) => {
    window.addWave(DI, 'sc')
    const gi = window.DAYS[DI].waves.findIndex(w => w.kind === 'sc')
    const ids = Object.keys(window.PEOPLE).filter(i => !window.PEOPLE[i].special)
    const used = new Set()
    const pick = seat => { const i = ids.find(x => window.PEOPLE[x].seat === seat && !used.has(x)); used.add(i); return i }
    ;[[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]].forEach(([li, ai]) => { window.fillSlot(`${DI}.${gi}.${li}.${ai}.p`, pick('FCP')); window.fillSlot(`${DI}.${gi}.${li}.${ai}.w`, pick('RCP')) })
    const w = window.DAYS[DI].waves[gi]
    w.formations[0].rl = '06:30'; w.formations[1].aircraft[2].fly = true
    window.afterSchedMutate && window.afterSchedMutate()
    return gi
  }, DI)
  await p.waitForTimeout(800)
  /* the week's own scroller: bring the Saturday's SC wave to the top */
  const sel = `#page-editsched [data-sarole="${DI}.${gi}.0.0"]`
  const shoot = async (name) => {
    const el = p.locator(sel).first()
    await el.evaluate(e => { const day = e.closest('.day'); if (day) day.scrollIntoView({ block: 'nearest', inline: 'start' }); e.scrollIntoView({ block: 'start', inline: 'nearest' }); let a = e.parentElement; while (a && !(a.scrollHeight > a.clientHeight && /auto|scroll/.test(getComputedStyle(a).overflowY))) a = a.parentElement; if (a) a.scrollTop -= 120; else window.scrollBy(0, -120) })
    await p.waitForTimeout(300)
    const top = await el.boundingBox()
    const bot = await p.locator(`#page-editsched [data-sarole="${DI}.${gi}.1.3"]`).first().boundingBox()
    if (!top || !bot) throw new Error('the SC rows are not on screen')
    const y = Math.max(0, top.y - 100)
    await p.screenshot({ path: resolve(OUT, name), clip: { x: 0, y, width: 402, height: Math.min(bot.y + 60 - y, 1300) } })
  }
  const lit = await p.locator(`#page-editsched .saflies.on`).count()
  console.log('lit chips on the week', lit)
  if (lit < 5) throw new Error('premise gone: expected five lit chips')
  await shoot('1-stacked-as-built.png')
  await p.addStyleTag({ content: '#page-editsched .sarole.saflies{font-size:7px;padding:0 4px}' })
  await shoot('2-stacked-smaller.png')
  await p.addStyleTag({ content: '#page-editsched .sarole.saflies{font-size:8.5px;padding:0 5px}' })
  await p.evaluate(() => document.querySelectorAll('#page-editsched .saflies.on').forEach(c => { c.textContent = '✓F' }))
  await shoot('3-tick-with-f.png')
  await ctx.close()
} finally {
  await browser.close()
  console.log('page errors', errors.length, errors.slice(0, 3).join(' | '))
}
