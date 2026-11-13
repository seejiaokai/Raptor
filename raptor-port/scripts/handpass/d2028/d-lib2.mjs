/* d-lib2 v1 — the D1 fixture, built through the app's own controls, for the later scenarios (D8, D9, D10). */
const D = await import('./d-lib.mjs')
export { D }
export const { X, L, sleep, j, SAT } = D
export async function buildD1(w, { logic = true } = {}) {
  const ranger = w.ID('Ranger')
  const a = await D.addCommon(w, SAT, 'Briefing', '09:00')
  const dr = await D.drop(w, `a:${SAT}.${a.ri}.+`, 'allavail')
  const g = await D.addGround(w, SAT, 'Ground Programme', '10:15', '10:45', ranger)
  const p = await D.pub(w, SAT)
  const s4 = await D.signFour(w, SAT)
  await L.closeBoard(w.page)
  let lg = null
  if (logic) lg = await D.setLogic(w, 'openEnd', '2h', null)
  console.log('FIXTURE', j({ a, dr, g, pub: p.pressed, signs: s4.head && s4.head.signs, lg }))
  return { a, g, p, s4, lg }
}
