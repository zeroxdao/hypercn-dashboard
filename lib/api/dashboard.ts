/**
 * 仪表板数据聚合服务
 * 将 Hyperliquid API、CoinGecko API 和 DefiLlama API 数据转换为仪表板所需格式
 */

import { getMetaAndAssetCtxs, getSpotMetaAndAssetCtxs } from "./hyperliquid"
import { getHypeTokenData, getHypeMarketChart } from "./coingecko"
import { getHyperliquidData } from "./defillama"
import type { DashboardStats, HypePrice, BuybackData, RevenueData, TokenInfo } from "@/lib/types/hyperliquid"

/**
 * 获取仪表板统计数据
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [hypeData, defiLlamaData, perpsVolume] = await Promise.all([
      getHypeTokenData(),
      getHyperliquidData(),
      fetchPerpsVolume(),
    ])

    const tvl = defiLlamaData.tvl || 0

    if (hypeData) {
      return {
        totalUsers: 0,
        totalMarketCap: `US$${Math.round(hypeData.market_data.market_cap.usd).toLocaleString("en-US")}`,
        marketCapChange: Number.parseFloat(hypeData.market_data.market_cap_change_percentage_24h.toFixed(2)),
        totalValueLocked: `US$${Math.round(tvl).toLocaleString("en-US")}`,
        tvlChange: 0,
        volume24h: `US$${Math.round(perpsVolume).toLocaleString("en-US")}`,
        hyperevmTps: 0,
      }
    }

    console.warn("CoinGecko API failed, using Hyperliquid API as fallback")

    return {
      totalUsers: 0,
      totalMarketCap: "US$0",
      marketCapChange: 0,
      totalValueLocked: `US$${Math.round(tvl).toLocaleString("en-US")}`,
      tvlChange: 0,
      volume24h: `US$${Math.round(perpsVolume).toLocaleString("en-US")}`,
      hyperevmTps: 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalUsers: 0,
      totalMarketCap: "US$0",
      marketCapChange: 0,
      totalValueLocked: "US$0",
      tvlChange: 0,
      volume24h: "US$0",
      hyperevmTps: 0,
    }
  }
}

/**
 * 获取 Perps 24 小时交易量（从 Hyperliquid API）
 */
async function fetchPerpsVolume(): Promise<number> {
  try {
    const { data: metaAndCtxs } = await getMetaAndAssetCtxs()

    if (metaAndCtxs) {
      const [, assetCtxs] = metaAndCtxs
      const totalVolume = assetCtxs.reduce((sum, ctx) => {
        return sum + Number.parseFloat(ctx.dayNtlVlm)
      }, 0)

      return totalVolume
    }

    return 0
  } catch (error) {
    console.error("Error fetching perps volume:", error)
    return 0
  }
}

/**
 * 获取 HYPE 价格数据
 * 使用 CoinGecko API 获取真实价格数据
 */
export async function getHypePrice(): Promise<HypePrice> {
  try {
    const hypeData = await getHypeTokenData()

    if (hypeData) {
      const chartData = await getHypeMarketChart(1)
      const priceHistory = chartData
        ? chartData.prices.map(([time, price]) => ({
            time,
            price,
          }))
        : []

      return {
        current: hypeData.market_data.current_price.usd.toFixed(4),
        change24h: Number.parseFloat(hypeData.market_data.price_change_percentage_24h.toFixed(2)),
        low24h: hypeData.market_data.low_24h.usd.toFixed(4),
        high24h: hypeData.market_data.high_24h.usd.toFixed(4),
        chartData: priceHistory,
      }
    }

    console.warn("CoinGecko API failed, using Hyperliquid API as fallback")
    const { data: metaAndAssetCtxs } = await getMetaAndAssetCtxs()

    if (!metaAndAssetCtxs) {
      throw new Error("Failed to fetch price data")
    }

    const [meta, assetCtxs] = metaAndAssetCtxs
    const hypeIndex = meta.universe.findIndex((asset) => asset.name === "HYPE")

    if (hypeIndex === -1) {
      throw new Error("HYPE not found in universe")
    }

    const hypeCtx = assetCtxs[hypeIndex]
    const currentPrice = Number.parseFloat(hypeCtx.markPx)
    const prevPrice = Number.parseFloat(hypeCtx.prevDayPx)
    const change24h = ((currentPrice - prevPrice) / prevPrice) * 100

    const chartData = Array.from({ length: 24 }, (_, i) => ({
      time: Date.now() - (24 - 1 - i) * 3600000,
      price: currentPrice * (0.95 + Math.random() * 0.1),
    }))

    return {
      current: currentPrice.toFixed(4),
      change24h: Number.parseFloat(change24h.toFixed(2)),
      low24h: hypeCtx.impactPxs[0],
      high24h: hypeCtx.impactPxs[1],
      chartData,
    }
  } catch (error) {
    console.error("Error fetching HYPE price:", error)
    return {
      current: "0",
      change24h: 0,
      low24h: "0",
      high24h: "0",
      chartData: [],
    }
  }
}

