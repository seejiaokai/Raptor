// The screen after asking for access — two more welcoming looks (D1649, 5 Nov 26), drawn ON the real frozen build;
// nothing here is built. Each is drawn at his iPhone's 402 × 874 (WebKit) and his PC's 1536 (Chromium), beside today's.
//   A — "your puck": how he will appear on the schedule (the app's own puck, shown at twice its size on a strip of the
//       week), and three steps — request sent, an admin approves, you're on the schedule — the middle one current.
//   B — "the pass": the card as a pass with his callsign large, his initials, seat and CAT, a perforation, then the words.
//   C — his pick (D1650, "A combination of both"): B's pass on top, A's three steps, the read-only line and the two
//       buttons below; "Signed in as …" kept small at the foot. Run alone with ONLY=C.
//   A + band — look A with the failed-save band of [GUEST-SAVE-WARNING] (the app's own `.saveband` markup), the page
//       moved down under it so nothing is covered.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/aw1105-mock.mjs
import * as L from './aw1105-lib.mjs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../docs/mock/2026-11-05-access-wait/img')
mkdirSync(OUT, { recursive: true })

const CSS = `
/* ---- shared ---- */
#accessWaiting .login-card.aw{padding:22px 20px 20px}
.aw .acc-h{font-size:19px;line-height:1.3;margin-bottom:4px}
.aw-tag{position:fixed;left:10px;top:10px;z-index:99999;background:#ff3b6b;color:#fff;font:700 12px/1 system-ui,sans-serif;
  padding:6px 8px;border-radius:5px;letter-spacing:.02em}

/* ---- A: your puck + three steps ---- */
.aw-stage{margin:16px -20px 18px;padding:14px 20px 16px;border-top:1px solid var(--edge);border-bottom:1px solid var(--edge);
  background:
    repeating-linear-gradient(90deg,transparent 0 calc(20% - 1px),rgba(255,255,255,.045) calc(20% - 1px) 20%),
    var(--panel-2)}
.aw-days{display:grid;grid-template-columns:repeat(5,1fr);font-size:9px;font-weight:700;letter-spacing:.14em;color:var(--ink-3);
  text-transform:uppercase;text-align:center;margin-bottom:12px}
.aw-days span:nth-child(3){color:var(--ink-2)}
.aw-puckrow{display:flex;justify-content:center;height:34px;align-items:center}
.aw-puckrow .puck{transform:scale(2);transform-origin:center;cursor:default;box-shadow:0 6px 14px -6px rgba(0,0,0,.7)}
.aw-cap{text-align:center;font-size:11.5px;color:var(--ink-3);margin-top:10px}
.aw-steps{list-style:none;margin:0 0 16px;padding:0;display:grid;grid-template-columns:repeat(3,1fr);position:relative}
.aw-steps li{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;font-size:11.5px;line-height:1.3;
  color:var(--ink-3);position:relative;padding:0 4px}
.aw-steps li::before{content:'';position:absolute;top:10px;left:calc(-50% + 14px);right:calc(50% + 14px);height:2px;
  background:var(--edge-2);border-radius:1px}
.aw-steps li:first-child::before{display:none}
.aw-steps li.done+li::before{background:var(--accent)}
.aw-dot{width:22px;height:22px;border-radius:50%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;
  border:2px solid var(--edge-2);background:var(--panel)}
.aw-steps li.done .aw-dot{background:var(--accent);border-color:var(--accent)}
.aw-steps li.done{color:var(--ink-2)}
.aw-steps li.now{color:var(--ink);font-weight:600}
.aw-steps li.now .aw-dot{border-color:var(--accent);border-style:dashed}
.aw-steps li.now .aw-dot::after{content:'';width:8px;height:8px;border-radius:50%;background:var(--accent)}
.aw-steps svg{width:12px;height:12px;stroke:var(--accent-ink);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round}

/* ---- B: the pass ---- */
#accessWaiting .login-card.awb{padding:0;overflow:hidden;position:relative}
.awb-top{padding:20px 20px 18px;background:
  linear-gradient(135deg,rgba(59,198,232,.10),rgba(59,198,232,0) 55%),var(--panel-2)}
.awb-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.awb-row svg{width:22px;height:22px;fill:var(--accent)}
.awb-state{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--accent);
  border:1px solid rgba(59,198,232,.45);border-radius:999px;padding:4px 10px 4px 8px}
.awb-state i{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.awb-cs{font-size:30px;font-weight:800;letter-spacing:.12em;color:var(--ink);line-height:1.05;text-transform:uppercase;
  margin-right:-.12em;overflow-wrap:anywhere}
.awb-fields{display:grid;grid-template-columns:repeat(3,auto);justify-content:start;column-gap:28px;margin-top:14px}
.awb-fields dt{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:4px}
.awb-fields dd{margin:0;font-size:15px;font-weight:700;color:var(--ink)}
.awb-perf{position:relative;height:0;border-top:2px dashed var(--edge-2);margin:0 16px}
.awb-perf::before,.awb-perf::after{content:'';position:absolute;top:-12px;width:22px;height:22px;border-radius:50%;
  background:var(--bg);border:1px solid var(--edge)}
.awb-perf::before{left:-28px}
.awb-perf::after{right:-28px}
.awb-bot{padding:18px 20px 20px}
.awb-bot .aw-steps{margin:2px 0 18px}
.awc-who{text-align:center;margin:12px 0 0;font-size:12px;color:var(--ink-3)}
.awc-who b{color:var(--ink-2);font-weight:600}
`

