/* Chat 29 walk, parts A-D (8 Nov 26). Run: node scripts/handpass/chat29-walk.mjs   (ONLY=A,B,C,D to filter; KEEP=1 keeps old pictures) */
import { freshFolder, open, go, press, shot, shotOf, step, sleep, rect, results, errors } from './chat29-lib.mjs'
console.log('chat29-walk v1 A-D')
freshFolder()
const px = s => parseFloat(s)
const pad = (page, sel) => page.locator(sel).first().evaluate(e => getComputedStyle(e).paddingRight)
const winBox = page => page.locator('[data-testid="win-inputedit"]').first().boundingBox().catch(() => null)
async function openMed(h) { await go(h.page, 'inputs'); await press(h, '#inMedBtn'); await h.page.waitForSelector('#medView .medsec', { state: 'attached' }); await sleep(400) }
async function drag(page) {
  const t = await page.locator('[data-testid="win-inputedit"] .win-ttl').first().boundingBox()
  const x = t.x + 24, y = t.y + t.height / 2
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 800, y + 150, { steps: 10 }); await page.mouse.up(); await sleep(500)
}
async function cardsPast(page) {
  return page.evaluate(() => {
    const w = document.querySelector('[data-testid="win-inputedit"]'); if (!w) return 'nowin'
    const wl = w.getBoundingClientRect().left
    let worst = -1e9; for (const e of document.querySelectorAll('.medcard,.medsec')) { const r = e.getBoundingClientRect(); if (r.width) worst = Math.max(worst, r.right - (wl - 4)) }
    return worst
  })
}

