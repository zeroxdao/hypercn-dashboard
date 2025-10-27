import { NextResponse } from "next/server"

/**
 * 返回 Hyperliquid 的 dailyRevenue（不是 fees）
 * 结构：{ totalDataChart: [ [timestamp, value], ... ] }
 */
export async function GET() {
  try {
    const url = "https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue"

    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { accept: "application/json" },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error("[v0] DefiLlama API error:", res.status, text)

      return NextResponse.json({
        totalDataChart: generateMockRevenueData(),
        isMockData: true,
      })
    }

    const json = await res.json()

    // DefiLlama 返回里会有 totalDataChart（[timestamp, value][]）
    const totalDataChart: [number, number][] = json?.totalDataChart || []

    if (totalDataChart.length === 0) {
      return NextResponse.json({
        totalDataChart: generateMockRevenueData(),
        isMockData: true,
      })
    }

    return NextResponse.json({ totalDataChart })
  } catch (err: any) {
    console.error("[v0] Error fetching DefiLlama revenue:", err)

    return NextResponse.json({
      totalDataChart: generateMockRevenueData(),
      isMockData: true,
    })
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
