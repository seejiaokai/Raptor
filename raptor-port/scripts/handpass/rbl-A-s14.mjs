/* S14 — clear and restore take-off: B plus a second Tuesday line (timed late, not binding); clear its take-off with the landing kept; clear the landing;
   restore the take-off only; restore the landing. Once on the Board's boxes, once on the Edit Schedule week's boxes. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, clean } = K
const id = 'S14'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const { t } = await K.baseB(p)
  await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
  await K.ff(p, TUE, t.gi, fi, 'cs', 'ZU'); await K.ff(p, TUE, t.gi, fi, 'to', '15:00'); await K.ff(p, TUE, t.gi, fi, 'ld', '16:00')
  const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
  const ok = s => whole(s) && /05:00/.test(K.restText(s) || '') && /4h30/.test(K.restText(s) || '') && clean(s)
  await chk(p, `${id}.0`, `B plus a second Tuesday line ${await K.lineOf(p, TUE, t.gi, fi)} (took ${sd.took})`, ok, { monPic: true })
  /* ---- on the Board ---- */
  await K.ff(p, TUE, t.gi, fi, 'to', '')
  await chk(p, `${id}.b1`, `BOARD: the second line's take-off cleared, landing kept: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await K.ff(p, TUE, t.gi, fi, 'ld', '')
  await chk(p, `${id}.b2`, `BOARD: its landing cleared too: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await K.ff(p, TUE, t.gi, fi, 'to', '15:00')
  await chk(p, `${id}.b3`, `BOARD: take-off 15:00 restored, no landing: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await K.ff(p, TUE, t.gi, fi, 'ld', '16:00')
  await chk(p, `${id}.b4`, `BOARD: landing 16:00 restored: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  /* ---- on the Edit Schedule week ---- */
  const wk = async (field, val) => { await W.boardOff(p).catch(() => {}); await B.toEdit(p); await W.showDay(p, TUE); const el = p.locator(`#eWeek [data-txt="ff:${TUE}.${t.gi}.${fi}.${field}"]:visible`).first()
    await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await el.click(); await p.keyboard.press('Control+A')
    if (val === '') await p.keyboard.press('Backspace'); else await p.keyboard.type(val, { delay: 8 })
    await el.evaluate(e => e.blur()); await K.sleep(500) }
  await wk('to', '')
  await chk(p, `${id}.w1`, `WEEK: the second line's take-off cleared in the week's own box, landing kept: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await wk('ld', '')
  await chk(p, `${id}.w2`, `WEEK: landing cleared too: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await wk('to', '15:00')
  await chk(p, `${id}.w3`, `WEEK: take-off 15:00 restored: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  await wk('ld', '16:00')
  await chk(p, `${id}.w4`, `WEEK: landing 16:00 restored: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
  /* the first (binding) line's own landing cleared and restored: take-off stays */
  await wk('ld', '')
  const u = await K.undo(p)
  await chk(p, `${id}.u`, `Undo of that last week edit (pressed ${u.pressed}): ${await K.lineOf(p, TUE, t.gi, fi)}`, ok)
  const r = await K.redo(p)
  await chk(p, `${id}.r`, `Redo (pressed ${r.pressed}): ${await K.lineOf(p, TUE, t.gi, fi)}`, ok)
  await K.reload(p)
  await chk(p, `${id}.x`, `reload: ${await K.lineOf(p, TUE, t.gi, fi)}`, ok, { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s14', browser, errors, id)
