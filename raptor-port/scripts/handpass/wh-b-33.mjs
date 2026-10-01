/* WALKER B — Astra's scenario 33: a rename of a man named in a hidden warning is a label change, not a new warning.
   Tuesday published; Static's long work day hidden (pending); the four sign over it; Static renamed on Quals. */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, short, pk, flagged } = B
const S = '33'
B.prefix('s33-')
const { browser, p, errors } = await B.world()
const LONG = /long work day/i
const lineL = list => (list.lines || []).find(x => LONG.test(x.text)) || null
async function rename(to) {
  await W.boardOff(p); await L.go(p, 'quals')
  await p.click('#qViewA').catch(() => {}); await L.sleep(250)
  if (await p.locator('#qEdit:visible').count()) { await p.click('#qEdit'); await L.sleep(300) }
  const b = p.locator('#qtbl input[data-cs="wolf"]').first()
  if (!(await b.count())) return 'no callsign box on his Quals row'
  await b.scrollIntoViewIfNeeded(); await b.fill(to); await b.press('Enter'); await b.blur().catch(() => {}); await L.sleep(600)
  const shot = await pic(p, `s${S}-quals-renamed-${to}`)
  const now = await p.evaluate(() => { const e = document.querySelector('#qtbl td.qname[data-person="wolf"]'); return e ? (e.querySelector('input') ? e.querySelector('input').value : e.textContent.trim()) : null })
  return { now, shot }
}
try {
  await B.toEdit(p)
  await B.pubOrig(p, TUE)
  const did = await B.hide(p, TUE, LONG)
  await B.sign4(p, TUE)
  let a = await B.auth(p, TUE)
  let w = await B.work(p, TUE)
  let s0 = await pic(p, `s${S}-0-signed-over-hide`)
  const it0 = a.win.out.out
  judge(`${S}.0`, 'setup: Tuesday published; ✕ on Static\'s long work day; the four sign-off selects over the pending hide', [
    ['the ✕ was pressed', did === 'pressed', did], ['1 pending, the marker reads Not yet published, the four are signed', /^1\s*pending/.test(a.head.pending) && a.head.nys === 'Not yet published' && W.signsFull(a.head), [a.head.pending, a.head.nys, a.head.signs]],
    ['"To go out" holds the one line naming Static', it0.length === 1 && /^Warning · Static — Static has a long work day/.test(it0[0].where), it0.map(i => i.text)]], [s0, a.win.shots[0]])
  const signed0 = a.head.signs.join('|')

  /* the rename */
  const rn = await rename('Statix')
  a = await B.auth(p, TUE)
  w = await B.work(p, TUE)
  let l = lineL(w.list), ps = await B.dayPucks(p, '#eWeek', TUE, 'wolf')
  const names = await p.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .puck[data-person="wolf"] .nm`)].map(e => e.innerText.trim()), TUE)
  let s1 = await pic(p, `s${S}-1-work-after-rename`), s1p = await B.puckPic(p, '#eWeek', TUE, 'wolf', `s${S}-1-work-after-rename-puck`)
  const it = a.win && a.win.out ? a.win.out.out : []
  judge(`${S}.1`, 'Quals (All, Edit): Static\'s callsign box retyped "Statix"; then Edit Schedule, Tuesday', [
    ['Quals shows the new callsign', rn.now === 'Statix', rn], ['his pucks on Tuesday read Statix', names.length > 0 && names.every(n => n === 'Statix'), names],
    ['the warning is still hidden: its line painted struck, with ↺', !!l && l.struck && l.btn === '↺', short(w.list)], ['the line now words him as Statix, and Static is gone from it', !!l && /Statix — Statix has a long work day/.test(l.text) && !/Static\b/.test(l.text), l && l.text],
    ['no second long-work-day line appeared', w.list.lines.filter(x => LONG.test(x.text)).length === 1 && w.list.lines.length === 4, short(w.list)], ['the bar still reads 3 issues', nIssues(w.list) === 3, w.list.bar],
    ['his pucks still carry no flag', ps.length > 0 && flagged(ps).length === 0, pk(ps)],
    ['still exactly 1 pending', /^1\s*pending/.test(a.head.pending), a.head.pending], ['"To go out" still holds ONE line, now worded Statix, "flagged → hidden"', it.length === 1 && /^Warning · Statix — Statix has a long work day/.test(it[0].where) && /flagged → hidden/.test(it[0].chg), it.map(i => i.text)],
    ['the four sign-offs stand, the same names', W.signsFull(a.head) && a.head.signs.join('|') === signed0, a.head.signs], ['the marker still reads Not yet published', a.head.nys === 'Not yet published', a.head.nys],
    ['Publish AL1 is still unlocked', !!a.btn && a.btn.label === 'Publish AL1' && !a.btn.locked, a.btn]], [rn.shot, s1, s1p, ...(a.win ? a.win.shots : [])])

  /* the published face */
  let m = await B.member(p, TUE, ['wolf'], `s${S}-2-member-after-rename`)
  l = lineL(m.list)
  judge(`${S}.2`, 'the member — the published face (the Original) after the rename, the hide still waiting', [
    ['4 issues; the long-work-day line is NOT struck', nIssues(m.list) === 4 && !!l && !l.struck, short(m.list)], ['it words him as Statix', !!l && /Statix/.test(l.text), l && l.text],
    ['his puck is still flagged', flagged(m.pks.wolf).length > 0, pk(m.pks.wolf)]], m.shots)

  /* publish over the standing signatures; rename once more after it is out */
  await B.admin(p)
  const h = await B.head(p, TUE)
  await W.showDay(p, TUE)
  const al = await W.publishAL(p, TUE); await L.sleep(400)
  w = await B.work(p, TUE)
  let s3 = await pic(p, `s${S}-3-AL1-out`)
  judge(`${S}.3`, 'the scheduler after a reload: the four still signed, Publish AL1 pressed without signing again', [
    ['after the reload the four sign-offs still stand', W.signsFull(h), h.signs], ['Publish AL1 was pressed', al.pressed, al], ['the day reads AL1, nothing pending', /AL1/.test(w.head.tag) && !/pending/.test(w.head.pending), [w.head.tag, w.head.pending]],
    ['the line is struck, worded Statix', !!lineL(w.list) && lineL(w.list).struck && /Statix/.test(lineL(w.list).text), short(w.list)]], [s3])
  const rn2 = await rename('Statik')
  w = await B.work(p, TUE); l = lineL(w.list)
  let s4 = await pic(p, `s${S}-4-work-second-rename`)
  m = await B.member(p, TUE, ['wolf'], `s${S}-4-member-second-rename`)
  const lm = lineL(m.list)
  judge(`${S}.4`, 'renamed again ("Statik") after AL1 went out with the hide — the working copy and the published face', [
    ['Quals shows Statik', rn2.now === 'Statik', rn2], ['working copy: the line still struck with ↺, worded Statik, 3 issues', !!l && l.struck && l.btn === '↺' && /Statik/.test(l.text) && nIssues(w.list) === 3, short(w.list) + ' ' + (l && l.text)],
    ['nothing pending, no marker', !/pending/.test(w.head.pending) && !w.head.nys, [w.head.pending, w.head.nys]],
    ['published face (AL1): the line still struck, no button, worded Statik, 3 issues', !!lm && lm.struck && !lm.btn && /Statik/.test(lm.text) && nIssues(m.list) === 3, short(m.list) + ' ' + (lm && lm.text)],
    ['his puck carries no flag', m.pks.wolf.length > 0 && flagged(m.pks.wolf).length === 0, pk(m.pks.wolf)]], [rn2.shot, s4, ...m.shots])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
