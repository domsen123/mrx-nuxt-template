const createRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-?'
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export default defineNitroPlugin(async () => {
  const { admin: { email, password: pw } } = useRuntimeConfig()
  const password = pw || createRandomPassword()

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
