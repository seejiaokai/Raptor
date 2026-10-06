/* Walker D — "Publication orders": S = seat X on a new blank flying line, F = file a whole-day LL for X on Tuesday (mode 'file') or
   L = lift an LL that was there from the start (mode 'lift'), P = publish the day (Original), A = publish AL1.
   Usage: node bta-D-2.mjs <ORDER like SFPA> [file|lift] [nocycle] */
import * as D from './bta-D-lib.mjs'
const { B, K, C, W, L, TUE, ID, CSN, sleep } = D
const R = K.R
const order = (process.argv[2] || 'SFPA').toUpperCase()
const mode = process.argv[3] || 'file'
const cycle = process.argv[4] !== 'nocycle'
const letter = c => (c === 'F' && mode === 'lift') ? 'L' : c
const NAME = order.split('').map(letter).join('')
const ID_ = `PO-${NAME}`
const signsHold = c => !/not yet signed/i.test(c.hd.nys || '') && /SIGNED/.test(c.hd.signed || '')
const signsDown = c => /not yet signed/i.test(c.hd.nys || '')
const pendN = c => { const m = /^(\d+)\s*pending/i.exec(c.hd.pend || ''); return m ? +m[1] : 0 }
const flagged = c => c.lines.some(t => /(On leave but planned to fly|Downchit but planned to fly|clashes with)/.test(t)) && c.ring
const nolines = c => c.lines.length === 0 && !c.ring
const wasFlag = c => c.lines.length > 0 || c.ring
const say = (w, f, l) => `WORKING: ${D.sayCard(w)}  ||  FACE (View-only Sched): ${D.sayCard(f)}${l ? '  ||  LOOK (👁 Original): ' + D.sayCard(l) : ''}`
const shots = (...x) => x.flatMap(c => c ? [c.shot] : []).filter(Boolean)

