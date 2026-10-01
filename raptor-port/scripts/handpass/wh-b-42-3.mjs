/* WALKER B — Astra's scenarios 42 (Load the CURRENT version resets its hides exactly, its confirm counts one) and 3 (an
   OLDER version's load counts only what it will really replace). Each part in its own world. WH_PART=42a|42b|3|3c|all */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, pk, flagged, K } = B
const part = process.env.WH_PART || 'all', k = K.long
const ALLERR = []
async function run(id, fn) {
  if (part !== 'all' && part !== id) return
  B.prefix(`s${id}-`)
  const { browser, p, errors } = await B.world()
  try { await fn(p, id) } catch (e) { row(`${id}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${id}-X-error`)]) }
  row(`${id}.err`, 'the browser\'s error list through this part', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
  ALLERR.push(...errors)
  await browser.close()
}
/* look at a version, read its face, press Load (and its confirm), read what the app said and what the day is afterwards */
async function lookLoad(p, id, label, n) {
  await W.toastSpy(p); await W.toasts(p)
  const lk = await B.look(p, TUE, label)
  await B.openList(p, '#eWeek', TUE)
  const face = await B.lookFace(p, TUE), vlist = await B.readList(p, '#eWeek', TUE)
  const s1 = await pic(p, `s${id}-${n}-look`)
  const ld = await B.load(p, TUE, { confirm: false })
  const s2 = await pic(p, `s${id}-${n}-load-pressed`)
  let confirmed = null
  if (ld.armed) { const b = p.locator(`#eWeek [data-restore="${TUE}"]:visible`).first(); if (await b.count()) { await b.click(); await L.sleep(800); confirmed = true } }
  const toasts = await W.toasts(p)
  const s3 = await pic(p, `s${id}-${n}-loaded`)
  return { lk, face, vlist, ld, confirmed, toasts, shots: [s1, s2, s3] }
}

/* 42a — the current version has the warning flagged; the working copy hides it */
await run('42a', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE); await B.hide(p, TUE, k.re)
  let w = await B.work(p, TUE)
  const r = await lookLoad(p, id, /Original/, 1)
  const vl = lineOf(r.vlist, k.re)
  judge(`${id}.1`, 'Tuesday published flagged; ✕ on the long work day (1 pending); plans selector → the Original (👁) → "Load onto working copy"', [
    ['before: 1 pending, the line struck', /^1\s*pending/.test(w.head.pending) && lineOf(w.list, k.re).struck, [w.head.pending, short(w.list)]],
    ['the look shows the Original with the line NOT struck, 4 issues, no button', !!vl && !vl.struck && !vl.btn && nIssues(r.vlist) === 4 && r.face.woff === 0, short(r.vlist)],
    ['the first press asks: "Discard 1 edit & load — confirm"', /^Discard 1 edit & load — confirm$/.test(r.ld.armed || ''), r.ld.said]], r.shots)
  w = await B.work(p, TUE)
  let l = lineOf(w.list, k.re), ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  const s = await pic(p, `s${id}-2-after-load`)
  judge(`${id}.2`, 'the confirm pressed — the working copy afterwards', [
    ['the app said what it did', r.toasts.length > 0, r.toasts], ['the line is plain with ✕ again, 4 issues', !!l && !l.struck && l.btn === '✕' && nIssues(w.list) === 4, short(w.list)],
    ['Static\'s puck is flagged again', flagged(ps).length > 0, pk(ps)], ['nothing pending, no marker, no Publish AL button', !/pending/.test(w.head.pending) && !w.head.nys && !w.head.alpub, [w.head.pending, w.head.nys, w.head.alpub]]], [s])
  await B.admin(p)
  w = await B.work(p, TUE); l = lineOf(w.list, k.re)
  const s2 = await pic(p, `s${id}-3-after-reload`)
  const m = await B.member(p, TUE, [k.who], `s${id}-3-member`)
  judge(`${id}.3`, 'a reload as the scheduler, then as the member', [
    ['the scheduler: line plain, 4 issues, nothing pending', !!l && !l.struck && nIssues(w.list) === 4 && !/pending/.test(w.head.pending), [short(w.list), w.head.pending]],
    ['the member: the Original, 4 issues, not struck', /ORIG/.test(m.hd.tag) && nIssues(m.list) === 4 && !lineOf(m.list, k.re).struck, [m.hd.tag, short(m.list)]]], [s2, ...m.shots])
})