/* ---------- A ---------- */
for (const [W, H] of [[1536, 864], [1229, 600]]) {
  const h = await open({ width: W, height: H })
  const p = h.page, T = `${W}`
  await step(`A1-${T}`, 'Medical tab, no window: padding-right 16', async () => {
    await openMed(h); const v = await pad(p, '.med-body'); return { ok: v === '16px', note: `padding-right ${v} (expected 16px)`, pics: [await shot(p, `med-${T}-A1-tab-at-rest`)] }
  })
  await step(`A2-${T}`, '+ Medical: room = min(430,w-24)+16', async () => {
    await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(600)
    const v = await pad(p, '.med-body'), exp = Math.min(430, W - 24) + 16, past = await cardsPast(p), wb = await winBox(p)
    return { ok: px(v) === exp && past <= 0, note: `padding-right ${v} (expected ${exp}px); worst card right minus (window left-4) = ${past}; window x=${wb && wb.x} w=${wb && wb.width}`, pics: [await shot(p, `med-${T}-A2-window-at-right`)] }
  })
  await step(`A3-${T}`, 'drag window away: padding back to 16', async () => {
    const before = await winBox(p); await drag(p)
    const v = await pad(p, '.med-body'), wb = await winBox(p), body = await rect(p, '.med-body')
    return { ok: v === '16px' && !!wb && Math.abs(wb.x - before.x) > 200, note: `padding-right ${v} (expected 16px); window moved x ${Math.round(before.x)} -> ${wb && Math.round(wb.x)}, y ${Math.round(before.y)} -> ${wb && Math.round(wb.y)}; body width ${Math.round(body.w)}`, pics: [await shot(p, `med-${T}-A3-window-dragged-away`)] }
  })
  await step(`A4-${T}`, 'press a card behind window: opens that input, no room', async () => {
    const before = await p.locator('[data-testid="win-inputedit"]').count()
    const card = p.locator('.medsec .medcard').first(); await card.scrollIntoViewIfNeeded()
    const wb = await winBox(p), cb = await card.boundingBox()
    await card.click(); await sleep(700)
    const v = await pad(p, '.med-body'), wcount = await p.locator('[data-testid="win-inputedit"]').count(), title = await p.locator('[data-testid="win-inputedit"] .win-ttl').first().innerText().catch(() => '')
    const docpop = await p.locator('#docViewPop:not([hidden])').count()
    return { ok: v === '16px' && wcount >= 1, note: `padding-right ${v} (expected 16px); windows ${before}->${wcount}; title "${title.replace(/\n/g, ' ')}"; docViewPop open ${docpop}; card box ${JSON.stringify(cb && { x: Math.round(cb.x), y: Math.round(cb.y) })}; window ${JSON.stringify(wb && { x: Math.round(wb.x), y: Math.round(wb.y), w: Math.round(wb.width) })}`, pics: [await shot(p, `med-${T}-A4-card-pressed-behind`)] }
  })
  await step(`A5a-${T}`, 'close by X, reopen +Medical: where dropped, 16px', async () => {
    const dropped = await winBox(p)
    const x = p.locator('[data-testid="win-inputedit"] .win-x, [data-testid="win-inputedit"] [aria-label="Close"], [data-testid="win-inputedit-x"]').first()
    let used = 'x'; if (await x.count()) await x.click(); else { used = 'Escape'; await p.keyboard.press('Escape') }
    await sleep(500); const closed = await p.locator('[data-testid="win-inputedit"]').count()
    const pic1 = await shot(p, `med-${T}-A5a-closed-by-x`)
    await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(600)
    const re = await winBox(p), v = await pad(p, '.med-body')
    return { ok: closed === 0 && v === '16px' && !!re && Math.abs(re.x - (dropped?.x ?? 0)) < 4, note: `closed via ${used}, windows after close ${closed}; dropped at x=${dropped && Math.round(dropped.x)} y=${dropped && Math.round(dropped.y)}, reopened x=${re && Math.round(re.x)} y=${re && Math.round(re.y)}; padding-right ${v} (expected 16px)`, pics: [pic1, await shot(p, `med-${T}-A5a-reopened-where-dropped`)] }
  })
  await step(`A5b-${T}`, 'close by Escape: cards as they were', async () => {
    await p.keyboard.press('Escape'); await sleep(500)
    const n = await p.locator('[data-testid="win-inputedit"]').count(), v = await pad(p, '.med-body')
    return { ok: n === 0 && v === '16px', note: `windows ${n}; padding-right ${v}`, pics: [await shot(p, `med-${T}-A5b-closed-by-escape`)] }
  })
  await step(`A5c-${T}`, 'open a card, close by Cancel/Escape', async () => {
    await p.locator('.medsec .medcard').first().click(); await sleep(700)
    const win = await p.locator('[data-testid="win-inputedit"]').count(), pic1 = await shot(p, `med-${T}-A5c-card-opened`)
    const cancel = p.locator('[data-testid="win-inputedit"] button', { hasText: /^Cancel$/ }).first()
    let how = 'Cancel'; if (await cancel.count() && await cancel.isVisible()) await cancel.click(); else { how = 'Escape (no Cancel shown)'; await p.keyboard.press('Escape') }
    await sleep(500)
    const n = await p.locator('[data-testid="win-inputedit"]').count(), v = await pad(p, '.med-body'), docpop = await p.locator('#docViewPop:not([hidden])').count()
    return { ok: n === 0 && v === '16px', note: `after press: windows ${win}; closed by ${how}: windows ${n}, docViewPop ${docpop}; padding-right ${v}`, pics: [pic1, await shot(p, `med-${T}-A5c-closed-again`)] }
  })
  await step(`A6-${T}`, 'reload: +Medical opens at right, room 446', async () => {
    await p.reload(); await p.waitForSelector('#luser'); await (await import('./chat29-lib.mjs')).login(p)
    await openMed(h); await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(700)
    const v = await pad(p, '.med-body'), wb = await winBox(p), exp = Math.min(430, W - 24) + 16
    return { ok: px(v) === exp, note: `padding-right ${v} (expected ${exp}px); window x=${wb && Math.round(wb.x)} w=${wb && Math.round(wb.width)}`, pics: [await shot(p, `med-${T}-A6-after-reload`)] }
  })
  await h.browser.close()
}

