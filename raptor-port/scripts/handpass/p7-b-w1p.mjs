/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 1 on the PHONE (1 Oct 26): the sim brief flag
   in the ALL AVAIL window at 390×844, in the SAME world part 1 built and published on the desktop (its storage saved
   right after publication, before the sim was moved — HP_STATE_IN). View-only Sched's window (the day as issued) and the
   board's window (the working copy): the flag and its wrapped reason stay with the man.
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_TAG=p7, HP_STATE_IN. */
import { boot, fact, facts } from './p6-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L, { phone: true, storageState: process.env.HP_STATE_IN })
const DI = 1, TAL = 'haowen', ECHO = 'freak', NOMAD = 'pike'
const pics = []
const pic = async (name, o) => { await L.shot(p, name, o || {}); pics.push(name + '.png'); return name + '.png' }
const want = 'No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00'
const vp = p.viewportSize()
/* the reason is WITH the man: its box starts under (or beside) his puck, inside the window, nothing cut off sideways */
const withMan = (w, r) => !!r && !!r.whyBox && !!r.puckBox && r.whyBox.w > 0 && r.whyBox.h > 0
  && r.whyBox.x >= w.rect.x && r.whyBox.x + r.whyBox.w <= w.rect.x + w.rect.w + 1
  && r.whyBox.y >= r.puckBox.y && r.whyBox.y - (r.puckBox.y + r.puckBox.h) < 12
const out = {}
const run = async (tag, where, getThere) => {
  try {
    await getThere()
    const OPS = await B.chipItem(p, DI, 'ground', 'OPS BRIEF')
    await pic(`B14p-${tag}-0-before-tap`)
    const w = await B.openChip(p, OPS, where)
    if (!w.open) { out[tag] = w; L.check(`B14p ${tag}: the count opened the window`, false, w); return }
    const e = B.man(w, ECHO), t = B.man(w, TAL), n = B.man(w, NOMAD)
    out[tag] = { chip: w.chip, one: w.one, from: w.from, rect: w.rect, echo: e && { flag: e.flag, why: e.why, whyBox: e.whyBox, puckBox: e.puckBox, paint: e.paint }, tal: t && { flag: t.flag, why: t.why }, nomad: n && { flag: n.flag, why: n.why }, foot: w.foot }
    fact(`B14p.${tag}`, out[tag])
    L.check(`B14p ${tag}: the window is a bottom panel across the phone (a 12 px gutter each side)`, w.rect.w >= vp.width - 32 && w.rect.y > vp.height * 0.25 && w.rect.y + w.rect.h <= vp.height + 1, w.rect)
    L.check(`B14p ${tag}: Echo and Talisman listed, amber, with the brief sentence`, !!e && !!t && e.flag === 'AMBER' && e.why === want && t.why === want, { e: e && e.why, t: t && t.why })
    L.check(`B14p ${tag}: Echo's reason is painted amber and sits with him (under his puck, inside the window)`, !!e && /229, 168, 59/.test(e.paint.why) && withMan(w, e), e && { why: e.paint.why, whyBox: e.whyBox, puckBox: e.puckBox, win: w.rect })
    await pic(`B14p-${tag}-1-window`)
    /* bring Talisman's row into the window's own scroll and look at him too */
    await p.evaluate(id => { const x = document.querySelector(`.availwin:not([hidden]) .rpuck[data-awp="${id}"]`); if (x) x.scrollIntoView({ block: 'center' }) }, TAL); await B.sleep(250)
    const w1 = await B.win(p); const t1 = B.man(w1, TAL)
    L.check(`B14p ${tag}: Talisman's wrapped reason stays with him when the list is scrolled to him`, withMan(w1, t1) && t1.whyBox.y > w1.rect.y && t1.whyBox.y + t1.whyBox.h <= w1.rect.y + w1.rect.h, t1 && { whyBox: t1.whyBox, puckBox: t1.puckBox, win: w1.rect })
    await pic(`B14p-${tag}-2-window-talisman`)
    fact(`B14p.${tag}.tap`, await B.tapMan(p, TAL))
    const w2 = await B.win(p); out[tag].footAfterTap = w2.foot
    L.check(`B14p ${tag}: a tap on Talisman gives the full sentence in the foot`, w2.foot.includes('Talisman') && w2.foot.includes(want), w2.foot)
    await pic(`B14p-${tag}-3-window-foot`)
    await B.tapMan(p, TAL)
    await B.closeWin(p)
  } catch (e) { L.check(`B14p ${tag} — the step ran`, false, String(e && e.stack || e).slice(0, 700)); await pic(`B14p-${tag}-X-error`).catch(() => {}) }
}
await run('view', `#vWeek .day[data-day="${DI}"]`, async () => { await L.go(p, 'viewsched'); await W.showDay(p, DI, '#vWeek') })
await run('board', '#schedBoard', async () => { await W.boardOn(p, DI) })
fact('errors', errors)
B.saveSection('w1p-sim-flags-phone', { checks: L.results, facts, errors, pics, out })
console.log(`\n${L.results.filter(r => r.ok).length}/${L.results.length} checks passed; errors: ${errors.length}`, errors)
await browser.close()
