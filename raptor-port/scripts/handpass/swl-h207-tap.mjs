// swl-h207-tap — the host's check of walker C's Finding 1 (chat 207): on the phone, SC MAIN's back seat armed, a tap on
// Marlin planted Kraken. Here the tap lands at a chosen point of Marlin's puck — TAPX=name (his name's middle) or
// TAPX=wide (the middle of the whole puck box, as walker C tapped) — and the boxes are read again just after.
//   SWLC_RUN=h207-<name|wide> TAPX=name|wide W2_URL=http://localhost:<port>/ SZ=p node scripts/handpass/swl-h207-tap.mjs
import './swl-w1C-env.mjs'
const C = await import('./swl-w1C-lib.mjs')
const { L, sleep, J, run, armAt, addLine, holdsAt } = C
const SZ = process.env.SZ || 'p'
const TAPX = process.env.TAPX || 'wide'
const boxes = p => p.evaluate(() => Object.fromEntries(['cards', 'krait'].map(id => {
  const e = [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].find(x => x.getBoundingClientRect().width > 0)
  const n = e && e.querySelector('.nm'); const r = e && e.getBoundingClientRect(); const rn = n && n.getBoundingClientRect()
  return [id, r ? { puck: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], name: rn ? [Math.round(rn.left), Math.round(rn.top), Math.round(rn.width), Math.round(rn.height)] : null } : null]
})))
const atPoint = (p, x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const k = e && e.closest('[data-person]'); return { tag: e && e.tagName, cls: e && String(e.className).slice(0, 40), person: k ? k.dataset.person : null } }, [x, y])
console.log(`VERSION swl-h207-tap 1 · ${SZ} · ${TAPX} · bundle ${process.env.W2_URL}`)
await run('H207', SZ, async (p, W) => {
  const sc = await addLine(p, W, 4, { kind: 'SC' })
  const key = `4.${sc.wi}.0.0.w`
  const a = await armAt(p, W, 4, `[data-slot="${key}"]`, 'h-' + TAPX)
  const pk = p.locator('#schedBoard .rpuck[data-person="cards"]:visible').first()
  await pk.scrollIntoViewIfNeeded(); await sleep(800)
  const b0 = await boxes(p)
  const src = TAPX === 'name' ? b0.cards.name : b0.cards.puck
  /* TAPX=<number>: that x, at Marlin's row's middle (the blank between his puck and the letters, on the fixed build) */
  const pt = /^\d+$/.test(TAPX) ? { x: Number(TAPX), y: src[1] + src[3] / 2 } : { x: src[0] + src[2] / 2, y: src[1] + src[3] / 2 }
  const hit = await atPoint(p, pt.x, pt.y)
  await W.pic(p, 'h-' + TAPX + '-before')
  if (W.isPhone) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y)
  await sleep(700)
  const b1 = await boxes(p)
  W.rec('h-' + TAPX, `armed ${a.armed}; one tap at Marlin's ${TAPX} middle — who is planted`, 'REC', `before ${J(b0)} · at the point ${J(hit)} · tap ${J(pt)} · seat now "${await holdsAt(p, key)}" · note "${await L.toastSaid(p)}" · after ${J(b1)}`, await W.pic(p, 'h-' + TAPX + '-after'))
}, '2026-07-15T09:00:00')
console.log('DONE')
process.exit(0)
