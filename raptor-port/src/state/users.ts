/* The Manage-users list — the reference's USERS array with its two mutations
   (add from the modal's fields, remove by row index). Prototype-only: no
   server, exactly as the reference ships it. */
export let USERS: any[] = [
  { name: 'Bane', role: 'admin' }, { name: 'Stiff', role: 'admin' },
  { name: 'Ignite', role: 'main' }, { name: 'Casper', role: 'main' },
]
export function addUser(name: string, role: string) { USERS.push({ name, role }) }
export function delUser(i: number) { USERS.splice(i, 1) }
