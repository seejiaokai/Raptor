// Chat 153 (24 Nov 26) — the new words of his D2396 and D2389 drawn on the REAL app for his approval (D1625): each screen
// reached by pressing the app's own controls; only the words (or the one mark) are changed in the page for the picture,
// nothing in the app or its saved data. Pictures at 2x, phone 402 and desktop 1536.
// Run from raptor-port/ with the build in dist/:
//   MQ_PORT=4701 MQ_OUT=<scratch> MQ_RAW=<scratch> MQ_PICS=docs/mock/2026-11-24-msq-new-words/img SZ=d,p ONLY=b,f,l,o,n,w,i node scripts/handpass/n153/draw/draw.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { serve, stop, signIn, facts, errs, note } from '../../n149/walk/lib.mjs'
import { adminCat, openRow, lineBtn, bellOpen, toastText } from '../../n149/walk/w1-view.mjs'
import { as, press, step } from '../../n149/rewalk/rlib.mjs'
import { newPage, ringShot } from '../../n149/morning/mlib.mjs'
import { barPick, menuPick, go, openMenu, closeMenuOutside, state } from '../../n150/walk/vlib.mjs'

const DIR = process.env.MQ_PICS
mkdirSync(DIR, { recursive: true })
const SZS = (process.env.SZ || 'd,p').split(',')
const only = (process.env.ONLY || 'b,f,l,o,n,w,i').split(',')
const T = id => `[data-testid="${id}"]`
const W = s => (s.desk ? 'desk' : 'phone')
const made = []
const log = (file, what) => made.push({ file, what })

/* the words of a part of the page changed for the picture; returns how many places changed, so a miss is seen */
const swap = (s, sel, from, to) => s.page.evaluate(([sel, from, to]) => {
  let hit = 0
  for (const root of document.querySelectorAll(sel)) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n
    while ((n = w.nextNode())) if (n.nodeValue.includes(from)) { n.nodeValue = n.nodeValue.replace(from, to); hit++ }
  }
  return hit
}, [sel, from, to])
const shut = async s => { for (let i = 0; i < 3 && (await state(s)).drawerOpen; i++) await closeMenuOutside(s) }
const pickS = (s, n) => (s.desk ? barPick(s, n) : menuPick(s, n))
async function fresh(sz, user, pass) { const s = await newPage(sz); await signIn(s, user, pass); return s }
async function give(s, pid, unit, line) { await adminCat(s, 'Users'); await openRow(s, pid); await press(s, lineBtn(unit, line)); await press(s, '#accEdSave'); await s.page.waitForTimeout(900) }
async function role(s, pid, v) { await openRow(s, pid); await s.page.selectOption('#accEdRole', v); await press(s, '#accEdSave'); await s.page.waitForTimeout(900) }

/* a toast's words changed at once, then its picture, before it fades */
async function toastPic(s, from, to, file, what) {
  const hit = await swap(s, '#toastEl', from, to)
  facts[file] = { hit, toast: await toastText(s) }
  await ringShot(s, file, { ring: ['#toastEl'], clip: ['#toastEl'], pad: s.desk ? 70 : 28, what })
  log(file, what)
}

