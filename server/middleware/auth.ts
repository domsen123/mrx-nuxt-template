export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  if (session?.user) {
    event.context.user = session.user
  }
})
