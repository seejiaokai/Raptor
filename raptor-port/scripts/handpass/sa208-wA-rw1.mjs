// sa208-wA-rw1 — walker A's re-walk 1 of the chat 208 walk (27 Nov 26), on the frozen build D:/raptor-work/c208-build2
// (index-0HKWKnT7.js): a PUBLISHED day must not turn "Not yet signed" when a SANS posting on it takes effect. Ranger posted
// out as SANS from Fri 17 through the Leave War, nothing filed, planned on Sat 18's OFT EP-9 10:00–11:00, Sat 18 signed and
// published through the board's own controls; read clean; the clock crosses into Fri 17 with the page open, then the page
// reopened; Sat 18 read again. Plus F1 once (the note reads the crew list's words). Every step through the app's own
// controls; window.* only READ. Serve: SA208_DIR=D:/raptor-work/c208-build2 node scripts/handpass/sa208-wA-serve.mjs
// Run from raptor-port/: SZ=d|p SA208A_RUN=rewalk1 node scripts/handpass/sa208-wA-rw1.mjs
import './sa208-wA-env.mjs'
const H = await import('./sa208-wA-lib.mjs')
const { B, Y, L, T, J, sleep, ID, NFW, note, LNF, chk, rec, step, pics, mkLine, mkSim, seat, sim, reason, plant, rsay, lines, saveRaw, sansOnly, oneSans, dragIn } = H
const SZ = process.env.SZ || 'd'
L.SIZES.d.opts.viewport = { width: 1536, height: 1000 }
const DESK = () => SZ === 'd'
const R17 = 'SANS from Fri 17 Jul: no availability filed'
console.log('VERSION sa208-wA-rw1 1 ·', SZ, '·', process.env.W2_URL, '·', L.OUT)

const noteOk = (k, want) => (k.seen || []).includes(want) && oneSans(want)
const nsay = k => `notes ${J(k.seen)} · holds ${J(k.holds)}`
/* Saturday read on the board (its pending chip, sign line) and on Edit Schedule (its card) */
async function satState(p, W, tag) {
  await B.openB(p, W, 5); await sleep(400)
  const bd = await L.pendingOf(p, 5)
  const bpic = await W.pic(p, tag + '-board')
  await B.closeB(p, W)
  const es = await T.dayState(p, W, 'Saturday', tag + '-editsched')
  return { bd, es, pic: pics(bpic, es.pic), say: `board: pending ${bd.pend}, notSigned ${bd.notSigned}, signed "${bd.signed}", approved ${J(bd.approved)} · Edit Schedule card: pending ${es.pending}, notSigned ${es.notSigned}, "${es.signedLine}"` }
}
const clean = s => !s.bd.notSigned && !s.bd.pend && !s.es.notSigned && s.es.pending === 'none'

