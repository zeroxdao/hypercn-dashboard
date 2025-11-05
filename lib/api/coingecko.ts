/**
 * CoinGecko API 客户端
 * 用于获取 HYPE 代币的市值、价格、流通量等数据
 */

import { redis } from "@/lib/redis"

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ""
const COINGECKO_BASE_URL = "https://pro-api.coingecko.com/api/v3"

const CACHE_TTL = {
  TOKEN_DATA: 60, // 60 seconds for token data
  SIMPLE_PRICE: 30, // 30 seconds for simple price
  MARKET_CHART: 300, // 5 minutes for market chart
}

export interface CoinGeckoTokenData {
  id: string
  symbol: string
  name: string
  market_data: {
    current_price: {
      usd: number
    }
    market_cap: {
      usd: number
    }
    market_cap_change_percentage_24h: number
    total_volume: {
      usd: number
    }
    circulating_supply: number
    total_supply: number
    high_24h: {
      usd: number
    }
    low_24h: {
      usd: number
    }
    price_change_percentage_24h: number
  }
}

export interface CoinGeckoSimplePrice {
  usd: number
  usd_24h_change: number
  usd_24h_vol: number
  usd_market_cap: number
}

export interface CoinGeckoMarketChart {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

/**
 * 获取 HYPE 代币完整数据
 */
export async function getHypeTokenData(): Promise<CoinGeckoTokenData | null> {
  const cacheKey = "coingecko:hyperliquid:token_data"

  try {
    if (redis) {
      const cached = await redis.get<CoinGeckoTokenData>(cacheKey)
      if (cached) {
        console.log("[v0] Using cached CoinGecko token data")
        return cached
      }
    }

    const url = COINGECKO_API_KEY
      ? `${COINGECKO_BASE_URL}/coins/hyperliquid?x_cg_pro_api_key=${COINGECKO_API_KEY}`
      : `${COINGECKO_BASE_URL}/coins/hyperliquid`

    const response = await fetch(url, {
      next: { revalidate: 60 }, // 缓存 60 秒
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error(`Response body: ${text.substring(0, 200)}`)
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoTokenData = await response.json()

    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL.TOKEN_DATA, data)
      console.log("[v0] Cached CoinGecko token data")
    }

    return data
  } catch (error) {
    console.error("Error fetching HYPE token data from CoinGecko:", error)

    if (redis) {
      const stale = await redis.get<CoinGeckoTokenData>(cacheKey)
      if (stale) {
        console.log("[v0] Using stale cache due to API error")
        return stale
      }
    }

    return null
  }
}

/**
 * 获取 HYPE 代币简单价格数据（更快的 API）
 */
export async function getHypeSimplePrice(): Promise<CoinGeckoSimplePrice | null> {
  const cacheKey = "coingecko:hyperliquid:simple_price"

  try {
    if (redis) {
      const cached = await redis.get<CoinGeckoSimplePrice>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const url = COINGECKO_API_KEY
      ? `${COINGECKO_BASE_URL}/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&x_cg_pro_api_key=${COINGECKO_API_KEY}`
      : `${COINGECKO_BASE_URL}/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`

    const response = await fetch(url, {
      next: { revalidate: 30 }, // 缓存 30 秒
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.hyperliquid as CoinGeckoSimplePrice

    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL.SIMPLE_PRICE, result)
    }

    return result
  } catch (error) {
    console.error("Error fetching HYPE simple price from CoinGecko:", error)

    if (redis) {
      const stale = await redis.get<CoinGeckoSimplePrice>(cacheKey)
      if (stale) {
        return stale
      }
    }

    return null
  }
}

/**
 * 获取 HYPE 代币历史价格数据
 * @param days 天数 (1, 7, 14, 30, 90, 180, 365, max)
 */
export async function getHypeMarketChart(days = 1): Promise<CoinGeckoMarketChart | null> {
  const cacheKey = `coingecko:hyperliquid:market_chart:${days}`

  try {
    if (redis) {
      const cached = await redis.get<CoinGeckoMarketChart>(cacheKey)
      if (cached) {
        console.log(`[v0] Using cached CoinGecko market chart (${days} days)`)
        return cached
      }
    }

    const url = COINGECKO_API_KEY
      ? `${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart?vs_currency=usd&days=${days}&x_cg_pro_api_key=${COINGECKO_API_KEY}`
      : `${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart?vs_currency=usd&days=${days}`

    const response = await fetch(url, {
      next: { revalidate: 300 }, // 缓存 5 分钟
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoMarketChart = await response.json()

    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL.MARKET_CHART, data)
      console.log(`[v0] Cached CoinGecko market chart (${days} days)`)
    }

    return data
  } catch (error) {
    console.error("Error fetching HYPE market chart from CoinGecko:", error)

    if (redis) {
      const stale = await redis.get<CoinGeckoMarketChart>(cacheKey)
      if (stale) {
        console.log(`[v0] Using stale cache for market chart due to API error`)
        return stale
      }
    }

    return null
  }
}

/**
 * 获取 HYPE 代币历史价格数据（指定时间范围）
 * @param from Unix 时间戳（秒）
 * @param to Unix 时间戳（秒）
 */
export async function getHypeMarketChartRange(from: number, to: number): Promise<CoinGeckoMarketChart | null> {
  const cacheKey = `coingecko:hyperliquid:market_chart_range:${from}:${to}`

  try {
    if (redis) {
      const cached = await redis.get<CoinGeckoMarketChart>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const url = COINGECKO_API_KEY
      ? `${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart/range?vs_currency=usd&from=${from}&to=${to}&x_cg_pro_api_key=${COINGECKO_API_KEY}`
      : `${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart/range?vs_currency=usd&from=${from}&to=${to}`

    const response = await fetch(url, {
      next: { revalidate: 300 }, // 缓存 5 分钟
    })

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoMarketChart = await response.json()

    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL.MARKET_CHART, data)
    }

    return data
  } catch (error) {
    console.error("Error fetching HYPE market chart range from CoinGecko:", error)

    if (redis) {
      const stale = await redis.get<CoinGeckoMarketChart>(cacheKey)
      if (stale) {
        return stale
      }
    }

    return null
  }
}
