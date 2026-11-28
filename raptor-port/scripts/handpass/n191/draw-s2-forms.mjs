// draw-s2-forms - section 2, Admin → Users across squadrons: the owed states of its FORMS and notes (ledger rows 2.10,
// 2.19, 2.26, 2.28, 2.29, 2.30, 2.36), on the REAL app at 4700. The page is round 6's approved page (./draw-s2-lib.mjs
// `build`); the "+ Add a person" form opens under the TOP row (D2652 N13 i), its foot the app's own Save · Cancel pair
// measured on an opened row (D2644; n176/draw-r5b-lib rowFootRef / footLikeRow).
// SET-UP by presses, from round 6's world (kept in .tmp/n176-draw/):
//   s2-state-arch.json  Saber archives 142's Jester (so Jester is archived on 142 alone; Ace on 142 and on 150 - the world)
//   s2-state-wait.json  then two new sign-ins ask 149 for access by the app's own "Request access" card:
//                       "jester@mail" as Jester (Pilot), "viper@mail" as Viper (WSO)
//   s2-10-{d,p}-waiting         2.10  Kestrel, 149: "Waiting for access" with two people, in the new page (no jump)
//   s2-19-p-roles               2.19  the roles table's note 5 on a phone
//   s2-26-p-archived-many / -after    2.26  "Ace" typed on a phone: archived holders on two squadrons, a line each
//   s2-28-p-taken               2.28  "Ranger is already taken on 142" under the callsign box, on a phone
//   s2-29-{d,p}-give-ask / -give-told 2.29  the Give access form: the note, then its twin "…when you approve him."
//   s2-30-{d,p}-both / s2-30-d-both-plain / s2-30-d-both-after   2.30 (V-Q2) Hunter, an admin of both: the recommended
//                               answer (a way across), the other answer (words only), and after "Someone new"
//   s2-36-{d,p}-changed         2.36  Save on a row whose man changed squadron while it stood open
//   node raptor-port/scripts/handpass/n191/draw-s2-forms.mjs   (ONLY=10,19,…  SZ=d,p  FRESH=1 remakes the set-up)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run, as, W, W6, WN, WS, FACT, wait, vis, hit, usersTab, reachPick, shot, shotTall, box, words, closeAll, typeInto, barSq, addButton, openFormInPlace, rowFootRef, footLikeRow, greyLook, linesOf, TMP, want, load, S, rowsOf, ringAll, build, pin, spec149, start, column, paneCol, holdToast, R6 } from './draw-s2-lib.mjs'
import { archive, toastNow } from '../n175/p6-lib.mjs'
import { URL_ } from '../n175/lib.mjs'
const ARCHST = resolve(TMP, 's2-state-arch.json'), WAITST = resolve(TMP, 's2-state-wait.json'), ASRC = resolve(TMP, 's2-arch-src.json')
const details = r => { const parts = r.sub.split(' · ').map(x => x.trim()); const seat = parts.find(p => /^(Pilot|WSO|Personnel)$/.test(p)); const cat = (parts.find(p => /^CAT /.test(p)) || '').replace(/^CAT /, ''); const date = (r.line || '').replace(/^Archived /, '').replace(/ by .*$/, ''); return { seat, cat, date } }
const save = async (s, f) => { await wait(s, 600); writeFileSync(f, JSON.stringify(await s.ctx.storageState())) }