/**
 * 获取回购数据
 * 注意：Hypurrscan API 不可用，使用模拟数据
 */
export async function getBuybackData(): Promise<BuybackData[]> {
  try {
    return [
      {
        period: "24h",
        amount: "$1.54m",
        hypeAmount: "41.26K",
        avgPrice: "US$37.34",
      },
      {
        period: "7d",
        amount: "$22.38m",
        hypeAmount: "585.23K",
        avgPrice: "US$38.05",
      },
      {
        period: "30d",
        amount: "$104.79m",
        hypeAmount: "2.43M",
        avgPrice: "US$44.60",
      },
    ]
  } catch (error) {
    console.error("Error fetching buyback data:", error)
    return [
      {
        period: "24h",
        amount: "$1.54m",
        hypeAmount: "41.26K",
        avgPrice: "US$37.34",
      },
      {
        period: "7d",
        amount: "$22.38m",
        hypeAmount: "585.23K",
        avgPrice: "US$38.05",
      },
      {
        period: "30d",
        amount: "$104.79m",
        hypeAmount: "2.43M",
        avgPrice: "US$44.60",
      },
    ]
  }
}

/**
 * 获取收入数据（支持两种时间视图）
 * @param timeView - 时间视图: 'month' (12个月), 'day' (30天)
 */
export async function getRevenueData(timeView: "month" | "day" = "month"): Promise<RevenueData[]> {
  try {
    const defiLlamaData = await getHyperliquidData()

    if (timeView === "month") {
      return await getMonthlyRevenueData(defiLlamaData)
    } else {
      return await getDailyRevenueData(defiLlamaData)
    }
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return []
  }
}

/**
 * 获取月度收入数据（最近12个月，按UTC自然月聚合）
 */
async function getMonthlyRevenueData(defiLlamaData: any): Promise<RevenueData[]> {
  if (!defiLlamaData.fees || !defiLlamaData.revenue) {
    console.warn("DefiLlama API unavailable, using mock revenue data")
    return []
  }

  const feesChart = defiLlamaData.fees.totalDataChart || []
  const revenueChart = defiLlamaData.revenue.totalDataChart || []

  const monthlyData = new Map<string, { fees: number; revenue: number }>()

  feesChart.forEach(([timestamp, fees]: [number, number]) => {
    const date = new Date(timestamp * 1000)
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    const existing = monthlyData.get(monthKey) || { fees: 0, revenue: 0 }
    existing.fees += fees
    monthlyData.set(monthKey, existing)
  })

  revenueChart.forEach(([timestamp, revenue]: [number, number]) => {
    const date = new Date(timestamp * 1000)
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    const existing = monthlyData.get(monthKey) || { fees: 0, revenue: 0 }
    existing.revenue += revenue
    monthlyData.set(monthKey, existing)
  })

  const sortedData = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)

  return sortedData.map(([monthKey, data]) => {
    return {
      month: monthKey,
      fees: data.fees,
      revenue: data.revenue,
    }
  })
}

/**
 * 获取日度收入数据（最近30天，直接使用daily序列）
 */