/* 42b — the current version went out with the warning hidden; the working copy flags it again */
await run('42b', async (p, id) => {
  await B.toEdit(p); await B.hide(p, TUE, k.re); await B.pubOrig(p, TUE); await B.again(p, TUE, k.re)
  let w = await B.work(p, TUE)
  const r = await lookLoad(p, id, /Original/, 1)
  const vl = lineOf(r.vlist, k.re)
  judge(`${id}.1`, '✕ on the long work day, Tuesday published (hidden); ↺ on it (1 pending); the Original (👁) → "Load onto working copy"', [
    ['before: 1 pending, the line plain', /^1\s*pending/.test(w.head.pending) && !lineOf(w.list, k.re).struck, [w.head.pending, short(w.list)]],
    ['the look shows the Original with the line STRUCK, 3 issues, no button', !!vl && vl.struck && !vl.btn && nIssues(r.vlist) === 3 && r.face.woff === 0, short(r.vlist)],
    ['the first press asks: "Discard 1 edit & load — confirm"', /^Discard 1 edit & load — confirm$/.test(r.ld.armed || ''), r.ld.said]], r.shots)
  w = await B.work(p, TUE)
  const l = lineOf(w.list, k.re), ps = await B.dayPucks(p, '#eWeek', TUE, k.who)
  const s = await pic(p, `s${id}-2-after-load`)
  judge(`${id}.2`, 'the confirm pressed — the working copy afterwards', [
    ['the app said what it did', r.toasts.length > 0, r.toasts], ['the line is struck with ↺ again, 3 issues', !!l && l.struck && l.btn === '↺' && nIssues(w.list) === 3, short(w.list)],
    ['Static\'s pucks carry no flag', ps.length > 0 && flagged(ps).length === 0, pk(ps)], ['nothing pending, no marker', !/pending/.test(w.head.pending) && !w.head.nys, [w.head.pending, w.head.nys]]], [s])
})

/* 3 — Original flagged; AL1 hidden; the working copy flags it again (so it already matches the Original); load the Original */
await run('3', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE); await B.hide(p, TUE, k.re); await B.pubAL(p, TUE); await B.again(p, TUE, k.re)
  let w = await B.work(p, TUE)
  const a0 = await B.auth(p, TUE)
  const r = await lookLoad(p, id, /Original/, 1)
  const vl = lineOf(r.vlist, k.re)
  judge(`${id}.1`, 'Original flagged → ✕ → AL1 (hidden) → ↺ on the working copy (1 pending, and now the same as the Original); the Original (👁) → "Load onto working copy"', [
    ['before: the day is at AL1, 1 pending, the line plain', /AL1/.test(w.head.tag) && /^1\s*pending/.test(w.head.pending) && !lineOf(w.list, k.re).struck, [w.head.tag, w.head.pending, short(w.list)]],
    ['"To go out · AL2" holds the one line "hidden → flagged again"', !!a0.win && a0.win.out.out.length === 1 && /hidden → flagged again/.test(a0.win.out.out[0].chg), a0.win && a0.win.out.out.map(o => o.text)],
    ['the look shows the Original: the line NOT struck, 4 issues', !!vl && !vl.struck && nIssues(r.vlist) === 4, short(r.vlist)],
    ['the load does NOT say it will discard an edit (the working copy already matches the Original — nothing is replaced)', !/Discard\s+[1-9]/.test(r.ld.said.join(' | ')), r.ld.said],
    ['its message does not claim an edit was replaced', !/[1-9]\d* (edit|change)s? (was |were )?(replaced|discarded)/i.test(r.toasts.join(' | ')), r.toasts]], r.shots)
  w = await B.work(p, TUE)
  const a1 = await B.auth(p, TUE)
  const l = lineOf(w.list, k.re)
  const s = await pic(p, `s${id}-2-after-load`)
  judge(`${id}.2`, 'the working copy after the load', [
    ['the line is plain, 4 issues', !!l && !l.struck && nIssues(w.list) === 4, short(w.list)], ['the one difference from AL1 still reads 1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending],
    ['"To go out" still holds the one line "hidden → flagged again"', !!a1.win && a1.win.out && a1.win.out.out.length === 1 && /hidden → flagged again/.test(a1.win.out.out[0].chg), a1.win && a1.win.out && a1.win.out.out.map(o => o.text)]], [s, ...(a1.win ? a1.win.shots : [])])
  row(`${id}.said`, 'RECORDED — every word the load put on screen', `buttons: ${r.ld.said.join(' → ')} · messages: ${r.toasts.join(' | ') || '(none)'} · the look's own count beside the day: "${r.face.pend}"`, 'RECORDED', r.shots)
})

