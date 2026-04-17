import { z } from 'zod'
import { badRequest } from './api-error'

const uuidSchema = z.string().uuid()

export function validateUuid(id: string) {
  const result = uuidSchema.safeParse(id)
  if (!result.success) return badRequest('Invalid ID format')
  return null
}
