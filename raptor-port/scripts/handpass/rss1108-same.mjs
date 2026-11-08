// The night of 7–8 Nov 26, job 2 — React Doctor's findings on the shell, the state and the windows (Shell, Modals, the
// windows' shades and ✕ buttons, the Insights body, the highlight chips' lists, the save indicator's source, the top bar's
// mark): NOTHING A PERSON SEES MAY CHANGE. Every touched screen pictured on the build before and the build after, at his
// PC's 1536 (Chromium, 125%) and his iPhone's 402 (WebKit, 3x), the clock held still, then each pair compared (no pixel
// more than 24 colour levels off). First the same build twice — the comparison must see only the code (walk-scripts §8).
// Each screen is reached by the controls a person presses, in a fresh browser world (the demo), signed in as the admin.
// Copied from the method of scripts/handpass/pq1106-same.mjs (6 Nov 26).
// Usage, from raptor-port/:  node scripts/handpass/rss1108-same.mjs <before dist> <after dist> [out folder] [only,names]
import { chromium, webkit, LAUNCH, serveDist, pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('[rss1108-same v2]')
const [before, after, out = 'docs/img/handpass/2026-11-08-rd-shell-state/same', onlyArg = ''] = process.argv.slice(2)
const ONLY = onlyArg.split(',').filter(Boolean)
mkdirSync(out, { recursive: true })
const ORIGIN = 'http://localhost:4393'
const NOW = new Date('2026-07-14T09:30:00+08:00')
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const V = sel => `${sel} >> visible=true`
const tid = (p, t) => p.locator(`[data-testid="${t}"]:visible`).first()
const press = async (p, sel) => { try { await p.locator(V(sel)).first().click({ timeout: 6000 }) } catch (e) { throw new Error(`pressing ${sel}: ${e.message.split(String.fromCharCode(10))[0]}`) } await p.clock.runFor(450) }
/* Insights: the button on a desktop, the ⋯ menu's item on a phone */
async function insights(p) {
  if (await p.locator(V('#insightBtn')).count()) await press(p, '#insightBtn')
  else { await press(p, '#page-editsched .schedule-more'); await press(p, '#editSchedMoreInsights') }
}
const phoneOf = p => p.viewportSize().width < 600
/* a page tab: the top bar's on a desktop, the side menu's on a phone */
async function tab(p, page) {
  if (phoneOf(p)) { await press(p, '#burger'); await press(p, `#drawerNav a[data-page="${page}"]`) }
  else await press(p, `#topnav a[data-page="${page}"]`)
  await p.clock.runFor(900)
}
/* the Inputs calendar's day window */
async function inputsDay(p, iso) {
  await tab(p, 'inputs')
  if (await p.locator(V('#inCalBtn')).count()) await press(p, '#inCalBtn')
  await p.locator(`#inpCal [data-icday="${iso}"]`).first().click({ position: { x: 8, y: 8 }, timeout: 6000 }); await p.clock.runFor(500)
}

/* each screen: [name, reach, address] — reach runs freshly signed in as the admin; the address is ?fresh=1 (a fresh demo
   in memory) unless the screen names another */
const SCREENS = [
  ['view', async () => {}],
  ['view-hl', async p => { if (phoneOf(p) && await p.locator(V('#page-viewsched .hl-tog')).count()) await press(p, '#page-viewsched .hl-tog'); await press(p, '#page-viewsched [data-hlgrp-btn="cat"]'); await press(p, '#page-viewsched .fchip[data-hl="A"]') }],
  ['view-dayinfo', async p => { await press(p, '.dinfobtn[data-dayinfo="0"]') }],
  ['drawer', async p => { if (phoneOf(p)) await press(p, '#burger') }],
  ['edit', async p => { await tab(p, 'editsched') }],
  ['edit-search', async p => { await tab(p, 'editsched'); await p.locator(V('#searchE')).first().fill('a').catch(() => {}); await p.clock.runFor(500) }],
  ['edit-weekcal', async p => { await tab(p, 'editsched'); await press(p, '#page-editsched .wk-cal, #page-editsched .filt-cal, .wknav-mbtn.filt-cal') }],
  ['edit-traffic', async p => { await tab(p, 'editsched'); await press(p, '#eWeek .airbtn[data-air]') }],
  ['edit-insights', async p => { await tab(p, 'editsched'); await insights(p) }],
  ['edit-insights-all', async p => { await tab(p, 'editsched'); await insights(p); if (await p.locator(V('#insightBody [data-insights-all]')).count()) await press(p, '#insightBody [data-insights-all]') }],
  ['edit-daytpl', async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-daytplopen="0"]'); await press(p, 'text=Manage templates') }],
  ['edit-plans', async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-planmanage]') }],
  /* the app's own test switch ?savefail (D1666) refuses every save once the app is up — the band and its Retry; a press
     on Retry is refused again while the switch is on, so the band stays (the retry is the moved press, savestatus-source) */
  ['save-failed', async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await p.clock.runFor(800) }, '?savefail'],
  ['save-failed-retry', async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await p.clock.runFor(800); await press(p, '.savestat.failed button, .saveband button'); await p.clock.runFor(1500) }, '?savefail'],
  ['help', async p => { await tab(p, 'help') }],
  ['inputs-picker', async p => { await inputsDay(p, '2026-07-07'); await press(p, '#icAddPuck'); await press(p, '#icNewNotePpl'); await press(p, '.ic-pick [data-hlgrp="cat"] .hl-gtab') }],
  ['docconf', async p => { await inputsDay(p, '2026-07-22'); await press(p, '#icPopAdd'); await p.selectOption('#inpEditType', 'ATT C'); await p.clock.runFor(300); await press(p, '#inpEditSave') }],
  ['oilconf', async p => { await inputsDay(p, '2026-07-18'); await press(p, '#icPopAdd'); await p.selectOption('#inpEditType', 'Duty'); await p.clock.runFor(300); await press(p, '#inpEditSave') }],
  ['guest', async p => {
    await tab(p, 'admin'); await p.locator(V('.adm-cat')).filter({ hasText: 'Users' }).first().click(); await p.clock.runFor(500)
    if (!(await p.locator('#admGuestView').isChecked())) await press(p, '#admGuestView')
    if (phoneOf(p)) { await press(p, '#burger'); await press(p, '#drawerLogout') } else await press(p, '#logout')
    await p.clock.runFor(700)
    await p.fill('#luser', 'stranger'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await p.clock.runFor(900)
    await p.fill('#accCs', 'Stranger'); await p.fill('#accIni', 'ST'); await p.selectOption('#accSeat', 'GND'); await press(p, '#accSend'); await p.clock.runFor(900)
    await press(p, '#accGuest'); await p.clock.runFor(900)
  }],
]

