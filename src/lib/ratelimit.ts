import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

const WINDOW_SECONDS = 3600 // 1 hour
const MAX_REQUESTS = 20

export async function checkReminderRateLimit(organizationId: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  const redis = getRedis()
  const key = `reminder_rate:${organizationId}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - WINDOW_SECONDS

  await redis.zremrangebyscore(key, 0, windowStart)

  const count = await redis.zcard(key)

  if (count >= MAX_REQUESTS) {
    const oldest = await redis.zrange(key, 0, 0, { withScores: true })
    const resetAt = oldest.length > 0 ? Math.ceil(Number(oldest[1]) + WINDOW_SECONDS) : now + WINDOW_SECONDS
    return { allowed: false, remaining: 0, resetAt }
  }

  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  await redis.expire(key, WINDOW_SECONDS)

  return {
    allowed: true,
    remaining: MAX_REQUESTS - count - 1,
    resetAt: now + WINDOW_SECONDS,
  }
}
