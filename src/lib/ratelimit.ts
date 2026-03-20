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

async function slidingWindow(key: string, maxRequests: number, windowSeconds: number) {
  const redis = getRedis()
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds

  await redis.zremrangebyscore(key, 0, windowStart)
  const count = await redis.zcard(key)

  if (count >= maxRequests) {
    const oldest = await redis.zrange(key, 0, 0, { withScores: true })
    const resetAt = oldest.length > 0
      ? Math.ceil(Number(oldest[1]) + windowSeconds)
      : now + windowSeconds
    return { allowed: false, remaining: 0, resetAt }
  }

  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  await redis.expire(key, windowSeconds)
  return { allowed: true, remaining: maxRequests - count - 1, resetAt: now + windowSeconds }
}

// 5 requests per hour per IP for public paid endpoints (legal demand / CCJ pack)
export async function checkPublicRateLimit(ip: string): Promise<{ allowed: boolean; resetAt: number }> {
  const key = `public_rate:${ip}`
  const result = await slidingWindow(key, 5, 3600)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

// 20 reminder emails per hour per org
export async function checkReminderRateLimit(organizationId: string): Promise<{
  allowed: boolean
  remaining: number
  resetAt: number
}> {
  return slidingWindow(`reminder_rate:${organizationId}`, 20, 3600)
}