async function request(s, mail, pass, sqn, cs, ini, seat) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', mail); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accForm', { timeout: 15000 })
  await page.selectOption('#accSqn', { label: sqn })
  await page.fill('#accCs', cs); await page.fill('#accIni', ini); await page.selectOption('#accSeat', { label: seat }); await wait(s, 200)
  const cats = await page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(v => v)); if (cats.length) await page.selectOption('#accCat', cats[0])
  await page.click('#accSend'); await wait(s, 900)
  const said = await page.evaluate(() => document.querySelector('#accessWaiting')?.innerText.replace(/[ \t\r\n]+/g, ' ').trim().slice(0, 160) ?? null)
  await page.click('#accOut'); await page.waitForSelector('#luser', { timeout: 15000 }); await wait(s, 400)
  return { mail, askedAs: cs, squadron: sqn, seat, cat: cats[0] ?? null, waitingScreen: said }
}
async function setup() {
  if (existsSync(ARCHST) && existsSync(WAITST) && existsSync(ASRC) && !process.env.FRESH) return JSON.parse(readFileSync(ASRC, 'utf8'))
  const src = {}
  await run('s2.setup.arch', 'd', async s => {
    await as(s, 'saber')
    FACT('s2.setup.archiveJester', await archive(s, 'ipman'))
    const rows = async () => { if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 400); return s.page.evaluate(() => [...document.querySelectorAll('#accArchList .acc-row[data-person]')].map(e => ({ pid: e.dataset.person, cs: e.querySelector('.acc-name').textContent, sub: e.querySelector('.acc-sub').textContent, line: e.querySelector('.od-archline')?.textContent ?? null }))) }
    await usersTab(s); src['142'] = await rows()
    await reachPick(s, 150, 'bar'); await usersTab(s); await wait(s, 400); src['150'] = await rows()
    await reachPick(s, 142, 'bar'); await wait(s, 500)
    await save(s, ARCHST)
  }, { state: R6 })
  await run('s2.setup.wait', 'd', async s => {
    FACT('s2.setup.request.jester', await request(s, 'jester@mail', 'j1', '149', 'Jester', 'JS', 'Pilot'))
    FACT('s2.setup.request.viper', await request(s, 'viper@mail', 'v1', '149', 'Viper', 'VP', 'WSO'))
    await save(s, WAITST)
  }, { state: ARCHST })
  FACT('s2.setup.archived', { 142: src['142'].map(r => `${r.cs} | ${r.sub} | ${r.line}`), 150: src['150'].map(r => `${r.cs} | ${r.sub} | ${r.line}`) })
  writeFileSync(ASRC, JSON.stringify(src))
  return src
}
const pic = (row, name) => async (sz, fn, st) => { const k = `s2-${row}-${sz}-${name}`; if (want(row, sz)) await run(k, sz, s => fn(s, k), { state: st }) }

/* the app's own row-foot pair, measured once a size on Osprey's opened row (Kestrel, 149) */
const REF = {}
async function ref(sz) { if (!REF[sz]) await run('s2.ref.' + sz, sz, async s => { await as(s, 'kestrel'); await usersTab(s); await wait(s, 400); REF[sz] = await rowFootRef(s, hit, 'osp9') }, { state: R6 }); return REF[sz] }
/* "+ Add a person" pressed: the form under the top row (on a phone under the button itself), a callsign typed */
async function formTop(s, k, who, pick, cs) {
  const R = await ref(s.sz)
  FACT(`${k}.add`, await start(s, who, pick)); await openFormInPlace(s, W)
  await s.page.evaluate(() => document.querySelector('#n176add').classList.add('on'))
  const b = await build(s, { ...spec149(who === 'hunter' ? { other: { hunter: { you: true } } } : {}), keepForm: true })
  await s.page.evaluate(() => { const blk = document.querySelector('#accAddBlock'), add = document.querySelector('#n176add'), bar = document.querySelector('#s2bar'), desk = innerWidth > 820
    if (desk) { bar.style.marginBottom = '0'; bar.insertAdjacentElement('afterend', blk); blk.style.marginTop = '12px'; blk.style.marginBottom = '22px' } else { add.style.marginBottom = '0'; add.insertAdjacentElement('afterend', blk); blk.style.marginTop = '12px'; blk.style.marginBottom = '22px' } })
  const typed = await typeInto(s, '#accAddCs', cs)
  await s.page.evaluate(() => document.activeElement?.blur?.())
  FACT(`${k}.foot`, await footLikeRow(s, R))
  await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
  FACT(`${k}.form`, { squadron: await barSq(s), typed, formUnder: s.desk ? 'the top row (search · Filter · + Add a person)' : 'the "+ Add a person" button, under the jumps', jumps: b.jumps.map(j => j.words) })
}
/* the archived note's block under the callsign's row: the page's own note, plain button and quiet words (round 5's parts,
   n176/draw-r5b-form `block`); `across` - the quiet words as a way across instead, in the look of "Edit on 142 →" */
