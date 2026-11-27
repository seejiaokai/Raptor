// draw-q26 - question 26 on the one questions page (chat 205, 27 Nov 26): one row open at a time on Admin -> Users, one
// "Give access" form at a time. Real presses on the built app (a copy of dist, q26-lib), Kestrel (149's admin) signed in.
//   row  Kestrel opens Osprey's row and types a new sign-in name ("osprey"), not saved; then presses Raven's row (149 has no
//        Ranger: Raven is the row under Osprey's).
//        today    = Raven's row REALLY pressed: Osprey's row closed, back to "us9", Raven's open. Rings: Osprey's row, Raven's.
//        proposed = the press not made; the app's own toastAt raises "Blocked: save or cancel the open row, then open Raven’s."
//                   under Raven's row (a desktop) / at the foot (an upright phone), never over Save / Cancel.
//                   Rings: the note, and the typed sign-in box still open.
//   ga   Kestrel presses "Give access" on Nova's waiting request and changes its Role to Admin; then presses "Give access" on
//        Ace's.
//        today    = Ace's REALLY pressed: Nova's form gone with its change, Ace's form open. Rings: Nova's request, Ace's form.
//        proposed = the press not made; "Blocked: finish or cancel giving access, then give access to Ace." under Ace's
//                   "Give access" (a desktop) / at the foot (a phone), never over the form's own buttons.
//                   Rings: the note, and the changed Role box still open.
//   node raptor-port/scripts/handpass/n205/draw-q26.mjs   (ONLY=row-today-p,row-prop-p,row-today-d,row-prop-d,ga-today-p,ga-prop-p,ga-today-d,ga-prop-d ; FRESH=1)
import { run, FACT, wait, signIn, usersTab, box, shot, tring, raise, want, closeAll, hit, ERRS } from './q26-lib.mjs'

const WORDS = {
  row: 'Blocked: save or cancel the open row, then open Raven’s.',
  ga: 'Blocked: finish or cancel giving access, then give access to Ace.',
}
const neutral = async s => { await s.page.evaluate(() => document.activeElement?.blur()); if (s.desk) await s.page.mouse.move(1, 1).catch(() => {}) }
const barFoot = s => s.page.evaluate(() => { const b = [...document.querySelectorAll('.topbar')].find(e => e.getBoundingClientRect().height > 0); return b ? b.getBoundingClientRect().bottom : 60 })
/* scroll so the element's top stands `gap` under the top bar */
const topUnderBar = (s, sel, gap = 8) => s.page.evaluate(([sel, gap]) => { const bar = [...document.querySelectorAll('.topbar')].find(e => e.getBoundingClientRect().height > 0); const f = bar ? bar.getBoundingClientRect().bottom : 60; const e = document.querySelector(sel); e.scrollIntoView({ block: 'start' }); scrollBy(0, e.getBoundingClientRect().top - f - gap) }, [sel, gap])
/* scroll so the element's foot stands `gap` above the screen's foot */
const footAbove = (s, sel, gap) => s.page.evaluate(([sel, gap]) => { const e = document.querySelector(sel); scrollBy(0, e.getBoundingClientRect().bottom - (innerHeight - gap)) }, [sel, gap])
/* a box held inside the screen under the bar (a ring on a part running past the screen's foot) */
const inView = async (s, b) => { if (!b) return b; const f = await barFoot(s); const y = Math.max(b.y, f + 6), bot = Math.min(b.y + b.h, s.H - 8); return { x: b.x, y, w: b.w, h: bot - y } }
/* two rings on parts that touch (the upper one's foot on the lower one's head): each pulled in at the shared edge so the
   two dashed lines stand 4px apart, never drawn over each other */
const apart = (a, b) => { const seam = b.y; return [{ ...a, h: seam - a.y - 10 }, { ...b, y: seam + 6, h: b.h - 6 }] }
const fieldOf =(s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); const f = e?.closest('.mfield') || e; const r = f.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
async function picture(s, k) {
  if (!s.desk) { await shot(s, k); return }
  const p = await box(s, '#page-admin')
  const x = Math.max(0, p.x - 16), r = Math.min(s.W, p.x + p.w + 16)
  await shot(s, k, { x, y: 0, width: r - x, height: s.H })
}