/* 3c — the same, but the working copy ALSO hides Saint's clash (a real edit the load replaces): the count must be one */
await run('3c', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE); await B.hide(p, TUE, k.re); await B.pubAL(p, TUE); await B.hide(p, TUE, K.clash.re)
  let w = await B.work(p, TUE)
  const r = await lookLoad(p, id, /Original/, 1)
  judge(`${id}.1`, 'Original flagged → ✕ long day → AL1; then ✕ on Saint\'s clash (1 pending); the Original (👁) → "Load onto working copy"', [
    ['before: AL1, 1 pending', /AL1/.test(w.head.tag) && /^1\s*pending/.test(w.head.pending), [w.head.tag, w.head.pending]],
    ['while the Original is looked at, the count beside the day still reads 1 pending (WH8: one on every count)', /^1\s*pending/.test(r.face.pend), `the chip reads "${r.face.pend}"`],
    ['the confirm counts the ONE unpublished edit: "Discard 1 edit & load — confirm"', /^Discard 1 edit & load — confirm$/.test(r.ld.armed || ''), r.ld.said],
    ['its message says 1 unpublished edit was replaced', /\b1 unpublished edit replaced/.test(r.toasts.join(' | ')), r.toasts]], r.shots)
  row(`${id}.chip`, 'RECORDED — the count beside the day while the Original is looked at (before the look it read "1 pending"; the Amendments panel beside it says Tue · 1 change)', `the chip beside the day reads "${r.face.pend}"`, 'RECORDED', [r.shots[0], r.shots[1]])
  w = await B.work(p, TUE)
  const a1 = await B.auth(p, TUE)
  const s = await pic(p, `s${id}-2-after-load`)
  const it = a1.win && a1.win.out ? a1.win.out.out : []
  judge(`${id}.2`, 'the confirm pressed — the working copy is the Original: all four flagged; against AL1 one thing differs', [
    ['all four lines plain, 4 issues', w.list.lines.length === 4 && w.list.lines.every(x => !x.struck) && nIssues(w.list) === 4, short(w.list)],
    ['1 pending', /^1\s*pending/.test(w.head.pending), w.head.pending], ['"To go out" holds the one line: the long work day, "hidden → flagged again"', it.length === 1 && /Static/.test(it[0].where) && /hidden → flagged again/.test(it[0].chg), it.map(o => o.text)]], [s, ...(a1.win ? a1.win.shots : [])])
  row(`${id}.said`, 'RECORDED — every word the load put on screen', `buttons: ${r.ld.said.join(' → ')} · messages: ${r.toasts.join(' | ') || '(none)'}`, 'RECORDED', r.shots)
})
/* 3d — NOTHING is pending (the working copy IS AL1, which went out with the long day hidden); a look at the Original.
   The screen's own words are "Discard N edits" / "your N unpublished edits": with no unpublished edit there is none to discard. */
await run('3d', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE); await B.hide(p, TUE, k.re); await B.pubAL(p, TUE)
  let w = await B.work(p, TUE)
  const a0 = await B.auth(p, TUE)
  await W.toastSpy(p); await W.toasts(p)
  await B.look(p, TUE, /^Original/)
  const face = await B.lookFace(p, TUE)
  const s1 = await pic(p, `s${id}-1-look`)
  const ld = await B.load(p, TUE, { confirm: false })
  const title = await p.evaluate(i => { const b = document.querySelector(`#eWeek [data-restore="${i}"]`); return b ? b.getAttribute('title') : '' }, TUE)
  const s2 = await pic(p, `s${id}-1-load-pressed`)
  judge(`${id}.1`, 'Original flagged → ✕ long day → AL1, and nothing more (nothing pending); the Original (👁) → "Load onto working copy"', [
    ['before: AL1, nothing pending, no marker', /AL1/.test(w.head.tag) && !/pending/.test(w.head.pending) && !w.head.nys && (!a0.panel || a0.panel.days.length === 0), [w.head.tag, w.head.pending, w.head.nys]],
    ['while the Original is looked at, the count beside the day does not say something is pending (nothing is)', !/pending/.test(face.pend), `the chip reads "${face.pend}"`],
    ['the load does not ask to discard an unpublished edit (there is none)', !/Discard\s+[1-9]/.test(ld.said.join(' | ')), ld.said.join(' → ') + (title ? ` (its hint: "${title}")` : '')]], [s1, s2])
  if (ld.armed) { const b = p.locator(`#eWeek [data-restore="${TUE}"]:visible`).first(); if (await b.count()) { await b.click(); await L.sleep(800) } }
  const toasts = await W.toasts(p)
  w = await B.work(p, TUE)
  const a1 = await B.auth(p, TUE)
  const it = a1.win && a1.win.out ? a1.win.out.out : []
  const s3 = await pic(p, `s${id}-2-after-load`)
  judge(`${id}.2`, 'the load carried through — the working copy is the Original; against AL1 one thing differs', [
    ['the long-day line is plain, 4 issues', !!lineOf(w.list, k.re) && !lineOf(w.list, k.re).struck && nIssues(w.list) === 4, short(w.list)], ['1 pending: "hidden → flagged again"', /^1\s*pending/.test(w.head.pending) && it.length === 1 && /hidden → flagged again/.test(it[0].chg), [w.head.pending, it.map(o => o.text)]],
    ['its message does not say an unpublished edit was replaced', !/[1-9]\d* unpublished edits? replaced/i.test(toasts.join(' | ')), toasts]], [s3, ...(a1.win ? a1.win.shots : [])])
})
/* 3e — the same shape with an ORDINARY edit instead of a hide, for comparison (recorded, not judged): a remark typed,
   AL1 published with it, nothing pending, a look at the Original, Load. */
