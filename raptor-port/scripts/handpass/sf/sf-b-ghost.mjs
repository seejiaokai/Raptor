/* B — [GHOST-FLAG-SHADOW]: a dragged puck keeps BOTH its dark "lifted" depth shadow AND its own flag ring, whatever ring
   it wears (thin red, amber, grey note, dotted, "you"), on the mouse ghost (desktop) and the finger ghost (phone).
   Usage: node sf-b-ghost.mjs [desktop|phone|all] [outdir-suffix] */
const OUT = 'b-ghost' + (process.argv[3] ? '-' + process.argv[3] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, editWeek, board, check, note, summary, SF_STATE, DESK, PHONE } = L
const which = process.argv[2] || 'all'
/* the kinds of ring a draggable puck can wear on the everything-week, found by class on the surface */
const KINDS = [
  ['red', '.puck.boxred:not(.me)'], ['amber', '.puck.warn:not(.hard):not(.note):not(.boxred):not(.me)'],
  ['grey', '.puck.warn.note:not(.me)'], ['dotted', '.puck.boxdot:not(.me)'], ['you', '.puck.me'],
  ['plain', '.puck:not(.warn):not(.boxred):not(.boxdash):not(.boxdot):not(.me)'],
]
const read = (page, sel) => page.evaluate(s => {
  const e = document.querySelector(s); if (!e) return null
  const c = getComputedStyle(e), r = e.getBoundingClientRect()
  return { cls: e.className, bs: c.boxShadow, filter: c.filter, overflow: c.overflow, outline: `${c.outlineStyle} ${c.outlineColor}`, before: getComputedStyle(e, '::before').boxShadow, x: r.x, y: r.y, w: r.width, h: r.height }
}, sel)

for (const k of (which === 'all' ? ['desktop', 'phone'] : [which])) {
  const { browser, ctx, page, errors } = await open({ ...(k === 'phone' ? PHONE : DESK), state: SF_STATE })
  await editWeek(page)
  if (k === 'phone') await board(page, 0)
  const scope = k === 'phone' ? '#schedBoard' : '#eWeek'
  for (const [name, sel] of KINDS) {
    /* the first such puck sitting in a real seat (it can be dragged), on the visible surface */
    const id = await page.evaluate(({ scope, sel }) => {
      const p = [...document.querySelectorAll(`${scope} ${sel}`)].find(x => x.offsetWidth && x.closest('[data-slot]'))
      if (!p) return null
      p.setAttribute('data-sfpick', '1'); p.scrollIntoView({ block: 'center', inline: 'center' }); return p.closest('[data-slot]').dataset.slot
    }, { scope, sel })
    if (!id) { note(`${k}.B ${name}`, 'no such puck in a seat on this surface'); continue }
    await page.waitForTimeout(250)
    const rest = await read(page, '[data-sfpick="1"]')
    const b = { x: rest.x, y: rest.y, width: rest.w, height: rest.h }
    const x = b.x + b.width / 2, y = b.y + b.height / 2
    let g
    if (k === 'phone') {
      const cdp = await ctx.newCDPSession(page)
      const T = (type, px, py) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py, radiusX: 4, radiusY: 4, force: 1, id: 1 }] })
      await T('touchStart', x, y); await page.waitForTimeout(320)
      for (let i = 1; i <= 8; i++) { await T('touchMove', x + i * 4, y + i * 7); await page.waitForTimeout(30) }
      await page.waitForTimeout(250)
      g = await read(page, '.tdghost')
      if (g) await page.screenshot({ path: `${process.env.HP_SHOTS}/${k}-B-${name}-ghost.png`, clip: { x: Math.max(0, g.x - 30), y: Math.max(0, g.y - 30), width: Math.min(390 - Math.max(0, g.x - 30), g.w + 60), height: g.h + 70 } })
      for (let i = 7; i >= 0; i--) { await T('touchMove', x + i * 4, y + i * 7); await page.waitForTimeout(30) }
      await T('touchEnd'); await page.waitForTimeout(600)
    } else {
      await page.mouse.move(x, y); await page.mouse.down()
      await page.mouse.move(x + 40, y + 60, { steps: 8 }); await page.waitForTimeout(300)
      g = await read(page, '.dragimg')
      if (g) await page.screenshot({ path: `${process.env.HP_SHOTS}/${k}-B-${name}-ghost.png`, clip: { x: Math.max(0, g.x - 40), y: Math.max(0, g.y - 30), width: g.w + 80, height: g.h + 70 } })
      await page.mouse.move(x, y, { steps: 6 }); await page.waitForTimeout(150); await page.mouse.up(); await page.waitForTimeout(500)
    }
    await page.evaluate(() => document.querySelectorAll('[data-sfpick]').forEach(e => e.removeAttribute('data-sfpick')))
    note(`${k}.B ${name} (${id}) at rest`, JSON.stringify({ bs: rest.bs, outline: rest.outline }))
    note(`${k}.B ${name} ghost`, JSON.stringify(g && { cls: g.cls, bs: g.bs, filter: g.filter, outline: g.outline, before: g.before }))
    /* the depth may ride the ghost itself (the old place, where a ring could eat it) or its veil; either way it must be
       there, and a veil's outer shadow shows only when the ghost does not clip its overflow */
    const dark = v => /rgba\(0, 0, 0, 0\.6\)/.test(v || '')
    const depth = !!g && (dark(g.bs) || (dark(g.before) && g.overflow === 'visible'))
    check(`${k}.B ${name}: the ghost keeps the dark "lifted" depth shadow`, depth, g && `ghost ${g.bs} | veil ${g.before} | overflow ${g.overflow}`)
    /* its own ring: the box-shadow ring it wears at rest (a dotted ring is an OUTLINE), and the same outline */
    const ring = rest.bs === 'none' ? true : g && g.bs.includes(rest.bs.split(' inset')[0])
    check(`${k}.B ${name}: the ghost wears the puck's own ring (box-shadow and outline as at rest)`, !!g && !!ring && g.outline === rest.outline, g && `rest ${rest.bs} / ${rest.outline} · ghost ${g.bs} / ${g.outline}`)
    check(`${k}.B ${name}: the cyan lift box on the veil`, !!g && /59, 198, 232/.test(g.before), g && g.before)
  }
  check(`${k}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('sf-b-ghost') ? 1 : 0
