// The one place storage is touched.
//
// A leave war is inherently shared, and browser storage is not — forty people
// bidding in forty browsers is not a leave war. The seam exists so that the
// shared backend arriving next replaces one module rather than every write
// path in the codebase.

export interface StorageBackend {
  read(key: string): string | null
  write(key: string, value: string): void
  /** [DB-READINESS] group A, phase 0 — phase 3 keeps one record per bid, so a deleted bid is REMOVED
      (removing an absent key is not an error) and the war's records are LISTED at boot. */
  remove(key: string): void
  keys(): string[]
}

export function memoryBackend(): StorageBackend {
  const map = new Map<string, string>()
  return {
    read: key => map.get(key) ?? null,
    write: (key, value) => void map.set(key, value),
    remove: key => void map.delete(key),
    keys: () => [...map.keys()],
  }
}

export function localBackend(): StorageBackend {
  return {
    read: key => {
      try {
        return localStorage.getItem(`leavewar:${key}`)
      } catch {
        // Private browsing and disabled storage both throw. A leave war that
        // cannot persist is still worth reading, so degrade rather than die.
        return null
      }
    },
    write: (key, value) => {
      try {
        localStorage.setItem(`leavewar:${key}`, value)
      } catch {
        /* ignore — see read() */
      }
    },
    remove: key => {
      try {
        localStorage.removeItem(`leavewar:${key}`)
      } catch {
        /* ignore — see read() */
      }
    },
    keys: () => {
      const out: string[] = []
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('leavewar:')) out.push(k.slice('leavewar:'.length))
        }
      } catch {
        /* see read() */
      }
      return out
    },
  }
}
