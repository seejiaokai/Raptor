/* THE MOCK-UP FOR [ONE-DOOR] (27 Sep 26) — his rulings D309, D310 (one door: Admin → Users shows every person's sign-in
   and roster state and carries every action; Quals loses its archive), D308 (a post-in date wherever a man is put on
   the roster) and D305 (the man himself told, on his first sign-in after Restore, to check his quals and CAT). Pictures
   of the REAL app (the production build, a fresh demo world each time) with the proposed rows drawn into its own markup
   and classes (acc-row, acc-main, mfield, abtn …) and a few small new ones (the two dots, the search box) — so the look
   is the app's own. The waiting request, the switch-off and the Quals page are the real thing, done through their own
   controls. Nothing here is built; the page is docs/mock/one-door.html. Run from raptor-port/, the preview on 4178:
     node scripts/handpass/am/mk-one-door.mjs
   A RECORD once the page is approved: re-running it on a later build draws into screens that may have moved. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const OUT = 'docs/mock/img/one-door'
mkdirSync(OUT, { recursive: true })
const BASE = process.env.HP_URL || 'http://localhost:4178/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const done = []

async function open(w, h, scale = 1) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale })).newPage()
  await page.goto(BASE + '?fresh=1'); await page.waitForSelector('#luser')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return page
}
async function signIn(page, u, p = 'x') {
  if (!(await page.locator('#luser').count())) {
    for (const s of ['#logout', '#accOut', '#guestOut']) { const l = page.locator(s); if (await l.count() && await l.isVisible()) { await l.click(); break } }
    if (!(await page.locator('#luser').count())) { const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(300); await page.click('#drawerLogout') } }
    await page.waitForSelector('#luser')
  }
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(800)
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await page.waitForTimeout(700) }
async function snap(page, name, target, opts = {}) {
  const f = `${OUT}/${name}.png`
  if (target) await page.locator(target).first().screenshot({ path: f, ...opts })
  else await page.screenshot({ path: f, ...opts })
  done.push(name); console.log('ok', name)
}
async function step(name, fn) { try { await fn() } catch (e) { console.log('FAILED', name, String(e.message || e).slice(0, 300)) } }
const hideToast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.opacity = '0' })

/* the new pieces' look — the app's own tokens (scheduler.css :root), nothing new in colour */
const CSS = `
#page-admin .od-head{display:flex;align-items:center;gap:10px;margin:0 0 10px}
#page-admin .od-head .adm-sub{margin:0}
#page-admin .od-find{margin-left:auto;flex:0 1 220px;min-width:0;background:var(--bg);border:1px solid var(--edge);color:var(--ink);
  font:13px 'Inter Tight',sans-serif;padding:7px 10px;border-radius:9px}
#page-admin .od-c{flex:0 0 52px;display:inline-flex;justify-content:center;align-items:center}
#page-admin .od-c i{width:9px;height:9px;border-radius:50%;display:inline-block;background:var(--ink-3);opacity:.45}
#page-admin .od-c i.g{background:var(--ok);opacity:1;box-shadow:0 0 0 3px rgba(87,201,122,.16)}
#page-admin .od-c i.r{background:var(--hard);opacity:1;box-shadow:0 0 0 3px rgba(240,85,95,.16)}
#page-admin .od-rc{flex:0 0 62px;display:inline-flex;justify-content:flex-end}
#page-admin .od-row{flex-wrap:wrap}
#page-admin .od-row>.acc-main{flex:1 1 0}
#page-admin .od-cols{display:flex;gap:6px 10px;align-items:center;padding:0 0 6px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
#page-admin .od-cols .od-grow{flex:1 1 0}
#page-admin .od-rw{display:none}
#page-admin .od-po{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:1px 7px;border-radius:999px;
  background:rgba(229,168,59,.14);color:var(--adv)}
#page-admin .od-arch{margin-top:12px}
#page-admin .od-arch>.abtn{font-size:12px}
#page-admin .od-row-on{background:var(--panel-2);margin:0 -10px;padding:8px 10px;border-radius:10px;border-bottom-color:transparent}
#page-admin .od-err{color:#FBB4B9;font-size:11.5px;line-height:1.35;margin:-6px 0 10px}
#page-admin .od-said{color:var(--ink-3);font-size:11.5px;margin:-4px 0 10px}
#toastEl{visibility:hidden !important}
@media (max-width:820px){ #page-admin .od-find{flex:1 1 100%;margin-left:0} #page-admin .od-head{flex-wrap:wrap}
  #page-admin .od-rc{display:none} #page-admin .od-rw{display:inline} #page-admin .od-c{flex-basis:46px} }
`

