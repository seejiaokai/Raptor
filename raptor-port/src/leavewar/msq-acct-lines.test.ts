// @vitest-environment jsdom
/* STEP F, §7 ITEM 6 — A MAN IS TOLD ON HIS OWN BELL WHENEVER HIS ACCOUNT'S ACCESS CHANGES (batch 1's second half,
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §7 items 6 and 8, §15 D5, D7, D11, §16 D5′–D7′, D11′;
   his D2251, D2309, D2319 — the words drawn on docs/mock/2026-11-22-msq-b1-screens, pictures f3a, f3b).
   - each change of access, a grant-only one among them, writes its line to the man only, in the drawn words, signed by
     whoever made it — the app's own with no name;
   - a move saved today tells him at the first load of its day, once; a move cancelled first tells nothing;
   - a forged line — naming an unaffected man, or about a change that did not happen — is refused by the commit gate;
   - give → read → Undo → Redo: the opposite line, then a fresh one; unread at the Undo, the first line simply goes;
   - the Undo of "+ New squadron" still says 150.
   Red first on 12dd61875. The world: test-support/msq-world.ts — Wed 15 Jul 26. */
import { beforeEach, describe, expect, it } from 'vitest'
import { archivePerson, runPoArchive } from './sync'
import { setGrant, removeGrant, addUnit, places, todayIso, unitById, grantOfOn } from '../state/units'
import { NOTICES, noticesFor, noticeWords, noticeAccount, type Notice } from '../state/notices'
import { saveAccess, updateAccount, setMaster, accountById, levelAcct, ACCOUNTS_LIST } from '../state/accounts'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { noticeSeenLoad, NOTICESEEN_PFX } from '../state/noticeseen'
import { HOOKS, store } from '../engine/hooks'
import { commitProjection } from '../command'
import { globalUndo, globalRedo } from '../undo/timeline'
import { useMsqWorld, signInAs, ACCT, PID, on, moveMan, pastMidnight } from '../test-support/msq-world'

useMsqWorld()
beforeEach(() => { NOTICES.length = 0 })

/* every own-account line stored, as "<to> · <what> · <who>" */
const acct = (): string[] => NOTICES.filter(n => (n.what || []).some((p: any) => p.k === 'acct'))
  .map(n => { const w = noticeWords(n); return `${n.to} · ${w.what}${w.who ? ` · ${w.who}` : ''}` })
/* …on one man's bell as he sees it */
const bell = (who: keyof typeof PID): string[] => noticesFor(PID[who]).filter(n => (n.what || []).some((p: any) => p.k === 'acct')).map(n => noticeWords(n).what)
/* he has read everything on his bell up to now (his own read record, as his tap writes it) */
const hasReadAll = (who: keyof typeof PID): void => { store.set(NOTICESEEN_PFX + PID[who], { upto: Date.now(), ids: [] }); noticeSeenLoad() }
const H = PID.hunter, R = PID.ranger, K = PID.kestrel

