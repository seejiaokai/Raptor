// W1 part g4 — is the joined bar (D1359) drawn for an APPROVED leave and for a course? (desktop 1536x864 at 3x)
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-g33b.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
L.clearPrefix('s33b-')
console.log('lw-m3b-w1-g33b desktop 1536x864 @3x out', L.OUT)
const w = await M.start('desk', 'chromium', 'admin', undefined, undefined, 3)
const P = w.page
const say = s => console.log('   ' + s)
const ids = await M.ids(P)
const who = ids.Ranger
const geom = async iso => { const g = await M.boxGeom(P, who, iso); return g ? `${iso}: td ${g.td.join('..')}; ` + g.boxes.map(b => `"${b.text}" [${b.cls.replace('c ', '')}] ${b.left}..${b.right} radius ${b.radius} color ${b.color} shadow ${b.shadow}`).join(' | ') : `${iso}: no cell` }
// an approved three-day LL (the window's switch left on)
{
  if (!(await M.dragCells(w, [who, '2026-12-09'], [who, '2026-12-11']))) throw new Error('no drag')
  await M.setSwitch(w, true, 'sel')
  await L.press(w, T('sel-remarks')); await P.keyboard.type('Mid'); await P.waitForTimeout(150)
  await L.press(w, T('sel-LL')); await P.waitForTimeout(700)
  if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(700) }
  for (const d of ['2026-12-09', '2026-12-10', '2026-12-11']) say('approved LL: ' + await geom(d))
  say('picture ' + await M.rangeShot(w, who, '2026-12-09', '2026-12-11', 's33b-1-approved-three-day'))
}
// a two-day course (CSE), filed straight
{
  if (!(await M.dragCells(w, [who, '2026-12-14'], [who, '2026-12-15']))) throw new Error('no drag 2')
  await L.press(w, T('sel-file-CSE')); await P.waitForTimeout(900)
  if (await L.vis(P, T('select-sheet'))) { say('course window stayed open: ' + (await L.txt(P, T('sel-note')))) }
  for (const d of ['2026-12-14', '2026-12-15']) say('course: ' + await geom(d))
  say('picture ' + await M.rangeShot(w, who, '2026-12-14', '2026-12-15', 's33b-2-course-two-day'))
}
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
