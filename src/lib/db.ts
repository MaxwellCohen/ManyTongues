import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '#/db/schema'

const url = process.env.DB_URL
const authToken = process.env.DB_AUTH_TOKEN

function getDb() {
  if (!url?.trim()) {
    throw new Error('DB_URL is not configured.')
  }
  const client = createClient({
    url,
    authToken: authToken ?? undefined,
  })
  return drizzle(client, { schema })
}

/** Lazy singleton for server-side use. */
let _db: ReturnType<typeof getDb> | null = null

export function getTursoDb() {
  if (!_db) _db = getDb()
  return _db
}
