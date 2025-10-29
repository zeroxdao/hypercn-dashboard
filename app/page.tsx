// app/page.tsx
import DashboardClient from "@/components/dashboard-client"
import {
  getDashboardStats,
  getHypePrice,
  getBuybackData,
  getRevenueData,
  getHotTokens,
  getTopGainers,
  getNewTokens,
} from "@/lib/api/dashboard"
import { unstable_noStore as noStore } from "next/cache"

// 告诉 Next：这个页面是动态的，不要尝试静态预渲染或缓存
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"
export const revalidate = 0  // 覆盖掉原来的 10，避免与 no-store 冲突

export default async function HyperliquidDashboard() {
  noStore() // 进一步声明：本次请求不缓存

  const [stats, hypePrice, buybackData, revenueData, hotTokens, topGainers, newTokens] =
    await Promise.all([
      getDashboardStats(),
      getHypePrice(),
      getBuybackData(),
      getRevenueData(),
      getHotTokens(),
      getTopGainers(),
      getNewTokens(),
    ])

  return (
    <DashboardClient
      stats={stats}
      hypePrice={hypePrice}
      buybackData={buybackData}
      revenueData={revenueData}
      hotTokens={hotTokens}
      topGainers={topGainers}
      newTokens={newTokens}
    />
  )
}