const steps = `<ol class="aw-steps">
  <li class="done"><span class="aw-dot"><svg viewBox="0 0 12 12"><path d="M2.5 6.4l2.3 2.3 4.7-5"/></svg></span>Request sent</li>
  <li class="now"><span class="aw-dot"></span>An admin approves</li>
  <li><span class="aw-dot"></span>You're on the schedule</li>
</ol>`

async function reachWaiting(size) {
  const { page } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(300)
  await L.signOut(page)
  await L.signIn(page, 'stranger', 'x')
  await page.fill('#accCs', 'Stranger'); await page.fill('#accIni', 'ST')
  await page.selectOption('#accSeat', 'P').catch(async () => page.selectOption('#accSeat', await page.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).find(Boolean))))
  if (await page.locator('#accCat').count()) await page.selectOption('#accCat', 'OCU').catch(async () => page.selectOption('#accCat', await page.locator('#accCat option').evaluateAll(os => os.map(o => o.value).find(Boolean))))
  await page.click('#accSend'); await page.waitForTimeout(900)
  await page.waitForSelector('#accessWaiting')
  await page.addStyleTag({ content: CSS })
  return page
}

/* the picture: a phone whole; a desktop cut to the card's column */
async function shot(page, size, name, tag, top = 10) {
  await page.evaluate(([t, top]) => { document.querySelectorAll('.aw-tag').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'aw-tag'; d.textContent = t; d.style.top = top + 'px'; document.body.appendChild(d) }, [tag, top])
  let clip
  if (size === 'desktop') {
    const b = await page.locator('#accessWaiting .login-wrap').boundingBox()
    const w = 600, x = Math.round(b.x + b.width / 2 - w / 2), y = Math.max(0, Math.round(b.y - 70)), h = Math.min(864 - y, Math.round(b.height + 140))
    clip = { x, y, width: w, height: h }
    await page.evaluate(([x, y]) => { const t = document.querySelector('.aw-tag'); t.style.left = (x + 10) + 'px'; t.style.top = (y + 10) + 'px' }, [x, y])
  }
  await page.screenshot({ path: join(OUT, `${name}-${size === 'desktop' ? 'desk' : 'phone'}.png`), ...(clip ? { clip } : {}) })
}

function lookA() {
  const card = document.querySelector('#accessWaiting .login-card')
  const asked = document.querySelector('#accAsked')
  const cs = asked.querySelector('b').textContent
  const sum = (asked.textContent.match(/\(([^)]*)\)/) || [, ''])[1]
  const cat = (sum.match(/CAT (\w+)/) || [, 'OCU'])[1]
  const cls = { OCU: 'q-ocu', D: 'q-d', C: 'q-c', B: 'q-b', A: 'q-a' }[cat] || 'q-ocu'
  const who = card.querySelector('.acc-who').outerHTML
  const rest = [...card.querySelectorAll('#accAsked ~ *')].map(n => n.outerHTML).join('')
  card.classList.add('aw')
  card.innerHTML = `<h2 class="acc-h">Your request is with the admins</h2>${who}
    <div class="aw-stage" aria-hidden="true">
      <div class="aw-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div>
      <div class="aw-puckrow"><span class="puck"><span class="nm">${cs}</span><span class="role ${cls}">${cat}</span></span></div>
      <div class="aw-cap">How you'll appear on the schedule · ${sum}</div>
    </div>
    ${window.__awSteps}
    ${rest}`
}

function lookB() {
  const card = document.querySelector('#accessWaiting .login-card')
  const asked = document.querySelector('#accAsked')
  const cs = asked.querySelector('b').textContent
  const sum = (asked.textContent.match(/\(([^)]*)\)/) || [, ''])[1]
  const parts = sum.split('·').map(s => s.trim())
  const ini = parts[0] || '—', seat = parts[1] || '—', cat = ((parts[2] || '').replace(/^CAT\s*/, '')) || '—'
  const who = card.querySelector('.acc-who').outerHTML
  const rest = [...card.querySelectorAll('#accAsked ~ *')].map(n => n.outerHTML).join('')
  const glyph = document.querySelector('.lb-glyph').outerHTML.replace('class="lb-glyph"', '')
  card.classList.add('awb')
  card.innerHTML = `<div class="awb-top">
      <div class="awb-row">${glyph}<span class="awb-state"><i></i>Waiting for an admin</span></div>
      <div class="awb-cs">${cs}</div>
      <dl class="awb-fields"><div><dt>Initials</dt><dd>${ini}</dd></div><div><dt>Seat</dt><dd>${seat}</dd></div><div><dt>CAT</dt><dd>${cat}</dd></div></dl>
    </div>
    <div class="awb-perf" aria-hidden="true"></div>
    <div class="awb-bot"><h2 class="acc-h">Your request is with the admins</h2>${who}
      <p class="acc-p">You'll be able to sign in as soon as an admin approves it.</p>${rest}</div>`
}

