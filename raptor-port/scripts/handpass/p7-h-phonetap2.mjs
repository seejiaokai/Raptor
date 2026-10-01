/* [DB-READINESS] phase 7 — the host's DIAGNOSIS of the phone count tap ([COUNT-CHIP-PHONE-TAP]; Astra's final read 1):
   which element each event of a finger tap on the count lands on, on the phone's edit week — and whether a candidate
   fix (CSS injected into the page, nothing built) changes it. Variants: none · bigger (Astra's min 28×28 on the week) ·
   active (an :active style on the count). Env as p7-h-phonetap.mjs. */
import { boot, TODAY, fact, saveFacts } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { L, W } = await boot()
const TUE = 1
const VARIANTS = {
  none: '',
  bigger: '@media (max-width:820px){#eWeek .oilcount,#vWeek .oilcount{box-sizing:border-box;min-width:28px;min-height:28px;margin:3px 0 0;padding:0 6px;justify-content:center;touch-action:manipulation}}',
  active: '.oilcount:active{filter:brightness(1.2)}',
}
for (const [name, css] of Object.entries(VARIANTS)) {
  const browser = await L.launch()
  const ctx = await browser.newContext({ viewport: L.DESK, hasTouch: true })
  await ctx.clock.setFixedTime(TODAY)
  const errors = []
  const p = await L.page(ctx, errors)
  await L.signIn(p, 'a')
  await W.boardOn(p, TUE)
  await p.locator(`#schedBoard [data-gradd="${TUE}"]:visible`).first().click(); await L.sleep(500)
  const ri = await p.evaluate(d => window.DAYS[d].ground.length - 1, TUE)
  await W.boardText(p, `gr:${TUE}.${ri}.prog`, 'OPS BRIEF')
  await W.boardText(p, `gr:${TUE}.${ri}.str`, '0900')
  await W.boardText(p, `gr:${TUE}.${ri}.end`, '1000')
  await handPut(p, `g:${TUE}.${ri}.+`, 'allavail')
  await L.settle(p)
  await W.boardOff(p)
  await p.setViewportSize(L.PHONE); await L.sleep(500)
  if (css) await p.addStyleTag({ content: css })
  await L.go(p, 'editsched'); await W.showDay(p, TUE, '#eWeek')
  const chip = p.locator(`#eWeek .day[data-day="${TUE}"] .oilcount:visible`).first()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  /* record where each event of the tap lands */
  await p.evaluate(() => {
    window.__ev = []
    const say = e => { const t = e.target; window.__ev.push(`${e.type}${e.pointerType ? '(' + e.pointerType + ')' : ''} → ${t.className && typeof t.className === 'string' ? t.tagName + '.' + t.className.split(' ').slice(0, 3).join('.') : t.tagName}${e.defaultPrevented ? ' [prevented]' : ''}`) }
    for (const n of ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'click']) document.addEventListener(n, say, true)
  })
  const b = await chip.boundingBox()
  const at = await chip.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === e ? 'the chip' : (h && (h.className || h.tagName)) })
  await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(700)
  const open = await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); return !!w })
  fact(`${name}`, { chip: { w: Math.round(b.width), h: Math.round(b.height) }, atCentre: at, opens: open, armed: await p.evaluate(() => (window.ARM && window.ARM.key) || null), events: await p.evaluate(() => window.__ev) })
  await L.shot(p, `H-phonetap2-${name}`)
  await browser.close()
}
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