/* ---------------- row ---------------- */
async function rowStart(s, k) {
  await signIn(s, 'kestrel'); await usersTab(s); await wait(s, 400)
  await hit(s, '#page-admin .acc-row[data-person="osp9"] .acc-tap', 700)
  await s.page.waitForSelector('.acc-row.od-row-on #accEdName')
  const name = s.page.locator('#accEdName')
  if (s.desk) await name.click(); else await name.tap()
  await s.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A'); await s.page.keyboard.type('osprey'); await wait(s, 300)
  FACT(`${k}.typed`, await name.inputValue())
  if ((await name.inputValue()) !== 'osprey') throw new Error('the typing did not take')
}
for (const [key, k, sz] of [['row-today-p', 'q26-row-today-phone', 'p'], ['row-today-d', 'q26-row-today-desktop', 'd']]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    await rowStart(s, k)
    await s.page.evaluate(() => document.activeElement?.blur())
    await hit(s, '#page-admin .acc-row[data-person="rav9"] .acc-tap', 800)
    const after = await s.page.evaluate(() => ({ open: document.querySelector('.acc-row.od-row-on')?.dataset.person || null, osprey: document.querySelector('#page-admin .acc-row[data-person="osp9"] .acc-main')?.innerText.replace(/\s+/g, ' ').trim(), nameBox: document.querySelector('#accEdName')?.value, dialogs: [...document.querySelectorAll('#dlgOk')].filter(e => e.getBoundingClientRect().width > 0).length, note: (() => { const t = document.getElementById('toastEl'); return t && getComputedStyle(t).opacity !== '0' ? t.innerText.replace(/\s+/g, ' ').trim() : '' })() }))
    FACT(`${k}.after`, after)
    if (after.open !== 'rav9' || !/us9/.test(after.osprey)) throw new Error('today did not do as the question says: ' + JSON.stringify(after))
    await topUnderBar(s, '#page-admin .acc-row[data-person="osp9"]', 10); await wait(s, 250); await neutral(s)
    const osp = await box(s, '#page-admin .acc-row[data-person="osp9"]'), rav = await inView(s, await box(s, '.acc-row.od-row-on'))
    FACT(`${k}.rings`, { osp, rav })
    { const [a, b] = apart(osp, rav); await tring(s, a); await tring(s, b) }
    await picture(s, k)
  })
}
for (const [key, k, sz] of [['row-prop-p', 'q26-row-proposed-phone', 'p'], ['row-prop-d', 'q26-row-proposed-desktop', 'd']]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    await rowStart(s, k)
    await s.page.evaluate(() => document.activeElement?.blur()); await wait(s, 300)
    /* Raven's row in view under the open row, room for the note under it */
    await footAbove(s, '#page-admin .acc-row[data-person="rav9"]', s.desk ? 70 : 150); await wait(s, 250)
    if ((await box(s, '.acc-row.od-row-on #accEdName')).y < (await barFoot(s))) await topUnderBar(s, '.acc-row.od-row-on', 6)
    await neutral(s)
    const n = await raise(s, WORDS.row, '#page-admin .acc-row[data-person="rav9"] .acc-tap', '#accEdSave, #accEdCancel')
    FACT(`${k}.note`, n)
    FACT(`${k}.still`, await s.page.evaluate(() => ({ open: document.querySelector('.acc-row.od-row-on')?.dataset.person, nameBox: document.querySelector('#accEdName')?.value })))
    const fld = await fieldOf(s, '#accEdName')
    FACT(`${k}.boxes`, { field: fld, raven: await box(s, '#page-admin .acc-row[data-person="rav9"]'), save: await box(s, '#accEdSave'), cancel: await box(s, '#accEdCancel') })
    await tring(s, n.box); await tring(s, fld)
    await picture(s, k)
  })
}

