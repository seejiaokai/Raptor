/* b3-05 — REGRESSION SWEEP (desktop, the error list watched): Publish day, Undo / Redo of that publish, Publish AL,
   Unpublish and its re-publish, a plan switch (and back), and the Amendments panel's own Publish button — each once,
   through the app's own controls, on the saved everything-week. Walker B3, 25 Sep 26.
   Usage (from raptor-port/): node scripts/handpass/am/b3-05-regress.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, publishAL, unpublish, head, menu, menuClose, menuSwitch, planMenuItems, check, note, summary, installToasts, takeToasts, clip, panelText, undoLabel, STATE, DESK, RESULTS } = L
import { writeFileSync } from 'node:fs'
const { browser, page, errors } = await openHi({ ...DESK, state: STATE, dpr: 1 })
await installToasts(page); await editWeek(page)
const errAt = () => errors.length
const shotHead = (name, di) => clip(page, name, `#eWeek .day[data-day="${di}"] .day-head`, { pad: 6, extraH: 30 })

/* 1. Publish day — Friday (a draft) */
let e0 = errAt()
let s = await signDay(page, 4, 0)
let hf = await head(page, 4)
check('d.R1 Fri signed by four through the selects; "Publish day" unlocks', hf.beak && !hf.beak.disabled, JSON.stringify({ s, beak: hf.beak }))
let r = await publishDay(page, 4); let t = await takeToasts(page); hf = await head(page, 4)
check('d.R1 Publish day: Fri reads ORIG, nothing pending, Unpublish offered', r.pressed && hf.tag.includes('ORIG') && !hf.pending && hf.unpub, JSON.stringify({ r, tag: hf.tag, pend: hf.pending, toasts: t }))
await shotHead('d-R1-fri-published', 4)
/* 2. Undo / Redo of the publish */
const ul = await undoLabel(page)
await page.locator('#undoBtn').click(); await page.waitForTimeout(700); t = await takeToasts(page); hf = await head(page, 4)
check('d.R2 Undo takes the publish back: Fri is a DRAFT again with its Publish day button', hf.tag.includes('DRAFT') && !!hf.beak, JSON.stringify({ undo: ul, tag: hf.tag, beak: hf.beak, toasts: t }))
await shotHead('d-R2-fri-after-undo', 4)
await page.locator('#redoBtn').click(); await page.waitForTimeout(700); t = await takeToasts(page); hf = await head(page, 4)
check('d.R2 Redo publishes it again: Fri reads ORIG', hf.tag.includes('ORIG') && !hf.pending, JSON.stringify({ tag: hf.tag, pend: hf.pending, toasts: t }))
check('d.R1-2 no browser errors in publish / undo / redo', errAt() === e0, errors.slice(e0).join(' | ').slice(0, 300))

/* 3. Publish AL — Sunday (ORIG + 1 pending) */
e0 = errAt()
let hs = await head(page, 6)
s = await signDay(page, 6, 1); hs = await head(page, 6)
check('d.R3 Sun (ORIG, 1 pending) signed: "Publish AL1" unlocks', hs.alpub && !hs.alpub.disabled && /AL1/.test(hs.alpub.text), JSON.stringify({ s, alpub: hs.alpub }))
r = await publishAL(page, 6); t = await takeToasts(page); hs = await head(page, 6)
check('d.R3 Publish AL1: Sun reads AL1, nothing pending; the toast names AL1 and its items', r.pressed && hs.tag.includes('AL1') && !hs.pending && t.some(x => /AL1/.test(x)), JSON.stringify({ r, tag: hs.tag, pend: hs.pending, toasts: t }))
await shotHead('d-R3-sun-al1-published', 6)
check('d.R3 no browser errors', errAt() === e0, errors.slice(e0).join(' | ').slice(0, 300))

