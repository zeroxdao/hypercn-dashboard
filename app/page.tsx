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

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 10 // 每10秒重新验证数据

export default async function HyperliquidDashboard() {
  // 并行获取所有数据
  const [stats, hypePrice, buybackData, revenueData, hotTokens, topGainers, newTokens] = await Promise.all([
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
