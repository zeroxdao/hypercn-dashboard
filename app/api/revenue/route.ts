import { type NextRequest, NextResponse } from "next/server"
import { getRevenueData } from "@/lib/api/dashboard"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeView = (searchParams.get("timeView") as "month" | "day") || "month"

    if (!["month", "day"].includes(timeView)) {
      return NextResponse.json({ error: "Invalid timeView parameter" }, { status: 400 })
    }

    const revenueData = await getRevenueData(timeView)

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error("[v0] Error in revenue API route:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