/* (b) The filter's Plans ticks: one tick per squadron somebody on the list plans */
async function drawB(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await give(s, 'prowler', '149', 'plan')
  await press(s, '#accFilter'); await s.page.waitForTimeout(350)
  // the Plans tick pressed for its real "on" look, its words changed, and the list shown as it will be: Hunter alone
  const chip = s.page.locator('#accFilterPanel button', { hasText: /^Plans 142$/ }).first()
  const adminChip = s.page.locator('#accFilterPanel button', { hasText: /^Admin$/ }).first()
  await adminChip.click(); await s.page.waitForTimeout(350)
  facts[`b-${sz}`] = await s.page.evaluate(() => {
    const btns = [...document.querySelectorAll('#accFilterPanel button')]
    const adm = btns.find(b => /(^|[^a-z ])\s*Admin\s*$/.test(b.textContent) || b.textContent.trim() === 'Admin'), plans = btns.find(b => /Plans 142\s*$/.test(b.textContent))
    // the "on" look moved whole (its class, its tick) from Admin to the Plans tick
    const cA = adm.className, pA = adm.getAttribute('aria-pressed'), hA = adm.innerHTML, cP = plans.className, pP = plans.getAttribute('aria-pressed'), hP = plans.innerHTML
    adm.className = cP; adm.setAttribute('aria-pressed', pP || 'false'); adm.innerHTML = hP.replace('Plans 142', 'Admin')
    plans.className = cA; plans.setAttribute('aria-pressed', pA || 'true'); plans.innerHTML = hA.replace('Admin', 'Plans 149'); plans.dataset.drawn = '1'
    const rows = [...document.querySelectorAll('#page-admin [data-testid="acc-groups"] [data-person]')]
    let n = 0; for (const r of rows) { if (r.dataset.person === 'prowler') { n++; continue } r.style.display = 'none' }
    return { rows: rows.length, kept: n, panel: document.querySelector('#accFilterPanel').innerText.replace(/\s+/g, ' ').slice(0, 260), head: [...document.querySelectorAll('#page-admin .od-head h4, #page-admin [data-unit-head], #page-admin .od-showing, #page-admin [data-testid="acc-showing"]')].map(e => e.textContent.replace(/\s+/g, ' ').trim()) }
  })
  const file = `b1-${W(s)}-plans-149-ticked.png`
  const what = "Admin → Users on 142's list: the filter's tick reads Plans 149"
  await ringShot(s, file, { rings: [['#accFilterPanel button[data-drawn="1"]']], clip: ['#accFilterPanel'], pad: 18, what }); log(file, what)
  // two squadrons planned: both ticks, side by side
  await s.page.evaluate(() => {
    const p = document.querySelector('#accFilterPanel button[data-drawn="1"]'), adm = [...document.querySelectorAll('#accFilterPanel button')].find(b => b.textContent.trim() === 'Admin')
    p.className = adm.className; p.setAttribute('aria-pressed', 'false'); p.innerHTML = adm.innerHTML.replace('Admin', 'Plans 149')
    const two = p.cloneNode(true); two.innerHTML = adm.innerHTML.replace('Admin', 'Plans 142'); two.dataset.drawn = '2'; p.before(two)
  })
  const file2 = `b2-${W(s)}-two-plans-ticks.png`
  const what2 = 'The same filter when somebody on the list also plans 142: one tick for each squadron'
  await ringShot(s, file2, { rings: [['#accFilterPanel button[data-drawn="2"]', '#accFilterPanel button[data-drawn="1"]']], clip: ['#accFilterPanel'], pad: 18, what: what2 }); log(file2, what2)
  // the panel closed: the list the Plans 149 tick finds — Hunter alone, his row saying why
  await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(350)
  if (await s.page.locator('#accFilterPanel').filter({ visible: true }).count()) { await press(s, '#accFilter'); await s.page.waitForTimeout(300) }
  facts[`b3-${sz}`] = await s.page.evaluate(() => {
    const rows = [...document.querySelectorAll('#page-admin [data-testid="acc-groups"] [data-person]')]
    for (const r of rows) r.style.display = r.dataset.person === 'prowler' ? '' : 'none'
    for (const e of document.querySelectorAll('#page-admin [data-unit-head], #page-admin .od-showing, #page-admin [data-testid="acc-showing"]')) {
      const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n
      while ((n = w.nextNode())) n.nodeValue = n.nodeValue.replace(/Showing \d+ of (\d+)/, 'Showing 1 of $1').replace(/· \d+/, '· 1')
    }
    return { hunter: document.querySelector('[data-person="prowler"]')?.textContent.replace(/\s+/g, ' ').trim(), showing: document.querySelector('#page-admin .od-showing, #page-admin [data-testid="acc-showing"]')?.textContent.replace(/\s+/g, ' ').trim(), filter: document.querySelector('#accFilter')?.textContent.trim() }
  })
  const file3 = `b3-${W(s)}-finds-hunter.png`, what3 = 'With that tick on, the list shows Hunter, whose row says he also plans 149'
  await ringShot(s, file3, { rings: [['[data-person="prowler"]']], clip: ['#accFilter', '#page-admin .od-showing, #page-admin [data-testid="acc-showing"]', '[data-person="prowler"]'], pad: 16, what: what3 }); log(file3, what3)
  await s.ctx.close()
}