/* ONE ROW PER PERSON. `st`: 'you' | 'on' | 'off' (suspended) | 'none' (no sign-in) | 'arch'. The sign-in dot: green on,
   red suspended, grey none; the roster dot: green on the roster, red archived. */
const ROW = `(o) => {
  const dot = (cls, tip) => '<span class="od-c" title="' + tip + '" aria-label="' + tip + '"><i class="' + cls + '"></i></span>'
  const sIn = o.st === 'none' || (o.st === 'arch' && !o.signin) ? dot('', 'No sign-in') : (o.st === 'off' || o.st === 'arch') ? dot('r', 'Sign-in suspended') : dot('g', 'Can sign in')
  const ros = o.st === 'arch' ? dot('r', 'Archived') : dot('g', 'On the roster')
  const roleW = o.signin ? (o.admin ? 'Admin' : 'Member') : ''
  const sub = (o.signin ? '<b>' + o.signin + '</b>' : 'no sign-in') + (roleW ? '<span class="od-rw"> · ' + roleW + '</span>' : '') + ' · ' + o.seat
    + (o.po ? ' <span class="od-po">' + o.po + '</span>' : '') + (o.st === 'you' ? ' <span class="acc-tag you">you</span>' : '')
  const role = '<span class="od-rc">' + (o.signin ? '<span class="ub ' + (o.admin ? 'admin' : 'main') + '">' + roleW + '</span>' : '') + '</span>'
  return '<div class="acc-row od-row' + (o.open ? ' od-row-on' : '') + '" data-od="' + o.id + '"><button class="acc-main acc-tap"' + (o.st === 'you' ? ' disabled' : '') + '>'
    + '<span class="acc-name">' + o.cs + '</span><span class="acc-sub">' + sub + '</span></button>'
    + sIn + ros + role + (o.held ? '<span class="acc-held">' + o.held + '</span>' : '') + (o.open || '') + '</div>'
}`

/* the demo people, as rows (read live from the app's own roster) */
async function peopleRows(page, over = {}) {
  return page.evaluate(({ over }) => {
    const P = window.PEOPLE
    const acct = { stiff: ['ad', true], bane: ['us', false], casper: ['outlaw', false], rocky: ['hex', false] }
    const seatOf = p => p.pers || p.seat === 'GND' ? 'Personnel' : (p.seat === 'FCP' ? 'Pilot' : 'WSO') + (p.q ? ' · CAT ' + p.q : '')
    return Object.keys(P).filter(id => !P[id].special && !P[id].deleted).map(id => {
      const p = P[id], a = acct[id]
      const o = { id, cs: String(p.cs), seat: seatOf(p), signin: a ? a[0] : '', admin: a ? a[1] : false,
        st: id === 'stiff' ? 'you' : a ? 'on' : 'none' }
      return Object.assign(o, over[id] || {})
    }).sort((x, y) => x.cs.localeCompare(y.cs))
  }, { over })
}

