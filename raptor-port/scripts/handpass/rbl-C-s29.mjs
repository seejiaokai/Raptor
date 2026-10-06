/* S29 — overlays and smaller screens. X = Saber (stiff, the admin's own sign-in): his Monday already ends 23:10 (two flights, a double turn, a long-day note).
   Fixture built ONCE at desktop (Tuesday ZT take-off 07:00, Brief 05:00, Saber in the BACK seat, the day published, then a change left pending, an ALL AVAIL crowd on a
   ground row), saved as the browser's storage, and READ in a fresh context at: phone 390×844 · short landscape 844×390 · desktop 1440×900 at 125% (two ways). */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, MON, TUE, R, pic, picEl } = C
const X = 'stiff', CS = 'Saber'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = C.sleep

/* ---------- the fixture, once, at desktop ---------- */
async function build() {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const errors = []
  const p = await L.page(ctx, errors)
  await L.signIn(p, 'a')
  await B.toEdit(p)
  const log = []
  const t = await K.addFlyWave(p, TUE)
  await C.csFix(p, TUE, t.gi, 0, { cs: 'ZT', msn: 'BFM', br: '05:00', to: '07:00', ld: '08:00' })
  const s = await K.seat(p, TUE, t.gi, 0, 0, 'p', X)
  await W.boardText(p, `fr:${TUE}.${t.gi}.0.0`, 'AAR')   /* a remark that raises a qualification warning for him, a higher-priority chip beside the rest line */
  log.push(`Tuesday ZT 07:00–08:00 Brief 05:00, remark AAR, ${CS} seated in the front seat (took ${s.took}${s.msg ? ', app said "' + s.msg + '"' : ''})`)
  const g = await C.groundRow(p, TUE, 'CROWD ROW', '08:00', '09:00', false)
  const put = await K.handPut(p, `g:${TUE}.${g.ri}.+`, 'allavail')
  log.push(`a Ground Programme row CROWD ROW 08:00–09:00 with an ALL AVAIL placeholder put on it (took ${put.took})`)
  const pub = await K.pubOrig(p, TUE)
  log.push(`the four sign-offs and Publish day (${JSON.stringify(pub.r)})`)
  /* a change made after publishing → the pending amendment tag */
  await K.ff(p, TUE, t.gi, 0, 'msn', 'ACM')
  await B.toEdit(p)
  const h = await B.head(p, TUE)
  log.push(`then the line's mission changed to ACM → the day's head: tag "${h.tag}", pending "${h.pending}"`)
  await L.settle(p)
  const warns = (await C.fullWarnsX(p, TUE, X)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
  const monW = (await C.fullWarnsX(p, MON, X)).map(w => `${w.sev}/${w.code}`)
  log.push(`Saber's Tuesday warnings: ${JSON.stringify(warns)}; Monday: ${JSON.stringify(monW)}`)
  const state = await ctx.storageState()
  const pf = await pic(p, 's29-0-fixture')
  await browser.close()
  return { state, log, errors, pf, gi: t.gi, ri: g.ri }
}

const ringOf = x => `${x.solid ? 'SOLID' : x.dashed ? 'DASHED' : 'no solid ring'}${x.dotted ? '+DOTTED' : ''}${x.chip ? ' chip ' + x.chip : ''}${/\bme\b/.test(x.cls) ? ' [me]' : ''}${x.outline ? ' outline ' + x.outline : ''}`
const hit = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.offsetParent !== null); if (!e) return 'absent'; e.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return x && (x === e || e.contains(x) || x.contains(e)) ? 'reachable' : 'COVERED by ' + (x ? (x.id || x.className || x.tagName).toString().slice(0, 40) : 'nothing') }, sel)

