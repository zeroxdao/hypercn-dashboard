/**
 * CoinGecko API 客户端
 * 用于获取 HYPE 代币的市值、价格、流通量等数据
 */

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || ""
const COINGECKO_BASE_URL = process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3"

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
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/hyperliquid`, {
      headers: {
        "x-cg-demo-api-key": COINGECKO_API_KEY,
      },
      next: { revalidate: 60 }, // 缓存 60 秒
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoTokenData = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching HYPE token data from CoinGecko:", error)
    return null
  }
}

/**
 * 获取 HYPE 代币简单价格数据（更快的 API）
 */
export async function getHypeSimplePrice(): Promise<CoinGeckoSimplePrice | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      {
        headers: {
          "x-cg-demo-api-key": COINGECKO_API_KEY,
        },
        next: { revalidate: 30 }, // 缓存 30 秒
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    return data.hyperliquid as CoinGeckoSimplePrice
  } catch (error) {
    console.error("Error fetching HYPE simple price from CoinGecko:", error)
    return null
  }
}

/**
 * 获取 HYPE 代币历史价格数据
 * @param days 天数 (1, 7, 14, 30, 90, 180, 365, max)
 */
export async function getHypeMarketChart(days = 1): Promise<CoinGeckoMarketChart | null> {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart?vs_currency=usd&days=${days}`, {
      headers: {
        "x-cg-demo-api-key": COINGECKO_API_KEY,
      },
      next: { revalidate: 300 }, // 缓存 5 分钟
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoMarketChart = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching HYPE market chart from CoinGecko:", error)
    return null
  }
}

/**
 * 获取 HYPE 代币历史价格数据（指定时间范围）
 * @param from Unix 时间戳（秒）
 * @param to Unix 时间戳（秒）
 */
export async function getHypeMarketChartRange(from: number, to: number): Promise<CoinGeckoMarketChart | null> {
  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/hyperliquid/market_chart/range?vs_currency=usd&from=${from}&to=${to}`,
      {
        headers: {
          "x-cg-demo-api-key": COINGECKO_API_KEY,
        },
        next: { revalidate: 300 }, // 缓存 5 分钟
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoMarketChart = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching HYPE market chart range from CoinGecko:", error)
    return null
  }
}
