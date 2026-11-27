// sa208-wA-repro1 — walker A's check of the F34 lead (chat 208): a SANS filing of typed hours 00:00–12:00 — made new, and
// made by changing an AM filing to Custom 00:00–12:00 — what the crew list's reason says, and what the saved filing and its
// reopened form hold. Every step through the app's own controls; window.* only READ.
// Run from raptor-port/: SZ=d|p SA208A_RUN=repro1 node scripts/handpass/sa208-wA-repro1.mjs
import './sa208-wA-env.mjs'
const H = await import('./sa208-wA-lib.mjs')
const { B, Y, L, W5, T, J, sleep, ID, ISO, HALF, chk, rec, file, mkSim, reason, rsay, saveRaw } = H
const SZ = process.env.SZ || 'd'
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
console.log('VERSION sa208-wA-repro1 1 ·', SZ)
const raw = (p, iid) => p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); return r ? { sans: r.sans, allday: r.allday, half: r.half, s: r.s, e: r.e } : null }, iid)
const spanNow = async (p, W, iid, tag) => {
  await T.closeAll(p, W); await W5.sansDay(p, W, ISO[4])
  await W.press(p, `[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`, 'sd-open'); await p.waitForSelector('#inpEditPop'); await sleep(400)
  const r = await p.evaluate(() => ({ pressed: [...document.querySelectorAll('#inpEditSpan [data-span]')].filter(e => e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.span), start: (document.querySelector('#inpEditStart') || {}).value, end: (document.querySelector('#inpEditEnd') || {}).value }))
  const pic = await W.pic(p, tag + '-reopened')
  /* the edit window closed by its own Cancel (nothing changed), then the day's window */
  if (await p.locator('#inpEditCancel:visible').count()) { await W.press(p, '#inpEditCancel:visible', 'cancel'); await sleep(400) }
  const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard')
  await T.closeAll(p, W)
  return { ...r, pic }
}
await Y.run('R1', SZ, async (p, W) => {
  const di = 4
  const zNew = await file(p, W, ISO[di], ID.Zenith, ['oft'], ['00:00', '12:00'], 'znew')
  const kAm = await file(p, W, ISO[di], ID.Kraken, ['oft'], 'AM', 'kam')
  const ep = await mkSim(p, W, di, 'oft', 'EP-8', '16:00', '17:00')
  const X = `[data-fill="s:${di}.oft.${ep}.+"]`
  let r = await reason(p, W, di, X, ID.Zenith, 'r1-new')
  const k0 = B.rowOf(r.s, ID.Kraken)
  chk(W, 'R1.new', 'a NEW filing typed 00:00–12:00 (Custom) — Zenith\'s reason "SANS — available 00:00–12:00 only" (D2759: typed hours stay hours)', r.r && r.r.why === HALF('00:00–12:00'), `${rsay(r.r)} · saved ${J(await raw(p, zNew))} · reopened ${J(await spanNow(p, W, zNew, 'r1-znew'))}`, r.pic)
  chk(W, 'R1.am', 'an AM filing — Kraken\'s reason "SANS — available AM only"', k0 && k0.why === HALF('AM'), `${B.rowSay(k0)} · saved ${J(await raw(p, kAm))}`)
  const e = await B.editS(p, W, ISO[di], kAm, { span: ['00:00', '12:00'] })
  const sp = await spanNow(p, W, kAm, 'r1-kedit')
  r = await reason(p, W, di, X, ID.Kraken, 'r1-edit')
  chk(W, 'R1.edit', 'the AM filing changed to Custom 00:00–12:00 — Kraken\'s reason "SANS — available 00:00–12:00 only"', r.r && r.r.why === HALF('00:00–12:00'), `${rsay(r.r)} · saved ${J(await raw(p, kAm))} · the form reopened: ${J(sp)}`, [r.pic, sp.pic].join(', '))
  const e2 = await B.editS(p, W, ISO[di], kAm, { span: ['00:00', '11:30'] })
  r = await reason(p, W, di, X, ID.Kraken, 'r1-edit2')
  rec(W, 'R1.edit2', 'then Custom 00:00–11:30 — his reason (control: a span that is not a half day)', `${rsay(r.r)} · saved ${J(await raw(p, kAm))}`, r.pic)
})
saveRaw(`results-repro1-${SZ}.json`, L.results)
process.exit(0)