function lookC() {
  const card = document.querySelector('#accessWaiting .login-card')
  const asked = document.querySelector('#accAsked')
  const cs = asked.querySelector('b').textContent
  const sum = (asked.textContent.match(/\(([^)]*)\)/) || [, ''])[1]
  const parts = sum.split('·').map(s => s.trim())
  const ini = parts[0] || '—', seat = parts[1] || '—', cat = ((parts[2] || '').replace(/^CAT\s*/, '')) || '—'
  const name = card.querySelector('.acc-who b').textContent
  const rest = [...card.querySelectorAll('#accAsked ~ *')].map(n => n.outerHTML).join('')
  const glyph = document.querySelector('.lb-glyph').outerHTML.replace('class="lb-glyph"', '')
  card.classList.add('awb')
  card.innerHTML = `<div class="awb-top">
      <div class="awb-row">${glyph}<span class="awb-state"><i></i>Waiting for an admin</span></div>
      <div class="awb-cs">${cs}</div>
      <dl class="awb-fields"><div><dt>Initials</dt><dd>${ini}</dd></div><div><dt>Seat</dt><dd>${seat}</dd></div><div><dt>CAT</dt><dd>${cat}</dd></div></dl>
    </div>
    <div class="awb-perf" aria-hidden="true"></div>
    <div class="awb-bot">${window.__awSteps}${rest}<p class="awc-who">Signed in as <b>${name}</b></p></div>`
}

const BAND = () => {
  const b = document.createElement('div')
  b.className = 'saveband'; b.setAttribute('role', 'status')
  b.innerHTML = '<span class="sv-msg"><span class="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span><button type="button">Retry</button>'
  Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999', height: '40px' })
  document.body.appendChild(b)
  document.querySelector('#accessWaiting').style.top = '40px'
}
/* his question of 5 Nov 26: "is it weird that the fade is abruptly stopped at the top half" — two ways out, phone only.
   smooth: one card surface, the blue tint fading to nothing before the tear line, the tear the only divider;
   solid: the pass a plain lighter surface with no tint, the foot the card's own, a clean break at the tear. */
const SMOOTH = `#accessWaiting .login-card.awb{background:linear-gradient(180deg,rgba(59,198,232,.10) 0,rgba(59,198,232,.04) 26%,rgba(59,198,232,0) 44%),var(--panel)}
#accessWaiting .awb-top{background:transparent}`
const SOLID = `#accessWaiting .awb-top{background:var(--panel-2)}`
if (process.env.ONLY === 'CV') {
  for (const [name, css, tag] of [['C-smooth', SMOOTH, 'C — the tint fades out before the tear'], ['C-solid', SOLID, 'C — no tint: two plain surfaces']]) {
    const page = await reachWaiting('phone')
    await page.evaluate(s => { window.__awSteps = s }, steps)
    await page.evaluate(lookC)
    await page.addStyleTag({ content: css })
    await shot(page, 'phone', name, tag)
    await page.context().close()
  }
  console.log('done CV', L.errs.length ? L.errs : 'no browser errors')
  process.exit(0)
}
if (process.env.ONLY === 'C') {
  for (const size of ['phone', 'desktop']) {
    const page = await reachWaiting(size)
    await page.evaluate(s => { window.__awSteps = s }, steps)
    await page.evaluate(lookC)
    await shot(page, size, 'C', 'C — your pick: the pass, then the steps')
    if (size === 'phone') { await page.evaluate(BAND); await shot(page, size, 'C-band', 'C — with the "Not saved" band', 52) }
    await page.context().close()
  }
  console.log('done C', L.errs.length ? L.errs : 'no browser errors')
  process.exit(0)
}

for (const size of ['phone', 'desktop']) {
  /* today */
  let page = await reachWaiting(size)
  await shot(page, size, 'today', 'TODAY')
  /* A */
  await page.evaluate(s => { window.__awSteps = s }, steps)
  await page.evaluate(lookA)
  await shot(page, size, 'A', 'A — your puck, and where your request is')
  /* A with the failed-save band: the band across the top, the page moved down by its height so nothing is covered */
  if (size === 'phone') {
    await page.evaluate(() => {
      const b = document.createElement('div')
      b.className = 'saveband'; b.setAttribute('role', 'status')
      b.innerHTML = '<span class="sv-msg"><span class="sv-ico" aria-hidden="true">⚠</span>Not saved — keep this page open</span><button type="button">Retry</button>'
      Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '9999', height: '40px' })
      document.body.appendChild(b)
      document.querySelector('#accessWaiting').style.top = '40px'
    })
    await shot(page, size, 'A-band', 'A — with the "Not saved" band', 52)
  }
  await page.context().close()
  /* B */
  page = await reachWaiting(size)
  await page.evaluate(lookB)
  await shot(page, size, 'B', 'B — the pass')
  await page.context().close()
}
await L.finish('aw1105-mock').catch(() => {})
console.log('done', L.errs.length ? L.errs : 'no browser errors')
process.exit(0)
