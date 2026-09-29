/* The map slide's page thumbnails: each page as it first opens, signed in as the admin; and the sign-in card. */
export default async function ({ fresh, go, shot, FULL }) {
  const page = await fresh('ad', { scale: 1 })
  for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'leavewar', 'tracker', 'admin']) {
    await go(page, p)
    await shot(page, `map-${p}`, FULL)
  }
  await page.context().close()
  const out = await fresh(null, { scale: 1 })
  await shot(out, 'map-login', FULL)
  await out.context().close()
}
