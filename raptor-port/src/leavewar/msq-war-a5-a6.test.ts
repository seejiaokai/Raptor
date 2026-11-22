// @vitest-environment jsdom
/* A5 AND A6 — THE POSTING PASS OVER EVERY SQUADRON, AND THE HELD NOTE OF ANOTHER SQUADRON'S MAN (the reshape plan,
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §6.2; D306, D1546, D1547, D2202).

   The proofs are copied from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/a-a05-other-sqn-posting-waits.test.ts.txt
   and a-a06-held-note-other-sqn.test.ts.txt, their harness changed to test-support/msq-world.ts (the `signInAs` adapter
   below takes the proofs' sign-in names; the world's clock starts on Wed 15 Jul 26, 09:00, as theirs did). */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PEOPLE } from '../engine/people'
import { ACCOUNTS_LIST, updateAccount } from '../state/accounts'
import { worldUnit, setCell, inOneWarCommand } from './state/store'
import { postOut, runPoOutcomes, postingHeldNote, runForeignPostings } from './sync'
import { unitsLoad, setGrant, setHome } from '../state/units'
import { useMsqWorld, signInAs as msqSignIn, worlds } from '../test-support/msq-world'
import { onCommit } from '../command'
import { NOTICES } from '../state/notices'
import { HOOKS } from '../engine/hooks'
import { notify as raptorNotify } from '../state/store'

useMsqWorld()

const signInAs = (name: string, pass = 'x') => { msqSignIn(name, pass) }
const acct = (id: string) => ACCOUNTS_LIST.find(a => a.id === id)

describe('A5 — 149’s posting runs on its date whoever opens the app', () => {
  const setPosting = () => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(postOut('osp9', '2026-07-16', 'overseas')).toBe(true)
    signInAs('ad', 'a')                                   // sign-out reloads: the boot's world (142's) is the one loaded
    expect(worldUnit()).toBe('u142')
  }
  it('only Saber (142) uses the app on 16 Jul: Osprey is archived and his account suspended', () => {
    setPosting()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('ad', 'a')
    runPoOutcomes()
    expect((PEOPLE as any).osp9.archived, 'posted out on his date').toBe(true)
    expect(acct('acus9')?.on, 'his account suspended').toBe(false)
  })
  it('(control) Kestrel (149) opens the app on 16 Jul: the posting runs', () => {
    setPosting()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('ad9', 'a9')
    runPoOutcomes()
    expect((PEOPLE as any).osp9.archived).toBe(true)
  })
})

/* ---- the plan's §6.4 cases for A5 (helper "war") ---- */
const envs: Array<{ type: string; colls: string[] }> = []
const watch = () => { envs.length = 0; return onCommit(env => { envs.push({ type: env.type, colls: env.changes.map(c => c.collection) }) }) }
/* (the bell's lines live for the module's life: each test counts only the lines written since it began) */
let BEFORE = new Set<string>()
beforeEach(() => { BEFORE = new Set(NOTICES.map(n => n.id)) })
const lines = (to: string, who: string) => NOTICES.filter(n => !BEFORE.has(n.id) && n.to === to && (n.what || []).some((p: any) => p.k === 'po' && p.who === who))
const day16 = () => { vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad() }
const post149 = (pid: string, outcome: 'overseas' | 'delete' | 'sans') => {
  signInAs('ad9', 'a9')
  expect(postOut(pid, '2026-07-16', outcome)).toBe(true)
  signInAs('ad', 'a')
  expect(worldUnit()).toBe('u142')
}
const stored149 = (pid: string): any => { try { return JSON.parse(worlds.u149!.read(`profile:${pid}`) ?? 'null') } catch { return null } }

