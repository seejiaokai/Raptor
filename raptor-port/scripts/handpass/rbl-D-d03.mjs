/* D-03 — a guest. B plus a blank crewed Tuesday line as admin; publish Monday and Tuesday; Admin → Users guest switch ON; sign out; the sign-in card;
   a name on no list asks for access, signs out, signs in again -> the guest view (D221). Read View-only as the guest. Desktop. */
import * as K from './rbl-D-lib.mjs'
const { B, W, L, R, X, MON, TUE } = K
const ID = 'D-03'
const { browser, p, errors } = await K.fresh()
const GUEST = 'g@mail'
async function signOutNow() {
  await W.boardOff(p).catch(() => {})
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = p.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await K.sleep(600); break }
  }
  await p.waitForSelector('#luser', { timeout: 15000 })
}
async function cardIn(name, pass = 'x') {
  await p.fill('#luser', name); await p.fill('#lpass', pass)
  await p.click('#loginForm button[type=submit]'); await K.sleep(900)
}
try {
  const cs = await B.csOf(p, X)
  await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  await K.addLine(p, TUE, t.gi)
  const fi = (await K.nLines(p, TUE, t.gi)) - 1
  const sb = await K.seat(p, TUE, t.gi, fi, 0, K.SEAT, X)
  await W.boardOff(p).catch(() => {})
  const pm = await B.pubOrig(p, MON), pt = await B.pubOrig(p, TUE)
  console.log('published', pm.r.label, pt.r.label, JSON.stringify(await B.head(p, TUE)))
  const sAdmin = await K.see(p, 'admin', { pics: false })
  // the guest switch, on Admin → Users
  await L.go(p, 'admin')
  const cat = p.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first()
  if (await cat.count()) { await cat.click(); await K.sleep(400) }
  await p.waitForSelector('#admGuestView', { state: 'attached', timeout: 8000 })
  const was = await p.locator('#admGuestView').isChecked()
  await p.locator('#admGuestView').scrollIntoViewIfNeeded()
  await p.check('#admGuestView'); await K.sleep(400)
  const nowOn = await p.locator('#admGuestView').isChecked()
  const swPic = await B.pic(p, 'admin-guest-switch')
  await signOutNow()
  const cardPic = await B.pic(p, 'sign-in-card')
  const card = await p.evaluate(() => ({ text: document.querySelector('#loginForm') ? (document.querySelector('#loginForm').closest('div, section, main') || document.body).innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : '', buttons: [...document.querySelectorAll('button, a')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').trim()).filter(Boolean) }))
  R(`${ID}.0`, `${cs}: Monday ZM 20:00–22:30; Tuesday ZT 07:00–08:00 Brief 05:00 and a blank crewed line (took ${sb.took}); both days signed and published (${pm.r.label}/${pt.r.label}; admin sees breach ${sAdmin.breach}, ring ${sAdmin.ringTue}, dotted ${sAdmin.dotMon}); Admin → Users guest switch (was ${was}, now ${nowOn}); signed out; the sign-in card`,
    `the card offers: ${JSON.stringify(card.buttons)} · text "${card.text}" — no separate guest button or "ask for access" link is on the card itself; the way in is a name on no list, which lands on Request access`, 'RECORDED', [swPic, cardPic])
  // a name on no list asks for access
  await cardIn(GUEST)
  const onReq = (await p.locator('#accessRequest').count()) === 1
  const reqPic = await B.pic(p, 'request-access-screen')
  await p.fill('#accCs', 'Guest'); await p.fill('#accIni', 'GST'); await p.selectOption('#accSeat', 'FCP'); await p.selectOption('#accCat', 'C')
  await p.click('#accSend'); await K.sleep(600)
  const afterAsk = { waiting: (await p.locator('#accessWaiting').count()) === 1, guestApp: (await p.locator('#guestApp').count()) === 1 }
  const askPic = await B.pic(p, 'after-asking')
  await signOutNow()
  await cardIn(GUEST)
  const inGuest = (await p.locator('#guestApp').count()) === 1
  await p.waitForSelector('#guestApp .day', { timeout: 10000 }).catch(() => {})
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' }).catch(() => {})
  const note = inGuest ? await p.locator('#guestNote').innerText().catch(() => '') : ''
  R(`${ID}.1`, `a name on no list (${GUEST}) signed in from the card, asked for access (Request access form filled and sent), signed out, signed in again`,
    `request screen shown: ${onReq} · after asking: ${JSON.stringify(afterAsk)} · after signing in again: guest view ${inGuest}${note ? ' — note "' + note + '"' : ''}`, inGuest ? 'PASS' : 'FAIL', [reqPic, askPic])
  if (inGuest) {
    // what the guest sees on the published Tuesday and Monday
    const surf = '#guestApp'
    await K.closeList(p, MON, surf).catch(() => {}); await W.showDay(p, MON, surf)
    const mon = await K.paint(p, `${surf} .day[data-day="${MON}"]`, X)
    const monPic = await K.picEl(p, `${surf} .day[data-day="${MON}"]`, 'guest-monday', { pad: 6, maxH: 900 })
    await W.showDay(p, TUE, surf)
    const tue = await K.paint(p, `${surf} .day[data-day="${TUE}"]`, X)
    const tuePic = await K.picEl(p, `${surf} .day[data-day="${TUE}"]`, 'guest-tuesday', { pad: 6, maxH: 900 })
    const ctl = await p.evaluate(() => ({
      woff: document.querySelectorAll('#guestApp [data-woff]').length, daywarn: document.querySelectorAll('#guestApp .daywarn, #guestApp [data-daywarn], #guestApp [data-dwbox]').length,
      edit: document.querySelectorAll('#guestApp [contenteditable="true"], #guestApp textarea, #guestApp select').length, inputs: [...document.querySelectorAll('#guestApp input')].map(e => e.type + '#' + e.id + '.' + e.className).join(' '), slots: document.querySelectorAll('#guestApp [data-slot], #guestApp [data-fill]').length, drag: document.querySelectorAll('#guestApp [data-drag="1"]').length, arm: document.querySelectorAll('#guestApp [data-wvadd], #guestApp [data-gline], #guestApp [data-gradd]').length,
      signsel: document.querySelectorAll('#guestApp select[data-sign]').length, pub: document.querySelectorAll('#guestApp [data-beak], #guestApp [data-alpub]').length,
      tag: [...document.querySelectorAll('#guestApp .day[data-day="1"] .verchip')].map(e => e.innerText.trim()).join(','), pend: [...document.querySelectorAll('#guestApp .dpend')].map(e => e.innerText.trim()).join(','), nys: [...document.querySelectorAll('#guestApp .nysmark')].map(e => e.innerText.trim()).join(',') }))
    const ringTue = tue.some(x => x.where === 'flying' && x.solid), dotMon = mon.some(x => x.dotted)
    R(`${ID}.2`, `the guest reads the published week (View-only guest page): Tuesday ${cs}'s pucks and Monday's`,
      `Tuesday pucks: ${K.pk(tue)} (rings as painted: ${tue.map(x => x.ring).join(' ; ')}) · Monday pucks: ${K.pk(mon)} (${mon.map(x => x.ring).join(' ; ')}) · controls in the guest page: day warning lists ${ctl.daywarn}, hide/flag-again buttons ${ctl.woff}, editable boxes / selects ${ctl.edit}, "add line/wave/row" buttons ${ctl.arm}, draggable pucks ${ctl.drag}, seat addresses drawn (display only) ${ctl.slots}, input boxes [${ctl.inputs}], sign-off selects ${ctl.signsel}, publish buttons ${ctl.pub} · head: tag "${ctl.tag}" pending "${ctl.pend}" marker "${ctl.nys}"`,
      ringTue && dotMon ? 'PASS' : 'FAIL', [tuePic, monPic])
  }
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap('d03', browser, errors, ID)