/* ---------- B ---------- */
{
  const h = await open({ width: 390, height: 844, phone: true }), p = h.page
  await step('B1', 'phone Medical: no room, window in the middle', async () => {
    await openMed(h); const before = await pad(p, '.med-body'), pic0 = await shot(p, 'med-phone-B1-tab-before')
    const firstInRow = await p.evaluate(() => { const n = document.querySelector('#medNew'); const r = n.getBoundingClientRect(); const sib = [...n.parentElement.children].filter(e => e.getBoundingClientRect().width); return { idx: sib.indexOf(n), left: Math.round(r.left), row: Math.round(r.top) } })
    await press(h, '#medNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(500)
    const pic1 = await shot(p, 'med-phone-B1-tap-right-after'); await sleep(700)
    const after = await pad(p, '.med-body'), wb = await winBox(p)
    const mid = wb ? Math.abs((wb.x + wb.width / 2) - 195) : 999
    return { ok: before === after && mid < 12, note: `padding before ${before} after ${after}; + Medical position in its row index ${firstInRow.idx} (0 = first), left ${firstInRow.left}; window x=${wb && Math.round(wb.x)} y=${wb && Math.round(wb.y)} w=${wb && Math.round(wb.width)} h=${wb && Math.round(wb.height)} centre offset ${Math.round(mid)}`, pics: [pic0, pic1, await shot(p, 'med-phone-B1-window-settled')] }
  })
  await h.browser.close()
}

/* ---------- C ---------- */
{
  const heads = p => p.evaluate(() => [...document.querySelectorAll('.inwrap table thead th, .inwrap thead th')].slice(0, 3).map(t => Math.round(t.getBoundingClientRect().width)))
  const winOpen = p => p.locator('[data-testid="win-inputedit"]').count()
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'inputs'); await press(h, '#inListBtn'); await p.waitForSelector('.inwrap'); await sleep(500)
  let rest, restHeads
  await step('C1', 'List at 1536: + Input room 446 and headings 110/140/90', async () => {
    rest = await pad(p, '.inwrap'); restHeads = await heads(p); const pic0 = await shot(p, 'list-1536-C1-at-rest')
    await press(h, '#inNew'); await p.waitForSelector('[data-testid="win-inputedit"]'); await sleep(700)
    const v = await pad(p, '.inwrap'), hd = await heads(p)
    return { ok: px(v) === 446 && hd.join() === '110,140,90', note: `at rest padding ${rest}, headings ${restHeads}; with window padding ${v} (expected 446px), headings ${hd} (expected 110,140,90)`, pics: [pic0, await shot(p, 'list-1536-C1-new-input-window')] }
  })
  await step('C2', 'drag away: padding and widths back', async () => {
    await drag(p); const v = await pad(p, '.inwrap'), hd = await heads(p)
    return { ok: v === rest, note: `padding ${v} (expected ${rest}); headings ${hd} (at rest ${restHeads})`, pics: [await shot(p, 'list-1536-C2-dragged-away')] }
  })
  await step('C3', 'close; reopen a row: no room', async () => {
    await p.keyboard.press('Escape'); await sleep(400)
    const op = p.locator('#inBody tr .in-open').first(); await op.scrollIntoViewIfNeeded(); await op.click(); await sleep(700)
    const v = await pad(p, '.inwrap'), n = await winOpen(p), wb = await winBox(p)
    return { ok: n >= 1 && v === rest, note: `windows ${n}; padding ${v} (expected ${rest}); window x=${wb && Math.round(wb.x)}`, pics: [await shot(p, 'list-1536-C3-row-opened')] }
  })
  await h.browser.close()
  for (const [W, exp] of [[1340, 'room'], [1339, 'none']]) {
    const g = await open({ width: W, height: 800 }), q = g.page
    await go(q, 'inputs'); await press(g, '#inListBtn'); await q.waitForSelector('.inwrap'); await sleep(500)
    await step(`C4-${W}`, `List at ${W}: window at rest -> ${exp}`, async () => {
      const r0 = await pad(q, '.inwrap'); await press(g, '#inNew'); await q.waitForSelector('[data-testid="win-inputedit"]'); await sleep(700)
      const v = await pad(q, '.inwrap'), wb = await winBox(q)
      const made = px(v) > px(r0) + 100
      return { ok: exp === 'room' ? made : !made, note: `at rest ${r0}, with window ${v}; window x=${wb && Math.round(wb.x)} w=${wb && Math.round(wb.width)} (expected ${exp === 'room' ? 'room made' : 'no room'})`, pics: [await shot(q, `list-${W}-C4-window-at-rest`)] }
    })
    await g.browser.close()
  }
}

