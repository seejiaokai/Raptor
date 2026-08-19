// The one place storage is touched.
//
// A leave war is inherently shared, and browser storage is not — forty people
// bidding in forty browsers is not a leave war. The seam exists so that the
// shared backend arriving next replaces one module rather than every write
// path in the codebase.

export interface StorageBackend {
  read(key: string): string | null
  write(key: string, value: string): void
}

export function memoryBackend(): StorageBackend {
  const map = new Map<string, string>()
  return {
    read: key => map.get(key) ?? null,
    write: (key, value) => void map.set(key, value),
  }
}

/**
 * Route a few named keys to a durable backend while everything else stays on
 * the session one. The counter DEFINITIONS (and their order/hidden lists) are
 * squadron SETTINGS, not leave data (owner, 19 Aug 26 — a counter he built,
 * or deleted, must not resurrect on reload), so they outlive the session that
 * deliberately forgets the war itself. One routing seam rather than a second
 * store: the shared database backend still replaces this whole module.
 */
export function splitBackend(session: StorageBackend, durable: StorageBackend, durableKeys: string[]): StorageBackend {
  const keys = new Set(durableKeys)
  return {
    read: key => (keys.has(key) ? durable : session).read(key),
    write: (key, value) => (keys.has(key) ? durable : session).write(key, value),
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
  }
}
