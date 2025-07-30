import process from 'node:process'

import { faker } from '@faker-js/faker'
import { auth } from '../server/utils/auth'

const seed = async () => {
  try {
    for (let i = 0; i < 100; i++) {
      await auth.api.createUser({
        body: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password({
            length: 8,
          }),
        },
      })
    }
    console.info('100 fake users created successfully.')
    process.exit(0)
  }
  catch (error) {
    console.error('Error creating fake users:', error)
    process.exit(1)
  }
}

seed()