const block = (s, { at = '#accAddCs', note, lines = [], button, ask, across, told, link }) => s.page.evaluate(({ at, note, lines, button, ask, across, told, link }) => {
  const csRow = document.querySelector(at).closest('.adm-2col')
  const blk = document.createElement('div'); blk.id = 's2arch'; blk.style.marginBottom = '12px'
  const para = (cls, t) => { const p = document.createElement('p'); p.className = cls; p.textContent = t; return p }
  if (told) { const p = para('adm-note acc-note', told); p.id = 's2told'; blk.appendChild(p) }
  else {
    if (note) blk.appendChild(para('adm-note acc-note', note))
    for (const l of lines) { const p = para('adm-note acc-note', l.words + ' '); const a = document.createElement('span'); a.className = 'acc-sub'; a.textContent = l.ask; a.style.display = 'inline'; p.appendChild(a); p.style.marginTop = '4px'; blk.appendChild(p) }
    const acts = document.createElement('div'); acts.className = 'acc-acts'; acts.style.alignItems = 'center'
    const b = document.createElement('button'); b.type = 'button'; b.className = 'abtn'; b.id = 's2new'; b.textContent = button; acts.appendChild(b)
    if (ask) { const q = document.createElement('span'); q.className = 'acc-sub'; q.id = 's2ask'; q.textContent = ask; q.style.alignSelf = 'center'; acts.appendChild(q) }
    if (across) { const t = document.createElement('button'); t.type = 'button'; t.id = 's2across'; t.textContent = across; Object.assign(t.style, { background: 'transparent', border: '0', padding: '6px 2px', cursor: 'pointer', color: link.color, fontSize: link.fontSize, fontWeight: link.fontWeight, fontFamily: link.fontFamily }); acts.appendChild(t) }
    blk.appendChild(acts)
  }
  csRow.insertAdjacentElement('afterend', blk)
  return blk.innerText.replace(/[ \t\r\n]+/g, ' ').trim()
}, { at, note, lines, button, ask, across, told, link })
const under = (s, sel, why) => s.page.evaluate(([sel, why]) => { const p = document.createElement('p'); p.className = 'adm-note'; p.id = 's2answer'; p.textContent = why; p.style.margin = '12px 0 0'; document.querySelector(sel).insertAdjacentElement('afterend', p) }, [sel, why])
const footNow = s => s.page.evaluate(() => [...document.querySelectorAll('#n176acts button, [data-approving] > .acc-acts:last-of-type button')].filter(b => b.getBoundingClientRect().width > 0).map(b => { const q = b.getBoundingClientRect(); return `${b.textContent}${b.disabled ? ' [greyed]' : ' [live]'}: x ${Math.round(q.left)}, y ${Math.round(q.top)}, w ${Math.round(q.width)}, h ${Math.round(q.height)}` }))
/* the look of the app's own text link ("What each role allows", as "Edit on 142 →" was drawn) */
const linkLook = s => s.page.evaluate(html => { const h = document.createElement('div'); h.innerHTML = html; h.style.position = 'absolute'; h.style.left = '-9999px'; document.querySelector('#page-admin').appendChild(h); const c = getComputedStyle(h.querySelector('details.acc-roles summary')); const r = { color: c.color, fontSize: c.fontSize, fontWeight: c.fontWeight, fontFamily: c.fontFamily }; h.remove(); return r }, S.CARD['k.Ranger'].html)
const formCut = async (s, k) => { const pane = await paneCol(s), a = await box(s, '#s2bar'), f = await box(s, '#accAddBlock'); await shotTall(s, k, { x: pane.x, y: a.y - (s.desk ? 16 : 14), w: pane.w, h: f.y + f.h - a.y + 34 }, 10) }

