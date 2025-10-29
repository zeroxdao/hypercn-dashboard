import { Redis } from "@upstash/redis"

let _redis: ReturnType<typeof Redis.fromEnv> | null = null

/** 单例：仅在第一次调用时创建 */
export const redis = (() => {
  if (_redis) return _redis
  _redis = Redis.fromEnv()
  return _redis!
})()

export default redis
