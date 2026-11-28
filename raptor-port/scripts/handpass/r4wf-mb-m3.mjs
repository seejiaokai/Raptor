// r4wf-mb-m3 — merge walk, Share B, M3 (Astra's M3): a shared Meeting for Ranger + Hex 08:00–12:00 on Wed 15 Jul (it lands
// on the Ground Programme and under Personal Inputs); Personal Inputs open. Clear the Meeting's Ground Programme End;
// click directly into its Personal Inputs Start, type 0900, Tab.
// EXPECTED (brief): ONE input, both men, throughout (D739); RECORD the times saved after each step; every box of both
// rows agrees with the store once the caret has left, and on the merged build the Ground Programme row agrees while the
// caret is still under Personal Inputs.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-m3.mjs
import { L, J, sleep, add, done, world, openBoard, pic, caretAt, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-m3 v1', BUILD, TAG)
const steps = [], pics = [], notes = []
const TYPE = process.env.MTYPE || 'Meeting'
try {
  const w = await world(); const p = w.page
  await L.openDay(w, L.WED); await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
  const types = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop #inpEditType option')].map(o => o.value + '=' + o.textContent.trim()))
  notes.push('input types offered: ' + J(types))
  await p.keyboard.press('Escape'); await sleep(300)
  const d = p.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {})
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
  const tv = types.map(t => t.split('=')).find(([v, t]) => t.toLowerCase() === TYPE.toLowerCase() || v.toLowerCase() === TYPE.toLowerCase())
  if (!tv) throw new Error('no type ' + TYPE)
  const before = await L.ids(p)
  const iid = await L.fileInput(w, TAG, L.WED, { type: tv[0], people: [L.RANGER, L.HEX], from: '08:00', to: '12:00', title: 'Shared meeting' })
  if (!iid) throw new Error('not filed; new ids ' + J((await L.ids(p)).filter(x => !before.includes(x))))
  await openBoard(w)
  /* Personal Inputs open */
  const shown = () => p.evaluate(id => [...document.querySelectorAll('#sbBoard > [data-secmove$=".inputs"] [data-ifld]')].filter(e => e.getAttribute('data-ifld').startsWith(id) && e.getBoundingClientRect().height > 0).length, iid)
  if (!(await shown())) { await clickNow(w, '#schedBoard [data-pitog]'); await sleep(500) }
  notes.push('Personal Inputs boxes of the meeting shown: ' + await shown())
  const look = async label => {
    const o = await p.evaluate(id => {
      const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
      const r = window.INPUTS.filter(x => String(x.iid) === id || ((x.people || []).some(y => y.p === 'bane' || y.p === 'rocky') && x.date === 'Jul 15' && x.type === window.INPUTS.find(z => String(z.iid) === id)?.type))
      const gi = (window.DAYS[2].ground || []).map((g, i) => ({ g, i })).filter(({ g }) => r.some(x => String(x.iid) === g.src))
      const gBoxes = gi.map(({ g, i }) => { const v = f => document.querySelector(`#schedBoard [data-bfld="gr:2.${i}.${f}"]`)?.value ?? '∅'; return `gr:2.${i} src=${g.src} who=${g.who} day-row ${g.str}-${g.end} boxes ${v('str')}-${v('end')} "${v('rmks')}"` })
      const pBoxes = [...document.querySelectorAll('#sbBoard > [data-secmove$=".inputs"] [data-ifld$=".str"]')].filter(e => r.some(x => e.getAttribute('data-ifld').startsWith(String(x.iid)))).map(e => { const k = e.getAttribute('data-ifld').replace(/\.str$/, ''); const row = e.closest('[data-inprow]') || e.parentElement.parentElement; return `${k} ${e.value}-${document.querySelector(`#schedBoard [data-ifld="${k}.end"]`)?.value ?? '∅'} who=${[...(row?.querySelectorAll('[data-person]') || [])].map(x => x.getAttribute('data-person')).join('+')}` })
      return { store: r.map(x => `${x.type} ${(x.people || []).map(y => y.p).join('+')} ${x.allday ? 'allday' : hm(x.s) + '-' + hm(x.e)} [${x.iid}]`), ground: gBoxes, personal: pBoxes }
    }, iid)
    o.step = label; o.caretAt = await caretAt(p)
    /* agreement: every Ground and Personal Inputs box against the record */
    const rec = o.store.find(s => s.endsWith(`[${iid}]`)) || ''
    const tm = (rec.match(/ (\d\d:\d\d|)-(\d\d:\d\d|) \[/) || []).slice(1)
    o.disagree = [...o.ground.filter(g => !g.includes(`boxes ${tm[0]}-${tm[1]}`)), ...o.personal.filter(x => !x.includes(` ${tm[0]}-${tm[1]} `))]
    if (/allday/.test(rec)) o.disagree = ['(all day — boxes listed for reading)']
    steps.push(o); console.log('LOOK', J(o)); return o
  }
  await look('filed')
  pics.push(await pic(w, 'm3-0-ground', ['#sbBoard > [data-secmove$=".ground"]']))
  pics.push(await pic(w, 'm3-0-personal', ['#sbBoard > [data-secmove$=".inputs"]']))
  const gk = (await look('read')).ground[0]?.split(' ')[0]
  steps.pop()
  if (!gk) throw new Error('the meeting has no Ground Programme row')
  /* 1. clear the Ground Programme End (nothing typed after the clear) */
  await clickNow(w, `#schedBoard [data-bfld="${gk}.end"]`); await sleep(250)
  await p.keyboard.press('Control+A'); await p.keyboard.press('Delete')
  await look('Ground End cleared, caret still in it')
  /* 2. click directly into its Personal Inputs Start */
  const pk = (await p.evaluate(id => document.querySelector(`#sbBoard > [data-secmove$=".inputs"] [data-ifld^="${id}"][data-ifld$=".str"]`)?.getAttribute('data-ifld'), iid))
  if (!pk) throw new Error('no Personal Inputs start box for the meeting')
  await clickNow(w, `#schedBoard [data-ifld="${pk}"]`); await sleep(400)
  await look('Personal Inputs Start clicked (caret under Personal Inputs)')
  pics.push(await pic(w, 'm3-1-ground-caret-in-personal', ['#sbBoard > [data-secmove$=".ground"]']))
  pics.push(await pic(w, 'm3-1-personal', ['#sbBoard > [data-secmove$=".inputs"]']))
  await p.keyboard.press('Control+A'); await p.keyboard.type('0900'); await p.keyboard.press('Tab'); await sleep(650)
  await look('0900, Tab (caret under Personal Inputs)')
  pics.push(await pic(w, 'm3-2-ground-after-tab', ['#sbBoard > [data-secmove$=".ground"]']))
  pics.push(await pic(w, 'm3-2-personal', ['#sbBoard > [data-secmove$=".inputs"]']))
  await p.mouse.click(3, 3); await sleep(700)
  await look('caret left')
  pics.push(await pic(w, 'm3-3-ground-left', ['#sbBoard > [data-secmove$=".ground"]']))
  pics.push(await pic(w, 'm3-3-personal-left', ['#sbBoard > [data-secmove$=".inputs"]']))
  const oneInput = steps.every(s => s.store.length === 1 && /bane\+rocky|rocky\+bane/.test(s.store[0]))
  const leftAgree = !steps.at(-1).disagree.length
  const whileIn = steps.filter(s => /caret under Personal/.test(s.step))
  const groundWhileIn = whileIn.every(s => s.ground.every(g => !s.disagree.includes(g)))
  const v = oneInput && leftAgree && (BUILD === 'main' || groundWhileIn) ? 'PASS' : 'FAIL'
  add('M3', v, { oneInput, leftAgree, groundAgreesWhileCaretInPersonal: groundWhileIn, notes, steps }, pics)
} catch (e) { add('M3', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps }).slice(0, 3000), pics) }
await done('m3')
