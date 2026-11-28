// jb-probe2 - the world every jb script starts from: 142 and 149 each dressed with their own course and marks
import { signIn, newPage, closeAll, finish, picsFor, note, pic, pickSq, shut } from './jlib.mjs'
import { dress, fp, short, wait, makeSquadron } from './jb-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jb-probe2 v1', SZ)
picsFor('probe2-' + SZ)
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await dress(s, '142', ['ST-01', 'ACG-01', 'ST-02'])
  await pic(s, '01-142')
  await pickSq(s, '149'); await shut(s); await wait(s, 1500)
  note('149 after pick', JSON.stringify(await fp(s)))
  await dress(s, '149', ['ST-01'])
  await pic(s, '02-149')
  await pickSq(s, '142'); await shut(s); await wait(s, 1500)
  note('back 142', short(await fp(s)))
  await pic(s, '03-142-back')
  await pickSq(s, '149'); await shut(s); await wait(s, 1500)
  note('back 149', short(await fp(s)))
  note('undo/redo', JSON.stringify((({ undo, redo }) => ({ undo, redo }))(await fp(s))))
  note('made', await makeSquadron(s, '150'))
  await pic(s, '04-sq')
  await s.ctx.close()
} finally { finish('probe2-' + SZ); await closeAll() }
