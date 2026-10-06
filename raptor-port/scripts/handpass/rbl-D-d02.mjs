/* D-02 — the crew list on a line with no take-off. Variants: brief | intime | meeting | blank. Env HP_PHONE=1 for the phone. */
import * as K from './rbl-D-lib.mjs'
const { B, W, R, X, MON, TUE, clean } = K
const sz = K.PHONE ? 'phone' : 'desk'
const variant = process.argv[2] || 'brief'
const OTHER = 'pike'     // an idle pilot (Nomad): the other man in the front seat
const ID = `D-02-${variant}-${sz}`

/* X's name in the crew list as the app paints it: struck (computed), its reason line, its tooltip */
async function roster(p, who = X) {
  return p.evaluate(w => {
    const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${w}"]`)].find(x => x.offsetParent !== null)
    if (!e) return { found: false }
    const nm = e.querySelector('.nm') || e
    const cs = getComputedStyle(nm), cs2 = getComputedStyle(e)
    const line = x => getComputedStyle(x).textDecorationLine.includes('line-through')
    const struck = line(nm) || line(e) || e.classList.contains('no') || e.classList.contains('na') || e.classList.contains('dim')
    const near = []
    for (let n = e.nextElementSibling, i = 0; n && i < 2; n = n.nextElementSibling, i++) near.push((n.innerText || '').replace(/\s+/g, ' ').trim())
    const par = e.parentElement
    return { found: true, struck, own: (e.innerText || '').replace(/\s+/g, ' ').trim(), cls: e.className, opacity: cs2.opacity, deco: cs.textDecorationLine, title: (e.getAttribute('title') || '') + ' | ' + ((e.querySelector('.puck') || {}).title || ''), next: near, parentCls: par ? par.className : '', parentText: par ? (par.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160) : '' }
  }, who)
}
const sayRoster = r => !r.found ? 'name not in the crew list' : `struck ${r.struck ? 'YES' : 'no'} (text-decoration "${r.deco}", opacity ${r.opacity}, class "${r.cls}") · beside it ${JSON.stringify(r.next)} · tooltip "${r.title}"`
async function arm(p, key) {
  const el = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(150)
  try { await el.click({ timeout: 2500 }) } catch { const b = await el.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await K.sleep(400)
  return p.evaluate(() => (window.ARM && window.ARM.key) || null)
}
const toastNow = p => p.evaluate(() => { const e = document.getElementById('toastEl'); return e && (e.textContent || '').trim() && getComputedStyle(e).opacity !== '0' ? e.textContent.trim() : null })

const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X), ocs = await B.csOf(p, OTHER)
  await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.addFlyWave(p, TUE)
  let fixture = `Monday ZM 20:00–22:30 with ${cs}; Tuesday + Wave (a new wave, its one line blank)`
  if (variant === 'brief') { await K.ff(p, TUE, t.gi, 0, 'br', '05:00'); fixture += `, Brief 05:00 typed, no take-off, no landing` }
  if (variant === 'intime') {
    await K.itAdd(p, 'board', TUE, t.gi); await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 IN TIME')
    fixture += `, an In-time / Rally line "${(await K.itLines(p, TUE, t.gi)).join(' / ')}" typed on the wave (no Brief)`
  }
  if (variant === 'meeting' || variant === 'meeting2') {
    const gr = await K.groundRow(p, TUE, 'SQN BRIEF', '08:00', '09:00', X); const g = await K.groundOf(p, TUE, gr.ri) + ' (placed: ' + gr.took + ')'
    fixture += `, ${cs} put on a Ground Programme row ${g}`
  }
  if (variant === 'brief' || variant === 'intime' || variant === 'meeting2') {
    const o = await K.seat(p, TUE, t.gi, 0, 0, 'p', OTHER); fixture += `; ${ocs} in the FRONT seat (took ${o.took})`
  }
  const lineNow = await K.lineOf(p, TUE, t.gi, 0)
  const w0 = (await K.held(p, TUE, X)).map(x => x.code)
  /* (1) the back seat of the same aircraft — recorded: a pilot offered a back seat */
  let backSay = ''
  if (variant === 'brief') {
    const kb = `${TUE}.${t.gi}.0.0.w`
    const ab = await arm(p, kb); const rb = await roster(p)
    await p.evaluate(x => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person="' + x + '"]')].find(q => q.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center' }) }, X); await K.sleep(250)
    const pb = await B.pic(p, `${variant}-1-back-seat-armed-crewlist`)
    backSay = `back seat armed (arm ${ab}): ${sayRoster(rb)}`
    await p.keyboard.press('Escape'); await K.sleep(200)
    R(`${ID}.0`, `${fixture}; arm the BACK seat of the same aircraft and read ${cs}'s name in the crew list before placing anything`, backSay, 'RECORDED', [pb])
  }
  /* (2) the seat he is placed in: the front seat of a second aircraft (or the blank line's own front seat when nobody is there) */
  let key
  if (variant === 'brief' || variant === 'intime' || variant === 'meeting2') {
    await K.boardTo(p, TUE)
    const b = p.locator(`#schedBoard [data-lac="${TUE}.${t.gi}.0"]`).first()
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await K.sleep(600)
    key = `${TUE}.${t.gi}.0.1.p`
  } else key = `${TUE}.${t.gi}.0.0.p`
  const a = await arm(p, key)
  const r1 = await roster(p)
  await p.evaluate(x => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person="' + x + '"]')].find(q => q.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center' }) }, X); await K.sleep(250)
  const pic1 = await B.pic(p, `${variant}-2-armed-crewlist`)
  const strikeOk = variant === 'blank' ? !r1.struck : r1.struck && /not clear until 12:30/.test(JSON.stringify(r1))
  R(`${ID}.1`, `${fixture}; arm ${key} (arm took: ${a}) and read ${cs}'s name in the crew list BEFORE placing — the Tuesday line now: ${lineNow}`,
    sayRoster(r1) + ` · full list entry: ${JSON.stringify({ own: r1.own, parent: r1.parentText })}`,
    strikeOk ? 'PASS' : 'FAIL', [pic1])
  /* place him by a tap on his name */
  const el = p.locator(`#sbRoster .rpuck[data-person="${X}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(150)
  await el.click({ timeout: 3000 }).catch(async () => { const bb = await el.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2) })
  await K.sleep(450)
  const toast = await toastNow(p)
  const pic2 = await B.pic(p, `${variant}-3-after-tap-toast`)
  await p.keyboard.press('Escape'); await K.sleep(200)
  const holds = await p.evaluate(k => { const h = document.querySelector(`#schedBoard [data-slot="${k}"]`) || document.querySelector(`#schedBoard [data-fill="${k}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
  const s = await K.see(p, `${variant}-4`, { monPic: false })
  const x = K.restText(s) || ''
  const want = { brief: /told to report 05:00/, intime: /told to report 05:00/, meeting2: /his day starts 08:00 \(SQN BRIEF\), and he is on a line with no take-off yet/, meeting: /his day starts 08:00 \(SQN BRIEF\), and he is on a line with no take-off yet/, blank: null }[variant]
  const sayAfter = `placed: ${holds.includes(X)} · toast "${toast}" · breach line in Tuesday's list: ${JSON.stringify(s.listMine)} · held sentence "${x}" · solid ring on his Tuesday flying puck: ${s.ringTue} · dotted on Monday's: ${s.dotMon}`
  let ok
  if (variant === 'blank') ok = holds.includes(X) && !s.breach && !s.ringTue && !s.dotMon
  else ok = holds.includes(X) && K.whole(s) && want.test(x) && clean(s)
  /* the toast and the sentence agree */
  let agree = true
  if (variant !== 'blank') agree = !!toast && (want === null || (toast && /05:00|08:00|no take-off/.test(toast)))
  R(`${ID}.2`, `${variant === 'blank' ? 'wholly blank line, no meeting' : fixture}: tap his name in the crew list to place him in ${key}`, sayAfter + ` · toast and breach sentence agree: ${agree}`, ok && (variant === 'blank' || agree) ? 'PASS' : 'FAIL', [pic2, ...s.shots])
  if (variant !== 'blank') {
    const rl = await K.held(p, TUE, X)
    console.log('FULL HELD', JSON.stringify(rl))
  }
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap(`d02-${variant}`, browser, errors, ID)
