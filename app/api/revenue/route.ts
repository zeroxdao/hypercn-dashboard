import { type NextRequest, NextResponse } from "next/server"
import { getRevenueData } from "@/lib/api/dashboard"
import { checkRateLimit, getCached, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const allowed = await checkRateLimit(ip, 60)

    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeView = (searchParams.get("timeView") as "month" | "day") || "month"

    if (!["month", "day"].includes(timeView)) {
      return NextResponse.json({ error: "Invalid timeView parameter. Must be 'month' or 'day'" }, { status: 400 })
    }

    const cacheKey = CACHE_KEYS.REVENUE_DATA(timeView)
    const cachedData = await getCached(cacheKey)

    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const revenueData = await getRevenueData(timeView)

    await setCache(cacheKey, revenueData, CACHE_TTL.REVENUE_DATA)

    return NextResponse.json(revenueData)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in revenue API route:", error)
    }
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
