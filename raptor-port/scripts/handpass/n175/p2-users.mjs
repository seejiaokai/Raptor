// p2-users - P2 case 1 (H3; F16, F17): Admin → Users beyond "a row with typing". Saber (master admin, on 142), each case
// in its own fresh browser, then a door pressed as a person reaches it: a pick of 149 (the top-bar picker on a desktop, the
// ☰ menu's squadron list on a phone) or the member-view switch (the name badge on a desktop, ☰'s role line on a phone).
// Read after each: the squadron in view, the page, whether the row or form is still open, what is in the box he typed in,
// whether anything was asked. After a pick, 142 is picked back and Admin → Users opened again: is the typing still there?
//   (a) Hunter's row opened, its Role changed Admin → Member, nothing typed
//   (b) "Give access" under "Waiting for access", words typed in its callsign box  (SET-UP by presses in a first browser:
//       a name on no list signs in, asks for access to 142 by the card's "Request access"; the saved data copied over)
//   (c) "Add a person" at the list's foot, a callsign typed
//   (d) an archived man's row opened and his name edited  (SET-UP by presses: Ace's row → Archive; then the fold)
//   (e) Admin → Squadrons → "+ New squadron", a number typed
//   (f) Hunter's row, words typed in its sign-in box, then Admin → Squadrons; f1: back to Users - is the row open with its
//       typing?  f2: the pick / view switch pressed from Squadrons, then back to 142's Users
//   (g) Hunter's row, words typed in its sign-in box, then another page's tab (Inputs) pressed: asked? then back to Users
// Typing: a desktop types with the keyboard; a phone sets the box's value through its own input event (typing on an
// emulated phone zooms the page - n166 draw-lib's way). Picture names: p2-users-<case>-<d|p>-<what>.png
//   node raptor-port/scripts/handpass/n175/p2-users.mjs <d|p>     (ONLY=a,b,c,d,e,f1,f2,g   DOORS=pick,view)
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, reachView, barSq, pageOn, windowsNow, roleNow, toastNow, tmpDir } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p2'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const DOORS = (process.env.DOORS || 'pick,view').split(',')
const TMP = tmpDir(SEC)
const W = 'N175 typed'
async function typeIn(s, sel, words) {
  const r = vis(s, sel).first()
  await r.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(words) }
  else { await r.tap(); await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, words) }
  await wait(s, 300)
  return r.inputValue()
}
async function adminSection(s, name) {
  if ((await pageOn(s)) !== 'page-admin') { await go(s, 'admin'); await wait(s, 700) }
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back', 500)
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: new RegExp('^' + name) }); if (await t.count()) await hit(s, t.first(), 700)
}
const boxVal = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return { inPage: false }; const r = e.getBoundingClientRect(); return { inPage: true, drawn: r.width > 0 && r.height > 0, value: e.value } }, sel)
const wordsAnywhere = (s, w) => s.page.evaluate(w => [...document.querySelectorAll('input, textarea')].filter(e => (e.value || '').includes(w)).map(e => (e.id || e.tagName) + (e.getBoundingClientRect().width > 0 ? '' : ' (hidden)')), w)
const asked = s => s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); const ask = [...document.querySelectorAll('.askcard')].find(e => e.getBoundingClientRect().width > 0); return { dlg: m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null, askcard: ask ? ask.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : null } })
const rowOpen = s => s.page.evaluate(() => ({ editor: !!document.querySelector('#accEdSave, #accEdCancel'), archivedEditor: !!document.querySelector('#accArRestore'), giveForm: !!document.querySelector('#apvGo'), newSqnForm: !!document.querySelector('#sqNewNum') }))

