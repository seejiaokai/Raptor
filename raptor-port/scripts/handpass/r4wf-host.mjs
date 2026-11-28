// r4wf — the host's own walk (chat 170's helper, 25 Nov 26), run on main's build and on the fixed build, each line an
// assertion of the RIGHT behaviour: the Board's other sections keep up while he types, the section he types in is not
// redrawn under him, the section he leaves catches up (Fable's B3), Undo / Redo pressed, a shared input, the week and a
// reload; and ordinary passing notes measured, so a change of their look shows. Run:
//   WR4_OUT=docs/img/handpass/2026-11-25-r4-walk-faults/host-<build> WR4_NEW=<build folder> node scripts/handpass/r4wf-host.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const res = [], J = JSON.stringify
const add = (id, verdict, what, pic = '') => { res.push([id, verdict, what, pic]); console.log('RESULT', id, '|', verdict, '|', what) }
const pic = async (p, name) => { await p.screenshot({ path: `${process.env.WR4_OUT}/${name}.png` }); return `${name}.png` }

async function board(w, tag, spec) {
  const p = w.page
  const iid = await L.fileInput(w, tag, L.WED, spec)
  await go(p, 'editsched')
  await p.evaluate(() => window.openScheduler(window.DAYS.findIndex(d => d.dt === 'Jul 15'))); await sleep(800)
  if (!(await p.locator(`#schedBoard [data-ifld^="${iid}"][data-ifld$=".str"]`).first().isVisible().catch(() => false))) {
    const ph = p.locator('#schedBoard [data-pitog]').first(); if (await ph.count()) { await (w.tap ? ph.tap() : ph.click()); await sleep(400) }
  }
  const di = await p.evaluate(() => window.DAYS.findIndex(d => d.dt === 'Jul 15'))
  const gk = await p.evaluate(([di, id]) => { const ri = (window.DAYS[di].ground || []).findIndex(r => r.src === id); return ri < 0 ? null : `gr:${di}.${ri}` }, [di, iid])
  return { iid, di, gk }
}
const val = (p, sel) => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 2); return e ? e.value ?? e.textContent : null }, sel)
const secs = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > *')].map(e => e.getAttribute('data-secmove') || e.className.split(' ').slice(0, 2).join('.')))
const caret = p => p.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || a.getAttribute('data-itline') || a.tagName) + (a.closest('#schedBoard') ? '@board' : '') : 'none' })
async function typeIn(w, sel, v) {
  const b = w.page.locator(sel).first(); await b.scrollIntoViewIfNeeded()
  if (w.tap) await b.tap(); else await b.click(); await sleep(200)
  if (v != null) { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(v) }
  await w.page.keyboard.press('Tab'); await sleep(450)
}