/* (f) Request access: Squadron starts on Pick…, and asks for it */
async function drawF(sz) {
  const s = await newPage(sz); await signIn(s, 'viper@mail', 'v1', { pending: true }); await s.page.waitForSelector('#accForm', { timeout: 10000 })
  const toPick = () => s.page.evaluate(() => {
    const q = document.querySelector('#accSqn')
    if (![...q.options].some(o => o.value === '__draw')) { const o = document.createElement('option'); o.value = '__draw'; o.textContent = 'Pick…'; q.prepend(o) }
    q.value = '__draw'; return q.selectedOptions[0].textContent
  })
  facts[`f-${sz}`] = await toPick()
  const f1 = `f1-${W(s)}-starts-on-pick.png`, w1 = 'Request access: the Squadron box starts on Pick…, like the two boxes under it'
  await ringShot(s, f1, { ring: ['#accSqn'], clip: ['#accForm'], pad: 18, what: w1 }); log(f1, w1)
  await s.page.fill('#accCs', 'Kite'); await s.page.fill('#accIni', 'KT'); await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(250)
  const cats = await s.page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(Boolean))
  if (cats.length) await s.page.selectOption('#accCat', cats[0])
  await s.page.waitForTimeout(250); await toPick()
  await s.page.evaluate(() => { document.querySelector('#accErr').textContent = 'Pick your squadron' })
  const f2 = `f2-${W(s)}-pick-your-squadron.png`, w2 = 'Kite pressed Request access without choosing: the card says Pick your squadron, and nothing is sent'
  await ringShot(s, f2, { rings: [['#accSqn'], ['#accErr']], clip: ['#accForm'], pad: 18, what: w2 }); log(f2, w2)
  await s.ctx.close()
}

