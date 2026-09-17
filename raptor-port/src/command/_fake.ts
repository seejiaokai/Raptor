/* Test-only fake EnlistableStore for the command-layer property tests. Not
   imported by any production module, so it drops out of the bundle. */
import type { EnlistableStore, RecordEntry, LogicalCollection } from './types'
import { deepClone } from './util'

export interface FakeStore {
  store: EnlistableStore
  set(id: string, value: unknown): void
  del(id: string): void
  get(id: string): unknown
}

export function makeStore(key: string, coll: LogicalCollection): FakeStore {
  const data = new Map<string, RecordEntry>()
  const rk = (id: string) => `${coll}/${id}`
  const store: EnlistableStore = {
    key,
    capture: () => deepClone([...data.entries()]),
    restore: (snap) => {
      data.clear()
      for (const [k, e] of snap as [string, RecordEntry][]) data.set(k, e)
    },
    records: () => {
      const m = new Map<string, RecordEntry>()
      for (const [k, e] of data) m.set(k, { collection: e.collection, id: e.id, value: e.value })
      return m
    },
    signature: () => {
      const parts = [...data.entries()].map(([k, e]) => k + '=' + JSON.stringify(e.value))
      parts.sort()
      return parts.join('|')
    },
  }
  return {
    store,
    set: (id, value) => data.set(rk(id), { collection: coll, id, value }),
    del: (id) => data.delete(rk(id)),
    get: (id) => data.get(rk(id))?.value,
  }
}
