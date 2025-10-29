/**
 * DefiLlama API Client
 *
 * DefiLlama provides comprehensive DeFi data including:
 * - TVL (Total Value Locked)
 * - Fees and Revenue
 * - Trading Volumes
 * - Historical data
 *
 * API Documentation: https://defillama.com/docs/api
 */

const DEFILLAMA_BASE_URL = process.env.DEFILLAMA_API_URL || "https://api.llama.fi"

export interface DefiLlamaChainTVL {
  date: number
  tvl: number
}

export interface DefiLlamaProtocolData {
  id: string
  name: string
  tvl: number
  chainTvls: Record<string, number>
  change_1d: number
  change_7d: number
  change_1m: number
}

export interface DefiLlamaFeesData {
  id: string
  name: string
  total24h: number
  total48hto24h: number
  total7d: number
  total30d?: number
  totalAllTime: number
  change_1d: number
  totalDataChart: [number, number][] // [timestamp, value]
  totalDataChartBreakdown: [number, Record<string, any>][]
}

export interface DefiLlamaVolumeData {
  id: string
  name: string
  total24h: number
  total48hto24h: number
  total7d: number
  totalAllTime: number
  change_1d: number
  totalDataChart: [number, number][]
  totalDataChartBreakdown: [number, Record<string, any>][]
}

/**
 * Get protocol TVL data from DefiLlama
 *
 * @param protocol - Protocol slug (e.g., 'hyperliquid')
 * @param chain - Optional chain name to get TVL for specific chain (e.g., 'Hyperliquid')
 */
export async function getProtocolTVL(protocol: string, chain?: string): Promise<DefiLlamaProtocolData | null> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE_URL}/protocol/${protocol}`)

    if (!response.ok) {
      console.error(`DefiLlama protocol API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    let tvlValue = 0

    if (chain && data.currentChainTvls && data.currentChainTvls[chain]) {
      tvlValue = data.currentChainTvls[chain]
    } else if (typeof data.tvl === "number") {
      tvlValue = data.tvl
    } else if (Array.isArray(data.tvl)) {
      if (data.tvl.length > 0) {
        const latestData = data.tvl[data.tvl.length - 1]
        tvlValue = latestData.totalLiquidityUSD || 0
      }
    } else if (typeof data.tvl === "string") {
      tvlValue = Number.parseFloat(data.tvl)
    } else if (data.tvl && typeof data.tvl === "object") {
      tvlValue = data.tvl.tvl || data.tvl.value || 0
    }

    if (tvlValue === 0 && data.currentChainTvls) {
      const chainTvls = Object.values(data.currentChainTvls)
      tvlValue = chainTvls.reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
    }

    return {
      id: data.id,
      name: data.name,
      tvl: tvlValue,
      chainTvls: data.currentChainTvls || data.chainTvls || {},
      change_1d: data.change_1d || 0,
      change_7d: data.change_7d || 0,
      change_1m: data.change_1m || 0,
    }
  } catch (error) {
    console.error("Error fetching DefiLlama protocol data:", error)
    return null
  }
}

/**
 * Get chain TVL data from DefiLlama
 * This returns the TVL for the entire chain, not just a specific protocol
 *
 * @param chain - Chain name (e.g., 'Hyperliquid')
 */