describe('each change of access tells the man himself, in the drawn words', () => {
  it('View given alone, his role unchanged (red: nothing told)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(acct()).toEqual([`${H} · Given View of 149 · Saber`])
  })
  it('Plan given through its own door: "Given Plan of 149: full access to 149 · Saber"', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    expect(acct()).toEqual([`${H} · Given Plan of 149: full access to 149 · Saber`])
  })
  it('Plan lowered to View says both; View taken says it ended', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(setGrant(ACCT.hunter, 'u149', 'view', H).ok).toBe(true)
    expect(acct()).toEqual([`${H} · Plan of 149 ended · Saber`, `${H} · Given View of 149 · Saber`])
    NOTICES.length = 0
    on(15, 11)
    expect(removeGrant(ACCT.hunter, 'u149').ok).toBe(true)
    expect(acct()).toEqual([`${H} · View of 149 ended · Saber`])
  })
  it('made a member, made an admin of 142 again', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(acct()).toEqual([`${H} · Made a member · Saber`])
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { role: 'admin' })).toBeNull()
    expect(acct()).toEqual([`${H} · Made an admin of 142 · Saber`])
  })
  it('a Plan holder made a member: his role and his Plan both said', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { role: 'main' })).toBeNull()
    expect(acct()).toEqual([`${H} · Made a member · Saber`, `${H} · Plan of 149 ended · Saber`])
  })
  it('suspended and enabled by hand (he reads the first once he can sign in again)', () => {
    signInAs('saber')
    expect(updateAccount(ACCT.ranger, { on: false })).toBeNull()
    expect(acct()).toEqual([`${R} · Suspended · Saber`])
    on(15, 10)
    expect(updateAccount(ACCT.ranger, { on: true })).toBeNull()
    expect(acct()).toEqual([`${R} · Suspended · Saber`, `${R} · Enabled · Saber`])
  })
  /* HIS D2396 (n), D2400 — the drawing docs/mock/2026-11-24-msq-new-words/img/n1-*.png: until now the Plan the Save dropped
     told nothing, so his bell's last word on 149 stayed "Given Plan of 149", no longer true. Red first. */
  it('made a master admin with a Plan: two lines, the mark first, each signed by who did it; the mark off: its own line, the Plan not back', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    const signed = (n: any) => { const w = noticeWords(n); return `${w.what} · ${w.who}` }
    expect(noticesFor(H).map(signed), 'as his bell lists them, newest first').toEqual([
      'Made a master admin: full access to every squadron · Saber',
      'Plan of 149 ended: master admin covers every squadron · Saber',
    ])
    NOTICES.length = 0
    on(15, 11)
    expect(saveAccess(ACCT.hunter, { master: false })).toBeNull()
    expect(noticesFor(H).map(signed)).toEqual(['Master admin taken off: full access to every squadron ended · Saber'])
    expect(grantOfOn(levelAcct(accountById(ACCT.hunter)!), 'u149'), 'the ended Plan never comes back by itself').toBeUndefined()
  })
  it('made a master admin with a View, and with no right at all: the View ends in the same words; with none, one line', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    expect(bell('hunter')).toEqual([
      'Made a master admin: full access to every squadron',
      'View of 149 ended: master admin covers every squadron',
    ])
    NOTICES.length = 0
    on(15, 11)
    expect(saveAccess(ACCT.ranger, { role: 'admin', master: true })).toBeNull()
    expect(bell('ranger').filter(w => /master admin/i.test(w))).toEqual(['Made a master admin: full access to every squadron'])
  })
  it('by the mark\'s own door too: the Plan\'s line is owed and the gate lets it through', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(setMaster(ACCT.hunter, true).ok).toBe(true)
    expect(bell('hunter')).toEqual([
      'Made a master admin: full access to every squadron',
      'Plan of 149 ended: master admin covers every squadron',
    ])
  })
  it('an Undo of the step he had read tells him the opposite: the mark off and the Plan given back', () => {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'admin', H).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(saveAccess(ACCT.hunter, { master: true })).toBeNull()
    on(15, 11)
    hasReadAll('hunter')
    on(15, 12)
    expect(globalUndo().ok).toBe(true)
    expect(bell('hunter')).toEqual(expect.arrayContaining([
      'Master admin taken off: full access to every squadron ended',
      'Given Plan of 149: full access to 149',
    ]))
  })
  it('archived: "Suspended · Saber", and each right it ended said by the app — "View of 149 ended: archived"', () => {
    signInAs('saber')
    expect(setGrant(ACCT.ranger, 'u149', 'view', R).ok).toBe(true)
    NOTICES.length = 0
    on(15, 10)
    expect(archivePerson(R).bad).toBeNull()
    expect(acct()).toEqual([`${R} · Suspended · Saber`, `${R} · View of 149 ended: archived`])
  })
  it('only the man changed is told — never the admin who made it, nor anyone else', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(NOTICES.filter(n => n.to !== H && (n.what || []).some((p: any) => p.k === 'acct'))).toEqual([])
  })
  it('the line is about him: shown on his bell, opens nothing, stays after he moves (§15 D5)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(bell('hunter')).toEqual(['Given View of 149'])
    expect(moveMan(H, 'u149').ok).toBe(true)
    pastMidnight()
    expect(bell('hunter')).toContain('Given View of 149')
  })
})

