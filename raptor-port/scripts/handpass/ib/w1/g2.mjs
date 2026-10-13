/* scenarios 15-20 (the gold dot): node g2.mjs desktop|phone */
import * as L from './ibl.mjs'
const size = process.argv[2] || 'desktop'
const b = await L.launch()
const jf = x => JSON.stringify(x)
const only = process.argv[3] ? process.argv[3].split(',') : null
const want = id => !only || only.includes(id)

/* put a man on a row: desktop = a real mouse drag from the crew list to the row's "+ add"; phone = armed tap (name, then "+ add") */
async function dropOn(s, person, fill) {
  const { page } = s
  const pk = page.locator(`#sbRoster .puck[data-person="${person}"]`).first()
  const tgt = page.locator(`#sbBoard [data-fill="${fill}"] .addz`).first()
  if (!(await tgt.count())) return { ok: false, why: 'no "+ add" for ' + fill }
  if (!s.tap) {
    await pk.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await tgt.evaluate(e => e.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(250)
    const fb = await pk.boundingBox(), tb = await tgt.boundingBox()
    if (!fb || !tb) return { ok: false, why: 'no box: puck ' + !!fb + ' addz ' + !!tb }
    await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await page.mouse.down()
    await page.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
    await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
    await page.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
    await page.mouse.up()
    await page.waitForTimeout(500)
    return { ok: true, how: 'mouse drag' }
  }
  /* phone: name-first (the brief's order) does not survive closing the crew drawer; the row-first order works: tap the row's "+ add" spot (the row arms and the drawer opens), then tap the name */
  await tgt.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const tb2 = await tgt.boundingBox()
  await page.touchscreen.tap(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2); await page.waitForTimeout(700)
  const inView = () => pk.evaluate(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight }).catch(() => false)
  const tried = ['tapped the row first']
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await page.waitForTimeout(400)
  if (!(await inView())) { const tab = page.locator('.ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await page.waitForTimeout(700); tried.push('opened the drawer by its tab') } }
  await pk.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(400)
  if (!(await inView())) return { ok: false, why: 'crew puck not in view; ' + jf(tried) }
  await pk.tap(); await page.waitForTimeout(700)
  return { ok: true, how: 'armed tap (row first, then the name in the crew drawer)', tried }
}
const wedRows = page => page.evaluate(d => (window.DAYS[d].ground || []).map((r, i) => `${i}:${String(r.prog).toLowerCase()}:${r.who}${(r.more || []).map(m => '+' + m).join('')}${r.src ? '@' + r.src : ''}`), L.WED_DI)
const dots = (page, root) => page.evaluate(root => [...document.querySelectorAll(`${root} [data-histdot]`)].map(e => e.tagName + '.' + String(e.className).split(' ').slice(0, 3).join('.') + ' person=' + (e.getAttribute('data-person') || (e.querySelector('[data-person]') || {}).getAttribute?.('data-person') || '') + ' slot=' + ((e.closest('[data-slot]') || {}).getAttribute?.('data-slot') || '')), root)
async function toggleHist(s, on) {
  const { page } = s
  const now = await page.evaluate(() => { const e = document.querySelector('#sbHist'); return e ? (e.getAttribute('aria-pressed') || e.className) : null })
  return now
}

try {
  const s = await L.session(b, size), { page } = s
  const iid = await L.fileIt(s, L.WED, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
  await L.openBoard(s, L.WED_DI)
  const ri = await page.evaluate(([d, i]) => window.DAYS[d].ground.findIndex(r => r && String(r.src) === String(i)), [L.WED_DI, iid])
  const fill = `g:${L.WED_DI}.${ri}.+`
  const before = await wedRows(page)
  const d = await dropOn(s, 'nick', fill)
  const after = await wedRows(page)
  const row = after[ri] || ''
  console.log('drop', jf(d), jf(row))
  if (!d.ok || !/nick/.test(row)) {
    for (const id of ['15', '16', '17', '18', '19']) L.record(id, size, 'NOT WALKED', `set-up: could not put Tally on the input's row (${jf(d)}); rows before=${jf(before)} after=${jf(after)}`, await L.shot(s, `15-${size}-setup-failed`))
  } else {
    /* History on */
    await page.locator('#sbHist').first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
    if (!(await page.locator('#sbHist:visible').count())) {
      // phone: behind the ⋯ menu?
      for (const sel of ['#sbMore', '[data-testid="sb-more"]', 'button[aria-label*="ore" i]', 'text=/^⋯$/']) { const c = page.locator(sel).first(); if (await c.count() && await c.isVisible().catch(() => false)) { await c.tap(); await page.waitForTimeout(400); break } }
    }
    const hb = page.locator('#sbHist:visible').first()
    const hist0 = await hb.count() ? await hb.evaluate(e => ({ cls: e.className, pressed: e.getAttribute('aria-pressed'), title: e.title })) : null
    if (!hist0) { for (const id of ['15', '16', '17', '18', '19']) L.record(id, size, 'NOT WALKED', 'History button not found/visible on the board bar', await L.shot(s, `15-${size}-no-history-button`)); }
    else {
      if (s.tap) await hb.tap(); else await hb.click()
      await page.waitForTimeout(600)
      const hist1 = await page.locator('#sbHist').first().evaluate(e => ({ cls: e.className, pressed: e.getAttribute('aria-pressed') }))
      const tallyPuck = page.locator(`#sbBoard [data-fill="${fill}"] .puck[data-person="nick"]`).first()
      const rangerPuck = page.locator(`#sbBoard [data-fill="${fill}"] .puck[data-person="bane"]`).first()
      const dotInfo = async p => p.evaluate(e => { const seat = e.closest('[data-slot]'); const anc = e.closest('[data-histdot]'); return { puckHas: e.hasAttribute('data-histdot'), seatHas: !!(seat && seat.hasAttribute('data-histdot')), seat: seat ? seat.getAttribute('data-slot') : null, nearestDotted: anc ? anc.tagName + '[data-slot=' + anc.getAttribute('data-slot') + ']' : null, self: e.hasAttribute('data-histdot') || !!(seat && seat.hasAttribute('data-histdot')), html: (e.closest('[data-fill]') || e).outerHTML.replace(/\s+/g, ' ').slice(0, 700) } })
      const tInfo = await dotInfo(tallyPuck), rInfo = await dotInfo(rangerPuck)
      const nAll = await page.locator('#sbBoard [data-histdot]').count()
      await tallyPuck.evaluate(e => e.scrollIntoView({ block: 'center' }))
      const pic15 = await L.shot(s, `15-${size}-history-on`)
      L.record('15', size, tInfo.self && !rInfo.self ? 'PASS' : 'FAIL', `drop used: ${d.how}; History button before=${jf(hist0)} after=${jf(hist1)}; Tally's puck carries data-histdot itself=${tInfo.puckHas}, its own seat wrapper carries it=${tInfo.seatHas} (seat ${tInfo.seat}); Ranger's puck itself=${rInfo.puckHas}, his seat wrapper=${rInfo.seatHas} (seat ${rInfo.seat}); row markup: ${tInfo.html}; all dotted elements on the board=${nAll}`, pic15)
      /* 16 */
      if (!s.tap) { await tallyPuck.hover() } else { await tallyPuck.tap() }
      await page.waitForTimeout(500)
      const bub = await page.evaluate(() => { const e = [...document.querySelectorAll('.histbub, [class*="histbub"], [class*="hbub"]')].filter(x => x.getBoundingClientRect().width > 0); return e.map(x => ({ cls: x.className, text: x.innerText.replace(/\s+/g, ' ').trim() })) })
      const pic16 = await L.shot(s, `16-${size}-bubble`)
      const bt = bub.map(x => x.text).join(' | ')
      L.record('16', size, bub.length && /tally/i.test(bt) && /added/i.test(bt) ? 'PASS' : 'FAIL', `${s.tap ? 'tapped' : 'hovered'} Tally's puck: bubbles seen=${jf(bub)}`, pic16)
      /* 17: the week (desktop) — phone has the board only, but the week is reachable too: record both */
      if (!s.tap) await page.mouse.move(5, 5); else { await page.keyboard.press('Escape').catch(() => {}) }
      const done = page.locator('#sbDone, button:has-text("Done")').first()
      if (await done.count() && await done.isVisible().catch(() => false)) { if (s.tap) await done.tap(); else await done.click(); await page.waitForTimeout(600) }
      await L.go(page, 'editsched')
      const histWk = await page.evaluate(() => { const e = [...document.querySelectorAll('button')].find(x => /history/i.test(x.title || '') || x.id === 'sbHist' || x.id === 'histBtn' || x.id === 'eHist'); return e ? { id: e.id, cls: e.className, pressed: e.getAttribute('aria-pressed'), vis: e.getBoundingClientRect().width > 0 } : null })
      const wkSel = `#eWeek [data-fill="${fill}"] .puck[data-person="nick"]`
      const wkN = await page.locator(wkSel).count()
      let wkInfo = null
      if (wkN) { await page.locator(wkSel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); wkInfo = await dotInfo(page.locator(wkSel).first()) }
      const pic17 = await L.shot(s, `17-${size}-week`)
      L.record('17', size, wkN ? (wkInfo.self ? 'PASS' : 'FAIL') : 'NOT WALKED', `edit schedule week: History control=${jf(histWk)}; Tally's puck on that row found=${wkN}; puck itself=${wkInfo && wkInfo.puckHas}, seat wrapper=${wkInfo && wkInfo.seatHas} (seat ${wkInfo && wkInfo.seat}); all dotted in week=${await page.locator('#eWeek [data-histdot]').count()}`, pic17)
      /* back to the board for 18-19 */
      await L.openBoard(s, L.WED_DI)
      const hb2 = await page.evaluate(() => { const e = document.querySelector('#sbHist'); return e ? { cls: e.className, pressed: e.getAttribute('aria-pressed') } : null })
      const stillOnBoard = await page.locator(`#sbBoard [data-fill="${fill}"] [data-histdot] .puck[data-person="nick"]`).count()
      /* 18: take Tally off (right-click) */
      const tp = page.locator(`#sbBoard [data-fill="${fill}"] .puck[data-person="nick"]`).first()
      let off = null, offHow = s.tap ? 'tap' : 'right-click'
      if (await tp.count()) {
        await tp.evaluate(e => e.scrollIntoView({ block: 'center' }))
        if (!s.tap) await tp.click({ button: 'right' })
        else { await tp.tap(); await page.waitForTimeout(300) }
        await page.waitForTimeout(600)
        off = await wedRows(page)
        if (s.tap && /nick/.test(off[ri] || '')) {
          /* a tap does not take him off: try one drag off the row, made with the mouse inside the phone-sized page (a touch drag cannot be made by this driver) */
          offHow = 'tap (nothing happened), then a mouse drag off the row in the phone-sized page'
          const hd = page.locator('#sbBoard .sb-sec').first()
          const pb = await tp.boundingBox()
          await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.mouse.down()
          await page.mouse.move(pb.x + pb.width / 2 + 6, pb.y + pb.height / 2 - 6, { steps: 3 })
          await page.mouse.move(pb.x + pb.width / 2, 200, { steps: 12 })
          await page.mouse.move(pb.x + pb.width / 2 + 1, 201)
          await page.mouse.up(); await page.waitForTimeout(600)
          off = await wedRows(page)
        }
      }
      const dottedNow = await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-histdot]')].map(e => (e.getAttribute('data-person') || e.innerText.slice(0, 12))))
      /* the changes window */
      const dchg = page.locator('#sbBoard .dchg:visible, .dchg:visible').first()
      let chg = 'no changes count button found'
      if (await dchg.count()) { await dchg.evaluate(e => e.click()); await page.waitForTimeout(700)
        chg = await page.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('Changes ·'); if (i < 0) return 'no "Changes ·" heading in the page text'; const j = t.indexOf('Tap a change', i); return t.slice(i, j > i ? j : i + 700).replace(/\s+/g, ' ') }) }
      const pic18 = await L.shot(s, `18-${size}-tally-taken-off`)
      await page.evaluate(() => { const h = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^Changes\s*·/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 0); if (h) { const x = h.closest('div').parentElement.querySelector('button'); let n = h; for (let i = 0; i < 4 && n; i++, n = n.parentElement) { const b = n.querySelector('button[aria-label*="lose" i], button[title*="lose" i], .win-x'); if (b) { b.click(); break } } } }).catch(() => {})
      await page.waitForTimeout(300)
      L.record('18', size, 'RECORD', `after the History control was ${jf(hb2)} on the board again (Tally still dotted before removal: ${stillOnBoard}); removal by ${offHow}: rows now ${jf(off)}; dotted elements on the board now=${jf(dottedNow)}; changes-window text seen=${jf(chg)}`, pic18)
      /* 19: history off */
      const hb3 = page.locator('#sbHist:visible').first()
      let offState = null
      if (await hb3.count()) { if (s.tap) await hb3.tap(); else await hb3.click(); await page.waitForTimeout(600); offState = await page.evaluate(() => { const e = document.querySelector('#sbHist'); return { cls: e.className, pressed: e.getAttribute('aria-pressed') } }) }
      const nAny = await page.locator('[data-histdot]').count()
      const pic19 = await L.shot(s, `19-${size}-history-off`)
      L.record('19', size, hb3 && offState ? (nAny === 0 ? 'PASS' : 'FAIL') : 'NOT WALKED', `History button after the press=${jf(offState)}; elements carrying data-histdot anywhere=${nAny}`, pic19)
    }
  }
  if (s.errs.length) L.record('errs-g2', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
} catch (e) { L.record('g2', size, 'NOT WALKED', 'script error: ' + e.message.split('\n')[0]); console.log(e.stack) }

