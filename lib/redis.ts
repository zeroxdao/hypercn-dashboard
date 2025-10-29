/**
 * Redis 客户端配置
 * 使用 Upstash Redis 进行数据缓存和速率限制
 */

import { Redis } from "@upstash/redis"

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  if (typeof window !== "undefined") {
    // Don't use Redis on client side
    return null
  }

  if (!redisClient) {
    try {
      redisClient = Redis.fromEnv()
    } catch (error) {
      console.error("Failed to initialize Redis client:", error)
      return null
    }
  }

  return redisClient
}

/**
 * 缓存键前缀
 */
export const CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard:stats",
  HYPE_PRICE: "dashboard:hype-price",
  BUYBACK_DATA: "dashboard:buyback",
  REVENUE_DATA: (timeView: string) => `dashboard:revenue:${timeView}`,
  HOT_TOKENS: "dashboard:hot-tokens",
  TOP_GAINERS: "dashboard:top-gainers",
  NEW_TOKENS: "dashboard:new-tokens",
  DEFILLAMA_REVENUE: "api:defillama-revenue",
  RATE_LIMIT: (ip: string) => `ratelimit:${ip}`,
} as const

/**
 * 缓存过期时间（秒）
 */
export const CACHE_TTL = {
  DASHBOARD_STATS: 60, // 1 分钟
  HYPE_PRICE: 30, // 30 秒
  BUYBACK_DATA: 300, // 5 分钟
  REVENUE_DATA: 300, // 5 分钟
  HOT_TOKENS: 60, // 1 分钟
  TOP_GAINERS: 60, // 1 分钟
  NEW_TOKENS: 300, // 5 分钟
  DEFILLAMA_REVENUE: 300, // 5 分钟
  RATE_LIMIT: 60, // 1 分钟
} as const

/**
 * 速率限制检查（使用 Redis）
 * @param ip - 客户端 IP 地址
 * @param limit - 每分钟请求限制（默认 60）
 * @returns 是否允许请求
 */
export async function checkRateLimit(ip: string, limit = 60): Promise<boolean> {
  try {
    const redis = getRedis()
    if (!redis) {
      // Redis 不可用时允许请求通过
      return true
    }

    const key = CACHE_KEYS.RATE_LIMIT(ip)
    const current = await redis.incr(key)

    // 第一次请求时设置过期时间
    if (current === 1) {
      await redis.expire(key, CACHE_TTL.RATE_LIMIT)
    }

    return current <= limit
  } catch (error) {
    // Redis 失败时允许请求通过（降级处理）
    if (process.env.NODE_ENV === "development") {
      console.error("Rate limit check failed:", error)
    }
    return true
  }
}

/**
 * 从缓存获取数据
 * @param key - 缓存键
 * @returns 缓存的数据或 null
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    if (!redis) {
      return null
    }

    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Failed to get cache for key ${key}:`, error)
    }
    return null
  }
}

/**
 * 设置缓存数据
 * @param key - 缓存键
 * @param data - 要缓存的数据
 * @param ttl - 过期时间（秒）
 */
export async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) {
      return
    }

    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Failed to set cache for key ${key}:`, error)
    }
  }
}

/**
 * 删除缓存
 * @param key - 缓存键
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) {
      return
    }

    await redis.del(key)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Failed to delete cache for key ${key}:`, error)
    }
  }
}

/**
 * 批量删除缓存（按模式匹配）
 * @param pattern - 缓存键模式（例如：dashboard:*）
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) {
      return
    }

    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Failed to delete cache pattern ${pattern}:`, error)
    }
  }
}
