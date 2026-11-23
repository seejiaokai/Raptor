// jb-s28c v1 - S28's doors with a question of their own: Duplicate syllabus (Yes / No, only in the copy / Cancel, then the name
// cancelled or given), Rename syllabus and Delete syllabus, each over an unsaved chart edit. What each does with the draft.
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut, step, check, press, addEvent, hasEv, ask } from './jlib.mjs'
import { dress, fp, short, wait, onSeed, vclick } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
const tag = `s28c-${SZ}`
console.log('jb-s28c v1', SZ)
picsFor(tag)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1000) }
const menu = async (s, item) => { await vclick(s, '#sylMenuBtn'); await wait(s, 200); await vclick(s, item); await wait(s, 400) }
const prompt = s => s.page.locator('#dlgInput').filter({ visible: true }).count()
/* a syllabus he has edited wears a pencil after its name in the list: the name is read without it */
const syl = s => s.page.evaluate(() => { const c = t => t.replace('✎', '').trim(); const e = document.getElementById('sylSel'); return { cur: c(e.selectedOptions[0]?.text || ''), all: [...e.options].map(o => c(o.text)) } })
async function toSyl(s, name) { const v = await s.page.evaluate(n => { const e = document.getElementById('sylSel'); return [...e.options].find(o => o.text.replace('✎', '').trim() === n)?.value }, name); if (v) { await s.page.selectOption('#sylSel', v); await wait(s, 600) } return !!v }
let n = 0
const draft = async s => { const name = `JC${++n}Q`; await onSeed(s); await toSyl(s, '2026'); await wait(s, 200); check(`draft ${name}`, await addEvent(s, name), name); return name }
const clearDraft = async s => { const f = await fp(s); if (f.dirty) { await vclick(s, '#saveChanges'); await wait(s, 600) } }
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01']); await to(s, '149'); await dress(s, '149', ['ST-01']); await to(s, '142'); await onSeed(s)
  await step('Duplicate: Cancel', async () => {
    const d = await draft(s); await menu(s, '#dupSyl'); const q = await ask(s); note('asks', JSON.stringify(q.msg), JSON.stringify(q.btns)); await pic(s, 'a1-asked')
    await press(s, '#dlgCancel', 'a2'); await wait(s, 400); const f = await fp(s)
    check('Duplicate Cancel: the draft is kept, no copy', f.dirty && await hasEv(s, d) && (await syl(s)).all.length === 4, { f: short(f), syl: await syl(s) }); await clearDraft(s)
  })
  await step('Duplicate: No, only in the copy, then the name cancelled', async () => {
    const d = await draft(s); await menu(s, '#dupSyl'); await press(s, '#dlgAlt', 'b1'); await wait(s, 400)
    const q = await ask(s); note('next', JSON.stringify(q.msg), 'name box', await prompt(s)); await pic(s, 'b1-next')
    if (await prompt(s)) { await press(s, '#dlgCancel', 'b2'); await wait(s, 500) }
    const f = await fp(s); const y = await syl(s); const still = await hasEv(s, d)
    note(`RECORD No then name cancelled: dirty ${f.dirty}, draft drawn ${still}, syllabus ${y.cur}, list ${y.all.join('/')}`); await pic(s, 'b2-after')
    check('No + cancelled name: no copy was made', y.all.length === 4, y.all)
    check('No + cancelled name: what is drawn agrees with the unsaved mark', f.dirty === still, { dirty: f.dirty, drawn: still })
    await clearDraft(s)
  })
  await step('Duplicate: No, only in the copy, then a name', async () => {
    const d = await draft(s); await menu(s, '#dupSyl'); await press(s, '#dlgAlt', 'c1'); await wait(s, 400)
    if (await prompt(s)) { await s.page.locator('#dlgInput:visible').first().fill('JCOPY1'); await vclick(s, '#dlgOk'); await wait(s, 900) }
    for (let i = 0; i < 2; i++) { const q = await ask(s); if (q.msg) { note('then', JSON.stringify(q.msg)); await press(s, q.btns.some(b => /dlgOk/.test(b)) ? '#dlgOk' : '#dlgCancel'); await wait(s, 400) } }
    const y = await syl(s); const inCopy = await hasEv(s, d); note('on', y.cur, 'event drawn', inCopy); await pic(s, 'c2-copy')
    check('No + name: the copy holds the edit', y.all.includes('JCOPY1') && inCopy, { y, inCopy })
    await toSyl(s, '2026'); await wait(s, 400); const f = await fp(s)
    check('No + name: 2026 does not hold it', !(await hasEv(s, d)) && !f.dirty, short(f)); await pic(s, 'c3-2026')
  })
  await step('Duplicate: Yes, on both', async () => {
    const d = await draft(s); await menu(s, '#dupSyl'); await press(s, '#dlgOk', 'd1'); await wait(s, 400)
    if (await prompt(s)) { await s.page.locator('#dlgInput:visible').first().fill('JCOPY2'); await vclick(s, '#dlgOk'); await wait(s, 900) }
    for (let i = 0; i < 2; i++) { const q = await ask(s); if (q.msg) { note('then', JSON.stringify(q.msg)); await press(s, q.btns.some(b => /dlgOk/.test(b)) ? '#dlgOk' : '#dlgCancel'); await wait(s, 400) } }
    const y = await syl(s); const inCopy = await hasEv(s, d); check('Yes: the copy holds the edit', y.all.includes('JCOPY2') && inCopy, { y, inCopy })
    await toSyl(s, '2026'); await wait(s, 400); const f = await fp(s); check('Yes: 2026 holds it, saved', await hasEv(s, d) && !f.dirty, short(f)); await pic(s, 'd2-2026')
  })
  await step('Rename syllabus: Cancel and a new name', async () => {
    const d = await draft(s); await menu(s, '#renSyl'); note('box', await prompt(s)); await press(s, '#dlgCancel', 'e1'); await wait(s, 350)
    let f = await fp(s); check('Rename Cancel: the draft is kept', f.dirty && await hasEv(s, d), short(f))
    await menu(s, '#renSyl'); await s.page.locator('#dlgInput:visible').first().fill('2026R'); await vclick(s, '#dlgOk'); await wait(s, 800)
    const q = await ask(s); if (q.msg) { note('after rename', JSON.stringify(q.msg)); await press(s, q.btns.some(b => /dlgCancel/.test(b)) ? '#dlgCancel' : '#dlgOk'); await wait(s, 300) }
    f = await fp(s); const y = await syl(s); check('Rename done: the draft is still there and unsaved', y.all.includes('2026R') && f.dirty && await hasEv(s, d), { f: short(f), y: y.cur }); await pic(s, 'e2-renamed')
    await clearDraft(s); await menu(s, '#renSyl'); await s.page.locator('#dlgInput:visible').first().fill('2026'); await vclick(s, '#dlgOk'); await wait(s, 700)
  })
  await step('Delete syllabus: Cancel, then OK on a copy', async () => {
    const d = await draft(s); await menu(s, '#delSyl'); await press(s, '#dlgCancel', 'f1'); await wait(s, 350)
    const f = await fp(s); check('Delete Cancel: the draft is kept', f.dirty && await hasEv(s, d), short(f)); await clearDraft(s)
    if (await toSyl(s, 'JCOPY1')) {
      const e = `JC${++n}Q`; check('draft on the copy', await addEvent(s, e), e); await menu(s, '#delSyl'); const q = await ask(s); note('delete asks', JSON.stringify(q.msg)); await press(s, '#dlgOk', 'f2'); await wait(s, 800)
      const q2 = await ask(s); if (q2.msg) { note('then', JSON.stringify(q2.msg)); await press(s, q2.btns.some(b => /dlgOk/.test(b)) ? '#dlgOk' : '#dlgCancel'); await wait(s, 500) }
      const g = await fp(s); const y = await syl(s); check('Delete OK: the copy gone, nothing left unsaved', !y.all.includes('JCOPY1') && !g.dirty && !(await hasEv(s, e)), { g: short(g), y }); await pic(s, 'f3-deleted')
    }
  })
  await step('149 stayed itself', async () => {
    await to(s, '149'); const h = await onSeed(s); const y = await syl(s)
    check('149: its own marks and syllabus list', h.done === 1 && !y.all.some(x => /^JCOPY/.test(x)) && !(h.courses || []).includes('JB142'), { h: short(h), y: y.all }); await pic(s, 'z-149')
  })
  await s.ctx.close()
} finally { finish(tag); await closeAll() }
