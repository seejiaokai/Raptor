/* R-01 — a week nobody has touched stays unsaved; an answer on it survives (re-walk, walker Q).
   Everything a step DOES goes through the app's own controls; window.* only reads. */
import * as C from './stk2-Q-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const TUE = 1
const PHONE = !!process.env.HP_PHONE
const w = await C.world(); const p = w.p
const pics = []
const checks = []
const log = []
const wkKeys = async () => { const r = await L.rows(p); return Object.keys(r).filter(k => k.startsWith('weeks/')).sort() }
const dayRows = ks => ks.filter(k => /#\d/.test(k))
const allKeys = async () => Object.keys(await L.rows(p)).sort()
try {
  /* (a) nothing touched: read, reload, read */
  const k0 = await wkKeys(); const all0 = await allKeys()
  log.push(`(a) before reload: week keys ${J(k0)} (all keys ${all0.length})`)
  await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.settle(p, 900)
  const k1 = await wkKeys(); const all1 = await allKeys()
  log.push(`after reload+sign-in: week keys ${J(k1)} (all keys ${all1.length})`)
  checks.push(['(a) no day row of either week is stored by merely opening and reloading', dayRows(k0).length === 0 && dayRows(k1).length === 0, J({ before: k0, after: k1 })])

  /* (b) tracking on; Tuesday's RU line "RED AIR" */
  await C.tracking(p, true)
  await L.go(p, 'editsched'); await W.showDay(p, TUE)
  const tgt = await p.evaluate(() => { const d = DAYS[1]; for (let g = 0; g < d.waves.length; g++) for (let f = 0; f < d.waves[g].formations.length; f++) { const F = d.waves[g].formations[f]; if (F.aircraft.some(a => a.rmks === 'RED AIR')) return { g, f, cs: F.cs, msn: F.msn, key: `fr:1.${g}.${f}.${F.aircraft.findIndex(a => a.rmks === 'RED AIR')}`, people: F.aircraft.flatMap(a => [a.p, a.w]).filter(Boolean).map(id => PEOPLE[id] && PEOPLE[id].cs) } } return null })
  log.push(`target ${J(tgt)}`)
  const KEY = tgt.key
  const names = [...new Set(tgt.people)]
  const bars = async label => { const o = await C.insightsRead(p); pics.push(o.pic); const m = C.mixOf(o, ...names); log.push(`bars ${label}: ${m}`); return { m, o } }
  const boxBtn = async label => {
    await W.showDay(p, TUE)
    const el = p.locator(`#eWeek [data-txt="${KEY}"]:visible`).first()
    await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await el.click(); await C.sleep(500)
    const r = await p.evaluate(() => { const c = document.querySelector('[data-role-choose]'); return { btn: c && c.offsetParent ? c.innerText.trim() : null, q: document.querySelectorAll('.mission-role-question').length } })
    r.pic = await C.pic(p, `r01-${label}-box`); pics.push(r.pic)
    log.push(`button ${label}: ${J(r)}`)
    await p.keyboard.press('Escape'); await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() }); await C.sleep(300)
    return r
  }
  const b0 = await bars('before-answer')
  const btn0 = await boxBtn('before')
  const kBefore = await allKeys()
  const el = p.locator(`#eWeek [data-txt="${KEY}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await el.click(); await C.sleep(400)
  const ch = p.locator('[data-role-choose]:visible').first()
  const chText = (await ch.count()) ? (await ch.innerText()).trim() : 'NO BUTTON'
  pics.push(await C.pic(p, 'r01-1-choose'))
  await ch.click(); await C.sleep(400)
  pics.push(await C.pic(p, 'r01-2-question'))
  await C.side(p, 'red'); await C.sleep(500)
  await p.keyboard.press('Escape'); await p.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() }); await C.sleep(300)
  await L.settle(p, 900)
  const kAfter = await allKeys()
  const newKeys = kAfter.filter(k => !kBefore.includes(k))
  log.push(`pressed "${chText}" -> Red. keys written by the answer: ${J(newKeys)}; week keys now ${J(await wkKeys())}`)
  const b1 = await bars('after-answer')
  const btn1 = await boxBtn('after-answer')
  checks.push(['(b) before the answer the crew had total-only bars and the button read "Choose mission role"', /-b\/-r/.test(b0.m) && /Choose/.test(btn0.btn || ''), J({ bars: b0.m, btn: btn0 })])
  checks.push(['(b) after Red the crew bars are split (blue/red counts shown) and the button reads "Change mission role"', !/-b\/-r/.test(b1.m) && /Change mission role/.test(btn1.btn || ''), J({ bars: b1.m, btn: btn1 })])
  /* reload, sign in */
  await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.settle(p, 900)
  await L.go(p, 'editsched'); await W.showDay(p, TUE)
  const b2 = await bars('after-reload')
  const btn2 = await boxBtn('after-reload')
  checks.push(['(b) after the reload the bars stay split and the button reads "Change mission role"', !/-b\/-r/.test(b2.m) && /Change mission role/.test(btn2.btn || ''), J({ bars: b2.m, btn: btn2 })])
  /* (c) week of 20 Jul and back */
  const nxt = p.locator('button:has-text("Jul 20"):visible').first()
  if (await nxt.count()) await nxt.click(); else await p.evaluate(() => document.querySelector('[data-wk="20/07/2026"]').click())
  await C.sleep(1300)
  const wk1 = await p.evaluate(() => window.CURWEEK)
  pics.push(await C.pic(p, 'r01-3-next-week'))
  const bk = p.locator('button:has-text("Jul 13"):visible').first()
  if (await bk.count()) await bk.click(); else await p.evaluate(() => document.querySelector('[data-wk="13/07/2026"]').click())
  await C.sleep(1300)
  const wk2 = await p.evaluate(() => window.CURWEEK)
  await W.showDay(p, TUE)
  const b3 = await bars('after-week-switch')
  const btn3 = await boxBtn('after-week-switch')
  log.push(`weeks: ${wk1} then ${wk2}`)
  checks.push(['(c) after the week of 20 Jul and back the bars stay split and the button reads "Change mission role"', wk1 !== wk2 && !/-b\/-r/.test(b3.m) && /Change mission role/.test(btn3.btn || ''), J({ weeks: [wk1, wk2], bars: b3.m, btn: btn3 })])
  /* (d) stored week rows */
  await L.settle(p, 900)
  const kd = await wkKeys(); const alld = await allKeys()
  log.push(`(d) week keys at the end ${J(kd)}`)
  checks.push(["(d) Tuesday's own day row is still not stored (an answer writes no day)", !kd.some(k => /#1$/.test(k)), J({ weekKeys: kd, otherNewKeys: alld.filter(k => !all1.includes(k)) })])
  const bad = checks.filter(c => !c[1])
  C.row(`R-01${PHONE ? '(phone)' : ''}`, 'fresh world, nothing changed: stored week rows read, reload, read; Logic tracking On; Edit Schedule Tue 14 Jul, the RU line whose Remarks reads RED AIR: clicked into its Remarks, Choose mission role -> Red; Insights bars; reload; bars and button; week of 20 Jul and back; stored week rows again',
    checks.map(c => `${c[1] ? 'OK' : 'NOT OK'} ${c[0]} [${String(c[2]).slice(0, 400)}]`).join(' || ') + ' || LOG: ' + log.join(' ;; '), bad.length ? 'FAIL' : 'PASS', pics)
} catch (e) { C.row('R-01', 'aborted', String(e.stack || e).slice(0, 900) + ' LOG ' + log.join(' ;; '), 'FAIL', [await C.pic(p, 'r01-error')]) }
console.log('ERRORS', J(C.ERR))
C.save('r01')
await w.browser.close()