try {
  await load()
  const src = await setup()
  const jester = details(src['142'].find(r => r.cs === 'Jester'))
  const aces = [...src['142'].filter(r => r.cs === 'Ace').map(r => ['142', r]), ...src['150'].filter(r => r.cs === 'Ace').map(r => ['150', r])]
  FACT('s2.forms.sources', { jester, aces: aces.map(([n, r]) => `${n}: ${r.sub} | ${r.line}`) })

  /* 2.10 - "Waiting for access" with people in it: today's list, under the top row, no jump of its own */
  for (const sz of ['d', 'p']) await pic('10', 'waiting')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    const b = await build(s, spec149())
    FACT(`${k}.built`, { jumps: b.jumps.map(j => j.words), headings: b.headings, waiting: await words(s, '#admWaiting .acc-row') })
    const col = await column(s), top = await box(s, s.desk ? '.adm-rail' : '.adm-pane'), first = await box(s, '[data-testid="acc-groups"] .acc-row')
    await shot(s, k, [{ x: col.x, y: top.y, w: col.w, h: Math.min(s.H - top.y - 8, first.y + first.h * 2 - top.y) }], 14)
  }, WAITST)

  /* 2.19 - the roles table's note 5 on a phone (Saber, 142, Hunter's row opened, "What each role allows" opened) */
  await pic('19', 'roles')('p', async (s, k) => {
    await as(s, 'saber'); await usersTab(s); await wait(s, 400)
    await hit(s, vis(s, '.acc-row[data-person="prowler"] .acc-tap').first(), 700)
    await s.page.evaluate(() => { document.querySelector('[data-testid="acc-roles"]').open = true }); await wait(s, 300)
    const today = await words(s, '.acc-rt-notes li')
    await s.page.evaluate(t => { const li = document.querySelectorAll('.acc-rt-notes li')[4]; li.textContent = t; li.id = 's2note5' }, W.rolesNote)
    FACT(`${k}.notes`, { today5: today[4], drawn5: (await words(s, '.acc-rt-notes li'))[4], lines: await linesOf(s, '#s2note5') })
    await s.page.evaluate(() => { const a = document.querySelector('#s2note5').getBoundingClientRect(); scrollBy(0, a.bottom - innerHeight + 90) }); await wait(s, 300)
    await ringAll(s, ['#s2note5'])
    const n = await box(s, '.acc-rt-notes'), d = await box(s, '[data-testid="acc-roles"]')
    await shot(s, k, [{ x: d.x, y: Math.max(60, n.y - 260), w: d.w, h: n.y + n.h - Math.max(60, n.y - 260) + 10 }], 12)
  }, R6)

  /* 2.26 - archived holders on several squadrons, on a phone */
  await pic('26', 'archived-many')('p', async (s, k) => {
    await formTop(s, k, 'kestrel', null, 'Ace')
    const lines = aces.map(([n, r]) => { const d = details(r); return { words: W.archivedLine(n, 'Ace', d.seat, d.cat, d.date), ask: W.askAdmin(n) } })
    FACT(`${k}.note`, await block(s, { note: W.archivedMany('Ace'), lines, button: W.someoneNewR5 }))
    FACT(`${k}.greyLook`, await greyLook(s, '#n176save')); await under(s, '#n176acts', W.answerFirst); await wait(s, 200)
    FACT(`${k}.footNow`, await footNow(s))
    await ringAll(s, ['#s2arch', '#s2answer'])
    await formCut(s, k)
  }, ARCHST)
  await pic('26', 'archived-many-after')('p', async (s, k) => {
    await formTop(s, k, 'kestrel', null, 'Ace')
    FACT(`${k}.note`, await block(s, { told: W.newOneToldTwo('Ace', '142', '150') })); FACT(`${k}.footNow`, await footNow(s))
    await ringAll(s, ['#s2told'])
    await formCut(s, k)
  }, ARCHST)

  /* AFTER THE COORDINATOR (26 Nov): the approved form pictures of rows 2.24, 2.25, 2.26 (desktop) and 2.28 (desktop) drew
     the form under "People" (round 5's place); the same states with the form under the TOP row (D2652 N13 i) - the note,
     the buttons and every word as approved (round 5's e6a-r, e6a2, e6b, e6b2, e6d-r). Files s2-<row>-<d|p>-top-*. */
  const taken = async (s, k) => {
    await s.page.evaluate(() => document.querySelector('#accAdd').click()); await wait(s, 500)
    const amber = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); const c = getComputedStyle(t); const r = { words: t.textContent.replace(/[ \t\r\n]+/g, ' ').trim(), color: c.color }; t.style.display = 'none'; return r })
    FACT(`${k}.todayNote`, amber)
    await s.page.evaluate(([w, color]) => { const csRow = document.querySelector('#accAddCs').closest('.adm-2col'); const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.id = 's2taken'; p.textContent = w; p.style.color = color; p.style.marginBottom = '12px'; csRow.insertAdjacentElement('afterend', p) }, [W.taken('Ranger', '142'), amber.color])
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    FACT(`${k}.drawn`, { words: await words(s, '#s2taken'), lines: await linesOf(s, '#s2taken') })
  }
  const aceLines = () => aces.map(([n, r]) => { const d = details(r); return { words: W.archivedLine(n, 'Ace', d.seat, d.cat, d.date), ask: W.askAdmin(n) } })
  for (const [row, name, sizes, cs, fn, rings] of [
    ['24', 'top-archived', ['d', 'p'], 'Jester', async (s, k) => { FACT(`${k}.note`, await block(s, { note: W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date), button: W.someoneNewR5, ask: W.askAdmin('142') })); FACT(`${k}.greyLook`, await greyLook(s, '#n176save')); await under(s, '#n176acts', W.answerFirst) }, ['#s2arch', '#s2answer']],
    ['25', 'top-after', ['d', 'p'], 'Jester', async (s, k) => { FACT(`${k}.note`, await block(s, { told: W.newOneTold('Jester', '142') })) }, ['#s2told']],
    ['26', 'top-archived-many', ['d'], 'Ace', async (s, k) => { FACT(`${k}.note`, await block(s, { note: W.archivedMany('Ace'), lines: aceLines(), button: W.someoneNewR5 })); FACT(`${k}.greyLook`, await greyLook(s, '#n176save')); await under(s, '#n176acts', W.answerFirst) }, ['#s2arch', '#s2answer']],
    ['26', 'top-archived-many-after', ['d'], 'Ace', async (s, k) => { FACT(`${k}.note`, await block(s, { told: W.newOneToldTwo('Ace', '142', '150') })) }, ['#s2told']],
    ['28', 'top-taken', ['d'], 'Ranger', taken, ['#s2taken']]])
    for (const sz of sizes) await pic(row, name)(sz, async (s, k) => {
      await formTop(s, k, 'kestrel', null, cs)
      await fn(s, k); await wait(s, 200)
      FACT(`${k}.footNow`, { buttons: await footNow(s), noteLines: await linesOf(s, '#s2arch .acc-note, #s2told, #s2taken') })
      await ringAll(s, rings)
      await formCut(s, k)
    }, ARCHST)

  /* 2.28 - a live man's callsign, on a phone: the refusal under the callsign box, in the passing note's own amber */
  await pic('28', 'taken')('p', async (s, k) => {
    await formTop(s, k, 'kestrel', null, 'Ranger')
    await s.page.evaluate(() => document.querySelector('#accAdd').click()); await wait(s, 500)
    const amber = await s.page.evaluate(() => { const t = document.querySelector('#toastEl'); const c = getComputedStyle(t); const r = { words: t.textContent.replace(/[ \t\r\n]+/g, ' ').trim(), color: c.color }; t.style.display = 'none'; return r })
    FACT(`${k}.todayNote`, amber)
    await s.page.evaluate(([w, color]) => { const csRow = document.querySelector('#accAddCs').closest('.adm-2col'); const p = document.createElement('p'); p.className = 'adm-note acc-note'; p.id = 's2taken'; p.textContent = w; p.style.color = color; p.style.marginBottom = '12px'; csRow.insertAdjacentElement('afterend', p) }, [W.taken('Ranger', '142'), amber.color])
    await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 300)
    FACT(`${k}.drawn`, { words: await words(s, '#s2taken'), lines: await linesOf(s, '#s2taken'), footNow: await footNow(s) })
    await ringAll(s, ['#s2taken'])
    await formCut(s, k)
  }, ARCHST)

  /* 2.29 - the Give access form (a request "Jester", 142 holding an archived Jester): the note, then its twin */
  for (const sz of ['d', 'p']) for (const part of ['ask', 'told']) await pic('29', 'give-' + part)(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    await build(s, spec149())
    await hit(s, s.page.locator('#admWaiting .acc-row.req').filter({ hasText: 'Jester' }).locator('[data-approve]').first(), 700)
    if ((await s.page.getAttribute('#apvModeNew', 'aria-pressed')) !== 'true') await hit(s, '#apvModeNew', 500)
    FACT(`${k}.today`, { note: await words(s, '#apvNote'), buttons: await words(s, '[data-approving] > .acc-acts:last-of-type button'), callsign: await s.page.inputValue('#apvCs') })
    await s.page.evaluate(() => { document.querySelector('#apvNote').style.display = 'none' })
    if (part === 'ask') {
      FACT(`${k}.note`, await block(s, { at: '#apvCs', note: W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date), button: W.someoneNewR5, ask: W.askAdmin('142') }))
      FACT(`${k}.greyLook`, await greyLook(s, '#apvGo')); await under(s, '[data-approving] > .acc-acts:last-of-type', W.answerFirst)
    } else FACT(`${k}.note`, await block(s, { at: '#apvCs', told: W.newOneTold('Jester', '142') }))
    await s.page.evaluate(() => { document.activeElement?.blur?.(); scrollTo(0, 0) }); await wait(s, 300)
    FACT(`${k}.footNow`, { buttons: await footNow(s), lines: await linesOf(s, part === 'ask' ? '#s2arch .acc-note' : '#s2told') })
    await ringAll(s, part === 'ask' ? ['#s2arch', '#s2answer'] : ['#s2told'])
    const pane = await paneCol(s), a = await box(s, '#s2bar'), f = await box(s, '[data-approving]')
    await shotTall(s, k, { x: pane.x, y: a.y - 14, w: pane.w, h: f.y + f.h - a.y + 40 }, 10)
  }, WAITST)

  /* 2.30 (V-Q2) - an admin of BOTH squadrons meets the other's archived callsign: Hunter (142's admin, Plan of 149), 149
     picked, "Jester" typed. He may restore the man himself - the note gives him the way across (recommended), or only says so. */
  for (const [name, sizes, opt] of [['both', ['d', 'p'], 'across'], ['both-plain', ['d'], 'plain'], ['both-after', ['d'], 'after']]) for (const sz of sizes) await pic('30', name)(sz, async (s, k) => {
    await formTop(s, k, 'hunter', 149, 'Jester')
    const note = W.archivedNote('142', 'Jester', jester.seat, jester.cat, jester.date)
    if (opt === 'after') FACT(`${k}.note`, await block(s, { told: WS.bothAfter('Jester') }))
    else {
      FACT(`${k}.note`, await block(s, opt === 'across' ? { note, button: W.someoneNewR5, across: WS.bothAcross('142'), link: await linkLook(s) } : { note, button: W.someoneNewR5, ask: WS.bothPlain('142') }))
      FACT(`${k}.greyLook`, await greyLook(s, '#n176save')); await under(s, '#n176acts', W.answerFirst)
    }
    await wait(s, 200); FACT(`${k}.footNow`, await footNow(s))
    await ringAll(s, opt === 'after' ? ['#s2told'] : opt === 'across' ? ['#s2across'] : ['#s2ask'])
    await formCut(s, k)
  }, ARCHST)

  /* 2.36 - Save on another squadron's man whose home changed while his row stood open (Kestrel on 149; Cinch of 142,
     given View of 149, Save pressed after 142 posted him away): the app's own passing note, raised for real by a refused
     add and its words replaced */
  for (const sz of ['d', 'p']) await pic('36', 'changed')(sz, async (s, k) => {
    FACT(`${k}.add`, await start(s, 'kestrel'))
    /* the plan (§19.2, l.2385): "nothing is sent and the row closes with the words" - so Cinch's row stands CLOSED again
       under the note (the words review's fact 1, 26 Nov; the first pass drew it still open) */
    const rows = rowsOf('142', '149'), cinch = rows.find(r => r.cs === 'Cinch')
    const b = await build(s, spec149({ lit: 'other', sq: { 142: { label: WN.opened(W6.folded('142', S.COUNT['142'])), rows } } }))
    await s.page.evaluate(id => { document.querySelector('#' + id).id = 's2opened' }, 's2row-' + cinch.key)
    FACT(`${k}.built`, { rowOpened: b.opened, cinchRowClosed: await s.page.evaluate(() => document.querySelector('#s2opened').innerText.replace(/[ \t\r\n]+/g, ' ').trim()) })
    FACT(`${k}.pinned`, await pin(s))
    await s.page.evaluate(y => { const a = document.querySelector('#s2opened').getBoundingClientRect(); scrollBy(0, a.top - y) }, s.desk ? 300 : 260); await wait(s, 300)
    await s.page.evaluate(() => document.querySelector('#accAdd').click()); await wait(s, 500)
    const t0 = await holdToast(s); FACT(`${k}.realNoteRaised`, t0)
    await s.page.evaluate(w => { const t = document.querySelector('#toastEl'); const walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); let n, done = false; while ((n = walk.nextNode())) { if (!done && n.textContent.trim()) { n.textContent = w; done = true } else if (n.textContent.trim()) n.textContent = '' } }, WS.changedWhileOpen('Cinch'))
    await wait(s, 200)
    const t = await holdToast(s); FACT(`${k}.drawn`, { ...t, lines: await linesOf(s, '#toastEl') })
    const c = await box(s, '#s2opened'), pane = await paneCol(s)
    const { tringFixed } = await import('./draw-s2-lib.mjs'); await tringFixed(s, t.box)
    await shot(s, k, [{ x: pane.x, y: c.y - (s.desk ? 120 : 110), w: pane.w, h: 10 }, { ...c, h: c.h + 120 }, t.box], 14)
  }, R6)
} finally { await closeAll() }
