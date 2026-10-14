/* THE WALK OF [GLOW-OFF] (owner D877, 15 Oct 26 — "all no glow"): each place he ruled on, reached through the app's own
   controls on the built app, its computed shadows read and pictured. A PASS means the place shows its ring and no glow:
   no shadow layer with a blur, other than a dragged thing's plain black drop shadow (depth, not a glow of a colour).
     W1 a flying line picked up by its grip (held mid-drag)        W2 the same line dropped: the landing flash
     W3 the Inputs calendar: a bar picked up, dropped, put back by Undo — W4 a red, W5 an amber, W6 a grey warning tapped: its crew
     W7 a warning that names a line's times: the time boxes lit    W8 a highlight chip: the pucks it lights
     W9 his own puck ("this is you")                               W10 OIL Earn on a weekend: a puck that earns
     W11 Edit Schedule's week: a warning tapped there lights its crew too
     W12 the guide read's G3: a line dragged into a just-added line's place inside its six seconds (what shows, pictured)
     W13 a puck's drag ghost   W14 a section dragged on Edit Schedule's week   W15 a row of the Leave War's settings list
   usage: DL_BASE=http://localhost:4181 DL_SHOTS=docs/handpass/glow-off/<run> node scripts/handpass/glowoff-walk.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { board, closeBoard } from './ou-lib.mjs'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

console.log('glowoff-walk v12')
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
const MON = 0, SAT = 5
const rows = []
const out = (id, what, expected, saw, ok) => { rows.push({ id, size: T, what, expected, saw, verdict: ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL' }); console.log(`${id} [${T}] ${ok === null ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL'} — ${what}: ${saw}`) }

/* every shadow layer on the element and its ::before / ::after that has a blur and is not plain black */
const glowOf = sel => p.evaluate(sel => {
  const e = typeof sel === 'string' ? document.querySelector(sel) : null
  if (!e) return null
  const split = s => s === 'none' ? [] : s.split(/,(?![^(]*\))/).map(x => x.trim())
  const blurred = l => { const n = l.replace(/rgba?\([^)]*\)/g, '').replace(/inset/g, '').match(/-?\d*\.?\d+px/g) || []; return parseFloat(n[2] || '0') > 0 }
  const black = l => /rgba?\(0,\s*0,\s*0/.test(l)
  const all = []
  for (const pse of [null, '::before', '::after']) { const cs = getComputedStyle(e, pse); if (pse && cs.content === 'none') continue; for (const l of split(cs.boxShadow)) all.push({ pse: pse || 'box', l }) }
  const cs = getComputedStyle(e)
  return { cls: e.className, outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`, shadows: all.map(x => `${x.pse}: ${x.l}`), glows: all.filter(x => blurred(x.l) && !black(x.l)).map(x => `${x.pse}: ${x.l}`) }
}, sel)
const verdictOf = (g, needRing) => g && g.glows.length === 0 && needRing(g)
const ringIn = g => g.shadows.some(s => /0px 0px 0px 2px/.test(s)) || /^2px (solid|dashed)/.test(g.outline)
const say = g => g ? `glow ${g.glows.length ? g.glows.join(' | ') : 'none'}; ring ${g.shadows.join(' | ') || 'none'}; outline ${g.outline}` : 'element not found'
const shot = (name, around, pad = 24) => L.pic(w, `${name}-${T}`, around ? { around, pad } : {})
const tagEl = (sel, n = 0) => p.evaluate(([sel, n]) => { document.querySelectorAll('[data-gw]').forEach(e => e.removeAttribute('data-gw')); const e = document.querySelectorAll(sel)[n]; if (!e) return false; e.setAttribute('data-gw', '1'); e.scrollIntoView({ block: 'center', inline: 'center' }); return true }, [sel, n])
const center = sel => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height } }, sel)

try {
  await board(w, MON)
  const grips = await p.evaluate(() => document.querySelectorAll('#schedBoard .sb-line[data-move] .sb-grip').length)
  /* W1 / W2: pick up the second flying line by its grip, hold it below the third, picture, then drop */
  if (grips >= 3) {
    const order = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-line[data-move]')].slice(0, 5).map(e => e.querySelector('.lin')?.value || '?').join(' / '))
    const before = await order()
    /* scrolled into view vertically only — centring it sideways as well (tagEl) left the phone's drop on its own place */
    await p.evaluate(() => { document.querySelectorAll('[data-gw]').forEach(e => e.removeAttribute('data-gw')); const e = document.querySelectorAll('#schedBoard .sb-line[data-move]')[1]; e.setAttribute('data-gw', '1'); e.scrollIntoView({ block: 'center' }) })
    const g = await center('[data-gw] .sb-grip')
    await p.mouse.move(g.x, g.y); await p.mouse.down()
    /* aimed at a definite place: just below the middle of the next formation's first line */
    const tgt = await p.evaluate(() => { const r = document.querySelectorAll('#schedBoard .sb-line[data-move]')[2].getBoundingClientRect(); return r.top + r.height * 0.7 })
    for (let i = 1; i <= 10; i++) { await p.mouse.move(g.x, g.y + (tgt - g.y) * i / 10); await L.sleep(40) }
    await L.sleep(150)
    const lifted = await p.evaluate(() => { document.querySelectorAll('[data-gw]').forEach(e => e.removeAttribute('data-gw')); const e = document.querySelector('#schedBoard .lift'); if (!e) return null; e.setAttribute('data-gw', '1'); return [...e.classList].join('.') })
    const gl = lifted ? await glowOf('[data-gw]') : null
    await shot('W1-picked-up', lifted ? '#schedBoard' : null)
    out('W1', 'a flying line picked up by its grip', 'the plain blue ring inside the line, no glow (a black drop shadow under a ghost is allowed)', `lifted ${lifted || 'nothing'} — ${say(gl)}`, gl ? verdictOf(gl, g2 => g2.shadows.some(s => /inset/.test(s) && /0px 0px 0px 2px/.test(s))) : false)
    await p.mouse.up()
    /* the flash is painted after the board's re-render (lift.ts paintLand) — wait for it rather than look once */
    const land = await p.waitForSelector('#schedBoard .lift-land', { timeout: 1500 }).then(() => true, () => false)
    console.log(`   lines: ${before} → ${await order()}`)
    const gland = land ? await glowOf('#schedBoard .lift-land') : null
    await p.evaluate(() => { const e = document.querySelector('#schedBoard .lift-land'); if (e) e.scrollIntoView({ block: 'center' }) })
    await L.pic(w, `W2-landed-${T}`, land ? { around: '#schedBoard .lift-land', pad: 20 } : {})
    out('W2', 'the dropped line\'s landing flash', 'its ring and tint, no glow', land ? say(gland) : 'no landing flash seen after the drop', land ? verdictOf(gland, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))) : false)
  } else out('W1', 'a flying line picked up', '', `only ${grips} draggable lines on Monday`, null)

  /* W4–W7: the board's own checks list (#sbWarn — folded on a phone), each kind of warning tapped, on the first day
     of the week that carries one; the time boxes are read after every tap */
  let timeBoxesSeen = false
  const openChecks = async () => { await p.evaluate(() => { const t = document.querySelector('#sbWarn [data-sbwtog]'); const wrap = document.querySelector('#sbWarn .sbwrap'); if (t && wrap && !wrap.classList.contains('open') && !document.querySelector('#sbWarn .wln[data-wix]')?.getClientRects().length) t.click() }); await L.sleep(350) }
  const tapLine = (di, ix) => p.evaluate(([di, ix]) => { const e = document.querySelector(`#sbWarn .wln[data-wdi="${di}"][data-wix="${ix}"]`); e.scrollIntoView({ block: 'center' }); e.click() }, [di, ix])
  for (const [id, sev, name] of [['W4', 'hard', 'red'], ['W5', 'adv', 'amber'], ['W6', 'note', 'grey']]) {
    let done = false
    for (let di = 0; di < 7 && !done; di++) {
      await board(w, di); await openChecks()
      const k = await p.evaluate(sev => { const e = [...document.querySelectorAll('#sbWarn .wln[data-wix]:not(.hid)')].find(x => x.classList.contains(sev)); return e ? { wdi: e.dataset.wdi, wix: e.dataset.wix, txt: e.innerText.replace(/\s+/g, ' ').slice(0, 90) } : null }, sev)
      if (!k) continue
      await tapLine(k.wdi, k.wix); await L.sleep(500)
      const n = await p.evaluate(() => document.querySelectorAll('#schedBoard .puck.wfoc').length)
      const g = n ? await glowOf('#schedBoard .puck.wfoc') : null
      if (n) { await tagEl('#schedBoard .puck.wfoc'); await L.sleep(150); await L.pic(w, `${id}-warning-${name}-${T}`, { around: '[data-gw]', pad: 40 }) }
      out(id, `a ${name} warning tapped (day ${di}): "${k.txt}"`, `its crew ringed in ${name}, no glow`, n ? `${n} pucks lit — ${say(g)}` : 'no puck lit', n ? verdictOf(g, ringIn) : null)
      if (!timeBoxesSeen && await p.evaluate(() => document.querySelectorAll('#schedBoard .badtm.wfoc').length)) {
        timeBoxesSeen = true
        const gt = await glowOf('#schedBoard .badtm.wfoc')
        await tagEl('#schedBoard .badtm.wfoc'); await L.sleep(150); await L.pic(w, `W7-time-boxes-${T}`, { around: '[data-gw]', pad: 40 })
        out('W7', `the time boxes a tapped warning lights ("${k.txt}")`, 'the inset ring, no glow', say(gt), verdictOf(gt, x => x.shadows.some(s => /inset/.test(s) && /0px 0px 0px 2px/.test(s))))
      }
      await tapLine(k.wdi, k.wix); await L.sleep(250)
      done = true
    }
    if (!done) out(id, `a ${name} warning tapped`, '', `no ${name} warning on any day of the week`, null)
  }
  if (!timeBoxesSeen) {
    /* the seed has no line whose time boxes a warning names: make one through the board's own boxes — Monday's first
       flying line given a landing equal to its take-off (the "no length" warning marks both boxes) — then try every
       warning of the day until one lights them */
    await board(w, MON)
    const to = await p.evaluate(() => { const e = document.querySelector('#schedBoard input.tm[data-bfld$=".to"]'); return e ? { v: e.value, f: e.dataset.bfld } : null })
    if (to && to.v) {
      const ld = `#schedBoard input.tm[data-bfld="${to.f.replace(/\.to$/, '.ld')}"]`
      await p.locator(ld).first().scrollIntoViewIfNeeded(); await w.press(ld)
      await p.keyboard.press('Control+A'); await p.keyboard.type(to.v.replace(':', '')); await p.keyboard.press('Enter'); await L.sleep(600)
      console.log('   fixture: landing typed', to.v, '— boxes marked:', await p.evaluate(() => document.querySelectorAll('#schedBoard .badtm').length))
    }
    for (let di = 0; di < 7 && !timeBoxesSeen; di++) {
      await board(w, di); await openChecks()
      const ks = await p.evaluate(() => [...document.querySelectorAll('#sbWarn .wln[data-wix]:not(.hid)')].map(e => ({ wdi: e.dataset.wdi, wix: e.dataset.wix, txt: e.innerText.replace(/\s+/g, ' ').slice(0, 90) })))
      for (const k of ks) {
        await tapLine(k.wdi, k.wix); await L.sleep(400)
        if (await p.evaluate(() => document.querySelectorAll('#schedBoard .badtm.wfoc').length)) {
          const gt = await glowOf('#schedBoard .badtm.wfoc'); timeBoxesSeen = true
          await tagEl('#schedBoard .badtm.wfoc'); await L.sleep(150); await L.pic(w, `W7-time-boxes-${T}`, { around: '[data-gw]', pad: 40 })
          out('W7', `the time boxes a tapped warning lights (day ${di}: "${k.txt}")`, 'the inset ring, no glow', say(gt), verdictOf(gt, x => x.shadows.some(s => /inset/.test(s) && /0px 0px 0px 2px/.test(s))))
          await tapLine(k.wdi, k.wix); await L.sleep(250); break
        }
        await tapLine(k.wdi, k.wix); await L.sleep(200)
      }
    }
    if (!timeBoxesSeen) out('W7', 'the time boxes a tapped warning lights', '', 'no warning on any day lights a line\'s time boxes', null)
  }
  await board(w, MON)

  /* W8: a highlight chip — on a phone the strip folds behind #sbHl */
  await p.evaluate(() => { const t = document.querySelector('#sbHl'); if (t && getComputedStyle(t).display !== 'none' && !document.querySelector('#sbHlStrip.open')) t.click() }); await L.sleep(300)
  const chips = await p.evaluate(() => [...document.querySelectorAll('#sbHlStrip .fchip[data-hl]')].map(e => e.dataset.hl))
  let hlDone = false
  for (const c of chips) {
    await p.evaluate(c => document.querySelector(`#sbHlStrip .fchip[data-hl="${c}"]`).click(), c); await L.sleep(350)
    const n = await p.evaluate(() => document.querySelectorAll('#schedBoard .puck.hl:not(.me)').length)
    if (n) {
      await tagEl('#schedBoard .puck.hl:not(.me)')
      const g = await glowOf('[data-gw]')
      await L.pic(w, `W8-highlight-${T}`, { around: '[data-gw]', pad: 40 })
      out('W8', `highlight chip ${c}: a puck it lights`, 'the blue ring, no glow', `${n} lit — ${say(g)}`, verdictOf(g, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))))
      await p.evaluate(c => document.querySelector(`#sbHlStrip .fchip[data-hl="${c}"]`).click(), c); await L.sleep(250)
      hlDone = true; break
    }
    await p.evaluate(c => document.querySelector(`#sbHlStrip .fchip[data-hl="${c}"]`).click(), c); await L.sleep(200)
  }
  if (!hlDone) out('W8', 'a highlight chip', '', `chips ${chips.join(',') || 'none'} lit no puck`, null)

  /* W9: his own puck, wherever the week seats him */
  let meDone = false
  for (let di = 0; di < 7 && !meDone; di++) {
    if (di !== MON) await board(w, di)
    if (await tagEl('#schedBoard .puck.me:not(.warn):not(.boxred):not(.boxdash):not(.boxdot):not(.oilglow)')) {
      const g = await glowOf('[data-gw]')
      await L.pic(w, `W9-this-is-you-${T}`, { around: '[data-gw]', pad: 40 })
      out('W9', `his own puck (day ${di})`, 'purple fill and ring, no glow', say(g), verdictOf(g, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))))
      meDone = true
    }
  }
  if (!meDone) out('W9', 'his own puck', '', 'Saber wears no unflagged puck on any day of the week', null)

  /* W10: OIL Earn on Saturday — a puck that earns */
  await board(w, SAT)
  await p.evaluate(() => { const b = document.querySelector('#sbOil'); if (b && !b.classList.contains('on')) b.click() }); await L.sleep(800)
  if (await tagEl('#schedBoard .puck.oilglow')) {
    const g = await glowOf('[data-gw]'), half = await p.evaluate(() => document.querySelectorAll('#schedBoard .puck.oilglow.half').length)
    await L.pic(w, `W10-oil-earn-${T}`, { around: '[data-gw]', pad: 40 })
    if (half) { await tagEl('#schedBoard .puck.oilglow.half'); await L.pic(w, `W10b-oil-earn-half-${T}`, { around: '[data-gw]', pad: 40 }) }
    out('W10', `OIL Earn on Saturday: a puck that earns (${half} half-day pucks)`, 'the green ring, no glow', say(g), verdictOf(g, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))))
  } else out('W10', 'OIL Earn: a puck that earns', '', 'no earning puck on Saturday (or no OIL Earn button)', null)
  await p.evaluate(() => { const b = document.querySelector('#sbOil.on'); if (b) b.click() }); await L.sleep(400)

  /* W12 (G3): + Line on Monday's first wave, then within six seconds drag the line above into the new line's place */
  await board(w, MON)
  const added = await p.evaluate(() => { const b = document.querySelector('#schedBoard [data-gline]'); if (!b) return null; b.scrollIntoView({ block: 'center' }); b.click(); return b.outerHTML.slice(0, 80) })
  await L.sleep(300)
  const fresh = await p.evaluate(() => document.querySelectorAll('#schedBoard .sb-fresh').length)
  if (added && fresh) {
    await tagEl('#schedBoard .sb-line.sb-fresh')
    const freshMove = await p.evaluate(() => document.querySelector('[data-gw]')?.dataset.move || '')
    const lines = await p.evaluate(() => [...(document.querySelector('[data-gw]')?.closest('.sb-go')?.querySelectorAll('.sb-line[data-move]') || [])].map(e => e.dataset.move))
    const other = lines.find(x => x !== freshMove)
    if (other) {
      const g = await center(`#schedBoard .sb-line[data-move="${other}"] .sb-grip`), t = await center(`#schedBoard .sb-line[data-move="${freshMove}"]`)
      await p.mouse.move(g.x, g.y); await p.mouse.down()
      for (let i = 1; i <= 10; i++) { await p.mouse.move(g.x, g.y + (t.y + t.h * 0.3 - g.y) * i / 10); await L.sleep(30) }
      await p.mouse.up(); await L.sleep(80)
      const both = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-line')].filter(e => e.classList.contains('sb-fresh') && e.classList.contains('lift-land')).length)
      const where = await p.evaluate(() => document.querySelector('#schedBoard .sb-line.lift-land, #schedBoard .sb-line.sb-fresh') ? 1 : 0)
      if (where) await L.pic(w, `W12-G3-fresh-and-landed-${T}`, { around: '#schedBoard .sb-line.lift-land, #schedBoard .sb-line.sb-fresh', pad: 40 })
      const gl = both ? await glowOf('#schedBoard .sb-line.sb-fresh.lift-land') : null
      out('W12', 'G3: a line dragged into a just-added line\'s place within six seconds', 'recorded as seen (older behaviour); no glow on either mark', both ? `one line wears the just-added ring AND the landing flash — ${say(gl)}` : 'no line wears both marks at once', both ? verdictOf(gl, () => true) : true)
    } else out('W12', 'G3', '', 'the new line has no neighbour in its formation to drag', null)
  } else out('W12', 'G3', '', `+ Line ${added ? 'pressed but no just-added ring seen' : 'not found'}`, null)

  /* W11: Edit Schedule's week — a warning tapped there lights its crew too */
  await closeBoard(w)
  await p.evaluate(() => { const d = document.querySelector('#eWeek [data-daywarn]'); if (d) { d.scrollIntoView({ block: 'center', inline: 'center' }); if (!d.closest('.dwbox.open')) d.click() } }); await L.sleep(500)
  await p.evaluate(() => { const e = document.querySelector('#eWeek .dwbox.open .witem.hard[data-wix] .wtx, #eWeek .dwbox.open .witem.hard[data-wix]'); e?.click() }); await L.sleep(500)
  if (await tagEl('#eWeek .puck.wfoc')) {
    const g = await glowOf('[data-gw]')
    await L.pic(w, `W11-week-warning-${T}`, { around: '[data-gw]', pad: 40 })
    out('W11', 'Edit Schedule\'s week: a red warning tapped', 'its crew ringed in red, no glow', say(g), verdictOf(g, ringIn))
  } else out('W11', 'Edit Schedule\'s week: a red warning tapped', '', 'no puck lit on the week', null)
  /* W3: the Inputs calendar — a month bar picked up, dropped a day later, then put back by Undo: the landing flash each time */
  await L.go(w, 'inputs'); await L.sleep(500)
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
  await p.waitForSelector('#inpCal'); await L.sleep(300)
  for (let i = 0; i < 6 && !(await p.locator('#inpCal .ib-bar[data-iid]').count()); i++) { await w.press('#icPrev'); await L.sleep(250) }
  console.log('   inputs calendar on', (await p.locator('#inpCal .ic-mon').innerText()).trim())
  /* a bar on Monday–Wednesday, one day long, so a move one day later stays off the weekend (a weekend move waits on the
     OIL question first — D783 — and moves nothing until it is answered) */
  const pick = await p.evaluate(() => {
    document.querySelectorAll('[data-gw]').forEach(e => e.removeAttribute('data-gw'))
    const cells = [...document.querySelectorAll('#inpCal [data-icday]')].map(c => ({ iso: c.dataset.icday, r: c.getBoundingClientRect() }))
    for (const b of document.querySelectorAll('#inpCal .ib-bar[data-iid]')) {
      const r = b.getBoundingClientRect(), c = cells.find(c => r.left + 4 >= c.r.left && r.left + 4 <= c.r.right && r.top >= c.r.top && r.top <= c.r.bottom)
      if (!c || r.width > c.r.width * 1.2) continue
      const dow = new Date(c.iso + 'T12:00:00').getDay()
      if (dow >= 1 && dow <= 3) { b.setAttribute('data-gw', '1'); b.scrollIntoView({ block: 'center' }); return c.iso }
    }
    return null
  })
  console.log('   bar picked on', pick)
  if (pick) {
    const iid = await p.evaluate(() => document.querySelector('[data-gw]').dataset.iid)
    const b = await center('[data-gw]'), cw = await p.evaluate(() => document.querySelector('#inpCal [data-icday]').getBoundingClientRect().width)
    await p.mouse.move(b.x, b.y); await p.mouse.down()
    for (let i = 1; i <= 8; i++) { await p.mouse.move(b.x + cw * i / 8, b.y + 4); await L.sleep(40) }
    await L.sleep(120)
    const ghost = await p.evaluate(() => !!document.querySelector('.ic-ghost'))
    const gg = ghost ? await glowOf('.ic-ghost') : null
    await L.pic(w, `W3a-bar-picked-up-${T}`, ghost ? { around: '.ic-ghost', pad: 30 } : {})
    out('W3a', 'an Inputs calendar bar picked up', 'the plain ring, no glow (its black drop shadow allowed)', ghost ? say(gg) : 'no ghost followed the mouse', ghost ? verdictOf(gg, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))) : null)
    const recOf = () => p.evaluate(iid => { const r = window.INPUTS.find(x => String(x.iid) === iid); return r ? `${r.date}–${r.endDate || ''}` : 'gone' }, iid)
    const before = await recOf()
    await p.mouse.up()
    const sel = `#inpCal .ib-bar.lift-land[data-iid="${iid}"]`
    const l1 = await p.waitForSelector(sel, { timeout: 1500 }).then(() => true, () => false)
    console.log(`   bar ${iid}: ${before} → ${await recOf()}; note: ${await p.evaluate(() => document.getElementById('toastEl')?.textContent || '')}; sheet open: ${await p.evaluate(() => !!document.querySelector('[data-testid="oilconf"], .sheet.open, [role=dialog]'))}`)
    const g1 = l1 ? await glowOf(sel) : null
    if (l1) await L.pic(w, `W3b-bar-landed-${T}`, { around: sel, pad: 30 })
    out('W3b', 'the bar dropped a day later: its landing flash', 'its ring and tint, no glow', l1 ? say(g1) : 'no landing flash on the moved bar', l1 ? verdictOf(g1, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))) : null)
    await L.sleep(900)
    await p.evaluate(() => document.querySelector('#undoBtn')?.click())
    const l2 = await p.waitForSelector(sel, { timeout: 1500 }).then(() => true, () => false)
    console.log(`   after Undo: ${await recOf()}`)
    const g2 = l2 ? await glowOf(sel) : null
    if (l2) await L.pic(w, `W3c-bar-undo-landed-${T}`, { around: sel, pad: 30 })
    out('W3c', 'Undo: the bar put back wears the landing flash', 'its ring and tint, no glow', l2 ? say(g2) : 'no landing flash on the bar after Undo', l2 ? verdictOf(g2, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))) : false)
  } else out('W3', 'an Inputs calendar bar', '', 'no bar on the month shown', null)
  /* W13–W15: the other places that wear the picked-up look — a puck dragged on the board (its ghost), a section dragged on
     Edit Schedule's week, a row of the Leave War's settings list. Each is held mid-drag, read and pictured, then let go
     where it started (a press-and-move back), so nothing is changed. */
  const holdRead = async (id, what, gripSel, liftSel, root = null) => {
    /* the first grip that is really under the pointer once scrolled to — on the desktop week a day can sit off to the side */
    const ok = await p.evaluate(s => {
      document.querySelectorAll('[data-gg]').forEach(e => e.removeAttribute('data-gg'))
      for (const e of document.querySelectorAll(s)) {
        e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect()
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        if (r.width && (hit === e || e.contains(hit))) { e.setAttribute('data-gg', '1'); return true }
      }
      return false
    }, gripSel)
    if (!ok) { out(id, what, '', `nothing on screen to drag (${gripSel})`, null); return }
    await L.sleep(200)
    const g = await center('[data-gg]')
    await p.mouse.move(g.x, g.y); await p.mouse.down()
    for (let i = 1; i <= 8; i++) { await p.mouse.move(g.x + i * 3, g.y + i * 6); await L.sleep(40) }
    await L.sleep(200)
    const seen = await p.evaluate(s => { document.querySelectorAll('[data-gw]').forEach(e => e.removeAttribute('data-gw')); const e = document.querySelector(s); if (!e) return null; e.setAttribute('data-gw', '1'); return [...e.classList].join('.') }, liftSel)
    const gl = seen ? await glowOf('[data-gw]') : null
    if (seen) await L.pic(w, `${id}-${T}`, { around: root || '[data-gw]', pad: 30 })
    for (let i = 7; i >= 0; i--) { await p.mouse.move(g.x + i * 3, g.y + i * 6); await L.sleep(30) }
    await p.mouse.up(); await L.sleep(400)
    out(id, what, 'the plain ring, no glow (a black drop shadow allowed)', seen ? `${seen} — ${say(gl)}` : `no picked-up look appeared (${liftSel})`, seen ? verdictOf(gl, x => x.shadows.some(s => /0px 0px 0px 2px/.test(s))) : false)
  }
  await L.go(w, 'editsched'); await board(w, MON)
  await holdRead('W13-puck-ghost', 'a puck dragged on the board: the ghost under the finger', '#schedBoard .sb-line .puck[data-slot], #schedBoard .sb-line [data-slot] .puck', '.dragimg.lift, .tdghost.lift')
  await closeBoard(w)
  await holdRead('W14-week-section', 'a section dragged on Edit Schedule\'s week by its grip', '#eWeek .secgrip', '#eWeek .lift')
  await L.go(w, 'leavewar'); await L.sleep(800)
  await p.evaluate(() => document.querySelector('[data-testid="settings-open"]')?.click()); await L.sleep(600)
  await holdRead('W15-lw-settings-row', 'a row of the Leave War\'s settings list dragged by its grip', '.set-grow[data-grow] .set-grip:not(.off)', '.set-grow.dragging, .crow-wrap.gs-row.dragging')
} catch (e) { console.log('STOPPED:', e.message); out('RUN', 'the walk', 'ran to the end', `stopped: ${e.message}`, false) }
finally {
  out('ERR', 'the browser\'s error list', 'empty', w.errors.length ? w.errors.join(' | ').slice(0, 400) : 'empty', w.errors.length === 0)
  writeFileSync(resolve(L.SHOTS, `results-${T}.json`), JSON.stringify(rows, null, 1))
  await L.close(w)
}