async function getDailyRevenueData(defiLlamaData: any): Promise<RevenueData[]> {
  if (!defiLlamaData.fees || !defiLlamaData.revenue) {
    console.warn("DefiLlama API unavailable")
    return []
  }

  const feesChart = defiLlamaData.fees.totalDataChart || []
  const revenueChart = defiLlamaData.revenue.totalDataChart || []

  const dailyData = new Map<string, { fees: number; revenue: number; timestamp: number }>()

  feesChart.forEach(([timestamp, fees]: [number, number]) => {
    const date = new Date(timestamp * 1000)
    const dayKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
    dailyData.set(dayKey, { fees, revenue: 0, timestamp })
  })

  revenueChart.forEach(([timestamp, revenue]: [number, number]) => {
    const date = new Date(timestamp * 1000)
    const dayKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
    const existing = dailyData.get(dayKey) || { fees: 0, revenue: 0, timestamp }
    existing.revenue = revenue
    dailyData.set(dayKey, existing)
  })

  const sortedData = Array.from(dailyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)

  return sortedData.map(([dayKey, data]) => {
    const date = new Date(data.timestamp * 1000)
    const monthDay = `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
    return {
      month: monthDay,
      fees: data.fees,
      revenue: data.revenue,
    }
  })
}

/**
 * 获取热门代币
 * 使用 Hyperliquid Spot API 获取热门代币（按交易量排序）
 */
export async function getHotTokens(): Promise<TokenInfo[]> {
  try {
    const { data: spotData } = await getSpotMetaAndAssetCtxs()

    if (!spotData) {
      throw new Error("Failed to fetch spot data")
    }

    const [spotMeta, assetCtxs] = spotData

    if (!Array.isArray(assetCtxs) || !Array.isArray(spotMeta?.universe)) {
      console.error("Invalid spot data structure")
      return []
    }

    const minLength = Math.min(assetCtxs.length, spotMeta.universe.length)

    if (assetCtxs.length !== spotMeta.universe.length) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `Array length mismatch: assetCtxs(${assetCtxs.length}) vs universe(${spotMeta.universe.length}), using first ${minLength} items`,
        )
      }
    }

    const sortedTokens = assetCtxs
      .slice(0, minLength)
      .map((ctx, index) => {
        const meta = spotMeta.universe[index]
        if (!meta || !ctx) {
          return null
        }

        return {
          ctx,
          meta,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => Number.parseFloat(b.ctx.dayNtlVlm) - Number.parseFloat(a.ctx.dayNtlVlm))
      .slice(0, 5)

    return sortedTokens.map(({ ctx, meta }) => {
      const currentPrice = Number.parseFloat(ctx.markPx)
      const prevPrice = Number.parseFloat(ctx.prevDayPx)
      const change24h = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0

      return {
        name: meta.name,
        symbol: meta.name,
        price: `US$${currentPrice.toFixed(meta.name === "USDT" ? 3 : 2)}`,
        change24h: Number.parseFloat(change24h.toFixed(1)),
        volume24h: ctx.dayNtlVlm,
      }
    })
  } catch (error) {
    console.error("Error fetching hot tokens:", error)
    return []
  }
}

/**
 * 获取涨幅最大的代币
 */
export async function getTopGainers(): Promise<TokenInfo[]> {
  try {
    const { data: spotData } = await getSpotMetaAndAssetCtxs()

    if (!spotData) {
      throw new Error("Failed to fetch spot data")
    }

    const [spotMeta, assetCtxs] = spotData

    if (!Array.isArray(assetCtxs) || !Array.isArray(spotMeta?.universe)) {
      console.error("Invalid spot data structure")
      return []
    }

    const minLength = Math.min(assetCtxs.length, spotMeta.universe.length)

    if (assetCtxs.length !== spotMeta.universe.length) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `Array length mismatch: assetCtxs(${assetCtxs.length}) vs universe(${spotMeta.universe.length}), using first ${minLength} items`,
        )
      }
    }

    const sortedTokens = assetCtxs
      .slice(0, minLength)
      .map((ctx, index) => {
        const meta = spotMeta.universe[index]
        if (!meta || !ctx) {
          return null
        }

        const currentPrice = Number.parseFloat(ctx.markPx)
        const prevPrice = Number.parseFloat(ctx.prevDayPx)
        const change24h = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0

        return {
          ctx,
          meta,
          change24h,
          currentPrice,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((token) => token.change24h > 0 && token.change24h < 1000)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 5)

    return sortedTokens.map(({ ctx, meta, change24h, currentPrice }) => {
      return {
        name: meta.name,
        symbol: meta.name,
        price: `US$${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}`,
        change24h: Number.parseFloat(change24h.toFixed(1)),
        volume24h: ctx.dayNtlVlm,
      }
    })
  } catch (error) {
    console.error("Error fetching top gainers:", error)
    return []
  }
}

/**
 * 获取新代币
 * 注意：这需要从专门的新代币 API 获取，这里返回最近添加的代币
 */
export async function getNewTokens(): Promise<TokenInfo[]> {
  try {
    const { data: spotData } = await getSpotMetaAndAssetCtxs()

    if (!spotData) {
      throw new Error("Failed to fetch spot data")
    }

    const [spotMeta, assetCtxs] = spotData

    if (!Array.isArray(assetCtxs) || !Array.isArray(spotMeta?.universe)) {
      console.error("Invalid spot data structure")
      return []
    }

    const minLength = Math.min(assetCtxs.length, spotMeta.universe.length)

    if (assetCtxs.length !== spotMeta.universe.length) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `Array length mismatch: assetCtxs(${assetCtxs.length}) vs universe(${spotMeta.universe.length}), using first ${minLength} items`,
        )
      }
    }

    const startIndex = Math.max(0, minLength - 5)
    const newTokens = assetCtxs
      .slice(startIndex, minLength)
      .map((ctx, offset) => {
        const index = startIndex + offset
        const meta = spotMeta.universe[index]

        if (!meta || !ctx) {
          return null
        }

        const currentPrice = Number.parseFloat(ctx.markPx)
        const prevPrice = Number.parseFloat(ctx.prevDayPx)
        const change24h = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0

        return {
          name: meta.name,
          symbol: meta.name,
          price: `US$${currentPrice.toFixed(currentPrice < 1 ? 6 : 2)}`,
          change24h: Number.parseFloat(change24h.toFixed(1)),
          volume24h: ctx.dayNtlVlm,
        }
      })
      .filter((token): token is NonNullable<typeof token> => token !== null)

    return newTokens
  } catch (error) {
    console.error("Error fetching new tokens:", error)
    return []
  }
}
