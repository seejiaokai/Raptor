// @vitest-environment jsdom
/* THE MEMBERS' SWITCH — "members may file duties and commitments for other people" (owner D654, D655 reading 6: the
   members' half is "for now"; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13).

   One squadron setting, `memberfile`: absent = ON, `false` = OFF. Written only by its own admin command,
   `settings.memberfile`; read by the one permission module. Its two doors on screen (behind the Inputs calendar's
   gear, and the Logic page's row) come with the Inputs calendar — this is the record, the command and Undo's words. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { setSession } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, globalRedo, undoState } from '../undo'
import { initStore } from './store'
import { commandStream } from '../command'
import { SETTINGS_KEYS } from './people-settings-commit'
import { COMMAND_OPS, membersFileOn } from './perms'
import { setMembersFile } from './memberfile'

const mem = new Map<string, string>()
const backend = () => ({ getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] })
const admin = () => setSession({ user: 'admin-test', role: 'admin' })
const member = () => setSession({ user: 'member-test', role: 'main' })
beforeEach(() => {
  mem.clear()
  storeBackend.impl = backend()
  initStore()
  admin()
  _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); storeBackend.impl = null; _resetTimeline() })

describe('the members\' switch is one setting, written by its own admin command', () => {
  it('is registered where every guard reads it', () => {
    expect(SETTINGS_KEYS).toContain('memberfile')
    expect(COMMAND_OPS['settings.memberfile']).toMatchObject({ table: 'Setting, SchemaVersion', act: 'U', own: 'never' })
  })
  it('starts ON — a squadron that has never touched it stores nothing', () => {
    expect(membersFileOn()).toBe(true)
    expect(mem.has('sqn142_memberfile')).toBe(false)
  })
  it('an admin turns it off and on again; ON stores nothing', () => {
    expect(setMembersFile(false)).toMatchObject({ ok: true })
    expect(membersFileOn()).toBe(false)
    expect(store.get('memberfile', null)).toBe(false)
    expect(commandStream().at(-1)!.type).toBe('settings.memberfile')
    expect(setMembersFile(true)).toMatchObject({ ok: true })
    expect(membersFileOn()).toBe(true)
    expect(mem.has('sqn142_memberfile')).toBe(false)
  })
  it('setting it to what it already is makes no command', () => {
    const n = commandStream().length
    expect(setMembersFile(true)).toMatchObject({ ok: true })
    expect(commandStream().length).toBe(n)
  })
  it('a member cannot flip it — by its command or by a raw write', () => {
    member()
    expect(setMembersFile(false)).toMatchObject({ ok: false })
    expect(membersFileOn()).toBe(true)
    expect(() => store.set('memberfile', false)).toThrow()
    expect(membersFileOn()).toBe(true)
  })
  it('a raw write is refused for an admin too: its one writer is the command', () => {
    expect(() => store.set('memberfile', false)).toThrow()
    expect(() => store.set('memberfile', 'yes')).toThrow()
    expect(membersFileOn()).toBe(true)
  })
  it('anything stored that is not exactly "off" reads as ON', () => {
    mem.set('sqn142_memberfile', '"no"')
    expect(membersFileOn()).toBe(true)
    mem.set('sqn142_memberfile', 'false')
    expect(membersFileOn()).toBe(false)
  })
  it('Undo and Redo take it back and put it again, and say which way it went', () => {
    setMembersFile(false)
    expect(undoState().undoLabel).toBe('members filing for other people — off')
    expect(globalUndo().ok).toBe(true)
    expect(membersFileOn()).toBe(true)
    expect(globalRedo().ok).toBe(true)
    expect(membersFileOn()).toBe(false)
    setMembersFile(true)
    expect(undoState().undoLabel).toBe('members filing for other people — on')
  })
})
