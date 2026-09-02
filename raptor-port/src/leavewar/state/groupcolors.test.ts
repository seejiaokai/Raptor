import { beforeEach, describe, expect, it } from 'vitest'
import { qualGroupId } from '../engine'
import { memoryBackend } from './storage'
import {
  addGroup,
  getState,
  initStore,
  resetGroups,
  setGroupColor,
  setGroupDefs,
  setQualCatalog,
  setRole,
} from './store'

/* The colour an admin PICKS for a qualification group (owner, 3 Sep 26 —
   "allow me to pick the colour i want"). Stored by group id, admin-gated, and
   it lives and dies with the group. */
describe('group colours', () => {
  const SCD = qualGroupId('scDay')
  const scdGroup = { id: SCD, kind: 'qual' as const, k: 'scDay' }

  beforeEach(() => {
    initStore(memoryBackend())
    setRole('admin')
    setQualCatalog([{ k: 'scDay', label: 'SC DAY' }, { k: 'scNight', label: 'SC NIGHT' }])
  })

  it('an admin picks a colour for a shown qualification group, and it persists', () => {
    addGroup(scdGroup)
    setGroupColor(SCD, '#E672A6')
    expect(getState().groupColors[SCD]).toBe('#E672A6')
    // survives a reload from the same backend
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    setQualCatalog([{ k: 'scDay', label: 'SC DAY' }])
    addGroup(scdGroup)
    setGroupColor(SCD, '#7BC043')
    initStore(backend)
    expect(getState().groupColors[SCD]).toBe('#7BC043')
  })

  it('refuses a member, a built-in group, a group not shown, and a non-hex value', () => {
    addGroup(scdGroup)
    setGroupColor('SXO', '#E672A6')                       // built-in: wears its CAT colour
    setGroupColor(qualGroupId('scNight'), '#E672A6')      // not shown
    setGroupColor(SCD, 'red')                             // not #rrggbb
    expect(getState().groupColors).toEqual({})
    setRole('member')
    setGroupColor(SCD, '#E672A6')
    expect(getState().groupColors).toEqual({})
  })

  it('a removed group takes its colour with it; reset clears them all', () => {
    addGroup(scdGroup)
    setGroupColor(SCD, '#E672A6')
    setGroupDefs(getState().groupDefs.filter(d => d.id !== SCD))
    expect(getState().groupColors).toEqual({})
    addGroup(scdGroup)
    setGroupColor(SCD, '#E672A6')
    resetGroups()
    expect(getState().groupColors).toEqual({})
  })

  it('reads stored colours leniently — only q: ids with #rrggbb values survive', () => {
    const backend = memoryBackend()
    backend.write('groupcolors', JSON.stringify({ [SCD]: '#ABCDEF', SXO: '#111111', 'q:x': 'blue', 'q:y': 7 }))
    backend.write('groupdefs', JSON.stringify([scdGroup]))
    initStore(backend)
    expect(getState().groupColors).toEqual({ [SCD]: '#ABCDEF' })
  })
})
