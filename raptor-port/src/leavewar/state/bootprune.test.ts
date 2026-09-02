import { describe, expect, it } from 'vitest'
import { qualGroupId } from '../engine'
import { memoryBackend } from './storage'
import { getState, groupsInOrder, initStore, setQualCatalog } from './store'

/* A SAVED qualification group must survive a reload even when its key is not
   one of the three the seed catalogue knows (bug hunt, 4 Sep 26): the boot
   used to prune the stored list against the SEED catalogue, so a TF / NVG /
   custom group — and its picked colour — was gone before Raptor's real column
   list ever arrived. The list is now pruned only at READ time and when the real
   catalogue lands, never at boot. */
describe('a stored qualification group outlives the boot', () => {
  const TF = qualGroupId('tf')

  it('keeps a TF group and its colour until the real catalogue arrives', () => {
    const backend = memoryBackend()
    backend.write('groupdefs', JSON.stringify([{ id: TF, kind: 'qual', k: 'tf' }, { id: 'SXO', kind: 'cat', g: 'SXO' }]))
    backend.write('groupcolors', JSON.stringify({ [TF]: '#E672A6' }))
    initStore(backend)
    // before the catalogue lands the seed does not know TF, so it is not SHOWN…
    expect(groupsInOrder().some(d => d.id === TF)).toBe(false)
    // …but it is still HELD, colour and all
    expect(getState().groupDefs.some(d => d.id === TF)).toBe(true)
    expect(getState().groupColors[TF]).toBe('#E672A6')
    // Raptor's real column list lands: the group is shown, in its colour
    setQualCatalog([{ k: 'scDay', label: 'SC DAY' }, { k: 'tf', label: 'TF' }])
    expect(groupsInOrder().map(d => d.id)).toEqual([TF, 'SXO'])
    expect(getState().groupColors[TF]).toBe('#E672A6')
  })

  it('a column the squadron really deleted still prunes the group, colour included', () => {
    const backend = memoryBackend()
    backend.write('groupdefs', JSON.stringify([{ id: TF, kind: 'qual', k: 'tf' }]))
    backend.write('groupcolors', JSON.stringify({ [TF]: '#E672A6' }))
    initStore(backend)
    setQualCatalog([{ k: 'scDay', label: 'SC DAY' }])
    expect(getState().groupDefs.some(d => d.id === TF)).toBe(false)
    expect(getState().groupColors[TF]).toBeUndefined()
    // and the pruned list is what a further reload sees
    initStore(backend)
    expect(getState().groupDefs.some(d => d.id === TF)).toBe(false)
  })
})