await run('3e', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE)
  await W.showDay(p, TUE)
  const key = await p.evaluate(i => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-txt^="fr:"]`)].find(x => x.offsetParent !== null); return e ? e.dataset.txt : null }, TUE)
  if (!key) { row(`${id}.1`, 'an ordinary edit for comparison', 'no remarks box found on Tuesday', 'NOT WALKED'); return }
  await W.weekText(p, key, 'WALK B REMARK')
  let w = await B.work(p, TUE)
  const pend0 = w.head.pending
  await B.pubAL(p, TUE)
  w = await B.work(p, TUE)
  await B.look(p, TUE, /^Original/)
  const face = await B.lookFace(p, TUE)
  const s1 = await pic(p, `s${id}-1-look`)
  const ld = await B.load(p, TUE, { confirm: false })
  const s2 = await pic(p, `s${id}-1-load-pressed`)
  row(`${id}.1`, 'RECORDED, for comparison — a remark typed on a Tuesday flying line after the Original (' + pend0 + '), AL1 published with it, nothing pending; the Original (👁) → "Load onto working copy"',
    `before the look: ${w.head.tag}, chip "${w.head.pending}" · while the Original is looked at the chip reads "${face.pend}" · the load: ${ld.said.join(' → ')}`, 'RECORDED', [s1, s2])
})
/* 3f — 3c's shape with ORDINARY edits, for comparison (recorded): remark A typed → AL1; remark B typed (1 pending);
   the Original (👁) → Load. What the app counts when the difference is content, not a hide. */
await run('3f', async (p, id) => {
  await B.toEdit(p); await B.pubOrig(p, TUE)
  await W.showDay(p, TUE)
  const keys = await p.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-txt^="fr:"]`)].filter(x => x.offsetParent !== null).map(e => e.dataset.txt), TUE)
  if (keys.length < 2) { row(`${id}.1`, 'ordinary edits for comparison', 'fewer than two remarks boxes found on Tuesday', 'NOT WALKED'); return }
  await W.weekText(p, keys[0], 'WALK B REMARK A')
  await B.pubAL(p, TUE)
  await B.toEdit(p); await W.showDay(p, TUE)
  await W.weekText(p, keys[1], 'WALK B REMARK B')
  const w = await B.work(p, TUE)
  await W.toastSpy(p); await W.toasts(p)
  await B.look(p, TUE, /^Original/)
  const face = await B.lookFace(p, TUE)
  const s1 = await pic(p, `s${id}-1-look`)
  const ld = await B.load(p, TUE, { confirm: true })
  const toasts = await W.toasts(p)
  const s2 = await pic(p, `s${id}-1-loaded`)
  row(`${id}.1`, 'RECORDED, for comparison — remark A typed → AL1; remark B typed on another line; the Original (👁) → "Load onto working copy" (confirmed)',
    `before the look: ${w.head.tag}, chip "${w.head.pending}" · while the Original is looked at the chip reads "${face.pend}" · the load: ${ld.said.join(' → ')} · message: ${toasts.join(' | ')}`, 'RECORDED', [s1, s2])
})
savePart(`s42-3${part === 'all' ? '' : '-' + part}`, { errors: ALLERR })
