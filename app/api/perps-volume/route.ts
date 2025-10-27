import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getPerpsVolume24hUsd } from "@/lib/api/hyperliquid"
import { getMetaAndAssetCtxs } from "@/lib/api/hyperliquid"
import { zipByMin } from "@/lib/utils"

// 保留原有的获取24h成交量的API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')
  
  if (type === 'volume') {
    try {
      const v = await getPerpsVolume24hUsd()
      return NextResponse.json({ vol24hUsd: v })
    } catch {
      return NextResponse.json({ vol24hUsd: null })
    }
  }
  
  // 新增：获取perps数据用于客户端展示
  try {
    const response = await getMetaAndAssetCtxs()
    if (response.error || !response.data) {
      return NextResponse.json({ data: [], error: response.error })
    }

    const [meta, assetCtxs] = response.data
    const universe = meta?.universe ?? []

    // 安全配对数组，避免越界
    const data = zipByMin(universe, assetCtxs, "perps-volume-mismatch").map(([u, c]) => ({
      u,
      c
    }))

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ data: [], error: "Failed to fetch perps data" })
  }
}