/* (l) The Undo words for a master admin */
async function drawL(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await adminCat(s, 'Users'); await role(s, 'prowler', 'master'); await s.page.waitForTimeout(2600)
  if (s.desk) {
    const t = await s.page.locator('#undoBtn:visible').first().getAttribute('title'); facts['l-title'] = t
    await s.page.evaluate(() => {
      const b = [...document.querySelectorAll('#undoBtn')].find(e => e.getBoundingClientRect().width > 0).getBoundingClientRect()
      const d = document.createElement('div'); d.id = 'drawTip'; d.textContent = 'Undo — Made a master admin · Hunter'
      Object.assign(d.style, { position: 'fixed', left: `${b.left}px`, top: `${b.bottom + 8}px`, background: '#2b2b2b', color: '#fff', font: '12px system-ui, sans-serif', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', whiteSpace: 'nowrap', zIndex: '2147483646' })
      document.body.appendChild(d)
    })
    const f = 'l3-desk-undo-hover.png', w = 'Hovering over Undo on a desktop: the same words after "Undo —"'
    await ringShot(s, f, { ring: ['#drawTip'], clip: ['#undoBtn', '#drawTip'], pad: 26, what: w }); log(f, w)
    await s.page.evaluate(() => document.querySelector('#drawTip').remove())
  }
  await press(s, '#undoBtn:visible')
  await toastPic(s, 'the master admin mark', 'Made a master admin · Hunter', `l1-${W(s)}-undid-made.png`, 'After Undo of making Hunter a master admin')
  await s.page.waitForTimeout(3000)
  await role(s, 'prowler', 'master'); await s.page.waitForTimeout(2600)
  await role(s, 'prowler', 'admin'); await s.page.waitForTimeout(2600)
  await press(s, '#undoBtn:visible')
  await toastPic(s, 'the master admin mark', 'Master admin taken off · Hunter', `l2-${W(s)}-undid-taken-off.png`, 'After Undo of taking master admin off Hunter')
  await s.ctx.close()
}

/* (o) One Save that changed two things, undone as one */
async function drawO(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await adminCat(s, 'Users'); await openRow(s, 'prowler')
  await press(s, lineBtn('149', 'plan')); await s.page.fill('#accEdName', 'hunter.m@mail'); await press(s, '#accEdSave'); await s.page.waitForTimeout(2800)
  await press(s, '#undoBtn:visible')
  await toastPic(s, 'Plan of 149 given', 'Plan of 149 given, sign-in name changed', `o1-${W(s)}-undid-two.png`, 'After one Undo of a Save that changed his sign-in and gave him Plan of 149')
  await s.ctx.close()
}

/* (n) Hunter's bell */
async function drawN(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await give(s, 'prowler', '149', 'plan')
  await role(s, 'prowler', 'master'); await s.page.waitForTimeout(1500)
  await role(s, 'prowler', 'admin'); await s.page.waitForTimeout(1500)
  await as(s, 'ad2', 'a2')
  await bellOpen(s); await s.page.waitForTimeout(400)
  const BELL = T('bell-list')
  facts[`n-${sz}`] = await s.page.evaluate(sel => {
    const list = document.querySelector(sel)
    const change = (root, from, to) => { const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n, hit = 0; while ((n = w.nextNode())) if (n.nodeValue.includes(from)) { n.nodeValue = n.nodeValue.replace(from, to); hit++ } return hit }
    const line = words => [...list.querySelectorAll('.bl-line')].find(e => e.textContent.includes(words))
    const m = line('Made a master admin'); const end = m.cloneNode(true)
    const a = change(list, 'Master admin taken off', 'Master admin taken off: full access to every squadron ended')
    const b = change(m, 'Made a master admin', 'Made a master admin: full access to every squadron')
    const c = change(end, 'Made a master admin', 'Plan of 149 ended: master admin covers every squadron')
    m.after(end); end.dataset.drawn = 'plan'; m.dataset.drawn = 'made'
    line('Master admin taken off').dataset.drawn = 'off'
    return { a, b, c, lines: [...list.querySelectorAll('.bl-line')].slice(0, 5).map(e => e.textContent.replace(/\s+/g, ' ').trim()) }
  }, BELL)
  const f = `n1-${W(s)}-bell.png`, w = "Hunter's bell, newest on top: the three lines with the new words"
  await ringShot(s, f, { rings: [[`${BELL} [data-drawn="off"]`], [`${BELL} [data-drawn="plan"]`, `${BELL} [data-drawn="made"]`]], clip: [BELL], pad: 12, what: w }); log(f, w)
  await s.ctx.close()
}

/* the band of a held window: the app's own band (reached by a pick, so the window is greyed exactly as D2323's), its words
   changed to D2389's */
const BAND_LEAD = 'Member view.', BAND_REST = 'Switch back to the admin view to change this, or close it.'
const bandWords = s => s.page.evaluate(([l, r]) => {
  const b = [...document.querySelectorAll('.saveband.moveband')].find(e => e.getBoundingClientRect().width > 0)
  if (!b) return null
  const was = b.textContent.replace(/\s+/g, ' ').trim()
  b.querySelector('b').textContent = l; b.querySelector('.sv-rest').textContent = r
  b.dataset.drawn = '1'
  return was
}, [BAND_LEAD, BAND_REST])

/* (w) a Leave War window */
async function drawW(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await give(s, 'prowler', '149', 'view')
  await as(s, 'ad2', 'a2')
  await go(s, 'leavewar'); await s.page.waitForTimeout(1500); await shut(s)
  let n = s.page.locator(T('person-prowler')).filter({ visible: true }).first()
  await n.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {}); await s.page.waitForTimeout(350)
  const blocked = await n.evaluate(e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(t && e.contains(t)) }).catch(() => true)
  if (blocked) n = s.page.locator('.mxband [data-band-id="prowler"] .whoedit').filter({ visible: true }).first()
  const b = await n.boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.page.waitForTimeout(800)
  await pickS(s, '149'); await s.page.waitForTimeout(500); await shut(s); await s.page.waitForTimeout(400)
  facts[`w-${sz}`] = await bandWords(s)
  const f = `w1-${W(s)}-leave-war-window.png`, w = 'A Leave War window left open when he switches to the member view'
  await ringShot(s, f, { ring: ['.saveband.moveband[data-drawn="1"]'], clip: ['.bidsheet:visible, .floatwin:visible'], pad: 12, what: w }); log(f, w)
  await s.ctx.close()
}