/* ---- 20: a plain programme row, same drop, History on ---- */
if (want('20')) try {
  const s = await L.session(b, size), { page } = s
  await L.openBoard(s, L.WED_DI)
  const n0 = await page.evaluate(d => window.DAYS[d].ground.length, L.WED_DI)
  const addItem = page.locator('#sbBoard button:has-text("Item"):visible').first()
  if (!(await addItem.count())) { L.record('20', size, 'NOT WALKED', 'no "+ Item" button visible on the board') }
  else {
    await addItem.evaluate(e => e.scrollIntoView({ block: 'center' }))
    if (s.tap) await addItem.tap(); else await addItem.click()
    await page.waitForTimeout(500)
    const n1 = await page.evaluate(d => window.DAYS[d].ground.length, L.WED_DI)
    const pi = n1 - 1
    await page.evaluate(([d, i]) => { const r = window.DAYS[d].ground[i]; r.prog = 'Hangar open day'; r.str = '13:00'; r.end = '15:00'; window.afterSchedMutate() }, [L.WED_DI, pi])
    await page.waitForTimeout(400)
    const rows = await wedRows(page)
    const pidx = rows.findIndex(r => /hangar open day/.test(r))
    const fill = `g:${L.WED_DI}.${pidx}.+`
    const d = await dropOn(s, 'nick', fill)
    const rows2 = await wedRows(page)
    if (!d.ok || !/nick/.test(rows2[pidx] || '')) { L.record('20', size, 'NOT WALKED', `set-up: plain row ${pidx} (rows ${jf(rows)}), drop ${jf(d)}, rows after ${jf(rows2)}`, await L.shot(s, `20-${size}-setup-failed`)) }
    else {
      const hb = page.locator('#sbHist:visible').first()
      if (await hb.count()) { if (s.tap) await hb.tap(); else await hb.click(); await page.waitForTimeout(600) }
      const pk = page.locator(`#sbBoard [data-fill="${fill}"] .puck[data-person="nick"]`).first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' }))
      const dotted = await pk.evaluate(e => e.hasAttribute('data-histdot') || !!(e.closest('[data-slot]') && e.closest('[data-slot]').hasAttribute('data-histdot')))
      const dInfo = await pk.evaluate(e => ({ puck: e.hasAttribute('data-histdot'), seat: !!(e.closest('[data-slot]') && e.closest('[data-slot]').hasAttribute('data-histdot')), slot: (e.closest('[data-slot]') || {}).getAttribute?.('data-slot') }))
      const pic = await L.shot(s, `20-${size}-plain-row-dot`)
      L.record('20', size, dotted ? 'PASS' : 'FAIL', `plain row "${rows2[pidx]}" made with "+ Item" (its title/times set through the developer bridge — set-up) and Tally put on it by ${d.how}; History button found=${await hb.count()}; his puck itself/seat wrapper carry data-histdot: ${jf(dInfo)}`, pic)
    }
  }
  if (s.errs.length) L.record('errs-20', size, 'RECORD', jf(s.errs))
  await s.ctx.close()
} catch (e) { L.record('20', size, 'NOT WALKED', 'script error: ' + e.message.split('\n')[0]); console.log(e.stack) }
await b.close()
