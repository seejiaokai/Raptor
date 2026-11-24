// p3-logout-save - P3 case 3: Logout while a change is "Not saved". Saber (ad) opens an input, and the failed save is
// raised as chat 166's save-d raised it; then Logout is pressed (the top bar's Logout on a desktop; ☰ then its Logout on a
// phone, only where reachable). Read: the band, Retry, the sign-in card and the line under it. Then a sign-in is pressed
// (ad / a): does it go through or wait, and what does the card say? Then the stand-in is lifted and Retry pressed: is the
// change saved (which key of the browser's storage holds the words), and does the page reload?
// STAND-IN, named: the browser's storage refuses every write (localStorage.setItem throws QuotaExceededError), installed
// from inside the page just before the input's Save (save-d's way - a full or locked browser storage); lifted before Retry.
//   node raptor-port/scripts/handpass/n175/p3-logout-save.mjs <d|p>
// Pictures (deciding): p3-logout-save-<size>-1-after-logout, -2-signin-pressed, -3-after-retry (each with -crop).
import { mk, closeAll, FACT, signIn, barSq, pageOn, bands, windowsNow, wait, decide, scratch, hit, vis, boxOf, covered, typeWords, openInput } from './p3-lib.mjs'
const SZ = process.argv[2] || 'd'
const k = `P3.logoutSave.${SZ}`, P = `p3-logout-save-${SZ}`, W = 'N175P3LS words'
const storedWith = s => s.page.evaluate(w => { const out = []; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if ((localStorage.getItem(key) || '').includes(w)) out.push(key) } return out }, W)
const screenNow = s => s.page.evaluate(() => {
  const v = e => { if (!e) return false; const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 1 && r.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' }
  const card = document.querySelector('#loginForm')
  const cardBox = card && v(card) ? card.closest('.login, .logincard, .signin, form') : null
  const retry = [...document.querySelectorAll('button')].filter(v).filter(b => /retry/i.test(b.textContent)).map(b => ({ words: b.textContent.trim(), disabled: b.disabled }))
  const band = [...document.querySelectorAll('.saveband, .savestat')].filter(v).map(e => e.textContent.replace(/\s+/g, ' ').trim())
  const signBtn = document.querySelector('#loginForm button[type=submit]')
  return {
    signInCard: !!(card && v(card)),
    signInCardWords: cardBox ? (cardBox.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300) : null,
    signInButton: signBtn && v(signBtn) ? { words: signBtn.textContent.trim(), disabled: signBtn.disabled } : null,
    nameBox: document.querySelector('#luser')?.value ?? null,
    band, retry,
    bar: !!document.querySelector('.topbar') && v(document.querySelector('.topbar')),
  }
})
const s = await mk(SZ)
let loads = 0
s.page.on('load', () => { loads++ })
try {
  console.log('p3-logout-save v1', SZ)
  await signIn(s, 'ad', 'a')
  loads = 0
  const inp = await openInput(s, null); FACT(`${k}.input`, inp.who)
  await s.page.evaluate(() => { window.__n175 = { real: Storage.prototype.setItem }; window.__n175page = 'same page'; Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') } })
  FACT(`${k}.standIn`, 'browser storage refuses every write (localStorage.setItem throws), from just before the Save')
  await typeWords(s, '#inpEditRmk', W)
  await hit(s, '#inpEditSave', 2500)
  FACT(`${k}.afterFailedSave`, { squadron: await barSq(s), page: await pageOn(s), bands: await bands(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 70)) })
  await scratch(s, `logout-save-${SZ}-0-not-saved`)
  /* Logout, as a person reaches it */
  let via
  if (await boxOf(s, '#logout')) {
    via = 'top bar Logout'; FACT(`${k}.logoutAt`, await covered(s, '#logout'))
    await hit(s, '#logout', 1500)
  } else {
    via = '☰ then Logout'; const c = await covered(s, '#burger'); FACT(`${k}.burgerAt`, c)
    if (c !== 'free') { const wins = await windowsNow(s); if (wins.length) { FACT(`${k}.closingWindowFirst`, wins.map(w => w.what)); await hit(s, '.floatwin .win-x', 600); FACT(`${k}.burgerAtAfterClose`, await covered(s, '#burger')) } }
    await hit(s, '#burger', 450)
    FACT(`${k}.drawerLogoutAt`, await covered(s, '#drawerLogout')); FACT(`${k}.drawerLogoutWords`, (await vis(s, '#drawerLogout').first().innerText()).trim())
    await hit(s, '#drawerLogout', 1500)
  }
  FACT(`${k}.logoutVia`, via)
  FACT(`${k}.afterLogout`, { ...(await screenNow(s)), pageLoadsSinceSignIn: loads, samePage: await s.page.evaluate(() => window.__n175page || 'page was reloaded').catch(() => 'page gone') })
  FACT(`${k}.afterLogout.question`, await s.page.evaluate(() => { const m = [...document.querySelectorAll('#dlgMsg, .askcard-q')].find(e => e.getBoundingClientRect().width > 0); return m ? m.textContent.trim() : null }))
  await decide(s, `${P}-1-after-logout`, ['.saveband', '#loginForm'], ['.saveband', '#loginForm'])
  /* a sign-in pressed while the save waits */
  if (await vis(s, '#luser').count()) {
    await typeWords(s, '#luser', 'ad'); await typeWords(s, '#lpass', 'a')
    await hit(s, '#loginForm button[type=submit]', 2500)
    FACT(`${k}.signInPressed`, { ...(await screenNow(s)), signedIn: !!(await vis(s, '#vWeek .day').count()) || (await s.page.evaluate(() => !!document.querySelector('.topbar #sqnMenuBtn, .topbar #burger') && !document.querySelector('#loginForm')?.getBoundingClientRect().width)), pageLoadsSinceSignIn: loads })
    await decide(s, `${P}-2-signin-pressed`, ['#loginForm', '.saveband'], ['.saveband', '#loginForm'])
  } else FACT(`${k}.signInPressed`, 'no sign-in card drawn')
  /* the stand-in lifted, Retry pressed */
  await s.page.evaluate(() => { if (window.__n175) Storage.prototype.setItem = window.__n175.real })
  FACT(`${k}.standInLifted`, true)
  const loadsBefore = loads
  const r = vis(s, 'button').filter({ hasText: /^Retry/ })
  if (await r.count()) {
    await hit(s, r.first(), 600); FACT(`${k}.retryPressed`, true)
    await s.page.waitForLoadState('load').catch(() => {}); await wait(s, 2500)
  } else FACT(`${k}.retryPressed`, 'no Retry drawn')
  FACT(`${k}.afterRetry`, { ...(await screenNow(s)), reloaded: loads > loadsBefore, pageLoadsSinceSignIn: loads, samePage: await s.page.evaluate(() => window.__n175page || 'page was reloaded').catch(() => 'page gone'), storedUnder: await storedWith(s), signedIn: await s.page.evaluate(() => !document.querySelector('#loginForm') || !(document.querySelector('#loginForm').getBoundingClientRect().width > 0)) })
  await decide(s, `${P}-3-after-retry`, ['#loginForm', '.saveband', '.topbar'], ['#loginForm', '.saveband'])
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)) } finally { await s.ctx.close().catch(() => {}); await closeAll() }
