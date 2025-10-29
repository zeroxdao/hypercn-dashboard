import { NextResponse, type NextRequest } from "next/server"
import { checkRateLimit, getCached, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

/**
 * 返回 Hyperliquid 的 dailyRevenue（不是 fees）
 * 结构：{ totalDataChart: [ [timestamp, value], ... ] }
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const allowed = await checkRateLimit(ip, 60)

    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const cacheKey = CACHE_KEYS.DEFILLAMA_REVENUE
    const cachedData = await getCached<{ totalDataChart: [number, number][]; isMockData?: boolean }>(cacheKey)

    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const url = "https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue"

    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { accept: "application/json" },
    })

    if (!res.ok) {
      const text = await res.text()
      if (process.env.NODE_ENV === "development") {
        console.error("DefiLlama API error:", res.status, text)
      }

      const mockData = {
        totalDataChart: generateMockRevenueData(),
        isMockData: true,
      }

      await setCache(cacheKey, mockData, 60)

      return NextResponse.json(mockData)
    }

    const json = await res.json()

    // DefiLlama 返回里会有 totalDataChart（[timestamp, value][]）
    const totalDataChart: [number, number][] = json?.totalDataChart || []

    if (totalDataChart.length === 0) {
      const mockData = {
        totalDataChart: generateMockRevenueData(),
        isMockData: true,
      }

      await setCache(cacheKey, mockData, 60)

      return NextResponse.json(mockData)
    }

    const responseData = { totalDataChart }

    await setCache(cacheKey, responseData, CACHE_TTL.DEFILLAMA_REVENUE)

    return NextResponse.json(responseData)
  } catch (err: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching DefiLlama revenue:", err)
    }

    const mockData = {
      totalDataChart: generateMockRevenueData(),
      isMockData: true,
    }

    return NextResponse.json(mockData)
  }
}

function generateMockRevenueData(): [number, number][] {
  const data: [number, number][] = []
  const now = Date.now() / 1000
  const oneDaySeconds = 86400

  // Generate 180 days of mock data
  for (let i = 180; i >= 0; i--) {
    const timestamp = now - i * oneDaySeconds
    // Generate realistic revenue values between 2M and 5M
    const baseRevenue = 3000000
    const variation = Math.sin(i / 10) * 1000000 + Math.random() * 500000
    const revenue = baseRevenue + variation
    data.push([Math.floor(timestamp), Math.floor(revenue)])
  }

  return data
}
