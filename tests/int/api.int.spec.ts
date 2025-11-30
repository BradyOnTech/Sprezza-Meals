import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload
let skip = false

const databaseUrl =
  process.env.DATABASE_URI || process.env.PAYLOAD_DATABASE_URI || process.env.DATABASE_URL
const enableApiTests = process.env.ENABLE_API_TESTS === 'true'

if (!databaseUrl || !enableApiTests) {
  skip = true
  if (!enableApiTests) {
    console.warn('Skipping API tests: set ENABLE_API_TESTS=true to run against a database.')
  } else {
    console.warn('Skipping API tests: no database URL configured.')
  }
}

describe('API', () => {
  beforeAll(async () => {
    if (skip) return
    const payloadConfig = await config
    try {
      payload = await getPayload({ config: payloadConfig })
    } catch (err) {
      skip = true
      console.warn('Skipping API tests: unable to connect to database.', err)
    }
  })

  it('fetches users', async () => {
    if (skip || !payload) return
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