/* the whole Users pane, drawn: Waiting (the REAL block, its two buttons renamed), People, Archived, Add a person, Guest */
async function drawUsers(page, { over = {}, openId = null, openHTML = '', archOpen = false, archOpenId = null, archHTML = '', rows = null, addHTML = null } = {}) {
  const list = rows || await peopleRows(page, over)
  await page.evaluate(({ list, css, ROW, openId, openHTML, archOpen, archOpenId, archHTML, addHTML }) => {
    const row = eval(ROW)
    if (!document.getElementById('odCss')) { const s = document.createElement('style'); s.id = 'odCss'; s.textContent = css; document.head.appendChild(s) }
    /* the real Waiting block: "Approve · Decline" read "Give access · Refuse" (D309) */
    for (const b of document.querySelectorAll('[data-approve]')) b.textContent = 'Give access'
    for (const b of document.querySelectorAll('[data-decline]')) b.textContent = 'Refuse'
    const acc = document.getElementById('accList'); if (!acc) throw new Error('no accList')
    const onRoster = list.filter(o => o.st !== 'arch'), arch = list.filter(o => o.st === 'arch')
    /* the "Accounts" heading becomes "People · N" with the search box */
    const h = acc.previousElementSibling
    h.outerHTML = '<div class="od-head"><h4 class="adm-sub">People · ' + onRoster.length + '</h4><input class="od-find" placeholder="Find a callsign or sign-in"></div>'
    const cols = '<div class="od-cols"><span class="od-grow"></span><span class="od-c">Sign-in</span><span class="od-c">Roster</span><span class="od-rc"></span></div>'
    acc.style.borderTop = 'none'
    acc.innerHTML = cols + '<div style="border-top:1px solid var(--edge)"></div>' + onRoster.map(o => row(Object.assign({}, o, { open: o.id === openId ? openHTML : '' }))).join('')
    acc.insertAdjacentHTML('afterend', '<div class="od-arch" id="odArch"><button class="abtn">' + (archOpen ? '▾' : '▸') + ' Archived · ' + arch.length + '</button>'
      + (archOpen ? '<div class="acc-list" style="margin-top:8px;border-top:none">' + '<div class="od-cols"><span class="od-grow"></span><span class="od-c">Sign-in</span><span class="od-c">Roster</span><span class="od-rc"></span></div><div style="border-top:1px solid var(--edge)"></div>' + arch.map(o => row(Object.assign({}, o, { open: o.id === archOpenId ? archHTML : '' }))).join('') + '</div>' : '') + '</div>')
    /* "Add an account" becomes "Add a person": New person only — a man already on the roster gets his sign-in on his row */
    if (addHTML != null) { const add = document.getElementById('accAddBlock'); add.innerHTML = addHTML }
  }, { list, css: CSS, ROW, openId, openHTML, archOpen, archOpenId, archHTML, addHTML })
}

const today = '2026-09-27'
const field = (label, inner) => `<div class="mfield"><label>${label}</label>${inner}</div>`
const input = (v, ph = '') => `<input value="${v}" placeholder="${ph}">`
const roleSel = r => `<select><option${r === 'main' ? ' selected' : ''}>Member — own inputs, quals and bids</option><option${r === 'admin' ? ' selected' : ''}>Admin — schedules and manages</option></select>`
const acts = (...b) => `<div class="acc-acts">${b.join('')}</div>`
const btn = (t, cls = '') => `<button class="abtn ${cls}">${t}</button>`
const edit = inner => `<div class="acc-edit">${inner}</div>`
const postIn = v => field('Post in', `<input type="date" value="${v}">`)

/* the opened rows, one per state (D310's list) */
const OPEN_ACTIVE = edit(`<div class="adm-2col">${field('Sign-in (defence mail)', input('outlaw'))}${field('Role', roleSel('main'))}</div>`
  + acts(btn('Save', 'primary'), btn('Suspend'), btn('Archive'), btn('Delete', 'danger'), btn('Cancel')))
const OPEN_OFF = edit(`<div class="adm-2col">${field('Sign-in (defence mail)', input('hex'))}${field('Role', roleSel('main'))}</div>`
  + acts(btn('Save', 'primary'), btn('Enable'), btn('Archive'), btn('Delete', 'danger'), btn('Cancel')))
const OPEN_NONE = cs => edit(`<div class="adm-2col">${field('Sign-in (defence mail)', input('', 'name@mail'))}${field('Role', roleSel('main'))}</div>`
  + acts(btn('Give sign-in', 'primary'), btn('Archive'), btn('Delete', 'danger'), btn('Cancel')))