async function boardRun(size, engine) {
  const tag = `${size}-${engine}`
  const w = await newPage(size, undefined, L.NEW_DIR, engine); await signIn(w, 'ad'); log(tag, 'bundle ' + await bundleOf(w.page))
  const p = w.page
  try {
    /* H1 — W1 steps 5–10: the Ground Programme row's own START typed; the Personal Inputs row follows at once */
    const { iid, di, gk } = await board(w, tag, { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
    add(`H0 ${tag} the day panel's blocks`, 'RECORD', J(await secs(p)))
    const PI = f => `#schedBoard [data-ifld="${iid}.${f}"]`, GR = f => `#schedBoard [data-bfld="${gk}.${f}"]`
    await typeIn(w, PI('str'), '0900')
    await typeIn(w, GR('str'), '0830')
    const a = { pi: await val(p, PI('str')), gr: await val(p, GR('str')), caret: await caret(p), rec: (await L.recOf(p, iid)).s }
    add(`H1 ${tag} ground START 0830 typed: Personal Inputs reads it at once`, a.pi === '08:30' && a.gr === '08:30' && a.caret.endsWith('@board') && a.rec === 510 ? 'PASS' : 'FAIL', J(a), await pic(p, `h1-${tag}-ground-0830`))
    /* H2 — Fable's B3: Personal Inputs start typed, then a box of ANOTHER section clicked, nothing typed: the section left
       is written at once (its start box a new node), the caret in the new box */
    await typeIn(w, PI('str'), '0800')
    await p.evaluate(s => document.querySelector(s)?.setAttribute('data-r4old', '1'), PI('str'))
    const other = '#schedBoard [data-bfld^="d:"][data-bfld$=".str"], #schedBoard [data-bfld^="g:"][data-bfld$=".str"]'
    const o = p.locator(`#schedBoard [data-bfld="${gk}.rmks"]`).first(); await o.scrollIntoViewIfNeeded()
    if (w.tap) await o.tap(); else await o.click(); await sleep(500)
    const b3 = { leftWritten: await p.evaluate(s => !document.querySelector(s)?.hasAttribute('data-r4old'), PI('str')), caret: await caret(p), pi: await val(p, PI('str')) }
    add(`H2 ${tag} B3: another section's box clicked, nothing typed — the section left is written`, b3.leftWritten && b3.caret.startsWith(`${gk}.rmks`) ? 'PASS' : 'FAIL', J(b3), await pic(p, `h2-${tag}-b3`))
    void other
    /* H3 — W5 (b): start typed, Tab; the Board's own Undo pressed, then Redo — both rows follow, sections once */
    await typeIn(w, PI('str'), '0915')
    const undo = p.locator('#schedBoard button[aria-label^="Undo"], #schedBoard [data-sbundo], #sbUndo').first()
    const redo = p.locator('#schedBoard button[aria-label^="Redo"], #schedBoard [data-sbredo], #sbRedo').first()
    if (await undo.count()) {
      if (w.tap) await undo.tap(); else await undo.click(); await sleep(700)
      const u = { pi: await val(p, PI('str')), gr: await val(p, GR('str')), rec: (await L.recOf(p, iid)).s, secs: await secs(p), caret: await caret(p) }
      add(`H3 ${tag} Undo after 0915: both rows back to 08:00, each section once`, u.rec === 480 && u.gr === '08:00' && new Set(u.secs).size === u.secs.length ? 'PASS' : 'FAIL', J(u), await pic(p, `h3-${tag}-undo`))
      if (w.tap) await redo.tap(); else await redo.click(); await sleep(700)
      const r = { pi: await val(p, PI('str')), gr: await val(p, GR('str')), rec: (await L.recOf(p, iid)).s }
      add(`H3 ${tag} Redo: both rows 09:15`, r.rec === 555 && r.gr === '09:15' ? 'PASS' : 'FAIL', J(r), await pic(p, `h3-${tag}-redo`))
    } else add(`H3 ${tag} Undo`, 'NOT WALKED', 'no Undo button found on the Board')
    /* H4 — the Board closed by its own ✓ Done, the week's two rows, reopened, a reload */
    await p.mouse.click(3, 3); await sleep(300)
    const done = p.locator('#sbDone:visible, #sbClose:visible').first()
    if (await done.count()) { if (w.tap) await done.tap(); else await done.click(); await sleep(700) }
    const wk = { open: await p.evaluate(() => window.SBDAY), weekGround: await val(p, `#eWeek [data-txt="${gk}.str"]`), weekPI: await val(p, `#eWeek [data-inp^="${iid}"][data-inp$=".str"]`), rec: (await L.recOf(p, iid)).s }
    add(`H4 ${tag} the Board closed: the week reads the saved start`, wk.weekGround === '09:15' && (wk.weekPI == null || wk.weekPI === '09:15') ? 'PASS' : 'FAIL', J(wk), await pic(p, `h4-${tag}-week`))
    await p.reload(); await p.waitForSelector('#vWeek .day, #luser', { state: 'attached' }); await sleep(800)
    const r2 = await L.recOf(p, iid)
    add(`H4 ${tag} after a reload`, r2 && r2.s === 555 && r2.e === 600 ? 'PASS' : 'FAIL', J({ s: r2?.s, e: r2?.e }))
    /* H5 — W2 (a): a shared input (Ranger and Hex); its end typed under Personal Inputs: the one Ground Programme row reads it */
    if (await p.locator('#luser').isVisible().catch(() => false)) await signIn(w, 'ad')
    await p.evaluate(() => window.go('viewsched')); await sleep(600)
    const s = await board(w, tag + '-shared', { type: 'Training', people: [L.RANGER, L.HEX], from: '13:00', to: '14:00', title: 'Sim brief' })
    const sPI = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard [data-ifld^="${id}"][data-ifld$=".end"]`)].map(e => e.getAttribute('data-ifld'))[0], s.iid)
    if (sPI && s.gk) {
      await typeIn(w, `#schedBoard [data-ifld="${sPI}"]`, '1430')
      const sh = { gr: await val(p, `#schedBoard [data-bfld="${s.gk}.end"]`), caret: await caret(p), people: await p.evaluate(k => document.querySelector(`#schedBoard [data-bfld="${k}.end"]`)?.closest('.sb-arow')?.querySelectorAll('.rpuck, .puck, [data-person]').length, s.gk) }
      add(`H5 ${tag} a shared input's end typed: its one Ground Programme row reads it at once`, sh.gr === '14:30' && sh.caret.endsWith('@board') ? 'PASS' : 'FAIL', J(sh), await pic(p, `h5-${tag}-shared`))
    } else add(`H5 ${tag} shared input`, 'NOT WALKED', J({ sPI, gk: s.gk }))
  } catch (e) { add(`H ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 200)) }
  await w.ctx.close()
}

/* N2 — ordinary notes measured: their box, lines and colour, a phone (WebKit) and a desktop */
async function notesRun(size, engine) {
  const tag = `${size}-${engine}`
  const w = await newPage(size, undefined, L.NEW_DIR, engine); await signIn(w, 'ad')
  const p = w.page
  const NOTES = [['plain', 'Input added', undefined], ['amber', 'Saber is not current for this shift — check his quals before he flies', 'warn'], ['red', 'Crew rest breach: Saber has 9H between his landing and his next brief', 'hard'], ['blocked', 'Blocked: Saber is already on that seat.', 'blocked'], ['receipt', 'Published AL1 · 14 items on Sat only · approved by Anvil · No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War.', undefined]]
  for (const [name, msg, kind] of NOTES) {
    const m = await p.evaluate(([msg, kind]) => {
      window.toast(msg, kind)
      const t = document.getElementById('toastEl'), r = t.getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(t)
      const lines = new Set([...g.getClientRects()].map(x => Math.round(x.top))).size, cs = getComputedStyle(t)
      return { l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), lines, color: cs.color, border: cs.borderTopColor, at: t.dataset.at }
    }, [msg, kind])
    await sleep(250)
    add(`N2 ${tag} ${name}`, 'RECORD', J(m), await pic(p, `n2-${tag}-${name}`))
  }
  await w.ctx.close()
}
await boardRun('desk', 'chromium')
await boardRun('phone', 'webkit')
await notesRun('desk', 'chromium')
await notesRun('phone', 'webkit')
facts.results = res
await finish()
console.log('errors:', facts.errors.length, facts.errors.slice(0, 6))