/* ---------------- Give access ---------------- */
const reqOf = (s, who) => s.page.evaluate(who => { document.querySelectorAll('[data-q26req]').forEach(e => e.removeAttribute('data-q26req')); const r = [...document.querySelectorAll('#page-admin .acc-row.req')].find(e => e.innerText.includes(who + '@mail')); if (r) r.setAttribute('data-q26req', who); return !!r }, who)
async function gaStart(s, k) {
  await signIn(s, 'kestrel'); await usersTab(s); await wait(s, 400)
  await reqOf(s, 'nova'); await hit(s, '[data-q26req="nova"] [data-approve]', 700)
  await s.page.waitForSelector('#apvRole')
  const roles = await s.page.evaluate(() => [...document.querySelector('#apvRole').options].map(o => ({ v: o.value, t: o.textContent.trim() })))
  const ad = roles.find(o => /admin/i.test(o.t)); if (!ad) throw new Error('no Admin role: ' + JSON.stringify(roles))
  await s.page.selectOption('#apvRole', ad.v); await wait(s, 300)
  FACT(`${k}.roleChanged`, { to: ad.t, cs: await s.page.inputValue('#apvCs') })
}
for (const [key, k, sz] of [['ga-today-p', 'q26-ga-today-phone', 'p'], ['ga-today-d', 'q26-ga-today-desktop', 'd']]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    await gaStart(s, k)
    await reqOf(s, 'ace'); await hit(s, '[data-q26req="ace"] [data-approve]', 800)
    const after = await s.page.evaluate(() => ({ cs: document.querySelector('#apvCs')?.value, role: document.querySelector('#apvRole')?.value, forms: document.querySelectorAll('#apvRole').length, dialogs: [...document.querySelectorAll('#dlgOk')].filter(e => e.getBoundingClientRect().width > 0).length }))
    FACT(`${k}.after`, after)
    if (after.cs !== 'Ace' || after.forms !== 1) throw new Error('today did not do as the question says: ' + JSON.stringify(after))
    await reqOf(s, 'nova'); const novaOpen = await s.page.evaluate(() => !!document.querySelector('[data-q26req="nova"] #apvRole'))
    FACT(`${k}.novaFormStillOpen`, novaOpen)
    await topUnderBar(s, '[data-q26req="nova"]', 10); await wait(s, 250); await neutral(s)
    const nova = await box(s, '[data-q26req="nova"]')
    await reqOf(s, 'ace'); const ace = await inView(s, await box(s, '[data-q26req="ace"]'))
    FACT(`${k}.rings`, { nova, ace })
    { const [a, b] = apart(nova, ace); await tring(s, a); await tring(s, b) }
    await picture(s, k)
  })
}
for (const [key, k, sz] of [['ga-prop-p', 'q26-ga-proposed-phone', 'p'], ['ga-prop-d', 'q26-ga-proposed-desktop', 'd']]) {
  if (!want(key)) continue
  await run(k, sz, async s => {
    await gaStart(s, k)
    await s.page.evaluate(() => document.activeElement?.blur())
    await reqOf(s, 'ace')
    await footAbove(s, '[data-q26req="ace"]', s.desk ? 70 : 150); await wait(s, 250)
    if ((await box(s, '#apvRole')).y < (await barFoot(s))) throw new Error('the Role box and Ace\'s request do not fit one screen')
    await neutral(s)
    const n = await raise(s, WORDS.ga, '[data-q26req="ace"] [data-approve]', '#apvGo, #apvCancel')
    FACT(`${k}.note`, n)
    FACT(`${k}.still`, await s.page.evaluate(() => ({ cs: document.querySelector('#apvCs')?.value, role: document.querySelector('#apvRole')?.value })))
    const fld = await fieldOf(s, '#apvRole')
    FACT(`${k}.boxes`, { role: fld, ace: await box(s, '[data-q26req="ace"]'), go: await box(s, '#apvGo'), cancel: await box(s, '#apvCancel') })
    await tring(s, n.box); await tring(s, fld)
    await picture(s, k)
  })
}
FACT('errors', ERRS); await closeAll()