const OPEN_ARCH = (cs, taken) => edit(`<div class="adm-2col">${field('Callsign/Name', input(taken ? cs + ' 2' : cs))}${postIn(today)}</div>`
  + (taken ? `<p class="od-err">${cs} is taken on the roster — give him another callsign.</p>` : '')
  + `<p class="od-said">He can sign in at once; the Leave War counts him from the post-in date.</p>`
  + acts(btn(taken ? `Restore as ${cs} 2` : 'Restore', 'primary'), btn('Delete', 'danger'), btn('Cancel')))
const DEL_ARMED = cs => edit(`<div class="adm-2col">${field('Sign-in (defence mail)', input('outlaw'))}${field('Role', roleSel('main'))}</div>`
  + acts(btn('Save', 'primary'), btn('Suspend'), btn('Archive'), `<button class="abtn danger del-armed" style="background:rgba(240,85,95,.18);color:#fff;border-color:#f0555f">Tap again to delete ${cs}</button>`, btn('Cancel'))
  + '<p class="adm-note acc-note acc-del-note">Goes: his account, his Quals row, every day still to come. Days he flew keep his puck. Can’t be undone.</p>')

/* the Add a person form (New person only) with its post-in date (D308) */
const SEATSEL = `<select><option>Pick…</option><option>Pilot</option><option>WSO</option><option>Personnel (ground crew)</option></select>`
const CATSEL = `<select><option>Pick…</option></select>`
const ADD = `<h4 class="adm-sub">Add a person</h4>
  <div class="adm-2col">${field('Callsign/Name', input(''))}${field('Initials', input(''))}</div>
  <div class="adm-2col">${field('Pilot, WSO or personnel', SEATSEL)}${field('CAT', CATSEL)}</div>
  <div class="adm-2col">${field('Sign-in (defence mail)', input('', "blank if he won't use the app"))}${postIn(today)}</div>
  <button class="abtn primary" style="width:100%">Add person</button>
  <p class="adm-note">Makes his Quals row, and his sign-in if you give one. The Leave War counts him from the post-in date.</p>`

/* the demo's states: Hex suspended (the REAL switch-off first), two men archived, one with no sign-in drawn open, a
   posting waiting for its date */