const record = {}
async function shoot(dist, tag) {
  const pics = {}
  for (const [size, engine] of [['desk', 'chromium'], ['phone', 'webkit']]) {
    const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
    for (const [name, reach, q = '?fresh=1'] of SCREENS) {
      if (ONLY.length && !ONLY.includes(name)) continue
      const phone = size === 'phone'
      const ctx = await br.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
      await serveDist(ctx, ORIGIN, dist)
      const p = await ctx.newPage()
      const errs = []; p.on('pageerror', e => errs.push(e.message))
      await p.clock.install({ time: NOW }); await p.clock.pauseAt(new Date(NOW.getTime() + 5000))
      await p.goto(ORIGIN + '/' + q)
      await p.addStyleTag({ content: QUIET }).catch(() => {})
      let reached = true, why = ''
      try {
        await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
        await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.clock.runFor(1500)
        await p.addStyleTag({ content: QUIET }).catch(() => {})
        await reach(p)
      } catch (e) { reached = false; why = e.message.split('\n')[0]; console.log(`  ${tag} ${size} ${name}: could not reach — ${why}`) }
      await p.clock.runFor(1500)
      const f = path.join(out, `${tag}-${size}-${name}.png`)
      await p.screenshot({ path: f, fullPage: false })
      pics[`${size}-${name}`] = f
      /* what stands on screen, so a picture that is the same in both builds is also shown to be the screen it names */
      const open = await p.evaluate(() => ['#dayPop', '#airpop', '#insightModal', '#daytplModal', '#draftsModal', '#weekCal', '#drawer.open', '[data-testid="docconf"]', '[data-testid="oilconf"]', '.ic-pick', '#guestApp', '.savestat.failed', '.saveband', '#page-help']
        .filter(s => { const n = document.querySelector(s); return !!n && !n.hidden && (n.offsetParent !== null || getComputedStyle(n).position === 'fixed') }))
      ;(record[`${size}-${name}`] ||= {})[tag] = { reached, why, open, errors: errs.slice(0, 3) }
      if (errs.length) console.log(`  ${tag} ${size} ${name}: page errors — ${errs.slice(0, 2).join(' | ')}`)
      await ctx.close()
    }
    await br.close()
  }
  return pics
}
const A = await shoot(before, 'before'), A2 = await shoot(before, 'before-again'), B = await shoot(after, 'after')
const cmp = await chromium.launch(LAUNCH)
let same = 0, diff = 0, noise = 0
for (const k of Object.keys(A)) {
  const self = await pictureDiff(cmp, A[k], A2[k]), d = await pictureDiff(cmp, A[k], B[k])
  const ok = d.same !== false && !(d.share > 0)
  /* a difference the SAME build shows against itself is the browser's, not the code's: it is marked NOISE and its
     pictures are opened by eye before the sheet says anything (the after must differ no more than the before-again) */
  const isNoise = !ok && self.same === false && d.pixels <= self.pixels * 1.5
  ok ? same++ : isNoise ? noise++ : diff++
  const verdict = ok ? 'SAME' : isNoise ? 'NOISE' : 'DIFF'
  record[k].self = self; record[k].diff = d; record[k].verdict = verdict
  console.log(`${verdict.padEnd(5)} ${k}  open: ${JSON.stringify(record[k].after?.open)}  before vs before-again: ${JSON.stringify(self)}  before vs after: ${JSON.stringify(d)}`)
}
await cmp.close()
writeFileSync(path.join(out, 'record.json'), JSON.stringify(record, null, 1))
console.log(`${same} the same, ${noise} differ only as the same build differs from itself, ${diff} differ`)
