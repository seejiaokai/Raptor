// Chat 10's re-walk of what the fix touched: every press during the chart's slide under the marking window (D1790).
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const ROOT = 'C:/Users/User/projects/Raptor/.claude/worktrees/react-doctor-cleanup-e72397/raptor-port';
const require = createRequire(ROOT + '/package.json');
const { chromium } = require('playwright');
const URL = 'http://localhost:4180/';
const SHOTS = ROOT + '/docs/img/handpass/2026-11-08-chat9-tracker/rewalk-chat10'; mkdirSync(SHOTS, { recursive: true });
const res = [];
const ok = (id, cond, said) => { res.push([id, cond ? 'PASS' : 'FAIL', said]); console.log((cond ? 'PASS ' : 'FAIL ') + id + ' — ' + said); };
const b = await chromium.launch({ args: ['--enable-smooth-scrolling'] });

async function world(vp, touch) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!touch, isMobile: !!touch, deviceScaleFactor: touch ? 2 : 1 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]');
  await p.waitForSelector('#vWeek .day', { state: 'attached' });
  await p.evaluate(() => window.go('tracker'));
  await p.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  return { p, ctx, errs, cdp };
}
const still = async p => { let last = -1, same = 0; for (let i = 0; i < 50 && same < 3; i++) { const y = await p.evaluate(() => document.getElementById('board').scrollTop); same = y === last ? same + 1 : 0; last = y; await p.waitForTimeout(100); } return last; };
const state = p => p.evaluate(() => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-09').getBoundingClientRect();
  const pops = document.querySelectorAll('#pop'), pop = pops[0], bd = document.getElementById('board');
  const vis = pop && getComputedStyle(pop).visibility !== 'hidden';
  return { st: bd.scrollTop, foot: g.bottom, ball: { x: g.left + g.width / 2, y: g.top + g.height / 2 }, n: pops.length,
    title: vis ? (document.getElementById('popTitle') || {}).textContent.trim() : null, top: vis ? pop.getBoundingClientRect().top : null,
    sliding: bd.classList.contains('is-sliding'), pe: bd.style.pointerEvents };
});
const close = async p => { if (await p.evaluate(() => document.querySelectorAll('#pop').length)) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); } await still(p); };
const landDesk = async p => { await close(p); await p.click('#hSearch'); await p.fill('#hSearch', ''); await p.fill('#hSearch', 'ACG-09'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await still(p); };
const r1 = n => n == null ? null : Math.round(n * 10) / 10;

/* DESKTOP 1500 x 950 */
{
  const { p, ctx, errs, cdp } = await world({ width: 1500, height: 950 });
  // R1: double-click at three gaps and three processor speeds
  for (const rate of [1, 2, 3]) for (const gap of [20, 80, 150]) {
    await landDesk(p); const s0 = await state(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await p.mouse.move(s0.ball.x, s0.ball.y);
    await p.mouse.down({ clickCount: 1 }); await p.mouse.up({ clickCount: 1 }); await p.waitForTimeout(gap);
    await p.mouse.down({ clickCount: 2 }); await p.mouse.up({ clickCount: 2 });
    await still(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const s1 = await state(p);
    ok(`R1 double-click, ${gap}ms, processor 1/${rate}`, s1.st > s0.st && s1.n === 1 && (s1.title || '').startsWith('ACG-09') && Math.abs(s1.top - s1.foot - 4) <= 2 && !s1.sliding && s1.pe === '',
      `chart ${r1(s0.st)} → ${r1(s1.st)}; ${s1.n} window, ${s1.title}, its top ${r1(s1.top - s1.foot)}px under the event; chart takes presses again: ${!s1.sliding && s1.pe === ''}`);
    if (rate === 2 && gap === 80) await p.screenshot({ path: SHOTS + '/r1-desk-dblclick-half-speed.png' });
  }
  // R2: an ordinary single click
  await landDesk(p); { const s0 = await state(p); await p.mouse.click(s0.ball.x, s0.ball.y); await still(p); const s1 = await state(p);
    ok('R2 one click on ACG-09', s1.n === 1 && (s1.title || '').startsWith('ACG-09') && Math.abs(s1.top - s1.foot - 4) <= 2, `${s1.title}, ${r1(s1.top - s1.foot)}px under`);
    await p.screenshot({ path: SHOTS + '/r2-desk-click.png' });
    // R3: at rest, a click on another event in clear view (not under the window) opens that event's window (the chart takes presses again)
    const other = await p.evaluate(() => { const bd = document.getElementById('board').getBoundingClientRect(); for (const g of document.querySelectorAll('#flowSvg .ball')) { if (g.dataset.id === 'ACG-09') continue; const r = g.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; if (!r.width || x < bd.left || x >= bd.right || y < bd.top || y >= bd.bottom) continue; const e = document.elementFromPoint(x, y), h = e && e.closest('.ball'); if (h && h.dataset.id === g.dataset.id) return { id: g.dataset.id, x, y }; } return null; });
    const hitOther = other && other.id;
    if (other) { await p.mouse.click(other.x, other.y); await p.waitForTimeout(200); await still(p); }
    const t = await p.evaluate(() => { const pop = document.getElementById('pop'); return pop && getComputedStyle(pop).visibility !== 'hidden' ? document.getElementById('popTitle').textContent.trim() : null; });
    ok('R3 at rest, a click on another event in view opens its window', !!hitOther && (t || '').startsWith(hitOther), `pressed ${hitOther}; window ${t}`);
    await p.screenshot({ path: SHOTS + '/r3-desk-other-event.png' });
  }
  // R4: a press outside the chart during the slide closes the window (A26 — kept)
  await landDesk(p); { const s0 = await state(p); await p.mouse.click(s0.ball.x, s0.ball.y); await p.waitForTimeout(60);
    const hdr = await p.evaluate(() => { const r = document.querySelector('#page-tracker header, #page-tracker .hdr, #hdr').getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 }; }).catch(() => null);
    if (hdr) await p.mouse.click(hdr.x, hdr.y);
    await still(p); const s1 = await state(p);
    ok('R4 a press on the Tracker bar during the slide closes the window', !!hdr && s1.n === 0 && !s1.sliding && s1.pe === '', `windows ${s1.n}; chart takes presses again: ${!s1.sliding && s1.pe === ''}`); }
  // R5: a mouse wheel during the slide, then a click — still one window, placed from where the event landed
  await landDesk(p); { const s0 = await state(p); await p.mouse.click(s0.ball.x, s0.ball.y); await p.waitForTimeout(60); await p.mouse.wheel(0, 120);
    await still(p); const s1 = await state(p);
    ok('R5 a wheel turn during the slide: one window for ACG-09, beside the event', s1.n === 1 && (s1.title || '').startsWith('ACG-09') && s1.top > s1.foot && s1.top - s1.foot < 12, `${s1.title}, ${r1(s1.top - s1.foot)}px under`); }
  ok('R6 desktop: no page or console errors', errs.length === 0, errs.slice(0, 3).join(' | ') || 'none');
  await ctx.close();
}

/* PHONE 402 x 874, touch: a second tap during the slide */
{
  const { p, ctx, errs } = await world({ width: 402, height: 874 }, true);
  // land ACG-09 by Find on the phone
  const land = async () => {
    await close(p);
    await p.tap('#hSearchBtn'); await p.waitForTimeout(400); await p.fill('#hSearch', 'ACG-09'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await still(p);
    if (await p.locator('#hSearch:visible').count()) { await p.tap('#hSearchClear').catch(() => {}); await p.waitForTimeout(400); await still(p); }
  };
  await land(); const s0 = await state(p);
  await p.touchscreen.tap(s0.ball.x, s0.ball.y); await p.waitForTimeout(90); await p.touchscreen.tap(s0.ball.x, s0.ball.y);
  await still(p); const s1 = await state(p);
  ok('R7 phone: a second tap during the slide — one window for ACG-09, 4px under it', s1.n === 1 && (s1.title || '').startsWith('ACG-09') && Math.abs(s1.top - s1.foot - 4) <= 2 && !s1.sliding,
    `chart ${r1(s0.st)} → ${r1(s1.st)}; ${s1.n} window, ${s1.title}, ${r1(s1.top - s1.foot)}px under`);
  await p.screenshot({ path: SHOTS + '/r7-phone-second-tap.png' });
  ok('R8 phone: no page or console errors', errs.length === 0, errs.slice(0, 3).join(' | ') || 'none');
  await ctx.close();
}
await b.close();
const { writeFileSync } = await import('fs');
writeFileSync(SHOTS + '/results.json', JSON.stringify(res, null, 1));
console.log(res.filter(r => r[1] === 'PASS').length + ' pass, ' + res.filter(r => r[1] !== 'PASS').length + ' fail');
