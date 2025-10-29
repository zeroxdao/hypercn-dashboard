/**
 * Hyperliquid API 服务
 * 所有 API 调用的统一入口
 */

import type {
  MetaResponse,
  AssetContext,
  UserState,
  UserFill,
  AllMids,
  SpotMeta,
  ApiResponse,
} from "@/lib/types/hyperliquid"

// API 配置
const API_BASE_URL = process.env.HYPERLIQUID_API_URL || "https://api.hyperliquid.xyz"
const API_TESTNET_URL = process.env.HYPERLIQUID_TESTNET_API_URL || "https://api.hyperliquid-testnet.xyz"

// 使用环境变量控制是否使用测试网
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_USE_TESTNET === "true" ? API_TESTNET_URL : API_BASE_URL
}

/**
 * 通用 POST 请求函数
 */
async function post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // 添加缓存策略
      next: { revalidate: 10 }, // 10秒缓存
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * 获取永续合约元数据
 */
export async function getMeta(dex?: string): Promise<ApiResponse<MetaResponse>> {
  return post<MetaResponse>("/info", {
    type: "meta",
    ...(dex && { dex }),
  })
}

/**
 * 获取资产上下文（包括标记价格、资金费率、未平仓合约等）
 */
export async function getMetaAndAssetCtxs(dex?: string): Promise<ApiResponse<[MetaResponse, AssetContext[]]>> {
  return post<[MetaResponse, AssetContext[]]>("/info", {
    type: "metaAndAssetCtxs",
    ...(dex && { dex }),
  })
}

/**
 * 获取所有币种的中间价格
 */
export async function getAllMids(dex?: string): Promise<ApiResponse<AllMids>> {
  return post<AllMids>("/info", {
    type: "allMids",
    ...(dex && { dex }),
  })
}

/**
 * 获取用户账户状态
 */
export async function getUserState(user: string, dex?: string): Promise<ApiResponse<UserState>> {
  return post<UserState>("/info", {
    type: "clearinghouseState",
    user,
    ...(dex && { dex }),
  })
}

/**
 * 获取用户交易历史
 */
export async function getUserFills(
  user: string,
  aggregateByTime?: boolean,
  dex?: string,
): Promise<ApiResponse<UserFill[]>> {
  return post<UserFill[]>("/info", {
    type: "userFills",
    user,
    ...(aggregateByTime !== undefined && { aggregateByTime }),
    ...(dex && { dex }),
  })
}

/**
 * 获取 Spot 元数据
 */
export async function getSpotMeta(): Promise<ApiResponse<SpotMeta>> {
  return post<SpotMeta>("/info", {
    type: "spotMeta",
  })
}

/**
 * 获取 Spot 元数据和资产上下文
 */
export async function getSpotMetaAndAssetCtxs(): Promise<ApiResponse<[SpotMeta, AssetContext[]]>> {
  return post<[SpotMeta, AssetContext[]]>("/info", {
    type: "spotMetaAndAssetCtxs",
  })
}

/**
 * 获取用户资金费率历史
 */
export async function getUserFunding(
  user: string,
  startTime: number,
  endTime?: number,
): Promise<ApiResponse<unknown[]>> {
  return post<unknown[]>("/info", {
    type: "userFunding",
    user,
    startTime,
    ...(endTime && { endTime }),
  })
}