/* 4. Unpublish and its re-publish — Tuesday (ORIG) */
e0 = errAt()
r = await unpublish(page, 1); t = await takeToasts(page); let ht = await head(page, 1)
check('d.R4 Unpublish Tue: it reads DRAFT with Publish day', r.pressed && ht.tag.includes('DRAFT') && !!ht.beak, JSON.stringify({ r, tag: ht.tag, beak: ht.beak, toasts: t }))
await shotHead('d-R4-tue-unpublished', 1)
s = await signDay(page, 1, 2)
r = await publishDay(page, 1); t = await takeToasts(page); ht = await head(page, 1)
check('d.R4 re-publish Tue: it reads ORIG again (the same version reissued), nothing pending', r.pressed && ht.tag.includes('ORIG') && !ht.pending, JSON.stringify({ r, tag: ht.tag, pend: ht.pending, toasts: t }))
await shotHead('d-R4-tue-republished', 1)
check('d.R4 no browser errors', errAt() === e0, errors.slice(e0).join(' | ').slice(0, 300))

/* 5. A plan switch — Wednesday (draft, on Plan B) */
e0 = errAt()
let m = await menu(page, 2)
note('d.R5 Wed plans menu', JSON.stringify(m.items))
const other = m.items.find(i => /^switch:/.test(i.does))
let hw = await head(page, 2)
if (other) {
  const name = other.text.split(' ')[0] + (other.text.split(' ')[1] ? ' ' + other.text.split(' ')[1] : '')
  const ok = await menuSwitch(page, new RegExp(other.text.slice(0, 6).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  t = await takeToasts(page); const hw2 = await head(page, 2)
  check(`d.R5 switching Wed from "${hw.selector.split('\n')[0]}" to another plan changes the selector`, ok && hw2.selector.split('\n')[0] !== hw.selector.split('\n')[0], JSON.stringify({ from: hw.selector, to: hw2.selector, toasts: t }))
  await shotHead('d-R5-wed-plan-switched', 2)
  await planMenuItems(page, 2)
  const back = await menuSwitch(page, new RegExp(hw.selector.split('\n')[0].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  t = await takeToasts(page); const hw3 = await head(page, 2)
  check('d.R5 …and back again', back && hw3.selector.split('\n')[0] === hw.selector.split('\n')[0], JSON.stringify({ now: hw3.selector, toasts: t }))
} else { await menuClose(page); note('d.R5 plan switch', 'no other plan offered on Wed — not walked') }
check('d.R5 no browser errors', errAt() === e0, errors.slice(e0).join(' | ').slice(0, 300))

/* 6. The Amendments panel's own Publish button — Monday (AL1 + 1 pending) */
e0 = errAt()
s = await signDay(page, 0, 3)
const pt0 = await panelText(page)
const pb = page.locator('#alPanel .al-pubday').filter({ hasText: /Mon/ }).locator('button').first()
const label = (await pb.count()) ? (await pb.innerText()).trim() : 'NO BUTTON'
const dis = (await pb.count()) ? await pb.isDisabled() : true
check('d.R6 the Amendments panel offers Mon\'s "Publish AL2", unlocked once signed', /Publish AL2/.test(label) && !dis, JSON.stringify({ label, dis, panel: pt0.slice(0, 200) }))
if (!dis) { await pb.click(); await page.waitForTimeout(800) }
t = await takeToasts(page); const hm = await head(page, 0); const pt1 = await panelText(page)
check('d.R6 the panel\'s button publishes: Mon reads AL2, nothing pending; the panel lists AL2', hm.tag.includes('AL2') && !hm.pending && /AL2/.test(pt1), JSON.stringify({ tag: hm.tag, pend: hm.pending, toasts: t, panel: pt1.slice(0, 260) }))
await clip(page, 'd-R6-panel-after-publish', '#alPanel', { pad: 6 })
check('d.R6 no browser errors', errAt() === e0, errors.slice(e0).join(' | ').slice(0, 300))
check('d.R: no browser errors across the whole sweep', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
const f = summary('b3-05-regress')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-05.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