async function readAt(tag, ctxOpts, browserArgs, state) {
  const browser = await chromium.launch({ headless: true, ...launchOptions, ...(browserArgs ? { args: browserArgs } : {}) })
  const ctx = await browser.newContext({ ...ctxOpts, storageState: state })
  const errors = []
  const p = await L.page(ctx, errors)
  const out = { pics: [] }
  try {
    await L.signIn(p, 'a')
    await B.toEdit(p)
    const vp = await p.evaluate(() => `${innerWidth}×${innerHeight} @${devicePixelRatio}`)
    out.vp = vp
    /* the week */
    const w = await C.seeWeek(p, TUE, `s29-${tag}`, { id: X })
    out.pics.push(...w.pics)
    out.tueLines = (w.list.full || []).filter(x => x.text.includes(CS)).map(x => `[${x.sev}] ${x.text.replace(/ ✕| ↺/g, '').slice(0, 200)}`)
    out.tue = w.pk.filter(x => x.where === 'flying line').map(ringOf)
    out.mon = w.pv.filter(x => x.where === 'flying line').map(ringOf)
    out.head = await B.head(p, TUE)
    /* tap the breach line: what lights, and what a finger lands on */
    const line = p.locator(`#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"] .witem[data-wix]`).filter({ hasText: CS }).filter({ hasText: /Crew rest/ }).first()
    if (await line.count()) {
      await line.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
      const landed = await line.evaluate(e => { const r = e.getBoundingClientRect(); const x = document.elementFromPoint(r.left + 30, r.top + r.height / 2); return x && (x === e || e.contains(x)) ? 'the line' : 'COVERED by ' + (x ? (x.id || x.className).toString().slice(0, 40) : 'nothing') })
      await line.click({ position: { x: 30, y: 8 }, timeout: 3000 }).catch(() => {}); await sleep(500)
      out.lineTap = `finger lands on ${landed}; lit after the tap: ${await p.evaluate(() => [...document.querySelectorAll('.puck.wfoc')].filter(e => e.offsetParent !== null).map(e => e.dataset.person).join(',') || 'nothing')}`
      out.pics.push(await pic(p, `s29-${tag}-linetap`))
    } else out.lineTap = 'no breach line to tap'
    /* the changes window */
    const chip = p.locator(`#eWeek .day[data-day="${TUE}"] .dpend`).first()
    if (await chip.count()) {
      await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(200)
      out.chipHit = await hit(p, `#eWeek .day[data-day="${TUE}"] .dpend`)
      await chip.click({ timeout: 3000 }).catch(() => {}); await sleep(700)
      out.chg = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return 'not open'; const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; return `title "${t(w.querySelector('.win-ttl'))}", tabs ${[...w.querySelectorAll('.win-tab')].map(t).join('/')}, text "${t(w).slice(0, 260)}"` })
      out.chgClose = await hit(p, '.chgwin:not([hidden]) .win-x')
      out.pics.push(await pic(p, `s29-${tag}-changes`))
      await p.locator('.chgwin:not([hidden]) .win-x').first().click().catch(() => {}); await sleep(300)
    } else { out.chg = 'no pending chip on Tuesday'; out.pics.push(await pic(p, `s29-${tag}-nochip`)) }
    /* the board */
    await K.boardTo(p, TUE); await sleep(400)
    const bp = await C.painted(p, '#schedBoard', X)
    out.board = bp.map(x => `${x.where}: ${ringOf(x)}`)
    const bl = await B.readBoard(p)
    out.boardBar = bl.head
    out.boardLines = (bl.lines || []).filter(x => x.text.includes(CS)).map(x => x.text.slice(0, 160))
    out.pics.push(await pic(p, `s29-${tag}-board`))
    /* the ALL AVAIL crowd, opened from the ground row */
    const pk = p.locator(`#schedBoard .oilcount:visible`).first()
    if (await pk.count()) {
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
      await pk.click({ timeout: 3000 }).catch(() => {}); await sleep(700)
      out.win = await p.evaluate(who => { const w = document.querySelector('.availwin'); if (!w) return 'did not open'; const e = [...w.querySelectorAll(`.puck[data-person="${who}"]`)][0]; const t = x => x ? (x.innerText || '').replace(/\s+/g, ' ').trim() : ''; return `open — ${t(w).slice(0, 120)} … his entry: ${e ? `"${t(e.closest('.aw-row, li, div') || e)}" class ${String(e.className).replace(/\s+/g, ' ').slice(0, 70)}` : 'not listed'}` }, X)
      out.winClose = await hit(p, '.availwin .win-x')
      out.pics.push(await pic(p, `s29-${tag}-allavail`))
      await p.keyboard.press('Escape'); await sleep(300)
    } else out.win = 'no ALL AVAIL count chip found on the board'
    out.errors = errors
  } catch (e) { out.err = String(e.stack || e).slice(0, 500); out.pics.push(await pic(p, `s29-${tag}-X`).catch(() => '')) }
  await browser.close()
  return out
}

const fx = await build()
R('S29.0', `fixture built once at desktop, admin Saber`, fx.log.join(' | ') + `. Errors: ${fx.errors.join(' | ') || 'none'}`, 'RECORDED', [fx.pf])
const SIZES = [
  ['desktop125-ctx', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.25 }, null, 'desktop 1440×900, context deviceScaleFactor 1.25'],
  ['desktop125-arg', { viewport: { width: 1440, height: 900 } }, ['--force-device-scale-factor=1.25'], 'desktop 1440×900, browser launched with --force-device-scale-factor=1.25'],
  ['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, null, 'phone 390×844'],
  ['landscape', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }, null, 'short landscape 844×390'],
]
for (const [tag, o, args, label] of SIZES) {
  const r = await readAt(tag, o, args, fx.state)
  if (r.err) { R(`S29.${tag}`, label, 'script error: ' + r.err, 'NOT WALKED', r.pics); continue }
  const restOK = r.tueLines.some(x => /Crew rest breach/.test(x))
  const dotOK = r.mon.some(x => /DOTTED/.test(x))
  const reach = [r.chipHit, r.chgClose, r.winClose].filter(x => x && x !== 'reachable' && x !== 'absent')
  R(`S29.${tag}`, `${label} (the page measured ${r.vp}); reads: week Tuesday, tap the breach line, the pending chip's changes window, the board, the ALL AVAIL crowd`,
    `Tuesday lines naming ${CS}: ${JSON.stringify(r.tueLines)}; his Tuesday cockpit pucks: ${JSON.stringify(r.tue)}; Monday: ${JSON.stringify(r.mon)}; Tuesday's head: tag "${r.head.tag}", pending "${r.head.pending}"; ${r.lineTap}; pending chip ${r.chipHit}; changes window: ${r.chg}; its close ${r.chgClose}; board panel "${r.boardBar}", lines naming him ${JSON.stringify(r.boardLines)}; his pucks on the board ${JSON.stringify(r.board)}; ALL AVAIL: ${r.win}; its close ${r.winClose}. Errors: ${(r.errors || []).join(' | ') || 'none'}`,
    restOK && dotOK && !reach.length ? 'PASS' : 'FAIL', r.pics)
}
B.savePart('rbl-C-s29')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
