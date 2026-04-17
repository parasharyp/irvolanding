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

const LUA_SLIDING_WINDOW = `
redis.call('zremrangebyscore', KEYS[1], 0, ARGV[1])
local count = redis.call('zcard', KEYS[1])
if count >= tonumber(ARGV[2]) then return 0 end
redis.call('zadd', KEYS[1], ARGV[3], ARGV[4])
redis.call('expire', KEYS[1], ARGV[5])
return 1`

async function slidingWindow(key: string, maxRequests: number, windowSeconds: number) {
  const redis = getRedis()
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - windowSeconds
  const member = `${now}-${Math.random()}`

  const result = await redis.eval(
    LUA_SLIDING_WINDOW,
    [key],
    [windowStart, maxRequests, now, member, windowSeconds],
  )

  const allowed = result === 1
  return {
    allowed,
    remaining: allowed ? Math.max(0, maxRequests - 1) : 0,
    resetAt: now + windowSeconds,
  }
}

// 5 requests per hour per IP for public paid endpoints (legal demand / CCJ pack)
export async function checkPublicRateLimit(ip: string): Promise<{ allowed: boolean; resetAt: number }> {
  const key = `public_rate:${ip}`
  const result = await slidingWindow(key, 5, 3600)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

// 100 authenticated API requests per minute per user
export async function checkAuthenticatedRateLimit(userId: string): Promise<{ allowed: boolean; resetAt: number }> {
  const result = await slidingWindow(`auth_rate:${userId}`, 100, 60)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

// Webhook idempotency — returns true if this event was already processed.
// Uses SET NX with 24h TTL to atomically mark an event as seen.
export async function isWebhookAlreadyProcessed(eventId: string): Promise<boolean> {
  const redis = getRedis()
  const key = `webhook_seen:${eventId}`
  // SET key 1 NX EX 86400 — returns 'OK' if set (first time), null if already existed
  const result = await redis.set(key, '1', { nx: true, ex: 86400 })
  return result === null
}

// 5 signups per hour per IP — prevents account farming
export async function checkSignupRateLimit(ip: string): Promise<{ allowed: boolean; resetAt: number }> {
  const result = await slidingWindow(`signup_rate:${ip}`, 5, 3600)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

// 10 AI classifications per hour per org — protects Anthropic API spend
export async function checkClassifyRateLimit(orgId: string): Promise<{ allowed: boolean; resetAt: number }> {
  const result = await slidingWindow(`ai_classify:${orgId}`, 10, 3600)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

// 30 AI drafts per hour per org — protects Anthropic API spend
export async function checkDraftRateLimit(orgId: string): Promise<{ allowed: boolean; resetAt: number }> {
  const result = await slidingWindow(`ai_draft:${orgId}`, 30, 3600)
  return { allowed: result.allowed, resetAt: result.resetAt }
}

export async function clearWebhookProcessed(eventId: string): Promise<void> {
  const redis = getRedis()
  await redis.del(`webhook_seen:${eventId}`)
}