const { browser, p, errors } = await K.fresh()
const st = { seated: false, leave: mode === 'lift', published: false, flagAtP: false, changed: false, iid: null, key: null, versions: null }
try {
  if (mode === 'lift') { const f = await D.file(p, 'LL', 'Walker D'); st.iid = f.iid }

  /* read the three surfaces (the look only once something is published) */
  async function read(tag, { pics = true, lookPics = false, look = st.published } = {}) {
    const w = await D.work(p, tag, { pic: pics, puck: false })
    const f = await D.face(p, tag, { pic: pics, puck: false })
    const l = look ? await D.lookAt(p, /Original/i, tag, { pic: lookPics, puck: false }) : null
    return { w, f, l }
  }
  /* judge a state of the world */
  function judge(s, { amended = false } = {}) {
    const flagW = st.seated && st.leave
    const bad = []
    if (flagged(s.w) !== flagW || (!flagW && !nolines(s.w))) bad.push(`working copy: expected ${flagW ? 'the red line and ring' : 'no absence line and no ring'}`)
    if (!st.published) { if (flagged(s.f) !== flagW) bad.push('View-only Sched (nothing published yet, so it shows the draft) does not agree with the working copy') }
    else {
      const faceExp = amended ? flagW : st.flagAtP
      if (flagged(s.f) !== faceExp) bad.push(`published face: expected ${faceExp ? 'the red line and ring' : 'clean'}`)
      if (s.l && !s.l.err && flagged(s.l) !== st.flagAtP) bad.push('👁 Original changed from what went out')
      if (s.l && s.l.err) bad.push('👁 look: ' + s.l.err)
      const n = pendN(s.w)
      if (amended || !st.changed) { if (n !== 0) bad.push(`reads "${s.w.hd.pend}" with nothing changed since the issue`); if (!signsHold(s.w)) bad.push('sign-offs not holding') }
      else if (flagW !== st.flagAtP) { if (n < 1) bad.push('warning appeared/vanished on the working copy but the day does not read pending'); if (!signsDown(s.w)) bad.push('sign-offs not taken down') }
    }
    return bad
  }
  const verdict = bad => bad.length ? 'FAIL' : 'PASS'
  let k = 0
  for (const raw of order) {
    const c = letter(raw)
    k++
    const tag = `dk-${NAME}-${k}${c}`
    let did = '', extra = '', s = null, amended = false, bad = []
    if (c === 'S') {
      const r = await D.seatBlank(p); st.seated = true; st.key = r.key; if (st.published) st.changed = true
      did = `${CSN} put on a new blank flying line ("+ Wave" → Flying wave, no times; took ${r.took})`
    } else if (c === 'F') {
      const f = await D.file(p, 'LL', 'Walker D'); st.iid = f.iid; st.leave = true; if (st.published) st.changed = true
      did = `local leave (LL) all Tuesday filed for ${CSN} on the Inputs page (asked: ${f.asked.join(',') || 'nothing'})`
    } else if (c === 'L') {
      const r = await D.lift(p, st.iid); st.leave = false; if (st.published) st.changed = true
      did = `the leave that was there from the start lifted on the Inputs page (${r})`
    } else if (c === 'P') {
      const flagW = st.seated && st.leave
      const r = await D.pub(p); st.published = true; st.flagAtP = flagW; st.changed = false
      did = `the day signed (four boxes) and published as Original (${JSON.stringify(r.r)})`
    } else if (c === 'A') {
      const probe = await D.work(p, tag + '-pre', { pic: false, puck: false })
      const btn = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-alpub="${i}"]`); return b ? { label: b.innerText.trim(), disabled: b.disabled, title: b.title } : null }, TUE)
      const flagW = st.seated && st.leave
      const r = await D.amend(p)
      const vs = await D.versionsOf(p)
      st.versions = vs
      const nothing = !st.changed
      did = `AL1 step: the day's Publish-AL1 button before signing: ${JSON.stringify(btn)}; four boxes signed and pressed → ${JSON.stringify(r.r)}; versions offered now ${JSON.stringify(vs)}`
      if (nothing) { if (vs.length > 1) bad.push('an amendment was created although nothing had changed since the issue'); amended = false }
      else { if (vs.length !== 2) bad.push(`expected Original + AL1, got ${JSON.stringify(vs)}`); amended = true }
      if (!nothing) { st.flagAtPface = flagW }
    }
    s = await read(tag, { pics: true, lookPics: c === 'P' || c === 'A' })
    bad.push(...judge(s, { amended }))
    R(`${ID_}.${k}${c}`, did, say(s.w, s.f, s.l) + ` · pending chip "${s.w.hd.pend}" · day head "${s.w.hd.tag}"`, verdict(bad), shots(s.w, s.f, s.l))
    if (bad.length) console.log('   BAD: ' + bad.join(' | '))

    /* Undo -> look -> Redo -> look -> reload -> look, on the step just before the amendment (or at the end when there is none) */
    const lastMut = Math.max(...order.split('').map((x, i) => 'SFL'.includes(letter(x)) ? i : -1)) + 1
    if (cycle && k === lastMut) {
      const before = { flag: flagged(s.w), pend: s.w.hd.pend, nys: s.w.hd.nys, faceFlag: flagged(s.f) }
      const u = await D.undo(p); const su = await read(tag + '-undo', { pics: true, look: false })
      R(`${ID_}.${k}${c}-undo`, `Undo (top bar ${JSON.stringify({ t: u.title, pressed: u.pressed })})`, say(su.w, su.f, null), 'RECORDED', shots(su.w, su.f))
      const r2 = await D.redo(p); const sr = await read(tag + '-redo', { pics: true, look: false })
      const same = flagged(sr.w) === before.flag && sr.w.hd.pend === before.pend && !!sr.w.hd.nys === !!before.nys && flagged(sr.f) === before.faceFlag
      R(`${ID_}.${k}${c}-redo`, `Redo (top bar ${JSON.stringify({ t: r2.title, pressed: r2.pressed })})`, say(sr.w, sr.f, null) + ` · back to the same as before the Undo: ${same}`, same ? 'PASS' : 'FAIL', shots(sr.w, sr.f))
      await D.reload(p); const sl = await read(tag + '-reload', { pics: true, look: st.published, lookPics: false })
      const same2 = flagged(sl.w) === before.flag && sl.w.hd.pend === before.pend && !!sl.w.hd.nys === !!before.nys && flagged(sl.f) === before.faceFlag
      R(`${ID_}.${k}${c}-reload`, 'page reloaded and signed in again', say(sl.w, sl.f, sl.l) + ` · the same as before the Undo: ${same2}`, same2 ? 'PASS' : 'FAIL', shots(sl.w, sl.f, sl.l))
    }
  }
} catch (e) { R(ID_, 'script', String(e.stack || e).slice(0, 800), 'FAIL', [await B.pic(p, ID_ + '-X')]) }
R(`${ID_}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart(ID_)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${String(r.saw).slice(0, 1800)}\n      pics ${(r.pics || []).join(' ')}`)
