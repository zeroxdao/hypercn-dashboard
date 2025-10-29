import { type NextRequest, NextResponse } from "next/server"
import { getRevenueData } from "@/lib/api/dashboard"

const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimit.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }

  if (limit.count >= 60) {
    // 60 requests per minute
    return false
  }

  limit.count++
  return true
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeView = (searchParams.get("timeView") as "month" | "day") || "month"

    if (!["month", "day"].includes(timeView)) {
      return NextResponse.json({ error: "Invalid timeView parameter. Must be 'month' or 'day'" }, { status: 400 })
    }

    const revenueData = await getRevenueData(timeView)

    return NextResponse.json(revenueData)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in revenue API route:", error)
    }
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
