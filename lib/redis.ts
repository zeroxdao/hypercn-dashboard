import { Redis } from '@upstash/redis'

// 方案 A：用 fromEnv（需提供 UPSTASH_REDIS_REST_URL / TOKEN）
export const redis = Redis.fromEnv()

// 若走方案 B（沿用 KV_*），改成：
// export const redis = new Redis({
//   url: process.env.KV_REST_API_URL!,
//   token: process.env.KV_REST_API_TOKEN!,
// })