/* ---------- D ---------- */
for (const phone of [false, true]) {
  const h = await open(phone ? { width: 390, height: 844, phone: true } : { width: 1536, height: 864 }), p = h.page, T = phone ? 'phone' : '1536'
  await go(p, 'inputs'); await sleep(500)
  const sel = '[data-testid="ib-expand"]'
  await step(`D1-${T}`, 'expand button 34x28, arrows centred 16x16', async () => {
    await p.locator(sel).first().scrollIntoViewIfNeeded()
    const m = await p.locator(sel).first().evaluate(b => { const r = b.getBoundingClientRect(), s = b.querySelector('svg'), sr = s && s.getBoundingClientRect(); return { w: r.width, h: r.height, sw: sr && sr.width, sh: sr && sr.height, dx: sr && (sr.left + sr.width / 2) - (r.left + r.width / 2), dy: sr && (sr.top + sr.height / 2) - (r.top + r.height / 2), pressed: b.getAttribute('aria-pressed') } })
    const pic = await shotOf(p, `inputs-cal-${T}-D1-expand-at-rest`, sel, 30)
    const ok = Math.round(m.w) === 34 && Math.round(m.h) === 28 && Math.round(m.sw) === 16 && Math.round(m.sh) === 16 && Math.abs(m.dx) <= 1 && Math.abs(m.dy) <= 1
    return { ok, note: `button ${m.w}x${m.h} (expected 34x28); svg ${m.sw}x${m.sh} (expected 16x16); centre offset dx ${m.dx?.toFixed(2)} dy ${m.dy?.toFixed(2)}; aria-pressed ${m.pressed}`, pics: [pic] }
  })
  await step(`D2-${T}`, 'press: lights, every input shows; press again: back', async () => {
    const cards = () => p.evaluate(() => document.querySelectorAll('#inpCal [data-testid^="ic-"], #inpCal .ic-in, #inpCal .ic-chip').length)
    const n0 = await cards(); await press(h, sel); await sleep(500)
    const on = await p.locator(sel).first().getAttribute('aria-pressed'), n1 = await cards(), bg1 = await p.locator(sel).first().evaluate(e => getComputedStyle(e).backgroundColor)
    const pic1 = await shotOf(p, `inputs-cal-${T}-D2-expand-pressed`, sel, 30), pic1b = await shot(p, `inputs-cal-${T}-D2-calendar-expanded`)
    await press(h, sel); await sleep(500)
    const off = await p.locator(sel).first().getAttribute('aria-pressed'), n2 = await cards(), bg2 = await p.locator(sel).first().evaluate(e => getComputedStyle(e).backgroundColor)
    return { ok: on === 'true' && off !== 'true' && bg1 !== bg2, note: `aria-pressed ${on} then ${off}; background ${bg1} then ${bg2}; items counted ${n0} -> ${n1} -> ${n2}`, pics: [pic1, pic1b, await shotOf(p, `inputs-cal-${T}-D2-expand-back`, sel, 30)] }
  })
  await h.browser.close()
}

console.log('\nERRORS (' + errors.length + ')'); for (const e of errors) console.log('  ' + e)
console.log(JSON.stringify(results.map(r => [r.id, r.ok])))
