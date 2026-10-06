/* WALKER C, script 5: S35's cross-day drag on the edit week — his sole Monday late seat carried onto Tuesday's other MAIN seat
   (then, with ANOTHER late Monday seat that stays). Usage: node scripts/handpass/bta-C-5.mjs [1|2] */
import * as X from './bta-C-lib.mjs'
const { B, K, W, R, ID, CSN, MON, TUE, pic, sleep } = X
const second = process.argv[2] === '2'
const T = second ? 'S35.5' : 'S35.4'
const { browser, p, errors } = await K.fresh()
try {
  const mon = await X.mondayLate(p)
  let extra = ''
  if (second) { const m2 = await K.addFlyWave(p, MON); await K.ff(p, MON, m2.gi, 0, 'cs', 'ZN'); await K.ff(p, MON, m2.gi, 0, 'msn', 'BFM'); await K.ff(p, MON, m2.gi, 0, 'to', '23:00'); await K.ff(p, MON, m2.gi, 0, 'ld', '23:45'); const s2 = await K.seat(p, MON, m2.gi, 0, 0, X.SEAT, ID); extra = ` and ANOTHER late seat on Monday (ZN 23:00–23:45, took ${s2.took})` }
  const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '05:00' })
  await B.toEdit(p)
  const kSrc = X.key(MON, mon.gi, 0, 0), kDst = X.key(TUE, sc.gi, 0, 1)
  const dst = p.locator(`#eWeek [data-slot="${kDst}"]:visible, #eWeek [data-fill="${kDst}"]:visible`).first()
  const src = p.locator(`#eWeek [data-slot="${kSrc}"]:visible .puck[data-person="${ID}"]`).first()
  /* bring the SOURCE to the middle of the window; then see where the target is */
  await W.showDay(p, MON)
  let a0 = await src.boundingBox(), b0 = await dst.boundingBox()
  await p.evaluate(d => window.scrollBy(0, d), Math.round((a0.y + b0.y) / 2 - 450)); await sleep(400)
  const a = await src.boundingBox(); let b = await dst.boundingBox()
  const vp = p.viewportSize()
  const shot0 = await pic(p, `s35d-${second ? 2 : 1}-before`)
  const onScreen = r => r && r.x >= 0 && r.y >= 0 && r.x + r.width <= vp.width && r.y + r.height <= vp.height
  if (!onScreen(a) || !onScreen(b)) {
    R(T, `edit week: Monday late seat and Tuesday's other MAIN seat both wanted on screen${extra}`, `source box ${JSON.stringify(a)}, target box ${JSON.stringify(b)} (window ${vp.width}x${vp.height}) — not both on screen at once without scrolling the week`, 'NOT WALKED', [shot0])
  } else {
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await p.mouse.down()
    await p.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 4 })
    await p.mouse.move(b.x + Math.min(b.width / 2, 30), b.y + b.height / 2, { steps: 20 })
    await sleep(600)
    const bubble = await p.evaluate(() => { const g = document.querySelector('.dragimg, .tdghost'); const w = g && g.querySelector('.dwhy'); return { ghost: !!g, why: w ? w.textContent.trim() : null } })
    const shot1 = await pic(p, `s35d-${second ? 2 : 1}-held`)
    await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2, { steps: 12 }); await sleep(200)
    await p.mouse.up(); await sleep(600)
    const still = await X.holds(p, kSrc)
    R(T, `edit week: his Monday late flight seat (ZM 21:00–22:30) dragged onto Tuesday's other MAIN seat (Cobra in MAIN row 0; B 05:00, shift 14:00–19:00)${extra}; held over it, then carried back and released on his own seat (Monday seat now "${still}")`,
      `the bubble under the dragged name: ${JSON.stringify(bubble)}`, 'RECORDED', [shot0, shot1])
    if (bubble.ghost) {
      /* and for real */
      await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await sleep(300)
      const a2 = await src.boundingBox(); const b2 = await dst.boundingBox()
      if (onScreen(a2) && onScreen(b2)) {
        await p.mouse.move(a2.x + a2.width / 2, a2.y + a2.height / 2); await p.mouse.down()
        await p.mouse.move(a2.x + a2.width / 2 + 10, a2.y + a2.height / 2 + 10, { steps: 4 })
        await p.mouse.move(b2.x + Math.min(b2.width / 2, 30), b2.y + b2.height / 2, { steps: 20 }); await sleep(400)
        await p.mouse.up(); await sleep(800)
        const toast = await X.toastNow(p)
        const monHold = await X.holds(p, kSrc), tueHold = await X.holds(p, kDst)
        const ws = await X.restWarns(p, TUE), wm = await X.restWarns(p, MON)
        R(T + 'b', `…and dropped for real`, `toast ${toast ? '"' + toast.slice(0, 200) + '"' : 'nothing'} · Monday seat now "${monHold}", Tuesday MAIN seat now "${tueHold}" · Tuesday crew-rest warnings naming him: ${X.shortWarns(ws)} · Monday: ${X.shortWarns(wm)}`, 'RECORDED', [await pic(p, `s35d-${second ? 2 : 1}-dropped`)])
      }
    }
  }
} catch (e) { R(T, 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's35d-X')]) }
R('S35d.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('bta-C-5-' + (second ? 2 : 1))
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
