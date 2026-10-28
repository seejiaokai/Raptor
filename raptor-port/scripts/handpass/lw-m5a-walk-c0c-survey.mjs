// walker C survey: every man's window on the grid — lines, paperclips (a first look, no verdicts)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/recon'
const { L, T, pwRead, closePw } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c0c-survey v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
const pids = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)))
for (const pid of pids) {
  await L.press(w, `[data-testid="row-${pid}"] .whoedit`); await P.waitForTimeout(350)
  const info = await P.evaluate(() => { const pw = document.querySelector('[data-testid="person-window"]'); if (!pw) return null; return { n: pw.querySelector('[data-testid="pw-name"]')?.textContent, lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => e.innerText.replace(/\s+/g, ' ').trim()), clips: pw.querySelectorAll('[data-testid^="pw-clip-"]').length, years: [...(pw.querySelector('[data-testid="pw-year"]')?.options || [])].map(o => o.textContent).join('/') } })
  if (info && (info.lines.length || info.clips)) console.log(pid, info.n, 'clips', info.clips, 'years', info.years, '|', info.lines.join(' ; '))
}
await w.ctx.close(); await L.closeBrowser()
console.log('DONE', w.errs)