describe('A5 — the pass over every squadron, as the plan §6.4 lists it', () => {
  it('its command is the loaded pass’s own type, one posting per command; the done mark is written in 149’s stored war', () => {
    post149('osp9', 'overseas')
    post149('mer9', 'sans')
    day16()
    const off = watch()
    signInAs('ad', 'a')
    off()
    const runs = envs.filter(e => e.colls.includes('lwx.profile'))
    expect(runs.length, 'two postings, two commands').toBe(2)
    expect(runs.every(e => e.type === 'lw.postoutRun')).toBe(true)
    expect((PEOPLE as any).osp9.archived).toBe(true)
    expect((PEOPLE as any).mer9.san, 'the SANS posting ran too').toBe(true)
    expect(stored149('osp9')?.post?.poDone, 'done, in 149’s own stored war').toBe('2026-07-16')
  })
  it('run once: 149’s war loading later finds it done — one bell line, never two', () => {
    post149('osp9', 'overseas')
    day16()
    signInAs('ad', 'a')
    expect((PEOPLE as any).osp9.archived).toBe(true)
    expect(lines('kes9', 'osp9').length, 'Kestrel told once').toBe(1)
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    runPoOutcomes()
    expect(lines('kes9', 'osp9').length, 'not run again when 149’s war loads').toBe(1)
  })
  it('the audience: 149’s admin of today told; the master at home in 142, and 142’s plain admin, not', () => {
    post149('osp9', 'overseas')
    day16()
    signInAs('ad', 'a')
    expect(lines('kes9', 'osp9').length).toBe(1)
    expect(lines('stiff', 'osp9').length, 'Saber (master, 142) not told').toBe(0)
    expect(lines('prowler', 'osp9').length, 'Hunter (142) not told').toBe(0)
  })
  it('PC1 through a real line: an admin holding Plan of 149 is told, and the gate takes the line', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok, 'Saber gives Hunter Plan of 149').toBe(true)
    post149('osp9', 'overseas')
    day16()
    signInAs('ad', 'a')
    expect((PEOPLE as any).osp9.archived, 'the run was not refused').toBe(true)
    expect(lines('prowler', 'osp9').length, 'Hunter, Plan of 149, told').toBe(1)
  })
  it('a foreign Delete: both halves — the man marked deleted, his account gone, his 149 war records from his date gone', () => {
    signInAs('ad9', 'a9')
    expect(setCell('osp9', '2026-07-20', 'LL'), 'a bid of his on 149’s war after his date').toBe(true)
    expect(setCell('osp9', '2026-07-13', 'LL'), 'and one before it').toBe(true)
    post149('osp9', 'delete')
    day16()
    signInAs('ad', 'a')
    expect((PEOPLE as any).osp9.deleted, 'marked deleted').toBe(true)
    expect(acct('acus9'), 'his account gone').toBeUndefined()
    const recs = worlds.u149!.keys().filter(k => k.startsWith('rec:')).map(k => JSON.parse(worlds.u149!.read(k)!)).filter((r: any) => r.pid === 'osp9')
    expect(recs.map((r: any) => r.date).sort(), 'his record before the date kept, the one after gone').toEqual(['2026-07-13'])
  })
  it('a moved man’s posting is skipped by both passes, unsaid, and never tried on every command', () => {
    post149('osp9', 'overseas')
    signInAs('ad', 'a')
    expect(setHome('osp9', 'u142').ok, 'Osprey moved to 142 from 16 Jul').toBe(true)
    day16()
    const off = watch()
    signInAs('ad', 'a')
    runPoOutcomes()
    off()
    expect((PEOPLE as any).osp9.archived, 'not run').toBeFalsy()
    expect(envs.filter(e => e.type === 'lw.postoutRun').length, 'no pass command at all').toBe(0)
    expect(HOOKS.toast).not.toHaveBeenCalled()
  })
  it('a held 149 posting says nothing to a 142 member; it runs by itself once 149 has another admin, 149’s war never loaded', () => {
    post149('kes9', 'overseas')
    day16()
    signInAs('us', 'us')                                    // Ranger, 142's member
    expect((PEOPLE as any).kes9.archived, 'held: Kestrel is 149’s last admin').toBeFalsy()
    expect(HOOKS.toast, 'no passing note about 149’s last admin').not.toHaveBeenCalled()
    signInAs('ad', 'a')
    expect(postingHeldNote('kes9'), 'the master’s Admin → Users says why').toMatch(/last admin/)
    expect(updateAccount('acus9', { role: 'admin' }), 'Saber makes Osprey an admin').toBeNull()
    raptorNotify()
    expect(worldUnit(), '142 still loaded').toBe('u142')
    expect((PEOPLE as any).kes9.archived, 'ran by itself, no posting touched').toBe(true)
    expect(HOOKS.toast).not.toHaveBeenCalled()
  })
  it('raised inside another command it is owed — never run inside it — and runs after it, in a command of its own', () => {
    post149('osp9', 'overseas')
    day16()                                                 // (no sign-in, no notify: nothing has woken it yet)
    const off = watch()
    let inside: unknown = 'not reached'
    inOneWarCommand('lw.reqmeta', () => { runForeignPostings(); inside = (PEOPLE as any).osp9.archived })
    expect(inside, 'not run inside the other command').toBeFalsy()
    raptorNotify()
    off()
    expect((PEOPLE as any).osp9.archived, 'the owed run, once that command is done').toBe(true)
    const run = envs.find(e => e.colls.includes('lwx.profile'))
    expect(run?.type, 'its own command, the posting run’s type').toBe('lw.postoutRun')
    expect(envs.filter(e => e.type === 'lw.reqmeta').every(e => !e.colls.includes('lwx.profile') && !e.colls.includes('people'))).toBe(true)
  })
})

describe('A6 — the held posting’s amber line shows whichever war is loaded', () => {
  const setPosting = () => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(postOut('kes9', '2026-07-16', 'overseas')).toBe(true)
  }
  it('(control) Kestrel’s own 149 war loaded on 16 Jul: his row says why the posting waits', () => {
    setPosting()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('ad9', 'a9')
    expect(postingHeldNote('kes9')).toMatch(/last admin/)
  })
  it('Saber (master, 142’s war loaded) on 16 Jul: Kestrel’s row says the same', () => {
    setPosting()
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad()
    signInAs('ad', 'a')
    expect(worldUnit()).toBe('u142')
    expect(postingHeldNote('kes9') ?? '(no line)', 'the amber line on the 149 man’s row').toMatch(/last admin/)
  })
})
