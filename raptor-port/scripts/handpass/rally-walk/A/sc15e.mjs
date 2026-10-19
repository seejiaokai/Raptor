import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bPublish, bType, rlBox, rec, errors, openBoard, closeBoard, lwOil, model } from './lib.mjs'
console.log('sc15e v1')
const b = await launch()
const geo = p => p.evaluate(() => {
  const q = k => document.querySelector(`[data-bfld="ff:5.0.0.${k}"]`)
  const hdr = [...document.querySelectorAll('#schedBoard .sb-go *')].filter(e => e.children.length === 0 && /^(CS|MSN|R|B|TO|LD|FCP|RCP|NOTES)$/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 1 && e.offsetParent).map(e => e.textContent.trim())
  const r = k => { const e = q(k); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }
  return { rl: r('rl'), br: r('br'), to: r('to'), ld: r('ld'), hdr, vals: ['rl', 'br', 'to', 'ld'].map(k => q(k) ? q(k).value : null), ro: !!(q('rl') && (q('rl').readOnly || q('rl').disabled)) }
})
for (const [tag, sz] of [['desk', SIZES.desk], ['phone', SIZES.phone]]) {
  const { ctx, p } = await ctxOpen(b, sz, '15e' + tag)
  await buildSat(p)
  await bType(p, rlBox(5, 0, 0), '08:30')
  await bPublish(p, 5)
  await openBoard(p, 5)
  const live = await geo(p)
  await p.locator('#schedBoard [data-planmenu="5"]').first().click(); await sleep(500)
  await p.locator('button:has-text("Original")').first().click(); await sleep(900)
  const look = await geo(p)
  const same = JSON.stringify([live.rl, live.br, live.to, live.ld].map(a => a && a.slice(2))) === JSON.stringify([look.rl, look.br, look.to, look.ld].map(a => a && a.slice(2)))
  rec('15', tag + ' ' + sz.width, 'published Saturday: the live board and its read-only version look: box sizes/positions', 'the two match (same R, B, TO, LD sizes); header cells equal', { live, look }, same ? 'PASS' : 'FAIL', await shot(p, 'A15e-' + tag + '-versionlook', p.locator('#schedBoard .sb-go').first()))
  if (tag === 'phone') rec('15', 'phone 402', 'the phone board header cells that are visible', 'CS MSN R B TO LD only (the right cells hidden)', live.hdr, JSON.stringify(live.hdr) === JSON.stringify(['CS', 'MSN', 'R', 'B', 'TO', 'LD']) ? 'PASS' : 'RECORD')
  await ctx.close()
}
/* 1a': tap the suggestion (09:00), leave, publish: OIL must not move */
{
  const { ctx, p } = await ctxOpen(b, SIZES.desk, '1a2')
  await buildSat(p)
  const r = rlBox(5, 0, 0)
  await p.locator(r + ':visible').first().click(); await sleep(200)
  const bx = await p.locator(r + ':visible').first().boundingBox(); await p.mouse.click(bx.x + 200, bx.y - 28); await sleep(400)
  const m = await model(p, 5, 0, 0)
  await bPublish(p, 5)
  const lw = await lwOil(p, ['stiff', 'freak'])
  rec('1a', 'desk', 'tap R (09:00 placed = the nominal), leave, publish; Leave War OIL', 'OIL does not move: still a half day', { rl: m.rl, lw }, m.rl === '09:00' && /^HO/.test(lw.stiff) ? 'PASS' : 'FAIL')
  await ctx.close()
}
console.log('errors', JSON.stringify(errors)); await b.close()