describe('a move tells him on its day, once (§15 D11, §16 D11′)', () => {
  /* 150, made by Saber with Kestrel its first admin — a squadron Hunter can move to while holding View of 149 */
  const make150 = (): string => {
    signInAs('saber')
    const r = addUnit('150', places()[0]!.id, ACCT.kestrel)
    expect(r.ok, r.message).toBe(true)
    return r.id!
  }
  it('saved today: nothing until its day; at the midnight wake, the app\'s own words with no name', () => {
    const u150 = make150()
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    NOTICES.length = 0
    expect(moveMan(H, u150).ok).toBe(true)
    expect(acct(), 'the move saved today ends nothing today').toEqual([])
    pastMidnight()
    expect(acct()).toEqual([`${H} · Made a member: you moved to 150`, `${H} · View of 149 ended: you moved to 150`])
    const day = todayIso()
    expect(NOTICES.filter(n => n.to === H).every(n => n.day === day && n.by == null)).toBe(true)
    runPoArchive(); runPoArchive()
    expect(acct().length, 'a second and third load write nothing').toBe(2)
  })
  it('a move cancelled before its day tells nothing (red: — kept to show the shape)', () => {
    const u150 = make150()
    NOTICES.length = 0
    expect(moveMan(H, u150).ok).toBe(true)
    on(15, 10)
    expect(globalUndo().ok, 'Saber takes the move back').toBe(true)
    pastMidnight()
    expect(acct()).toEqual([])
  })
})

describe('a forged line is refused (§7 item 6, §16 D6′)', () => {
  it('a line naming a man whose access the command did not change', () => {
    signInAs('saber')
    const r = commitSettingsIntent('grant.set', null, (txn: any) => {
      HOOKS.bellEnlist(txn)
      noticeAccount(R, PID.saber, { k: 'acct', c: 'plan', u: 'u149', num: '149' }, todayIso())
      HOOKS.bellEnd()
    })
    expect((r as any).ok).toBe(false)
    expect(acct()).toEqual([])
  })
  it('a real change carrying a second line, about someone else', () => {
    signInAs('saber')
    const r = commitSettingsIntent('grant.set', null, (txn: any) => {
      /* (a hand-built command: the right written, then its own line and one more) */
      store.set('grant:gx1', { id: 'gx1', account: ACCT.hunter, unit: 'u149', level: 'view', from: todayIso() })
      HOOKS.bellEnlist(txn)
      noticeAccount(H, PID.saber, { k: 'acct', c: 'view', u: 'u149', num: '149' }, todayIso())
      noticeAccount(R, PID.saber, { k: 'acct', c: 'view', u: 'u149', num: '149' }, todayIso())
      HOOKS.bellEnd()
    })
    expect((r as any).ok).toBe(false)
  })
  it('words that do not match the change', () => {
    signInAs('saber')
    const r = commitSettingsIntent('grant.set', null, (txn: any) => {
      store.set('grant:gx2', { id: 'gx2', account: ACCT.hunter, unit: 'u149', level: 'view', from: todayIso() })
      HOOKS.bellEnlist(txn)
      noticeAccount(H, PID.saber, { k: 'acct', c: 'plan', u: 'u149', num: '149' }, todayIso())
      HOOKS.bellEnd()
    })
    expect((r as any).ok).toBe(false)
  })
  it('signed as someone else', () => {
    signInAs('saber')
    const r = commitSettingsIntent('grant.set', null, (txn: any) => {
      store.set('grant:gx3', { id: 'gx3', account: ACCT.hunter, unit: 'u149', level: 'view', from: todayIso() })
      HOOKS.bellEnlist(txn)
      noticeAccount(H, K, { k: 'acct', c: 'view', u: 'u149', num: '149' }, todayIso())
      HOOKS.bellEnd()
    })
    expect((r as any).ok).toBe(false)
  })
  it("the app's own writer for a move that never happened", () => {
    const acc = ACCOUNTS_LIST.find(a => a.pid === H)!
    const r = commitProjection({ type: 'account.told', scope: { module: 'inputs' }, apply: (txn: any) => {
      HOOKS.bellEnlist(txn)
      noticeAccount(H, null, { k: 'acct', c: 'member', why: 'moved', mv: '149' }, todayIso(), Date.now(), `acct:mv:${acc.id}:${todayIso()}:member:`)
      HOOKS.bellEnd()
    } })
    expect((r as any).ok).toBe(false)
    expect(acct()).toEqual([])
  })
})