await Y.run('RW1', SZ, async (p, W) => {
  const bundle = await p.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src')).join(' '))
  chk(W, 'bundle', 'the page loads the new frozen build index-0HKWKnT7.js', /index-0HKWKnT7\.js/.test(bundle), bundle)

  /* F1 once: Mon VX 09:00–10:00 front, Jester (nothing filed) */
  await step(W, 'F1', async () => {
    const wi = await mkLine(p, W, 0, 'VX', '09:00', '10:00')
    const sel = seat(0, wi, 'p')
    const r = await reason(p, W, 0, sel, ID.Jester, 'f1')
    chk(W, 'F1.reason', 'F1: VX front picked — Jester struck "SANS — no availability filed for today", his hover the same', r.r && r.r.struck && r.r.why === NFW && r.r.title === 'Jester — ' + NFW, rsay(r.r), r.pic)
    let k
    if (DESK()) { k = await dragIn(p, W, 0, sel, ID.Jester, 'f1-drag'); chk(W, 'F1.hint', 'F1 (desktop): the drag hint while held reads his reason word for word', k.hover && k.hover.why === NFW, J(k.hover), k.hpic) }
    else { k = await H.pick(p, W, 0, sel, ID.Jester, 'f1'); k.pic = pics(k.first, k.crop) }
    chk(W, 'F1.note', 'F1: planted — the note "Jester — SANS — no availability filed for today" (the crew list\'s words), one "SANS", no "Planned on"', noteOk(k, note('Jester', NFW)), nsay(k), k.pic || pics(k.first, k.crop))
    const l = await lines(p, W, 0, 'Jester', 'f1')
    chk(W, 'F1.list', 'F1: the warning list keeps "Jester — SANS: no availability filed for today. Planned on VX (T/O 09:00)"', l.sans.some(x => x.text === LNF('Jester', 'VX (T/O 09:00)')), l.say, l.pic)
  })

  /* the set-up: Ranger posted out as SANS from Fri 17; Sat 18 OFT EP-9 10:00–11:00 (Ranger front) and EP-8 14:00–15:00 (empty) */
  let ep9, ep8, su9, line0
  await step(W, 'set', async () => {
    const po = await B.postR(p, W, 'rw-post')
    rec(W, 'set.post', 'Ranger posted out as SANS from Fri 17 through the Leave War (Post out → SANS → Post out)', J(po && (po.after || po.line || po)).slice(0, 300), po && po.pic)
    ep9 = await mkSim(p, W, 5, 'oft', 'EP-9', '10:00', '11:00')
    ep8 = await mkSim(p, W, 5, 'oft', 'EP-8', '14:00', '15:00')
    su9 = await mkSim(p, W, 6, 'oft', 'EP-9', '10:00', '11:00')
    const k = await plant(p, W, 5, sim(5, 'oft', ep9, 'p'), ID.Ranger, 'sat-plant')
    chk(W, 'set.reason', 'before his date takes effect: Sat 18 EP-9 front picked — Ranger struck "SANS from Fri 17 Jul: no availability filed"', k.r && k.r.why === R17, rsay(k.r), k.pic)
    chk(W, 'set.note', 'planted on Sat 18 — the note "Ranger — SANS from Fri 17 Jul: no availability filed"', noteOk(k, note('Ranger', R17)), nsay(k), pics(k.first, k.crop))
    const l = await lines(p, W, 5, 'Ranger', 'sat-before')
    line0 = l.sans.map(x => x.text)
    rec(W, 'set.list', 'Sat 18\'s warning list before publishing — his SANS line (RECORDED, the words compared later)', l.say, l.pic)
  })

  /* publish Sat 18: the four sign-offs picked on the board, then its Publish */
  await step(W, 'pub', async () => {
    await B.openB(p, W, 5); await sleep(400)
    const lab = await L.publish(p, W, 5)
    await sleep(600)
    const win = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"], .floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || 'floatwin') + ': ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160)))
    const pp = await W.pic(p, 'pub-after')
    rec(W, 'pub.press', 'Sat 18: the four sign-offs picked and Publish pressed on the board', `button "${lab}" · windows open after: ${J(win)}`, pp)
    const later = p.locator('[data-testid="win-oilday"] button', { hasText: 'Later' })
    if (await later.count() && await later.first().isVisible()) { await later.first().click(); await sleep(400) }
    await B.closeB(p, W)
    const s = await satState(p, W, 'pub-state')
    chk(W, 'pub.clean', 'published Sat 18 reads clean before the posting takes effect: no "Not yet signed", no pending count, a signed line', clean(s) && /SIGNED/i.test(s.es.signedLine + s.bd.signed), s.say, s.pic)
  })

  /* the posting takes effect: the clock crosses into Fri 17 with the page open */
  await step(W, 'cross', async () => {
    await B.closeB(p, W).catch(() => {})
    await p.clock.setSystemTime(new Date('2026-07-17T00:00:20'))
    await sleep(65000)
    const today = await L.today(p)
    const s = await satState(p, W, 'cross-state')
    chk(W, 'cross.clean', 'page left open across midnight into Fri 17 (the posting now taken effect): Sat 18 still no "Not yet signed", no pending change', clean(s), `page today ${today} · ${s.say}`, s.pic)
    const l = await lines(p, W, 5, 'Ranger', 'cross')
    chk(W, 'cross.line', 'Sat 18\'s SANS line — its words unchanged', J(l.sans.map(x => x.text)) === J(line0) && line0.length === 1, `before ${J(line0)} · now ${l.say}`, l.pic)
    const r = await reason(p, W, 5, `[data-fill="s:5.oft.${ep8}.+"]`, ID.Ranger, 'cross')
    chk(W, 'cross.reason', 'Sat 18 EP-8 picked (no change made) — Ranger now struck "SANS — no availability filed for today"', r.r && r.r.why === NFW, rsay(r.r), r.pic)
    await B.unarm(p, W, 'B').catch(() => {}); await B.closeB(p, W)
    const s2 = await satState(p, W, 'cross-after-pick')
    chk(W, 'cross.pick', 'picking a seat on Sat 18 (nothing planted) left it clean', clean(s2), s2.say, s2.pic)
  })

  /* reopened on Fri 17 */
  await step(W, 'reopen', async () => {
    await T.reload(p, 'ad', 'a'); await sleep(800)
    const today = await L.today(p)
    const s = await satState(p, W, 'reopen-state')
    chk(W, 'reopen.clean', 'reopened on Fri 17: Sat 18 no "Not yet signed", no pending change', clean(s), `page today ${today} · ${s.say}`, s.pic)
    const l = await lines(p, W, 5, 'Ranger', 'reopen')
    chk(W, 'reopen.line', 'reopened: Sat 18\'s SANS line — its words unchanged', J(l.sans.map(x => x.text)) === J(line0), `before ${J(line0)} · now ${l.say}`, l.pic)
    const r = await reason(p, W, 5, `[data-fill="s:5.oft.${ep8}.+"]`, ID.Ranger, 'reopen')
    chk(W, 'reopen.reason', 'reopened: Sat 18 EP-8 picked — Ranger struck "SANS — no availability filed for today"', r.r && r.r.why === NFW, rsay(r.r), r.pic)
    await B.unarm(p, W, 'B').catch(() => {}); await B.closeB(p, W)
    /* a fresh plant on Sun 19 (not published), so Saturday stays as published */
    const k = await plant(p, W, 6, sim(6, 'oft', su9, 'p'), ID.Ranger, 'sun-plant')
    chk(W, 'fresh.reason', 'Sun 19 EP-9 front picked — Ranger struck "SANS — no availability filed for today"', k.r && k.r.why === NFW, rsay(k.r), k.pic)
    chk(W, 'fresh.note', 'a fresh plant (Sun 19) after the posting took effect — the note "Ranger — SANS — no availability filed for today"', noteOk(k, note('Ranger', NFW)), nsay(k), pics(k.first, k.crop))
    await B.closeB(p, W)
    const s2 = await satState(p, W, 'reopen-after-sun')
    chk(W, 'fresh.sat', 'after the Sunday plant, Sat 18 still clean', clean(s2), s2.say, s2.pic)
    /* last: a fresh plant on Sat 18 itself — its note; Saturday's pending count from that change RECORDED */
    const k2 = await plant(p, W, 5, `[data-fill="s:5.oft.${ep8}.+"]`, ID.Ranger, 'sat-plant2')
    chk(W, 'fresh.satnote', 'a fresh plant on published Sat 18 (EP-8) — the note "Ranger — SANS — no availability filed for today"', (k2.seen || []).some(n => n === note('Ranger', NFW) || n.startsWith(note('Ranger', NFW))), nsay(k2), pics(k2.first, k2.crop))
    await B.closeB(p, W)
    const s3 = await satState(p, W, 'sat-after-plant2')
    rec(W, 'fresh.satstate', 'Sat 18 after that plant of my own (a pending change is expected now; RECORDED)', s3.say, s3.pic)
  })
})
saveRaw(`results-${process.env.SA208A_RUN || "rewalk1"}-${SZ}.json`, L.results)
process.exit(0)
