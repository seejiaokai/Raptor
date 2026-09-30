/* [DB-READINESS] group A FULL walk — W1 part B: publishing Saturday (5), Unpublish and the reissue (6), Undo / Redo of
   the reissue (7). Desktop 1440×900, a fresh world, every gesture on Edit Schedule's own controls (the sign-off boxes,
   Publish day, Publish AL1, Unpublish, the top bar's ↶ / ↷).
   Usage (from raptor-port/scripts/handpass): node dbrA-W1-b.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('b')
const { WK, day, ELOG, esc } = W
const IS = new RegExp('^' + esc(WK) + ':is:'), RX = new RegExp('^' + esc(WK) + ':rx:')
const WKROW = new RegExp('^' + esc(WK) + '$')
const LW = /^leavewar\//
const SAT = 5, SUN = 6
const browser = await L.launch()
const errors = []
const ctx = await L.context(browser)
const p = await L.page(ctx, errors, 'W1b')
const { T, S, pic, note } = W.table(L, '1440')
await L.signIn(p, 'a')
await W.toEdit(L, p)
await W.toastSpy(p)

const onSat = () => W.showDay(p, SAT)
const issued = async () => Object.keys(await L.rows(p)).filter(k => IS.test(k) || RX.test(k)).sort()
const headTxt = async (di) => { const h = await W.head(p, di); return `tag "${h.tag}" · pending "${h.pending}" · signs [${h.signs.join(' | ')}] · signed line "${h.signed}"${h.nys ? ' · ' + h.nys : ''} · buttons: publish ${h.beak} ${h.alpub ? '· "' + h.alpub + '"' : ''} ${h.unpub ? '· "' + h.unpub + '"' : ''}` }
const satLines = () => p.evaluate(() => window.ELOG.rows.filter(r => r.date === '2026-07-18').map(r => `${r.lbl}${r.who ? ' (' + r.who + ')' : ''}`))
async function viewSigned(di) {
  await L.go(p, 'viewsched')
  await W.showDay(p, di, '#vWeek')
  const r = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); const s = d && d.querySelector('.signedln'); return { line: s ? s.innerText.replace(/\s+/g, ' ').trim() : '', tag: (d && d.querySelector('.verchip') || {}).innerText || '' } }, di)
  await pic(p, `view-sat-${Date.now() % 100000}`)
  await W.toEdit(L, p)
  return r
}

/* ---------- 5. publish Saturday ---------- */
let signs0 = null
await S(p, 'W1.5a', 'Saturday: the four sign-off boxes signed on Edit Schedule (the week\'s first save)',
  async () => { signs0 = await W.signDay(p, SAT, 0); return signs0 },
  { expect: { put: [day(WK, SAT)], also: [WKROW, /^weeks\/13-07-2026#\d$/, ELOG], only: true }, onScreen: onSat,
    show: async () => headTxt(SAT) })
L.check('W1.5a the four names are still in their boxes after the reload', W.signsFull(await W.head(p, SAT)), await headTxt(SAT))
await S(p, 'W1.5b', 'Saturday: Publish day (the Original)',
  () => W.publishDay(p, SAT),
  { expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat,
    show: async () => headTxt(SAT) })
{
  const h = await W.head(p, SAT)
  L.check('W1.5b after the reload: Saturday wears the ORIG seal and the four names on its signed line', /ORIG/.test(h.tag) && Object.values(signs0).every(n => h.signed.includes(n.replace(/\s+/g, ' ').trim().split(' ')[0])), await headTxt(SAT))
  const v = await viewSigned(SAT)
  L.check('W1.5b after the reload: View-only Sched shows Saturday\'s signed line with the four names', /Signed/i.test(v.line) && Object.values(signs0).every(n => v.line.includes(n.replace(/\s+/g, ' ').trim().split(' ')[0])), JSON.stringify(v))
  T[T.length - 1].shown += ` · View-only Sched: tag "${v.tag}", line "${v.line}"`
  note(`W1.5 issuance rows now: ${(await issued()).join(', ')}`)
}
const satBefore = (await L.rows(p))[`${WK}#${SAT}`]
await S(p, 'W1.5c', 'Sunday: a day note typed (Saturday is published)',
  () => W.weekText(p, `dn:${SUN}.0`, 'W1 SUNDAY NOTE'),
  { expect: { put: [day(WK, SUN)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, SUN),
    show: async () => `Sunday's note "${await p.evaluate(() => window.txtGet('dn:6.0'))}" · Saturday: ${await headTxt(SAT)}` })
L.check('W1.5c Saturday\'s stored row is byte-for-byte untouched by Sunday\'s edit and its reload', (await L.rows(p))[`${WK}#${SAT}`] === satBefore)
await S(p, 'W1.5d', 'published Saturday: the four signed again (ready for the next version)',
  () => W.signDay(p, SAT, 0),
  { expect: { put: [day(WK, SAT)], also: [ELOG], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
await S(p, 'W1.5e', 'published Saturday: its day note edited → "1 pending", the four fall',
  () => W.weekText(p, `dn:${SAT}.0`, 'W1 SATURDAY AMENDED'),
  { expect: { put: [day(WK, SAT)], also: [ELOG], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
{
  const h = await W.head(p, SAT)
  L.check('W1.5e after the reload: "1 pending" and the four sign-offs fell (D103)', /1\s*pending/.test(h.pending) && W.signsEmpty(h), await headTxt(SAT))
}
let signsAL = null
await S(p, 'W1.5f', 'Saturday: the four signed for AL1',
  async () => { signsAL = await W.signDay(p, SAT, 1); return signsAL },
  { expect: { put: [day(WK, SAT)], also: [ELOG], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
await S(p, 'W1.5g', 'Saturday: Publish AL1',
  () => W.publishAL(p, SAT),
  { expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
{
  const h = await W.head(p, SAT), iss = await issued()
  L.check('W1.5g after the reload: AL1 on Saturday, nothing pending, two issuance rows', /AL1/.test(h.tag) && !/pending/.test(h.pending) && iss.filter(k => IS.test(k)).length === 2, `${await headTxt(SAT)} · ${iss.join(', ')}`)
  note(`W1.5g issuance rows now: ${iss.join(', ')}`)
}

/* ---------- 6. Unpublish AL1, then the reissue ---------- */
const isBefore = Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => IS.test(k)))
await S(p, 'W1.6a', 'Saturday: Unpublish (AL1 withdrawn)',
  () => W.unpublish(p, SAT),
  { expect: { put: [RX, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
{
  const r = await L.rows(p), h = await W.head(p, SAT)
  L.check('W1.6a the issuance rows are untouched (never deleted, never rewritten)', Object.entries(isBefore).every(([k, v]) => r[k] === v), Object.keys(isBefore).join(', '))
  L.check('W1.6a after the reload: the AL1 tag is gone (ORIG), the change pending again on the working copy', /ORIG/.test(h.tag) && /1\s*pending/.test(h.pending) && (await p.evaluate(() => window.txtGet('dn:5.0'))) === 'W1 SATURDAY AMENDED', await headTxt(SAT))
  note(`W1.6a issuance / retraction rows now: ${(await issued()).join(', ')}`)
}
let signsRe = null
await S(p, 'W1.6b', 'Saturday: the four signed for the reissue (different names)',
  async () => { signsRe = await W.signDay(p, SAT, 2); return signsRe },
  { expect: { put: [day(WK, SAT)], also: [ELOG], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
const isBefore2 = Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => IS.test(k) || RX.test(k)))
await S(p, 'W1.6c', 'Saturday: Publish AL1 again (the reissue)',
  () => W.publishAL(p, SAT),
  { expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
{
  const r = await L.rows(p), iss = await issued(), h = await W.head(p, SAT)
  const newIs = iss.filter(k => IS.test(k) && !(k in isBefore2))
  L.check('W1.6c a NEW issuance row (~1), the older rows untouched', newIs.length === 1 && /~1$/.test(newIs[0]) && Object.entries(isBefore2).every(([k, v]) => r[k] === v), `new ${newIs.join(', ')} · all ${iss.join(', ')}`)
  const tags = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] .verchip')].map(e => e.innerText.trim()))
  L.check('W1.6c after the reload: AL1 shows once, the four names of the REISSUE on its signed line', /AL1/.test(h.tag) && tags.filter(t => /AL1/.test(t)).length <= 2 && Object.values(signsRe).every(n => h.signed.includes(n.split(' ')[0])), `${await headTxt(SAT)} · chips ${JSON.stringify(tags)} · reissue signers ${JSON.stringify(signsRe)} · first AL1 signers ${JSON.stringify(signsAL)}`)
  const lines = await satLines()
  L.check('W1.6c after the reload: the history keeps the Original, AL1, the Unpublish and the reissue', lines.some(l => /^Published — the Original/.test(l)) && lines.filter(l => /^Published — AL1/.test(l)).length === 2 && lines.some(l => /^AL1 withdrawn/.test(l)), JSON.stringify(lines))
  T[T.length - 1].shown += ` · Saturday's history: ${JSON.stringify(lines)}`
  const v = await viewSigned(SAT)
  T[T.length - 1].shown += ` · View-only Sched: tag "${v.tag}", line "${v.line}"`
  L.check('W1.6c View-only Sched: AL1 with the reissue\'s four names', /AL1/.test(v.tag + v.line) && Object.values(signsRe).every(n => v.line.includes(n.split(' ')[0])), JSON.stringify(v))
}

/* ---------- 7. Undo the reissue, then Redo it (the top bar) ----------
   The undo list lives for the sign-in only (D148: it clears at sign-out, and a reload is a sign-out), so an Undo can
   only follow a reissue made in the same sign-in, and a Redo only an Undo. Each gets its reload straight after it:
   Unpublish → sign → reissue → Undo → RELOAD; then sign → reissue → Undo → Redo → RELOAD. */
await S(p, 'W1.7a', 'Saturday: Unpublish again (the reissued AL1 withdrawn)',
  () => W.unpublish(p, SAT),
  { expect: { put: [RX, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat, show: async () => headTxt(SAT) })
note(`W1.7a issuance / retraction rows now: ${(await issued()).join(', ')}`)
await S(p, 'W1.7b', 'Saturday: signed and AL1 reissued (no reload — the Undo comes next)',
  async () => { await W.signDay(p, SAT, 0); return W.publishAL(p, SAT) },
  { reload: false, expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat })
note(`W1.7b issuance / retraction rows now: ${(await issued()).join(', ')}`)
const beforeUndo = Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => IS.test(k) || RX.test(k)))
await S(p, 'W1.7c', "the top bar's ↶ Undo — the reissue taken back; then reload",
  () => W.door(p, 'top', 'undo'),
  { expect: { put: [day(WK, SAT)], also: [ELOG, LW, RX, IS, WKROW], only: true }, onScreen: onSat,
    after: async (a) => note(`W1.7c Undo: ${JSON.stringify(a.ret)} · rows ${[...a.put, ...a.del].join(', ')}`),
    show: async () => `${await headTxt(SAT)} · redo after the reload: ${JSON.stringify(await p.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? { off: b.disabled, title: b.title } : null }))}` })
{
  const r = await L.rows(p), h = await W.head(p, SAT)
  /* the design (data-model.md §5, the week rows): a row goes only by an explicit delete — an Undo of a publish removes
     the issuance it takes back; every OTHER issuance and retraction stays byte for byte */
  const gone = Object.keys(beforeUndo).filter(k => !(k in r)), changed = Object.keys(beforeUndo).filter(k => k in r && r[k] !== beforeUndo[k])
  L.check("W1.7c the Undo removed exactly the reissue's own issuance row (~2) and touched no other issuance or retraction", gone.length === 1 && /:is:.*~2$/.test(gone[0]) && !changed.length, `removed ${gone.join(', ') || 'none'} · rewritten ${changed.join(', ') || 'none'}`)
  L.check('W1.7c after the reload: the reissue is taken back — ORIG current, the AL1 change pending again', /ORIG/.test(h.tag) && /1\s*pending/.test(h.pending), await headTxt(SAT))
  note(`W1.7c issuance / retraction rows now: ${(await issued()).join(', ')}`)
}
await S(p, 'W1.7d', 'Saturday: signed and AL1 reissued again (no reload)',
  async () => { await W.signDay(p, SAT, 1); return W.publishAL(p, SAT) },
  { reload: false, expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat })
await S(p, 'W1.7e', "the top bar's ↶ Undo (no reload — the Redo comes next)",
  () => W.door(p, 'top', 'undo'),
  { reload: false, expect: { put: [day(WK, SAT)], also: [ELOG, LW, RX, IS, WKROW], only: true }, onScreen: onSat,
    after: async (a) => note(`W1.7e Undo: ${JSON.stringify(a.ret)} · rows ${[...a.put, ...a.del].join(', ')}`) })
const beforeRedo = Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => IS.test(k) || RX.test(k)))
await S(p, 'W1.7f', "the top bar's ↷ Redo — the reissue published again; then reload",
  () => W.door(p, 'top', 'redo'),
  { expect: { put: [day(WK, SAT)], also: [ELOG, LW, RX, IS, WKROW], only: true }, onScreen: onSat,
    after: async (a) => note(`W1.7f Redo: ${JSON.stringify(a.ret)} · rows ${[...a.put, ...a.del].join(', ')}`),
    show: async () => `${await headTxt(SAT)} · history ${JSON.stringify(await satLines())}` })
{
  const r = await L.rows(p), h = await W.head(p, SAT)
  const added = Object.keys(r).filter(k => (IS.test(k) || RX.test(k)) && !(k in beforeRedo)), changed = Object.keys(beforeRedo).filter(k => r[k] !== beforeRedo[k])
  L.check('W1.7f the Redo put back exactly the one issuance row (~2) and touched no other', added.length === 1 && /:is:.*~2$/.test(added[0]) && !changed.length, `added ${added.join(', ') || 'none'} · changed ${changed.join(', ') || 'none'}`)
  L.check('W1.7f after the reload: AL1 on Saturday, nothing pending', /AL1/.test(h.tag) && !/pending/.test(h.pending), await headTxt(SAT))
  const v = await viewSigned(SAT)
  T[T.length - 1].shown += ` · View-only Sched: tag "${v.tag}", line "${v.line}"`
  L.check('W1.7f View-only Sched agrees: AL1 and a signed line', /AL1/.test(v.tag) && /Signed/i.test(v.line), JSON.stringify(v))
  note(`W1.7 issuance / retraction rows at the end: ${(await issued()).join(', ')}`)
}

/* ---------- beside the list: an Unpublish, then Undo (the retraction taken back) ---------- */
await S(p, 'W1.7g', 'Saturday: Unpublish (no reload — the Undo comes next)',
  () => W.unpublish(p, SAT),
  { reload: false, expect: { put: [RX, day(WK, SAT)], also: [ELOG, LW, WKROW], only: true }, onScreen: onSat })
const beforeUndo2 = Object.fromEntries(Object.entries(await L.rows(p)).filter(([k]) => IS.test(k) || RX.test(k)))
await S(p, 'W1.7h', "the top bar's ↶ Undo — the Unpublish taken back; then reload",
  () => W.door(p, 'top', 'undo'),
  { expect: { put: [day(WK, SAT)], also: [ELOG, LW, RX, IS, WKROW], only: true }, onScreen: onSat,
    after: async (a) => note(`W1.7h Undo: ${JSON.stringify(a.ret)} · rows put ${a.put.join(', ')} · del ${a.del.join(', ')}`),
    show: async () => headTxt(SAT) })
{
  const r = await L.rows(p), h = await W.head(p, SAT)
  const gone = Object.keys(beforeUndo2).filter(k => !(k in r)), changed = Object.keys(beforeUndo2).filter(k => k in r && r[k] !== beforeUndo2[k])
  L.check('W1.7h the Undo removed exactly the retraction it took back (~2) and touched no issuance', gone.length === 1 && /:rx:.*~2$/.test(gone[0]) && !changed.length, `removed ${gone.join(', ') || 'none'} · rewritten ${changed.join(', ') || 'none'}`)
  L.check('W1.7h after the reload: AL1 current again, nothing pending', /AL1/.test(h.tag) && !/pending/.test(h.pending), await headTxt(SAT))
  note(`W1.7h issuance / retraction rows at the end: ${(await issued()).join(', ')}`)
}

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
