/**
 * Hyperliquid API 类型定义
 * 所有 API 响应的类型定义集中管理
 */

// 通用响应类型
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// 元数据类型
export interface AssetMeta {
  name: string
  szDecimals: number
  maxLeverage: number
  onlyIsolated?: boolean
  isDelisted?: boolean
}

export interface MetaResponse {
  universe: AssetMeta[]
}

// 资产上下文类型
export interface AssetContext {
  dayNtlVlm: string // 24小时交易量
  funding: string
  impactPxs: [string, string]
  markPx: string // 标记价格
  midPx: string // 中间价格
  openInterest: string
  oraclePx: string
  premium: string
  prevDayPx: string // 前一天价格
}

// 用户状态类型
export interface UserState {
  assetPositions: AssetPosition[]
  marginSummary: MarginSummary
  withdrawable: string
  time: number
}

export interface AssetPosition {
  position: {
    coin: string
    entryPx: string
    szi: string
    positionValue: string
    unrealizedPnl: string
    leverage: {
      type: string
      value: number
    }
  }
  type: string
}

export interface MarginSummary {
  accountValue: string
  totalMarginUsed: string
  totalNtlPos: string
  totalRawUsd: string
}

// 用户填充（交易历史）类型
export interface UserFill {
  coin: string
  px: string // 价格
  sz: string // 数量
  side: "A" | "B" // Ask (卖) 或 Bid (买)
  time: number
  dir: string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  feeToken: string
  tid: number
}

// 所有中间价格类型
export interface AllMids {
  [coin: string]: string
}

// Spot 元数据类型
export interface SpotMeta {
  universe: SpotAsset[]
  tokens: Token[]
}

export interface SpotAsset {
  tokens: [number, number]
  name: string
  index: number
  isCanonical: boolean
}

export interface Token {
  name: string
  szDecimals: number
  weiDecimals: number
  index: number
  tokenId: string
  isCanonical: boolean
}

// 仪表板数据类型
export interface DashboardStats {
  totalUsers: number
  totalMarketCap: string
  marketCapChange: number
  totalValueLocked: string
  tvlChange: number
  volume24h: string
  hyperevmTps: number
}

export interface HypePrice {
  current: string
  change24h: number
  low24h: string
  high24h: string
  chartData: PricePoint[]
}

export interface PricePoint {
  time: number
  price: number
}

export interface BuybackData {
  period: "24h" | "7d" | "30d"
  amount: string
  hypeAmount: string
  avgPrice: string
}

export interface RevenueData {
  month: string
  fees: number
  revenue: number
}

export interface TokenInfo {
  name: string
  symbol: string
  price: string
  change24h: number
  volume24h: string
  icon?: string
}