const STATES = {
  rocky: { st: 'off' },
  vector: { po: 'posting out 14 Oct · Overseas Sqn' },
}
async function world(page) {
  /* a REAL access request from a new man, so the Waiting block is the app's own */
  await signIn(page, 'ace2@mail'); await page.fill('#accCs', 'Ace'); await page.fill('#accIni', 'AJ'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await page.waitForTimeout(300)
  await signIn(page, 'ad', 'a'); await go(page, 'admin')
  /* on a phone the Users list is drilled into first */
  if (await page.locator('.adm-cat', { hasText: 'Users' }).first().isVisible() && !(await page.locator('#accList').isVisible())) { await page.locator('.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(300) }
  /* the REAL suspension of Hex (the act "Suspend" names) */
  await page.click('[data-acct="achex"] .acc-tap'); await page.click('#accEdOnOff'); await page.waitForTimeout(300)
  /* two men archived (drawn in memory only — Quals' ✕ is going) */
  const ids = await page.evaluate(() => {
    const P = window.PEOPLE, find = cs => Object.keys(P).find(k => P[k].cs === cs)
    const out = { vector: find('Vector'), ace: find('Ace'), wisp: find('Wisp'), dash: find('Dash') }
    return out
  })
  return ids
}

/* ---------- 1 · The one list: every person, two dots, the actions on his row ---------- */
await step('1 people desktop', async () => {
  const page = await open(1440, 1400); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const over = { rocky: { st: 'off' }, [ids.vector]: { po: 'posting out 14 Oct · Overseas Sqn' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await drawUsers(page, { over, addHTML: ADD })
  await hideToast(page)
  await snap(page, 'desktop-1-people', '.adm-pane')
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150)
  /* the top of the list and its foot, at reading size */
  const box = await page.locator('.adm-pane').boundingBox()
  await snap(page, 'desktop-1a-people-top', null, { clip: { x: box.x, y: box.y, width: box.width, height: 700 } })
  /* the rows that carry a state: Hex (suspended) to Saber (you) */
  await page.evaluate(() => document.querySelector('[data-od="rocky"]').scrollIntoView({ block: 'start' })); await page.evaluate(() => window.scrollBy(0, -120)); await page.waitForTimeout(150)
  const hx = await page.locator('[data-od="rocky"]').boundingBox(), sb = await page.locator('[data-od="stiff"]').boundingBox()
  await snap(page, 'desktop-1c-people-states', null, { clip: { x: box.x, y: hx.y - 36, width: box.width, height: sb.y + sb.height - hx.y + 44 } })
  await page.evaluate(() => document.getElementById('odArch').scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  const arch = await page.locator('#odArch').boundingBox(), box2 = await page.locator('.adm-pane').boundingBox()
  await snap(page, 'desktop-1b-people-foot', null, { clip: { x: box2.x, y: arch.y - 300, width: box2.width, height: 380 } })
})
await step('1 people phone', async () => {
  const page = await open(390, 844, 2); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const over = { rocky: { st: 'off' }, [ids.vector]: { po: 'posting out 14 Oct · Overseas Sqn' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await drawUsers(page, { over, addHTML: ADD })
  await hideToast(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await snap(page, 'phone-1-people')
  await page.evaluate(() => { document.getElementById('odArch').scrollIntoView({ block: 'center' }) }); await page.waitForTimeout(200)
  await snap(page, 'phone-1b-people-foot')
})

/* ---------- 2 · A row opened, in each state ---------- */
await step('2 open states', async () => {
  const page = await open(1440, 1100); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const base = { rocky: { st: 'off' }, [ids.vector]: { po: 'posting out 14 Oct · Overseas Sqn' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await hideToast(page)
  /* active */
  await drawUsers(page, { over: base, openId: 'casper', openHTML: OPEN_ACTIVE, addHTML: ADD })
  await snap(page, 'desktop-2a-open-active', '[data-od="casper"]')
  /* the delete, armed */
  await go(page, 'quals'); await go(page, 'admin')
  await drawUsers(page, { over: base, openId: 'casper', openHTML: DEL_ARMED('Outlaw'), addHTML: ADD })
  await snap(page, 'desktop-2b-delete-armed', '[data-od="casper"]')
  /* suspended */
  await go(page, 'quals'); await go(page, 'admin')
  await drawUsers(page, { over: base, openId: 'rocky', openHTML: OPEN_OFF, addHTML: ADD })
  await snap(page, 'desktop-2c-open-suspended', '[data-od="rocky"]')
  /* no sign-in */
  await go(page, 'quals'); await go(page, 'admin')
  const noneId = await page.evaluate(() => { const P = window.PEOPLE; return Object.keys(P).find(k => P[k].cs === 'Drifter') })
  await drawUsers(page, { over: base, openId: noneId, openHTML: OPEN_NONE('Drifter'), addHTML: ADD })
  await snap(page, 'desktop-2d-open-nosignin', `[data-od="${noneId}"]`)
  /* archived — Restore with its post-in date; and when his callsign is taken */
  await go(page, 'quals'); await go(page, 'admin')
  await drawUsers(page, { over: base, archOpen: true, archOpenId: ids.dash, archHTML: OPEN_ARCH('Dash', false), addHTML: ADD })
  await snap(page, 'desktop-2e-archived-restore', '#odArch')
  await go(page, 'quals'); await go(page, 'admin')
  await drawUsers(page, { over: base, archOpen: true, archOpenId: ids.dash, archHTML: OPEN_ARCH('Dash', true), addHTML: ADD })
  await snap(page, 'desktop-2f-archived-taken', '#odArch')
})
await step('2 phone open', async () => {
  const page = await open(390, 844, 2); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const base = { rocky: { st: 'off' }, [ids.vector]: { po: 'posting out 14 Oct · Overseas Sqn' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await hideToast(page)
  await drawUsers(page, { over: base, openId: 'rocky', openHTML: OPEN_OFF, addHTML: ADD })
  await page.evaluate(() => document.querySelector('[data-od="rocky"]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  await snap(page, 'phone-2-open-suspended')
})

/* ---------- 3 · Waiting: Give access / Refuse, New person with its post-in date (D308) ---------- */
await step('3 waiting', async () => {
  const page = await open(1440, 1100); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const base = { rocky: { st: 'off' }, [ids.vector]: { po: 'posting out 14 Oct · Overseas Sqn' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await hideToast(page)
  await drawUsers(page, { over: base, addHTML: ADD })
  await snap(page, 'desktop-3a-waiting', '#admWaiting')
  /* the REAL approve form, on New person, with the post-in date drawn in above Role */
  await page.click('#admWaiting [data-approve]'); await page.waitForTimeout(250)
  if (await page.locator('#apvModeNew').count()) await page.click('#apvModeNew')
  await page.evaluate(d => {
    const role = document.getElementById('apvRole').closest('.mfield')
    const wrap = document.createElement('div'); wrap.className = 'adm-2col'
    role.before(wrap); wrap.appendChild(role)
    wrap.insertAdjacentHTML('afterbegin', `<div class="mfield"><label>Post in</label><input type="date" value="${d}"></div>`)
    document.getElementById('apvGo').textContent = 'Add person and give access'
    const c = document.getElementById('apvCancel'); if (c) c.textContent = 'Cancel'
    document.querySelector('[data-approving]').scrollIntoView({ block: 'center' })
  }, today)
  await snap(page, 'desktop-3b-give-access-new', '[data-req]')
})

/* ---------- 4 · Add a person (New person only) with its post-in date ---------- */
await step('4 add', async () => {
  const page = await open(1440, 1100); await signIn(page, 'ad', 'a')
  const ids = await world(page)
  const base = { rocky: { st: 'off' }, [ids.wisp]: { st: 'arch' }, [ids.dash]: { st: 'arch', signin: 'dash', admin: false } }
  await hideToast(page)
  await drawUsers(page, { over: base, addHTML: ADD })
  await page.evaluate(() => document.getElementById('accAddBlock').scrollIntoView({ block: 'center' }))
  await snap(page, 'desktop-4-add-person', '#accAddBlock')
})

/* ---------- 5 · He's back: his own first sign-in after Restore (D305, 3a) ---------- */
const WELCOME = `<div class="back-prompt od-welcome" style="margin:10px 16px">
  <span><b>Welcome back, Hex</b> — check your quals and CAT.</span>
  <button class="abtn primary">Check my quals</button><button class="abtn">Later</button></div>`
await step('5 welcome desktop', async () => {
  const page = await open(1440, 900); await signIn(page, 'hex')
  await page.evaluate(html => {
    /* under the week's own bar, above the days — where a note to him would sit */
    document.querySelector('#vWeek').insertAdjacentHTML('beforebegin', html.replace('margin:10px 16px', 'margin:0 0 10px'))
  }, WELCOME)
  await page.waitForTimeout(200)
  await snap(page, 'desktop-5-welcome', null, { clip: { x: 0, y: 0, width: 1440, height: 470 } })
})
await step('5 welcome phone', async () => {
  const page = await open(390, 844, 2); await signIn(page, 'hex')
  await page.evaluate(html => {
    document.querySelector('#vWeek').insertAdjacentHTML('beforebegin', html.replace('margin:10px 16px', 'margin:0 0 8px'))
  }, WELCOME)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  await snap(page, 'phone-5-welcome', null, { clip: { x: 0, y: 0, width: 390, height: 600 } })
})

/* ---------- 6 · Quals after: no ✕ archive, no Archived list (D310) ---------- */
await step('6 quals', async () => {
  const page = await open(1440, 900); await signIn(page, 'ad', 'a'); await go(page, 'quals')
  await page.click('#qViewW').catch(() => {}); await page.waitForTimeout(200)
  await page.click('#qEdit').catch(() => {}); await page.waitForTimeout(300)
  await snap(page, 'desktop-6a-quals-before', '.qwrap', { clip: undefined })
  await page.addStyleTag({ content: '#qtbl [data-arch]{display:none !important} #qArchive{display:none !important}' })
  await page.waitForTimeout(200)
  await snap(page, 'desktop-6b-quals-after', '.qwrap')
})

console.log(`\n${done.length} pictures: ${done.join(', ')}`)
await browser.close()
