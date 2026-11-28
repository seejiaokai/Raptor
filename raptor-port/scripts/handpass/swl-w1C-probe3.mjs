// swl-w1C-probe3 — walker C checks a lead from runs F30-p and F30-p (re-run): on the phone, with SC MAIN's back seat armed,
// a tap on Marlin's crew-list name planted Kraken (the name drawn just above him). Here: the same seat armed straight away
// (no Undo before it), Marlin's and Kraken's drawn boxes read, what lies at Marlin's middle read, then one tap there.
//   SWLC_RUN=probe3 SZ=p node scripts/handpass/swl-w1C-probe3.mjs   (from raptor-port/)
import './swl-w1C-env.mjs'
const C = await import('./swl-w1C-lib.mjs')
const { L, W5, sleep, J, run, armAt, addLine, holdsAt, flight, addSimRow, tapIn, sbUndo } = C
const SZ = process.env.SZ || 'p'
console.log(`VERSION swl-w1C-probe3 1 · ${SZ} · bundle ${process.env.W2_URL} · out ${C.OUT}`)
const boxes = p => p.evaluate(() => Object.fromEntries(['cards', 'krait'].map(id => { const e = [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].find(x => x.getBoundingClientRect().width > 0); const r = e && e.getBoundingClientRect(); return [id, r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null] })))
const atPoint = (p, x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const k = e && e.closest('[data-person]'); return { tag: e && e.tagName, cls: e && String(e.className).slice(0, 40), person: k ? k.dataset.person : null } }, [x, y])
async function trial(p, W, key, tag) {
  const a = await armAt(p, W, 4, `[data-slot="${key}"]`, tag)
  const pk = p.locator('#schedBoard .rpuck[data-person="cards"]:visible').first()
  await pk.scrollIntoViewIfNeeded(); await sleep(800)
  const b0 = await boxes(p)
  const mid = b0.cards ? { x: b0.cards[0] + b0.cards[2] / 2, y: b0.cards[1] + b0.cards[3] / 2 } : null
  const hit = mid ? await atPoint(p, mid.x, mid.y) : null
  await W.pic(p, tag + '-before')
  if (mid) { if (W.isPhone) await p.touchscreen.tap(mid.x, mid.y); else await p.mouse.click(mid.x, mid.y) }
  await sleep(60); await W.pic(p, tag + '-now')
  await sleep(700)
  const b1 = await boxes(p)
  const note = await L.toastSaid(p)
  W.rec(tag, `armed ${a.armed}; one tap at Marlin's drawn middle — who is planted (RECORDED)`, 'REC', `boxes before ${J(b0)} · at the point ${J(hit)} · tap at ${J(mid)} · seat now "${await holdsAt(p, key)}" · note "${note}" · boxes after ${J(b1)}`, await W.pic(p, tag + '-after'))
}
await run('PR3', SZ, async (p, W) => {
  const sc = await addLine(p, W, 4, { kind: 'SC' })
  await trial(p, W, `4.${sc.wi}.0.0.w`, 'pr3-a')
  /* the F30 order: Marlin on an OFT seat first, the board's Undo, then the SC seat */
  const o = await addSimRow(p, W, 4, 'oft', 'PR3 OFT', '15:00', '16:00')
  await sbUndo(p, W).catch(() => {})
  const t = await tapIn(p, W, 4, `s:4.oft.${o.ri}.w`, 'cards', 'pr3-oft')
  W.rec('pr3-oft', 'Marlin tapped into an OFT back seat', 'REC', `notes ${J(t.seen)} · seat ${t.placed}`, t.notePic)
  await sbUndo(p, W)
  await trial(p, W, `4.${sc.wi}.1.0.w`, 'pr3-b')
}, '2026-07-15T09:00:00')
console.log('DONE probe3')
process.exit(0)