/* (i) an Input window */
async function openInput(s) {
  const { page } = s
  await go(s, 'inputs'); await page.waitForTimeout(900); await shut(s)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) await press(s, '#inListBtn')
  await page.waitForTimeout(400)
  if (!(await page.locator('#inRangePop').filter({ visible: true }).count())) await press(s, '#inRangeBtn')
  if (await page.locator('#inRangeAll').filter({ visible: true }).count()) await press(s, '#inRangeAll')
  await page.waitForTimeout(500)
  const row = page.locator(s.desk ? '#inBody tr[data-iid]' : '[data-testid^="inl-row-"]').filter({ visible: true }).first()
  await row.scrollIntoViewIfNeeded()
  const o = s.desk ? row.locator(T('in-open')).first() : row
  if (s.desk) await o.click(); else await o.tap()
  await page.waitForTimeout(800)
}
async function drawI(sz) {
  const s = await fresh(sz, 'ad', 'a')
  await give(s, 'prowler', '149', 'view')
  await as(s, 'ad2', 'a2')
  await openInput(s)
  if (s.desk) {
    await pickS(s, '149'); await s.page.waitForTimeout(700)
    facts[`i-${sz}`] = await bandWords(s)
  } else {
    // an iPhone's Input window covers the ☰ button, so this state is reached there only by a bell tap: the band is put into
    // the real window where the desktop draws it, with the same greyed parts
    facts[`i-${sz}`] = await s.page.evaluate(([l, r]) => {
      const save = [...document.querySelectorAll('#inpEditSave')].find(e => e.getBoundingClientRect().width > 0)
      const root = save.closest('.floatwin') || save.closest('.airpop-box')
      const head = root.querySelector('.win-bar, .airpop-head')
      const band = document.createElement('div'); band.className = 'saveband moveband'; band.dataset.drawn = '1'
      band.innerHTML = `<span class="sv-msg"><span class="sv-sign" aria-hidden="true"></span><b>${l}</b><span class="sv-sep"> </span><span class="sv-rest">${r}</span></span><button type="button" class="abtn">Close</button>`
      const host = head && head.parentElement === root ? root : (head ? head.parentElement : root)
      if (head) head.after(band); else root.prepend(band)
      const walk = node => { for (const c of [...node.children]) { if (c === band || c === head) continue; if (c.contains(band) || (head && c.contains(head))) { walk(c); continue } c.setAttribute('data-heldro', '') } }
      walk(root)
      return { host: host.className, head: head ? head.className : null }
    }, [BAND_LEAD, BAND_REST])
  }
  await s.page.waitForTimeout(200)
  const f = `i1-${W(s)}-input-window.png`, w = 'An Input window left open when he switches to the member view'
  await ringShot(s, f, { ring: ['.saveband.moveband[data-drawn="1"]'], clip: ['.floatwin:visible, .airpop-box:visible'], pad: 12, what: w }); log(f, w)
  await s.ctx.close()
}

const JOBS = { b: drawB, f: drawF, l: drawL, o: drawO, n: drawN, w: drawW, i: drawI }
await serve()
try {
  for (const k of only) for (const sz of SZS) await step(`${k} ${sz}`, () => JOBS[k](sz))
} finally { await stop() }
writeFileSync(`${process.env.MQ_RAW}/draw-${only.join('')}-${SZS.join('')}.json`, JSON.stringify({ made, facts, errs }, null, 1))
console.log(JSON.stringify({ made: made.map(m => m.file), facts }, null, 1))
console.log('errs', errs.length, errs.slice(0, 6))
note('done')