export async function getChainTVL(chain: string): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE_URL}/v2/historicalChainTvl/${chain}`)

    if (!response.ok) {
      console.error(`DefiLlama chain TVL API error: ${response.status}`)
      return 0
    }

    let data: any
    try {
      data = await response.json()
    } catch (parseError) {
      const text = await response.text()
      console.error(`Failed to parse DefiLlama chain TVL response as JSON:`, text.substring(0, 200))
      return 0
    }

    if (!Array.isArray(data)) {
      console.error(`Expected array but got ${typeof data}:`, JSON.stringify(data).substring(0, 200))
      return 0
    }

    if (data.length === 0) {
      console.warn(`No TVL data available for ${chain}`)
      return 0
    }

    const latestData = data[data.length - 1]

    if (!latestData || typeof latestData.tvl !== "number") {
      console.error(`Invalid TVL data structure:`, latestData)
      return 0
    }

    const latestTVL = latestData.tvl

    return latestTVL
  } catch (error) {
    console.error(`Error fetching DefiLlama chain TVL for ${chain}:`, error)
    return 0
  }
}

/**
 * Get protocol fees and revenue data from DefiLlama
 *
 * @param protocol - Protocol slug (e.g., 'hyperliquid')
 * @param dataType - Type of data: 'dailyFees', 'dailyRevenue', 'dailyHoldersRevenue', 'hourlyFees', 'hourlyRevenue'
 */
export async function getProtocolFees(
  protocol: string,
  dataType: "dailyFees" | "dailyRevenue" | "dailyHoldersRevenue" | "hourlyFees" | "hourlyRevenue" = "dailyFees",
): Promise<DefiLlamaFeesData | null> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE_URL}/summary/fees/${protocol}?dataType=${dataType}`)

    if (!response.ok) {
      console.error(`DefiLlama fees API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      total24h: data.total24h || 0,
      total48hto24h: data.total48hto24h || 0,
      total7d: data.total7d || 0,
      total30d: data.total30d || 0,
      totalAllTime: data.totalAllTime || 0,
      change_1d: data.change_1d || 0,
      totalDataChart: data.totalDataChart || [],
      totalDataChartBreakdown: data.totalDataChartBreakdown || [],
    }
  } catch (error) {
    console.error("Error fetching DefiLlama fees data:", error)
    return null
  }
}

/**
 * Get all available chains from DefiLlama
 */
export async function getAllChains(): Promise<string[]> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE_URL}/v2/chains`)

    if (!response.ok) {
      console.error(`DefiLlama chains API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    let chains: string[] = []

    if (Array.isArray(data)) {
      if (data.length > 0) {
        if (typeof data[0] === "string") {
          chains = data
        } else if (typeof data[0] === "object") {
          chains = data.map((chain: any) => chain.name || chain.gecko_id || chain.chainName || String(chain))
        }
      }
    }

    const hyperliquidChains = chains.filter(
      (chain: string) => chain && typeof chain === "string" && chain.toLowerCase().includes("hyper"),
    )

    return chains
  } catch (error) {
    console.error("Error fetching DefiLlama chains:", error)
    return []
  }
}

/**
 * Get all chains with their current TVL from DefiLlama
 * Uses the /v2/chains endpoint which returns all chains with current TVL
 */
export async function getAllChainsWithTVL(): Promise<Array<{ name: string; tvl: number }>> {
  try {
    const response = await fetch(`${DEFILLAMA_BASE_URL}/v2/chains`)

    if (!response.ok) {
      console.error(`DefiLlama chains API error: ${response.status}`)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.error(`Expected array but got ${typeof data}`)
      return []
    }

    // Filter and map to get chain names and TVL
    return data
      .filter((chain: any) => chain.name && typeof chain.tvl === "number")
      .map((chain: any) => ({
        name: chain.name,
        tvl: chain.tvl,
      }))
  } catch (error) {
    console.error("Error fetching chains with TVL:", error)
    return []
  }
}

/**
 * Get Hyperliquid L1 TVL from the /v2/chains endpoint
 * This is the recommended way to get current TVL for a specific chain
 */
export async function getHyperliquidL1TVL(): Promise<number> {
  try {
    const chains = await getAllChainsWithTVL()

    // Find Hyperliquid L1 in the chains list
    const hyperliquidChain = chains.find(
      (chain) => chain.name === "Hyperliquid L1" || chain.name.toLowerCase().includes("hyperliquid"),
    )

    if (hyperliquidChain) {
      console.log(`Hyperliquid L1 TVL: $${hyperliquidChain.tvl.toLocaleString()}`)
      return hyperliquidChain.tvl
    }

    console.warn("Hyperliquid L1 not found in chains list, falling back to historicalChainTvl")
    // Fallback to the historical endpoint
    return await getChainTVL("Hyperliquid L1")
  } catch (error) {
    console.error("Error fetching Hyperliquid L1 TVL:", error)
    return 0
  }
}

/**
 * Get Hyperliquid-specific data (convenience function)
 */
export async function getHyperliquidData() {
  console.log("Fetching Hyperliquid data from DefiLlama...")

  const [tvl, feesData, revenueData] = await Promise.all([
    getHyperliquidL1TVL(),
    getProtocolFees("hyperliquid", "dailyFees"),
    getProtocolFees("hyperliquid", "dailyRevenue"),
  ])

  return {
    tvl,
    fees: feesData,
    revenue: revenueData,
    volume: null, // Perps volume fetched from Hyperliquid API instead
  }
}
