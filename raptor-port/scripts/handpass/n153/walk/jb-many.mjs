// jb-many v1 - a master admin moving through many squadrons: four made through Admin, Squadrons, "+ New squadron", each given its
// own course and its own count of marks; every one read back after a tour, after Undo in each, and after a reload. Then a pick made
// straight on top of a save and straight on top of a mark: the change must land on the squadron it was made in.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, addEvent, hasEv, ask } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, mark, makeSquadron, reload, vclick } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const P = (process.env.PARTS || 'a,b,c').split(',')
const tag = `many-${SZ}-${P.join('')}`
console.log('jb-many v1', SZ)
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 800) }
const EV = ['ST-01', 'ACG-01', 'ST-02', 'ACG-02', 'ACG-03', 'ACG-04']
const SQ = { 142: 6, 149: 5, 150: 1, 151: 2, 152: 3, 153: 4 }
const own = (f, u, n) => (f.sq || '').startsWith(u) && f.done === n && (f.courses || []).includes('JB' + u) && (f.courses || []).filter(c => /^JB/.test(c)).length === 1
async function tour(s, label, want) {
  const bad = []
  for (const u of Object.keys(want)) { await to(s, u); const f = await onSeed(s); if (!own(f, u, want[u])) bad.push(`${u}: ${short(f)}`) }
  check(`${label}: all ${Object.keys(want).length} squadrons show only their own`, bad.length === 0, bad.length ? bad : Object.entries(want).map(([u, n]) => `${u}=${n}`).join(' '))
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a')
  for (const u of [150, 151, 152, 153]) check(`made ${u}`, await makeSquadron(s, u), String(u))
  for (const u of Object.keys(SQ)) { await to(s, u); await dress(s, u, EV.slice(0, SQ[u])) }
  const want = { ...SQ }
  if (P.includes('a')) await step('a tour', async () => { await tour(s, 'tour', want); await pic(s, 'a-tour-end') })
  if (P.includes('a')) await step('Undo in each, last made first', async () => {
    for (const u of ['153', '150', '149', '142']) {
      await to(s, u); await onSeed(s); const b = await fp(s); await press(s, '#trUndoBtn', `undo-${u}`); await wait(s, 400); const a = await fp(s)
      check(`Undo on ${u} takes one of ${u}'s own`, a.done === b.done - 1 && a.sq === u, `${b.done} -> ${short(a)}`); want[u] = a.done
    }
    await tour(s, 'after four Undos', want); await pic(s, 'b-after-undos')
  })
  if (P.includes('a')) await step('Redo in a different order', async () => {
    for (const u of ['142', '153', '150', '149']) {
      await to(s, u); await onSeed(s); const b = await fp(s); await press(s, '#trRedoBtn', `redo-${u}`); await wait(s, 400); const a = await fp(s)
      check(`Redo on ${u} puts back ${u}'s own`, a.done === b.done + 1 && a.sq === u, `${b.done} -> ${short(a)}`); want[u] = a.done
    }
    await tour(s, 'after four Redos', want)
  })
  if (P.includes('b')) await step('a pick straight on top of a mark', async () => {
    await to(s, '151'); await onSeed(s)
    const ball = page.locator('#page-tracker g.ball[data-id="ACG-05"]').first(); await ball.scrollIntoViewIfNeeded().catch(() => {}); await wait(s, 100); const r = await ball.boundingBox()
    if (s.desk) await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2); else await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2)
    await page.waitForSelector('#pop .opts button', { state: 'visible', timeout: 2500 })
    const o = page.locator('#pop .opts button[data-g="dco"]').first(); await (s.desk ? o.click() : o.tap()); want[151] += 1
    await pickSq(s, '152'); await shut(s); await wait(s, 900); const f = await onSeed(s)
    check('the pick landed on 152 with 152 alone', own(f, '152', want[152]), short(f)); await tour(s, 'after a pick on top of a mark', want); await pic(s, 'c-after')
  })
  if (P.includes('b')) await step('a pick straight on top of a chart save', async () => {
    await to(s, '152'); await onSeed(s); check('draft on 152', await addEvent(s, 'JBMANY'), 'JBMANY')
    const sv = page.locator('#saveChanges').filter({ visible: true }).first(); await (s.desk ? sv.click() : sv.tap())
    await pickSq(s, '153'); await wait(s, 500)
    const q = await ask(s); note('asked after the save press:', JSON.stringify(q.msg)); await pic(s, 'd1-pick-on-save')
    if (q.msg) { note('answering Stay'); await press(s, '#dlgCancel'); await wait(s, 500); await shut(s) } else await shut(s)
    await wait(s, 900)
    await to(s, '153'); const a = await onSeed(s); check('153 did not get the chart edit', !(await hasEv(s, 'JBMANY')) && own(a, '153', want[153]), short(a))
    await to(s, '152'); const b = await onSeed(s); check('152 holds the saved edit, nothing unsaved', (await hasEv(s, 'JBMANY')) && !b.dirty, short(b)); await pic(s, 'd2-152')
    for (const u of ['142', '149', '150', '151']) { await to(s, u); const f = await onSeed(s); check(`${u} has no JBMANY`, !(await hasEv(s, 'JBMANY')), short(f)) }
  })
  if (P.includes('c')) await step('a reload', async () => {
    note('reload', JSON.stringify(await reload(s)))
    await tour(s, 'after a reload', want); await pic(s, 'e-after-reload')
    const f = await fp(s); check('Undo starts empty after the reload', f.undo?.off === true, f.undo)
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
