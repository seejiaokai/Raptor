/* [DB-READINESS] phase 7 walk — the HOST's reproduction of walker C's F1 (1 Oct 26): at phone width a finger tap on an
   ALL AVAIL count chip on the WEEK views is said not to open the window (the touch lands on the puck above the chip).
   Sets up one ground row with ALL AVAIL on Tuesday through the board's own controls (desktop width, the mouse), then at
   390×844 measures the chip and what lies at its centre, and taps it by finger on the edit week and on View-only Sched —
   on this build, and (HP_URL pointed at it) on the build before phase 7.
   Env: HP_URL, HP_SHOTS, HP_OUT. */
import { boot, TODAY, fact, saveFacts } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W } = await boot()
const TUE = 1
const browser = await L.launch()
const ctx = await browser.newContext({ viewport: L.DESK, hasTouch: true })
await ctx.clock.setFixedTime(TODAY)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')

/* one ground row, OPS BRIEF 09:00–10:00, ALL AVAIL under it */
await W.boardOn(p, TUE)
const n0 = await p.evaluate(d => window.DAYS[d].ground.length, TUE)
await p.locator(`#schedBoard [data-gradd="${TUE}"]:visible`).first().click(); await L.sleep(500)
const ri = await p.evaluate(d => window.DAYS[d].ground.length - 1, TUE)
fact('rowAdded', { n0, ri })
await W.boardText(p, `gr:${TUE}.${ri}.prog`, 'OPS BRIEF')
await W.boardText(p, `gr:${TUE}.${ri}.str`, '0900')
await W.boardText(p, `gr:${TUE}.${ri}.end`, '1000')
fact('put', await handPut(p, `g:${TUE}.${ri}.+`, 'allavail'))
await L.settle(p)
await W.boardOff(p)

await p.setViewportSize(L.PHONE)
await L.sleep(600)
const winOpen = () => p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); return !!w })
const closeWin = async () => { const x = p.locator('.availwin:not([hidden]) .win-x:visible').first(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } }

for (const [page, scope] of [['editsched', '#eWeek'], ['viewsched', '#vWeek']]) {
  await L.go(p, page)
  await W.showDay(p, TUE, scope)
  const chip = p.locator(`${scope} .day[data-day="${TUE}"] .oilcount:visible`).first()
  if (!(await chip.count())) { fact(`${page}.chip`, 'NO CHIP'); continue }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  const geo = await chip.evaluate(e => {
    const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const hit = document.elementFromPoint(cx, cy)
    const puck = (e.closest('.seat') || e.parentElement).querySelector('.puck')
    const pr = puck ? puck.getBoundingClientRect() : null
    return { chip: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      atCentre: hit ? (hit === e ? 'the chip' : hit.className || hit.tagName) : null,
      puck: pr ? { x: Math.round(pr.left), y: Math.round(pr.top), w: Math.round(pr.width), h: Math.round(pr.height) } : null,
      gap: pr ? Math.round(r.top - pr.bottom) : null }
  })
  fact(`${page}.geometry`, geo)
  await L.shot(p, `H-phonetap-${page}-0-before`)
  /* (1) a finger tap at the chip's centre */
  const b = await chip.boundingBox()
  await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(700)
  const open1 = await winOpen()
  fact(`${page}.fingerTap.opens`, open1)
  await L.shot(p, `H-phonetap-${page}-1-finger`)
  await closeWin()
  const sel = await p.evaluate(() => (window.SELID != null ? window.SELID : null))
  fact(`${page}.fingerTap.selected`, sel)
  if (sel) { await p.keyboard.press('Escape'); await L.sleep(200) }
  /* (2) the same point by mouse */
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(700)
  fact(`${page}.mouseClick.opens`, await winOpen())
  await closeWin()
  L.check(`${page}: a finger tap on the count chip opens the window (phone)`, open1, geo)
}
fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({})
await browser.close()
