// k0p-world - make THE WORLD (k0p-lib makeWorld) once, then print each squadron's rows as Saber.
//   node raptor-port/scripts/handpass/n194/k0p-world.mjs
import { makeWorld, mk, signIn, pick, usersTab, rowsOf, FACT, closeAll, WORLD, wait, ERRS } from './k0p-lib.mjs'
console.log('k0p-world v1')
try {
  await makeWorld()
  const s = await mk('d', { storageState: WORLD })
  await signIn(s, 'saber')
  for (const n of [142, 149, 150]) { FACT(`world.${n}.bar`, await pick(s, n)); await usersTab(s); await wait(s, 400); FACT(`world.${n}.rows`, (await rowsOf(s)).slice(0, 40)) }
  await s.ctx.close()
} finally { FACT('errors', ERRS); await closeAll() }