/* SET-UP (b): the waiting request, by presses on the sign-in card's own "Request access" */
async function setupWaiting() {
  const s = await mk(SZ); const { page } = s
  await page.goto('http://localhost:4700/'); await page.waitForSelector('#luser')
  await page.fill('#luser', 'n175wait'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accForm', { timeout: 15000 })
  await page.selectOption('#accSqn', { label: '142' }); await page.fill('#accCs', 'Newbie'); await page.selectOption('#accSeat', { label: 'Pilot' })
  const cat = await page.evaluate(() => [...document.querySelector('#accCat').options].map(o => o.value).find(v => v)); await page.selectOption('#accCat', cat)
  await hit(s, '#accSend', 900)
  FACT(`p2.users.b.${SZ}.setup.waitingScreen`, (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 90))
  await hit(s, '#accOut', 900)
  const st = `${TMP}/users-wait-${SZ}.json`; writeFileSync(st, JSON.stringify(await s.ctx.storageState())); await s.ctx.close()
  return st
}
const CASES = {
  a: { what: "Hunter's row opened, Role changed Admin → Member, nothing typed", run: async s => {
    await adminSection(s, 'Users'); await hit(s, s.page.locator('[data-person="prowler"] .acc-tap').first(), 800)
    await s.page.selectOption('#accEdRole', 'main'); await wait(s, 300)
    return { box: '#accEdRole', ring: '#accEdRole', val: await s.page.inputValue('#accEdRole') } } },
  b: { what: '"Give access" under "Waiting for access", words typed', setup: setupWaiting, run: async s => {
    await adminSection(s, 'Users')
    FACT(`p2.users.b.${SZ}.waitingLine`, (await s.page.locator('#page-admin').innerText()).replace(/\s+/g, ' ').match(/(WAITING FOR ACCESS|Waiting for access ·).{0,90}/)?.[0])
    await hit(s, vis(s, '[data-approve]').first(), 700)
    FACT(`p2.users.b.${SZ}.formBoxes`, await s.page.evaluate(() => [...document.querySelectorAll('#page-admin input, #page-admin select')].filter(e => e.getBoundingClientRect().width > 0 && /^apv/.test(e.id)).map(e => e.id + '=' + e.value)))
    let box = (await vis(s, '#apvCs').count()) ? '#apvCs' : null
    if (!box) { const nb = vis(s, '#page-admin button').filter({ hasText: /^New person$/ }); if (await nb.count()) { await hit(s, nb.first(), 400); FACT(`p2.users.b.${SZ}.pressedNewPerson`, true) } box = (await vis(s, '#apvCs').count()) ? '#apvCs' : null }
    if (!box) return { box: null }
    return { box, ring: '#apvGo', typed: await typeIn(s, box, W) } } },
  c: { what: '"Add a person", a callsign typed', run: async s => {
    await adminSection(s, 'Users')
    return { box: '#accAddCs', ring: '#accAddCs', typed: await typeIn(s, '#accAddCs', 'Nfive') } } },
  d: { what: "an archived man's row opened, his name edited", run: async s => {
    await adminSection(s, 'Users'); await hit(s, s.page.locator('[data-person="ace"] .acc-tap, [data-person] .acc-tap').filter({ hasText: /^Ace/ }).first(), 700)
    await hit(s, '#accEdArchive', 900); FACT(`p2.users.d.${SZ}.setup.archiveToast`, await toastNow(s))
    if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500)
    await hit(s, vis(s, '#accArchList .acc-tap').first(), 700)
    return { box: '#accArCs', ring: '#accArCs', typed: await typeIn(s, '#accArCs', 'Acey') } } },
  e: { what: 'Admin → Squadrons → "+ New squadron", a number typed', run: async s => {
    await adminSection(s, 'Squadrons'); await hit(s, '#sqNew', 600)
    return { box: '#sqNewNum', ring: '#sqNewNum', typed: await typeIn(s, '#sqNewNum', '150') } } },
  f1: { what: "Hunter's row, sign-in typed, then Admin → Squadrons, then back to Users", noDoor: true, run: async s => {
    await adminSection(s, 'Users'); await hit(s, s.page.locator('[data-person="prowler"] .acc-tap').first(), 800)
    const typed = await typeIn(s, '#accEdName', W)
    await adminSection(s, 'Squadrons')
    FACT(`p2.users.f1.${SZ}.onSquadrons`, { box: await boxVal(s, '#accEdName'), wordsAnywhere: await wordsAnywhere(s, W), asked: await asked(s) })
    await adminSection(s, 'Users')
    return { box: '#accEdName', ring: '#accEdName', typed } } },
  f2: { what: "Hunter's row, sign-in typed, then Admin → Squadrons; the door pressed from there", run: async s => {
    await adminSection(s, 'Users'); await hit(s, s.page.locator('[data-person="prowler"] .acc-tap').first(), 800)
    const typed = await typeIn(s, '#accEdName', W)
    await adminSection(s, 'Squadrons')
    return { box: '#accEdName', ring: null, typed } } },
  g: { what: "Hunter's row, sign-in typed, then the Inputs page's tab", noDoor: true, run: async s => {
    await adminSection(s, 'Users'); await hit(s, s.page.locator('[data-person="prowler"] .acc-tap').first(), 800)
    const typed = await typeIn(s, '#accEdName', W)
    await go(s, 'inputs'); await wait(s, 600)
    FACT(`p2.users.g.${SZ}.afterTab`, { page: await pageOn(s), asked: await asked(s), toast: await toastNow(s), wordsAnywhere: await wordsAnywhere(s, W) })
    await scratch(s, SEC, `users-g-${SZ}-on-inputs`)
    await adminSection(s, 'Users')
    return { box: '#accEdName', ring: '#accEdName', typed } } },
}
async function one(key, door, state) {
  const c = CASES[key], k = `p2.users.${key}.${SZ}${door ? '.' + door : ''}`, P = `p2-users-${key}-${SZ}${door ? '-' + door : ''}`
  const s = await mk(SZ, state ? { storageState: state } : {})
  try {
    await signIn(s, 'ad', 'a')
    const r = await c.run(s)
    FACT(`${k}.case`, c.what)
    const TW = typeof r.typed === 'string' && r.typed ? r.typed : W
    if (!r.box) { FACT(`${k}.box`, 'no box found to type in'); await scratch(s, SEC, P + '-nobox'); return }
    FACT(`${k}.before`, { squadron: await barSq(s), page: await pageOn(s), box: await boxVal(s, r.box), open: await rowOpen(s), typedRead: r.typed ?? r.val })
    if (c.noDoor) {
      FACT(`${k}.backOnUsers`, { open: await rowOpen(s), box: await boxVal(s, r.box), wordsAnywhere: await wordsAnywhere(s, TW), asked: await asked(s) })
      await shot(s, `${P}-back`, [r.ring && (await s.page.locator(r.box).count()) ? r.box : '#page-admin .acc-list'], null, 60)
      return
    }
    if (door === 'pick' && !(key === 'f2')) await shot(s, `${P}-1-before`, [r.ring || r.box], null, 60)
    else await scratch(s, SEC, `${P}-1-before`)
    const did = door === 'pick' ? await reachPick(s, 149, s.desk ? 'bar' : 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    await wait(s, 600)
    FACT(`${k}.after`, { squadron: await barSq(s), role: await roleNow(s), page: await pageOn(s), asked: await asked(s), toast: await toastNow(s), open: await rowOpen(s), box: await boxVal(s, r.box), addHome: await boxVal(s, '#accAddHome'), wordsAnywhere: await wordsAnywhere(s, TW), windows: (await windowsNow(s)).map(w => w.what) })
    { const doorSel = s.desk ? (door === 'pick' ? '#sqnMenuBtn' : '#roleBadge') : '.topbar .mark'
      const bx = await boxVal(s, r.box)
      const what = bx.drawn ? r.box : '.page.on h1, .page.on h2'
      await shot(s, `${P}-2-after`, [doorSel, what], [doorSel, what], 40) }
    if (door === 'pick') {
      await reachPick(s, 142, s.desk ? 'bar' : 'menu'); await wait(s, 600)
      if (key === 'e') await adminSection(s, 'Squadrons'); else await adminSection(s, 'Users')
      if (key === 'd') { if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500) }
      FACT(`${k}.back142`, { squadron: await barSq(s), open: await rowOpen(s), box: await boxVal(s, r.box), addHome: await boxVal(s, '#accAddHome'), wordsAnywhere: await wordsAnywhere(s, TW), wordsTyped: r.typed })
      await scratch(s, SEC, `${P}-3-back142`)
    } else {
      /* back to the admin view, then Admin → Users / Squadrons: is the typing there? */
      await reachView(s); await wait(s, 500)
      if (key === 'e') await adminSection(s, 'Squadrons'); else await adminSection(s, 'Users')
      if (key === 'd') { if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500) }
      FACT(`${k}.backAdminView`, { role: await roleNow(s), open: await rowOpen(s), box: await boxVal(s, r.box), wordsAnywhere: await wordsAnywhere(s, TW) })
      await scratch(s, SEC, `${P}-3-back-admin-view`)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p2-users v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(CASES))) {
    const state = CASES[key].setup ? await CASES[key].setup() : null
    if (CASES[key].noDoor) await one(key, null, state)
    else for (const d of DOORS) await one(key, d, state)
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
