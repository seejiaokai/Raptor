/* wwf w1 scenario 10 — the Legend on both doors. usage: [PHONE=1] [WHO=u] node ... */
import * as H from './wwf-w1-lib.mjs'
const PHONE = process.env.PHONE === '1'
const WHO = process.env.WHO || 'a'
const RUN = process.env.RUN || `s10-${PHONE ? 'p' : 'd'}-${WHO}`
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE, who: WHO })
const { page } = w
const SZ = PHONE ? 'phone' : 'desktop'
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
const doors = WHO === 'a' ? [['editsched', '#eLegendBox'], ['viewsched', '#vLegendBox']] : [['viewsched', '#vLegendBox']]
for (const [pg, box] of doors) {
  await step(pg, async () => {
    await X.L.go(page, pg); await sleep(1200)
    const sel = `${box} > summary`
    const state = () => page.evaluate(b => { const d = document.querySelector(b); const l = d.querySelector('.legend'); const r = l && l.getBoundingClientRect(); return JSON.stringify({ open: d.open, h: r ? Math.round(r.height) : 0, w: r ? Math.round(r.width) : 0, text: l ? l.innerText.replace(/\s+/g, ' ').slice(0, 1500) : '' }) }, box)
    await page.locator(box).scrollIntoViewIfNeeded(); await sleep(300)
    const s0 = await state(); say(pg, 'folded', s0.slice(0, 80)); await pic(w, `${pg}-1-folded`)
    await page.locator(sel).click(); await sleep(700)
    say(pg, 'overflow-open', await page.evaluate(b => { const l = document.querySelector(b + ' .legend'); const r = l.getBoundingClientRect(); let mx = 0, who = ''; l.querySelectorAll('*').forEach(e => { if (e.children.length) return; const q = e.getBoundingClientRect(); if (q.width && q.right > mx) { mx = q.right; who = e.innerText } }); return JSON.stringify({ legendRight: Math.round(r.right), scrollW: l.scrollWidth, clientW: l.clientWidth, maxRight: Math.round(mx), who, vw: innerWidth }) }, box))
    const s1 = await state(); say(pg, 'open1', s1); await pic(w, `${pg}-2-open`)
    await page.locator(sel).click(); await sleep(600)
    say(pg, 'overflow', await page.evaluate(b => { const l = document.querySelector(b + ' .legend'); const r = l.getBoundingClientRect(); let mx = 0, who = ''; l.querySelectorAll('*').forEach(e => { if (e.children.length) return; const q = e.getBoundingClientRect(); if (q.width && q.right > mx) { mx = q.right; who = e.innerText } }); return JSON.stringify({ legendRight: Math.round(r.right), scrollW: l.scrollWidth, clientW: l.clientWidth, maxRight: Math.round(mx), who, vw: innerWidth }) }, box))
    const s2 = await state(); say(pg, 'folded again', s2.slice(0, 80)); await pic(w, `${pg}-3-folded-again`)
    await page.locator(sel).click(); await sleep(700)
    const s3 = await state(); say(pg, 'open2', s3); await pic(w, `${pg}-4-open-again`)
    const a = JSON.parse(s1), b = JSON.parse(s3)
    row('S10 ' + pg, SZ + ' ' + (WHO === 'a' ? 'admin' : 'member'), 'Legend folded, open, folded, open', 'folds and opens each time; same height and words both times; compare to approved picture', `open1 ${a.w}x${a.h}; open2 ${b.w}x${b.h}; text: ${a.text.slice(0, 700)}`, JSON.parse(s0).open === false && a.open && b.open && a.h === b.h && a.text === b.text ? 'RECORDED' : 'FAIL', `w1/${RUN}/${pg}-2-open.png`)
  })
}
await X.fin(w)