describe('an Undo or Redo of an access change tells him (§16 D7′)', () => {
  it('give → read → Undo: the opposite line; read it → Redo: a fresh one', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    on(15, 10); hasReadAll('hunter')
    on(15, 10, 30)
    expect(globalUndo().ok).toBe(true)
    expect(acct(), 'his line stays as read; the opposite one beside it').toEqual([`${H} · View of 149 ended · Saber`])
    on(15, 11); hasReadAll('hunter')
    on(15, 11, 30)
    expect(globalRedo().ok).toBe(true)
    const lines = acct()
    expect(lines.filter(l => l === `${H} · Given View of 149 · Saber`).length, 'the first line back, and a fresh unread one').toBe(2)
  })
  it('unread at the Undo: the first line simply goes, nothing written', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    on(15, 10)
    expect(globalUndo().ok).toBe(true)
    expect(acct()).toEqual([])
  })
  it('the Undo of "+ New squadron": its first admin, who had read it, told "Plan of 150 ended" — 150 kept as written', () => {
    signInAs('saber')
    const r = addUnit('150', places()[0]!.id, ACCT.kestrel)
    expect(r.ok, r.message).toBe(true)
    expect(acct()).toEqual([`${K} · Given Plan of 150: full access to 150 · Saber`])
    on(15, 10); hasReadAll('kestrel')
    on(15, 10, 30)
    expect(globalUndo().ok).toBe(true)
    expect(unitById(r.id!)).toBeUndefined()
    expect(acct()).toEqual([`${K} · Plan of 150 ended · Saber`])
  })
})

/* (the words, each as drawn — D2319) */
describe('the words', () => {
  it('every change, and the app\'s own', () => {
    const w = (p: any, by: string | null = PID.saber) => { const n: Notice = { id: 'x', to: H, by, at: 0, iid: '', name: 'Hunter', day: '2026-07-15', what: [{ k: 'acct', ...p }] }; const x = noticeWords(n); return x.who ? `${x.what} · ${x.who}` : x.what }
    expect(w({ c: 'admin', num: '142' })).toBe('Made an admin of 142 · Saber')
    expect(w({ c: 'member' })).toBe('Made a member · Saber')
    expect(w({ c: 'off' })).toBe('Suspended · Saber')
    expect(w({ c: 'on' })).toBe('Enabled · Saber')
    expect(w({ c: 'view', num: '149' })).toBe('Given View of 149 · Saber')
    expect(w({ c: 'viewEnd', num: '149' })).toBe('View of 149 ended · Saber')
    expect(w({ c: 'plan', num: '149' })).toBe('Given Plan of 149: full access to 149 · Saber')
    expect(w({ c: 'planEnd', num: '149' })).toBe('Plan of 149 ended · Saber')
    expect(w({ c: 'master' })).toBe('Made a master admin: full access to every squadron · Saber')
    expect(w({ c: 'masterEnd' })).toBe('Master admin taken off: full access to every squadron ended · Saber')
    expect(w({ c: 'planEnd', num: '149', why: 'master' })).toBe('Plan of 149 ended: master admin covers every squadron · Saber')
    expect(w({ c: 'viewEnd', num: '150', why: 'master' })).toBe('View of 150 ended: master admin covers every squadron · Saber')
    expect(w({ c: 'viewEnd', num: '149', why: 'moved', mv: '150' }, null)).toBe('View of 149 ended: you moved to 150')
    expect(w({ c: 'planEnd', num: '149', why: 'archived' }, null)).toBe('Plan of 149 ended: archived')
    expect(w({ c: 'member', why: 'moved', mv: '149' }, null)).toBe('Made a member: you moved to 149')
    expect(w({ c: 'off' }, null)).toBe('Suspended')
  })
})
