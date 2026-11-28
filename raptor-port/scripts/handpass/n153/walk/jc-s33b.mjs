// jc-s33b - S33's last part: a promotion undone and redone in Saber's one session, then Hunter's bell and access read; and undone, redone, undone again.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, check, facts, note, as } from './jlib.mjs'
import { toast, who, editRow, saveRow, toUsers, doUndo, doRedo, bell } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s33b v1', SZ)
picsFor('jc-s33b-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const MADE = 'Made a master admin: full access to every squadron · Saber'
const ENDED = 'Plan of 149 ended: master admin covers every squadron · Saber'
const n = (L, w) => L.filter(x => x.includes(w)).length
try {
  for (const [tag, seq] of [['undo-redo', ['u', 'r']], ['undo-redo-undo', ['u', 'r', 'u']]]) {
    const s = await newPage(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    await step(`S33 ${tag}`, async () => {
      await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s); await page.waitForTimeout(150)
      await editRow(s, 'prowler', [{ role: 'master' }]); await saveRow(s); await page.waitForTimeout(150)
      for (const x of seq) { if (x === 'u') await doUndo(s); else await doRedo(s); rec(`S33 ${tag} ${x}`, await toast(s)) }
      const w = await who(s, 'prowler', ['149']); rec(`S33 ${tag} account`, w)
      const master = seq[seq.length - 1] === 'r'
      check(`S33 ${tag} account`, master ? w.role === 'master' : w.role === 'admin' && w.lines['149'] === 'plan', w)
      await as(s, 'ad2', 'a2'); await bell.open(s); const L = await bell.lines(s); rec(`S33 ${tag} bell`, L); await pic(s, `${tag}-bell`)
      check(`S33 ${tag} Made line`, n(L, MADE) === (master ? 1 : 0), n(L, MADE))
      check(`S33 ${tag} Plan-ended line`, n(L, ENDED) === (master ? 1 : 0), n(L, ENDED))
      check(`S33 ${tag} Given Plan line kept once`, n(L, 'Given Plan of 149') === 1, n(L, 'Given Plan of 149'))
      await bell.close(s)
    })
    await s.ctx.close()
  }
} finally { finish('jc-s33b-' + SZ); await closeAll() }
