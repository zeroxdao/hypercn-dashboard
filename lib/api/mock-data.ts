/**
 * 模拟数据生成器
 * 用于在真实 API 不可用时提供测试数据
 *
 * 使用方法：
 * 1. 当真实 API 可用时，直接替换相应函数中的实现
 * 2. 保持函数签名不变，只需修改返回值来源
 */

import type { DashboardStats, BuybackData, RevenueData } from "@/lib/types/hyperliquid"

/**
 * 生成模拟的仪表板统计数据
 * TODO: 替换为真实 API 调用
 *
 * 真实 API 端点示例：
 * - 总用户数: GET /api/stats/users
 * - 总流通量: GET /api/stats/circulation
 * - HyperEVM TPS: GET /api/hypervm/tps
 */
export function generateMockDashboardStats(): Partial<DashboardStats> {
  return {
    totalUsers: 763914,
    // totalCirculation 应该从真实 API 获取
    // 示例: const response = await fetch('https://api.hyperliquid.xyz/info', {
    //   method: 'POST',
    //   body: JSON.stringify({ type: 'circulation' })
    // })
    hyperevmTps: 12.34,
    // HyperEVM TPS 应该从 HyperEVM 专用 API 获取
    // 示例: const response = await fetch('https://api.hypervm.xyz/tps')
  }
}

/**
 * 生成模拟的回购数据
 * TODO: 替换为真实 API 调用
 *
 * 真实 API 端点示例：
 * POST https://api.hyperliquid.xyz/info
 * Body: { "type": "buyback", "period": "24h" | "7d" | "30d" }
 */
export function generateMockBuybackData(): BuybackData[] {
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

/**
 * 生成模拟的收入数据（带上升趋势）
 * TODO: 替换为真实 API 调用
 *
 * 真实 API 端点示例：
 * POST https://api.hyperliquid.xyz/info
 * Body: { "type": "revenue", "timeframe": "yearly" }
 */
export function generateMockRevenueData(): RevenueData[] {
  const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

  return months.map((month, i) => {
    // 创建上升趋势，从 1.5b 到 3.5b
    const baseFees = 1500000000 + i * 150000000
    const baseRevenue = 1300000000 + i * 140000000

    // 添加一些随机波动使数据更真实
    const feesVariation = (Math.random() - 0.5) * 200000000
    const revenueVariation = (Math.random() - 0.5) * 180000000

    return {
      month,
      fees: baseFees + feesVariation,
      revenue: baseRevenue + revenueVariation,
    }
  })
}

/**
 * 计算历史价格变化百分比
 * TODO: 替换为真实历史数据 API
 *
 * 真实 API 端点示例：
 * POST https://api.hyperliquid.xyz/info
 * Body: { "type": "historicalPrice", "coin": "HYPE", "interval": "1d" }
 */
export function calculatePriceChange(currentPrice: number, historicalPrice: number): number {
  return ((currentPrice - historicalPrice) / historicalPrice) * 100
}

/**
 * 生成模拟的历史价格数据
 * TODO: 替换为真实历史数据 API
 */
export function generateMockPriceHistory(currentPrice: number, hours = 24) {
  return Array.from({ length: hours }, (_, i) => ({
    time: Date.now() - (hours - 1 - i) * 3600000,
    price: currentPrice * (0.95 + Math.random() * 0.1),
  }))
}
