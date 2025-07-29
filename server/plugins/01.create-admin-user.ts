export default defineNitroPlugin(async () => {
  const { admin: { email, password } } = useRuntimeConfig()

  try {
    await auth.api.createUser({
      body: { name: 'Admin User', email, password, role: 'admin' },
    })

    console.info(`Admin user created with email: ${email} and password: ${password}`)
  }
  catch (error: any) {
    if (error.body) {
      if (error.body.code !== 'USER_ALREADY_EXISTS') {
        throw error
      }
    }
    else {
      throw error
    }
  }
})
