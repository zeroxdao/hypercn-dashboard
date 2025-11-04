"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import type { DashboardStats, HypePrice, BuybackData, RevenueData, TokenInfo } from "@/lib/types/hyperliquid"
import { reformatCurrency } from "@/lib/utils/format"
import { ExternalLink, Menu, X } from "lucide-react"
import dayjs from "dayjs"

type UIProject = {
  id: string
  name: string
  logo?: string
  categories: string[] // <- Now always an array
  website?: string
  social?: string
  description?: string
  handle?: string
  tags?: string[]
  links?: {
    website?: string
    twitter?: string
    social?: string
  }
}

function mapAdminProject(p: any, idx: number): UIProject {
  // Support both old (category: string) and new (categories: string[]) formats
  const catsRaw = p?.categories ?? p?.category ?? p?.tags ?? []
  const cats = Array.isArray(catsRaw) ? catsRaw : catsRaw ? [catsRaw] : []

  return {
    id: p?.id ?? `admin-${idx}`,
    name: p?.name ?? p?.title ?? "Untitled",
    handle: p?.handle ?? p?.twitter ?? "",
    website: p?.website ?? p?.links?.website ?? "",
    social: p?.social ?? p?.links?.social ?? "",
    description: p?.description ?? "",
    logo: p?.logo ?? "",
    tags: p?.tags ?? [],
    categories: cats,
    links: {
      website: p?.website ?? p?.links?.website,
      twitter: p?.twitter ? `https://x.com/${p.twitter.replace(/^@/, "")}` : undefined,
      social:
        p?.social ??
        p?.links?.social ??
        (p?.website ? (p.website.startsWith("http") ? p.website : `https://${p.website}`) : undefined),
    },
  }
}

function toHttp(s?: string) {
  if (!s) return ""
  // 支持直接写域名，如 "apstation.io"
  return /^https?:\/\//i.test(s) ? s : `https://${s}`
}

interface DashboardClientProps {
  stats: DashboardStats
  hypePrice: HypePrice
  buybackData: BuybackData[]
  revenueData: RevenueData[]
  hotTokens: TokenInfo[]
  topGainers: TokenInfo[]
  newTokens: TokenInfo[]
}

interface DefiLlamaRevenueData {
  totalDataChart: [number, number][]
}

function niceTick(target: number): number {
  if (target <= 0) return 1
  const exponent = Math.floor(Math.log10(target))
  const power = Math.pow(10, exponent)
  const normalized = target / power
  const niceValues = [1, 2, 2.5, 5, 10]
  let bestValue = niceValues[0]
  let minDiff = Math.abs(normalized - bestValue)
  for (const value of niceValues) {
    const diff = Math.abs(normalized - value)
    if (diff < minDiff) {
      minDiff = diff
      bestValue = value
    }
  }
  if (bestValue === 10) return power * 10
  return bestValue * power
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}b`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`
  return `$${value.toFixed(0)}`
}

function formatVolume(value: number | undefined): string {
  const num = Number(value ?? 0)
  if (isNaN(num) || num === 0) return "$0"
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`
  return `$${num.toFixed(0)}`
}

function TruncatedDescription({
  text,
  maxLines = 3,
  onMore,
}: {
  text: string
  maxLines?: 2 | 3 | 4
  onMore: () => void
}) {
  const pRef = useRef<HTMLParagraphElement | null>(null)
  const [isOverflow, setIsOverflow] = useState(false)

  const clampClass = maxLines === 2 ? "line-clamp-2" : maxLines === 4 ? "line-clamp-4" : "line-clamp-3"

  useEffect(() => {
    const el = pRef.current
    if (!el) return

    const check = () => setIsOverflow(el.scrollHeight > el.clientHeight + 1)

    // Check in next frame and after resize
    check()
    const raf = requestAnimationFrame(check)

    const ro = new ResizeObserver(check)
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [text, maxLines])

  return (
    <div>
      <p ref={pRef} className={`text-[11px] leading-relaxed text-[#96fce4]/90 lg:text-[10px] ${clampClass}`}>
        {text}
      </p>

      {isOverflow && (
        <button
          type="button"
          onClick={onMore}
          className="mt-1 text-[11px] text-[#43e5c9] hover:underline lg:text-[10px]"
        >
          展开全文
        </button>
      )}
    </div>
  )
}

export default function DashboardClient({
  stats,
  hypePrice,
  buybackData,
  revenueData,
  hotTokens,
  topGainers,
  newTokens,
}: DashboardClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [timePeriod, setTimePeriod] = useState<"month" | "day">("month")
  const [currentRevenueData, setCurrentRevenueData] = useState<RevenueData[]>(revenueData)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState("全部")

  const [hoveredRevenueBar, setHoveredRevenueBar] = useState<{ index: number; x: number; y: number } | null>(null)
  const revenueChartWrapRefMobile = useRef<HTMLDivElement>(null)
  const revenueChartWrapRefDesktop = useRef<HTMLDivElement>(null)

  type StakeItem = {
    name: string
    logo?: string
    netAPY: number
    tvlUSD: number
    updatedAt: string
    link: string
  }

  const hypeStakeItems: StakeItem[] = [
    {
      name: "ApStation",
      logo: "/apstation-logo.jpg",
      netAPY: 18.0,
      tvlUSD: 120000000,
      updatedAt: new Date().toISOString(),
      link: "https://example.com/stake/apstation",
    },
    {
      name: "FlowMax",
      logo: "/flowmax-logo.jpg",
      netAPY: 21.5,
      tvlUSD: 89000000,
      updatedAt: new Date().toISOString(),
      link: "https://example.com/stake/flowmax",
    },
    {
      name: "DeFiHub",
      logo: "/defihub-logo.jpg",
      netAPY: 16.7,
      tvlUSD: 154000000,
      updatedAt: new Date().toISOString(),
      link: "https://example.com/stake/defihub",
    },
  ]

  const [stakeIdx, setStakeIdx] = useState(0)
  const [stakePaused, setStakePaused] = useState(false)

  useEffect(() => {
    if (stakePaused || hypeStakeItems.length <= 1) return
    const t = setInterval(() => setStakeIdx((i) => (i + 1) % hypeStakeItems.length), 3500)
    return () => clearInterval(t)
  }, [stakePaused])

  // 分页（每页 9 项）
  const [currentPage, setCurrentPage] = useState(1)
  // Renamed goToPage to goToPageInput
  const [goToPageInput, setGoToPageInput] = useState("")
  const itemsPerPage = 9

  const firstCardAnchorRef = useRef<HTMLDivElement | null>(null)

  const HEADER_OFFSET = 72

  const scrollToFirstCard = useCallback(() => {
    const el = firstCardAnchorRef.current
    if (!el) return

    const rectTop = el.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: Math.max(rectTop - HEADER_OFFSET, 0),
      behavior: "smooth",
    })
  }, [])

  const [defiLlamaRevenue, setDefiLlamaRevenue] = useState<DefiLlamaRevenueData | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(true)

  const [hlTopVolume, setHlTopVolume] = useState<TokenInfo[]>([])

  const [displayPrice, setDisplayPrice] = useState(hypePrice.current)
  const [displayChange, setDisplayChange] = useState(hypePrice.change24h)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number
    y: number
    price: number
    ts: number
    i: number
  } | null>(null)

  const chartRef = useRef<SVGSVGElement>(null)

  const [allProjects, setAllProjects] = useState<UIProject[]>([])

  const [descModal, setDescModal] = useState<{ open: boolean; title: string; text: string }>({
    open: false,
    title: "",
    text: "",
  })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch("/api/project", { cache: "no-store" })
        if (!res.ok) throw new Error("failed to load projects")
        const arr = await res.json()
        if (!Array.isArray(arr)) return
        const mapped = arr.map((p: any, i: number) => mapAdminProject(p, i))
        if (!cancelled) setAllProjects(mapped)
      } catch (e) {
        console.error("load projects failed", e)
        if (!cancelled) setAllProjects([])
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const fetchTopVolumePerps = async () => {
      try {
        const res = await fetch("https://api.hyperliquid.xyz/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "metaAndAssetCtxs" }),
        })
        if (!res.ok) {
          return
        }

        const json = await res.json()

        const universe = json?.[0]?.universe ?? []
        const ctxs = json?.[1] ?? []

        const rows: TokenInfo[] = universe.map((u: any, i: number) => {
          const c = ctxs[i] || {}
          const mark = Number.parseFloat(c.markPx ?? "0")
          const prev = Number.parseFloat(c.prevDayPx ?? (mark || "0"))
          const vol = Number.parseFloat(c.dayNtlVlm ?? "0")
          const changePct = prev > 0 ? ((mark - prev) / prev) * 100 : 0

          return {
            name: u.name,
            price: mark.toFixed(5),
            change24h: Number(changePct.toFixed(2)),
            // @ts-ignore
            volume24h: vol,
          }
        })

        rows.sort((a: any, b: any) => (b.volume24h ?? 0) - (a.volume24h ?? 0))
        const top10 = rows.slice(0, 10)

        setHlTopVolume(top10)
      } catch (e) {
        console.error("fetchTopVolumePerps error:", e)
      }
    }

    fetchTopVolumePerps()
  }, [])

  useEffect(() => {
    const fetchDefiLlamaRevenue = async () => {
      setRevenueLoading(true)
      try {
        const response = await fetch("/api/defillama-revenue")
        if (response.ok) {
          const data = await response.json()
          setDefiLlamaRevenue({
            totalDataChart: data.totalDataChart || [],
          })
        } else {
          console.error("DefiLlama API returned error:", response.status)
        }
      } catch (error) {
        console.error("Error fetching DefiLlama revenue:", error)
      } finally {
        setRevenueLoading(false)
      }
    }

    fetchDefiLlamaRevenue()
  }, [])

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/revenue?timeView=${timePeriod}`)
        if (response.ok) {
          const data = await response.json()
          setCurrentRevenueData(data)
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevenueData()
  }, [timePeriod])

  const { yMax, yTicks } = useMemo(() => {
    if (!currentRevenueData || currentRevenueData.length === 0) {
      return { yMax: 10_000_000, yTicks: [10_000_000, 7_500_000, 5_000_000, 2_500_000, 0] }
    }

    const maxDataValue = Math.max(...currentRevenueData.flatMap((d) => [d.fees, d.revenue]))
    const tick = niceTick(maxDataValue / 6)
    const calculatedYMax = Math.ceil(maxDataValue / tick) * tick
    const numTicks = Math.ceil(calculatedYMax / tick) + 1
    const ticks = Array.from({ length: numTicks }, (_, i) => calculatedYMax - i * tick)

    return { yMax: calculatedYMax, yTicks: ticks }
  }, [currentRevenueData])

  const revenueKPIs = useMemo(() => {
    if (!defiLlamaRevenue || !defiLlamaRevenue.totalDataChart || defiLlamaRevenue.totalDataChart.length === 0) {
      return { total24h: 0, total7d: 0, total30d: 0 }
    }

    const data = defiLlamaRevenue.totalDataChart
    const now = new Date()
    const todayUTCStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000

    const completedDays = data.filter(([timestamp]) => timestamp < todayUTCStart)

    let lastCompletedDay = completedDays.length > 0 ? completedDays[completedDays.length - 1] : null
    if (!lastCompletedDay || lastCompletedDay[1] === 0) {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i][1] > 0) {
          lastCompletedDay = data[i]
          break
        }
      }
    }

    const last30Days = completedDays.slice(-30)
    const last7Days = completedDays.slice(-7)

    return {
      total24h: lastCompletedDay ? lastCompletedDay[1] : 0,
      total7d: last7Days.reduce((sum, [_, value]) => sum + value, 0),
      total30d: last30Days.reduce((sum, [_, value]) => sum + value, 0),
    }
  }, [defiLlamaRevenue])

  const revenueChartData = useMemo(() => {
    if (!defiLlamaRevenue || !defiLlamaRevenue.totalDataChart || defiLlamaRevenue.totalDataChart.length === 0) {
      return { data: [], yMax: 10_000_000, yTicks: [] }
    }

    const last30Days = defiLlamaRevenue.totalDataChart.slice(-30)
    const maxValue = Math.max(...last30Days.map(([_, value]) => value))
    const tick = niceTick(maxValue / 6)
    const calculatedYMax = Math.ceil(maxValue / tick) * tick
    const numTicks = Math.ceil(calculatedYMax / tick) + 1
    const ticks = Array.from({ length: numTicks }, (_, i) => calculatedYMax - i * tick)

    return {
      data: last30Days,
      yMax: calculatedYMax,
      yTicks: ticks,
    }
  }, [defiLlamaRevenue])

  const chartPoints = useMemo(() => {
    if (hypePrice.chartData.length === 0) return []

    const W = 400
    const H = 100

    // Normalize timestamp (auto-detect seconds vs milliseconds)
    const normTs = (ts: number) => (String(ts).length === 10 ? ts * 1000 : ts)

    // Sort and clean data
    const series = hypePrice.chartData
      .filter((d) => d && d.price != null && !Number.isNaN(d.price))
      .sort((a, b) => normTs(a.timestamp) - normTs(b.timestamp))

    const minPrice = Math.min(...series.map((d) => d.price))
    const maxPrice = Math.max(...series.map((d) => d.price))
    const priceRange = Math.max(1e-12, maxPrice - minPrice)

    // Add 10% padding on top and bottom
    const padding = priceRange * 0.1
    const paddedMin = minPrice - padding
    const paddedMax = maxPrice + padding
    const paddedRange = paddedMax - paddedMin

    // Map to viewBox coordinates with padding
    return series.map((d, i) => {
      const x = (i / (series.length - 1)) * W
      const y = H - ((d.price - paddedMin) / paddedRange) * H
      return { x, y, ts: normTs(d.timestamp), price: d.price, i }
    })
  }, [hypePrice.chartData])

  const pickPoint = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const svg = chartRef.current
    if (!svg || chartPoints.length === 0) return null

    const rect = svg.getBoundingClientRect()
    const clientX = "touches" in e ? (e.touches?.[0]?.clientX ?? 0) : e.clientX
    let x = clientX - rect.left

    // Map to viewBox coordinates
    x = Math.max(0, Math.min(400, (x / rect.width) * 400))
    const idxFloat = (x / 400) * (chartPoints.length - 1)
    const i = Math.round(idxFloat)

    return chartPoints[i]
  }

  const handleChartInteraction = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const point = pickPoint(e)
    if (!point) return

    setHoveredPoint(point)

    const firstPrice = chartPoints[0]?.price ?? point.price
    const changePercent = ((point.price - firstPrice) / firstPrice) * 100

    setDisplayPrice(point.price.toFixed(2))
    setDisplayChange(Number.parseFloat(changePercent.toFixed(2)))
  }

  const updateHoverFromClientX = (svg: SVGSVGElement, clientX: number) => {
    if (!svg || chartPoints.length === 0) return

    const rect = svg.getBoundingClientRect()
    let x = clientX - rect.left

    // Map to viewBox coordinates
    x = Math.max(0, Math.min(400, (x / rect.width) * 400))
    const idxFloat = (x / 400) * (chartPoints.length - 1)
    const i = Math.round(idxFloat)

    const point = chartPoints[i]
    if (!point) return

    setHoveredPoint(point)

    const firstPrice = chartPoints[0]?.price ?? point.price
    const changePercent = ((point.price - firstPrice) / firstPrice) * 100

    setDisplayPrice(point.price.toFixed(2))
    setDisplayChange(Number.parseFloat(changePercent.toFixed(2)))
  }

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    svg.setPointerCapture?.(e.pointerId)
    setIsDragging(true)
    updateHoverFromClientX(svg, e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Mouse: only update when dragging; Touch: always update
    const isMouse = e.pointerType === "mouse"
    if ((isMouse && !isDragging) || !chartRef.current) return
    updateHoverFromClientX(e.currentTarget, e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setIsDragging(false)
    setHoveredPoint(null)
    setDisplayPrice(hypePrice.current)
    setDisplayChange(hypePrice.change24h)
  }

  const handlePointerLeave = () => {
    setIsDragging(false)
    setHoveredPoint(null)
    setDisplayPrice(hypePrice.current)
    setDisplayChange(hypePrice.change24h)
  }

  const pricePositionPercent = useMemo(() => {
    const low = Number.parseFloat(hypePrice.low24h)
    const high = Number.parseFloat(hypePrice.high24h)
    const current = Number.parseFloat(displayPrice)
    const range = high - low
    if (range === 0) return 50
    return ((current - low) / range) * 100
  }, [displayPrice, hypePrice.low24h, hypePrice.high24h])

  const { minPrice, maxPrice } = useMemo(() => {
    if (hypePrice.chartData.length === 0) {
      const lastPrice = Number.parseFloat(hypePrice.current)
      return { minPrice: lastPrice * 0.99, maxPrice: lastPrice * 1.01 }
    }
    const prices = hypePrice.chartData.map((p) => p.price)
    return { minPrice: Math.min(...prices) * 0.995, maxPrice: Math.max(...prices) * 1.005 }
  }, [hypePrice.chartData, hypePrice.current])

  // ===== 项目列表 =====

  const categoriesList = [
    "全部",
    "热门",
    "最新",
    "DeFi",
    "基础设施",
    "AI",
    "数据",
    "工具",
    "支付",
    "NFT",
    "迷因币",
    "手机端",
    "社区",
  ]

  // 与顶部大分类完全一致的形状（圆角/边框/内外边距）
  const pillShape = "inline-flex items-center rounded-lg border px-3 py-1.5"
  // 小标签统一的字号与字重（保持清晰）
  const pillTypo = "text-[12px] lg:text-[11px] font-bold"

  // 颜色：复用当前的三种配色（只负责颜色，不改形状）
  const pillHot = "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/15"
  const pillLatest = "bg-[#43b8e5]/10 text-[#43b8e5] border-[#43b8e5]/30 hover:bg-[#43b8e5]/15"
  const pillNormal = "bg-[#041713]/70 text-[#43e5c9]/80 border-[#43e5c9]/40"

  const filteredProjects = useMemo(() => {
    if (activeCategory === "全部") {
      return allProjects
    }

    const filtered = allProjects.filter((p) => {
      const cats = Array.isArray(p.categories) ? p.categories : []
      const fallback = Array.isArray(p.tags) ? p.tags : []
      const matches = cats.includes(activeCategory) || fallback.includes(activeCategory)

      return matches
    })

    return filtered
  }, [allProjects, activeCategory])

  const totalItems = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentProjects = filteredProjects.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [currentPage, totalPages])

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        requestAnimationFrame(scrollToFirstCard)
      }
    },
    [totalPages, scrollToFirstCard],
  )

  const goToPreviousPage = () => currentPage > 1 && goToPage(currentPage - 1)
  const goToNextPage = () => currentPage < totalPages && goToPage(currentPage + 1)
  const goToSpecificPage = (page: number) => goToPage(page)
  const handleGoToPageSubmit = () => {
    const page = Number.parseInt(goToPageInput)
    if (!isNaN(page)) {
      goToPage(page)
      setGoToPageInput("")
    }
  }

  const getVisiblePageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 1) return [1]
    pages.push(1)
    if (currentPage > 3) pages.push("...")
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="grid min-h-screen grid-rows-[auto_auto_1fr_auto] bg-[#010807] text-white lg:min-h-screen">
      <div className="hidden lg:block border-b border-[#072027] bg-[#010807] px-6 py-2.5">
        <div className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[#43e5c9]">总市值:</span>
              <span className="text-white lg:text-[14px] lg:font-medium tabular-nums">
                {reformatCurrency(stats.totalMarketCap)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#43e5c9]">总锁仓:</span>
              <span className="text-white lg:text-[14px] lg:font-medium tabular-nums">
                {reformatCurrency(stats.totalValueLocked)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#43e5c9]">24小时成交量:</span>
              <span className="text-white lg:text-[14px] lg:font-medium tabular-nums">
                {reformatCurrency(stats.volume24h)}
              </span>
            </div>
          </div>
          <div>
            <a href="https://t.me/chinesehyperliquid" target="_blank" rel="noopener noreferrer">
              <Button className="h-11 px-6 text-base rounded-xl bg-[#43e5c9] text-[#010807] hover:bg-[#2da691] font-medium">
                加入我们
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="block lg:hidden border-b border-[#072027] bg-[#010807] px-3 py-3 max-[639px]:order-1">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-[#43e5c9] text-xs">总市值:</span>
            <span className="text-white text-[12px] font-normal tabular-nums">
              {reformatCurrency(stats.totalMarketCap)}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-[#43e5c9] text-xs">总锁仓:</span>
            <span className="text-white text-[12px] font-normal tabular-nums">
              {reformatCurrency(stats.totalValueLocked)}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-[#43e5c9] text-xs">24小时成交量:</span>
            <span className="text-white text-[12px] font-normal tabular-nums">{reformatCurrency(stats.volume24h)}</span>
          </div>
        </div>
      </div>

      <nav className="border-b border-[#072027] bg-[#010807] px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="https://hyperliquid.gitbook.io/hyperliquid-docs/~gitbook/image?url=https%3A%2F%2F2356094849-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FyUdp569E6w18GdfqlGvJ%252Ficon%252FsIAjqhKKIUysM08ahKPh%252FHL-logoSwitchDISliStat.png%3Falt%3Dmedia%26token%3Da81fa25c-0510-4d97-87ff-3fb8944935b1&width=32&dpr=4&quality=100&sign=3e1219e3&sv=2"
              alt="Hyperliquid Logo"
              className="h-8 w-8 rounded-lg"
            />
            <span className="italic font-semibold text-white text-sm md:text-base">
              Hyperliquid<span className="italic">中文社区</span>
            </span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex flex-1 items-center gap-6">
            <a
              href="https://stats.hyperliquid.xyz/"
              target="_blank"
              className="flex items-center text-sm text-white gap-1 hover:text-[#43e5c9] transition-colors"
              rel="noreferrer"
            >
              Hyperliquid Stats <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://hyperdash.info/"
              target="_blank"
              className="flex items-center gap-1 text-sm text-white hover:text-[#43e5c9] transition-colors"
              rel="noreferrer"
            >
              Hyperdash <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://hypurrscan.io/"
              target="_blank"
              className="flex items-center text-sm text-white gap-1 hover:text-[#43e5c9] transition-colors"
              rel="noreferrer"
            >
              Hypurrscan <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://liquidscan.io/"
              target="_blank"
              className="flex items-center gap-1 text-sm text-white hover:text-[#43e5c9] transition-colors"
              rel="noreferrer"
            >
              Liquidscan <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://t.me/chinesehyperliquid"
              target="_blank"
              className="flex items-center text-sm text-white hover:text-[#43e5c9] transition-colors"
              rel="noreferrer"
            >
              博客区
            </a>
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-[#43e5c9] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile side menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-64 bg-[#010807] border-l border-[#072027] p-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-semibold">菜单</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white hover:text-[#43e5c9]">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <a
                  href="https://stats.hyperliquid.xyz/"
                  target="_blank"
                  className="flex items-center text-white gap-2 hover:text-[#43e5c9] transition-colors py-2"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hyperliquid Stats <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://hyperdash.info/"
                  target="_blank"
                  className="flex items-center gap-2 text-white hover:text-[#43e5c9] transition-colors py-2"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hyperdash <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://hypurrscan.io/"
                  target="_blank"
                  className="flex items-center text-white gap-2 hover:text-[#43e5c9] transition-colors py-2"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hypurrscan <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://liquidscan.io/"
                  target="_blank"
                  className="flex items-center gap-2 text-white hover:text-[#43e5c9] transition-colors py-2"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Liquidscan <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://t.me/chinesehyperliquid"
                  target="_blank"
                  className="flex items-center text-white hover:text-[#43e5c9] transition-colors py-2"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  博客区
                </a>
                <div className="px-4 pb-6 md:px-0 md:pb-0 mt-4">
                  <a
                    href="https://t.me/chinesehyperliquid"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="mx-auto block text-sm md:text-base h-9 md:h-11 px-4 md:px-6 w-[75%] max-w-[280px] md:w-auto rounded-xl bg-[#43e5c9] text-[#010807] hover:bg-[#2da691] font-medium">
                      加入我们
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="w-full mx-auto px-6 md:px-8 xl:px-10 2xl:px-12 max-w-[1600px] pb-24 overflow-y-auto mobile-main max-[639px]:order-2">
        <div className="py-3 lg:py-5">
          {/* 12 栏网格 */}
          <div className="grid w-full max-w-none grid-cols-1 items-start gap-3 lg:grid-cols-12 lg:gap-4">
            <Card className="col-span-1 lg:col-span-6 p-0 overflow-hidden bg-[#101419] border-[#072027]">
              {/* Mobile version: block md:hidden */}
              <div className="block md:hidden">
                <div className="rounded-2xl bg-[#0F1519] p-3">
                  {/* Title */}
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[13px] font-semibold text-emerald-300">$HYPE 价格</span>
                  </div>

                  {/* Price & Change */}
                  <div className="flex items-baseline gap-2 px-1 whitespace-nowrap mb-2">
                    <div className="text-2xl font-extrabold tracking-tight text-white">
                      US${Number.parseFloat(displayPrice).toFixed(2)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${displayChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      <span>{displayChange >= 0 ? "▲" : "▼"}</span>
                      <span className="font-semibold">{Math.abs(displayChange).toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="px-1 mb-3">
                    <div className="flex items-center justify-between text-[10px] text-white mb-1.5">
                      <span>US${Number.parseFloat(hypePrice.low24h).toFixed(2)}</span>
                      <span className="text-[#96fce4]">24小时范围</span>
                      <span>US${Number.parseFloat(hypePrice.high24h).toFixed(2)}</span>
                    </div>
                    <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[#072027]">
                      <div
                        className="absolute left-0 h-full rounded-full bg-gradient-to-r from-[#e54366] via-[#43e5c9] to-[#43e5c9]"
                        style={{ width: `${pricePositionPercent}%` }}
                      />
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#43e5c9] shadow-lg"
                        style={{ left: `${pricePositionPercent}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className="h-[180px] w-full overflow-hidden rounded-xl relative md:touch-auto"
                    style={{ touchAction: "pan-y" }}
                  >
                    {chartPoints.length === 0 ? (
                      <div className="h-full w-full bg-black/20 animate-pulse rounded-xl" />
                    ) : (
                      <>
                        <svg
                          ref={chartRef}
                          viewBox="0 0 400 100"
                          className="h-full w-full cursor-crosshair"
                          preserveAspectRatio="none"
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerLeave}
                          style={{ touchAction: "none" }}
                        >
                          <defs>
                            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#43e5c9" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#43e5c9" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 0,100 L ${chartPoints.map((p) => `${p.x},${p.y}`).join(" L ")} L 400,100 Z`}
                            fill="url(#priceGradient)"
                          />
                          <path
                            d={(() => {
                              if (chartPoints.length < 2) return ""
                              let path = `M ${chartPoints[0].x},${chartPoints[0].y}`
                              for (let i = 0; i < chartPoints.length - 1; i++) {
                                const p0 = chartPoints[Math.max(0, i - 1)]
                                const p1 = chartPoints[i]
                                const p2 = chartPoints[i + 1]
                                const p3 = chartPoints[Math.min(chartPoints.length - 1, i + 2)]
                                const cp1x = p1.x + (p2.x - p0.x) / 6
                                const cp1y = p1.y + (p2.y - p0.y) / 6
                                const cp2x = p2.x - (p3.x - p1.x) / 6
                                const cp2y = p2.y - (p3.y - p1.y) / 6
                                path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
                              }
                              return path
                            })()}
                            fill="none"
                            stroke="#43e5c9"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {hoveredPoint && (
                            <>
                              <line
                                x1={hoveredPoint.x}
                                y1="0"
                                x2={hoveredPoint.x}
                                y2="100"
                                stroke="#43e5c9"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                                opacity="0.6"
                              />
                              <circle
                                cx={hoveredPoint.x}
                                cy={hoveredPoint.y}
                                r="4"
                                fill="#43e5c9"
                                stroke="#010807"
                                strokeWidth="2"
                              />
                            </>
                          )}
                        </svg>
                        {hoveredPoint &&
                          (() => {
                            const tooltipWidth = 120
                            const tooltipHeight = 50
                            const svgWidth = 400
                            const svgHeight = 100

                            let horizontalAlign = "center"
                            let translateX = "-50%"

                            if (hoveredPoint.x < tooltipWidth / 2) {
                              horizontalAlign = "left"
                              translateX = "0%"
                            } else if (hoveredPoint.x > svgWidth - tooltipWidth / 2) {
                              horizontalAlign = "right"
                              translateX = "-100%"
                            }

                            let verticalAlign = "top"
                            let translateY = "-120%"

                            if (hoveredPoint.y < tooltipHeight + 10) {
                              verticalAlign = "bottom"
                              translateY = "20%"
                            }

                            return (
                              <div
                                className="pointer-events-none absolute rounded-lg bg-[#010807] px-2 py-1 text-[10px] shadow-lg"
                                style={{
                                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                                  transform: `translate(${translateX}, ${translateY})`,
                                  border: "1px solid #43e5c9",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <div className="text-[#96fce4]">
                                  {dayjs(hoveredPoint.ts).format("YYYY-MM-DD HH:mm")}
                                </div>
                                <div className="font-semibold text-white">US${hoveredPoint.price.toFixed(2)}</div>
                              </div>
                            )
                          })()}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop version: hidden md:block - 100% unchanged */}
              <div className="hidden md:block">
                <div className="h-[180px] px-5 py-4 grid grid-cols-12 gap-3 items-start overflow-hidden">
                  <div className="col-span-12 mb-2 flex items-center gap-2">
                    <img
                      src="https://hyperliquid.gitbook.io/hyperliquid-docs/~gitbook/image?url=https%3A%2F%2F2356094849-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FyUdp569E6w18GdfqlGvJ%252Ficon%252FsIAjqhKKIUysM08ahKPh%252FHL-logoSwitchDISliStat.png%3Falt%3Dmedia%26token%3Da81fa25c-0510-4d97-87ff-3fb8944935b1&width=32&dpr=4&quality=100&sign=3e1219e3&sv=2"
                      alt="Hyperliquid Logo"
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm font-semibold text-[#96fce4]">$HYPE 价格</span>
                  </div>

                  <div className="col-span-5 flex flex-col relative z-10">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold leading-none tracking-tight text-white">
                        US${Number.parseFloat(displayPrice).toFixed(2)}
                      </span>
                      <div
                        className={`flex items-center gap-1 ${displayChange >= 0 ? "text-[#43e5c9]" : "text-[#e54366]"}`}
                      >
                        <span className="text-sm">{displayChange >= 0 ? "▲" : "▼"}</span>
                        <span className="text-[12px] font-semibold">{Math.abs(displayChange)}%</span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-white">
                        <span>US${Number.parseFloat(hypePrice.low24h).toFixed(2)}</span>
                        <span className="text-[#96fce4]">24小时范围</span>
                        <span>US${Number.parseFloat(hypePrice.high24h).toFixed(2)}</span>
                      </div>
                      <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[#072027]">
                        <div
                          className="absolute left-0 h-full rounded-full bg-gradient-to-r from-[#e54366] via-[#43e5c9] to-[#43e5c9]"
                          style={{ width: `${pricePositionPercent}%` }}
                        />
                        <div
                          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#43e5c9] shadow-lg"
                          style={{ left: `${pricePositionPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 relative h-full flex items-center justify-center overflow-hidden">
                    {chartPoints.length === 0 ? (
                      <div className="h-full w-full bg-black/20 animate-pulse rounded-xl" />
                    ) : (
                      <svg
                        ref={chartRef}
                        viewBox="0 0 400 100"
                        className="h-full w-full cursor-crosshair"
                        preserveAspectRatio="none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerLeave}
                        style={{ touchAction: "none" }}
                      >
                        <defs>
                          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#43e5c9" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#43e5c9" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M 0,100 L ${chartPoints.map((p) => `${p.x},${p.y}`).join(" L ")} L 400,100 Z`}
                          fill="url(#priceGradient)"
                        />
                        <path
                          d={(() => {
                            if (chartPoints.length < 2) return ""
                            let path = `M ${chartPoints[0].x},${chartPoints[0].y}`
                            for (let i = 0; i < chartPoints.length - 1; i++) {
                              const p0 = chartPoints[Math.max(0, i - 1)]
                              const p1 = chartPoints[i]
                              const p2 = chartPoints[i + 1]
                              const p3 = chartPoints[Math.min(chartPoints.length - 1, i + 2)]
                              const cp1x = p1.x + (p2.x - p0.x) / 6
                              const cp1y = p1.y + (p2.y - p0.y) / 6
                              const cp2x = p2.x - (p3.x - p1.x) / 6
                              const cp2y = p2.y - (p3.y - p1.y) / 6
                              path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
                            }
                            return path
                          })()}
                          fill="none"
                          stroke="#43e5c9"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {hoveredPoint && (
                          <>
                            <line
                              x1={hoveredPoint.x}
                              y1="0"
                              x2={hoveredPoint.x}
                              y2="100"
                              stroke="#43e5c9"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                              opacity="0.6"
                            />
                            <circle
                              cx={hoveredPoint.x}
                              cy={hoveredPoint.y}
                              r="4"
                              fill="#43e5c9"
                              stroke="#010807"
                              strokeWidth="2"
                            />
                          </>
                        )}
                      </svg>
                    )}
                    {hoveredPoint &&
                      (() => {
                        const tooltipWidth = 120
                        const tooltipHeight = 50
                        const svgWidth = 400
                        const svgHeight = 100

                        let horizontalAlign = "center"
                        let translateX = "-50%"

                        if (hoveredPoint.x < tooltipWidth / 2) {
                          horizontalAlign = "left"
                          translateX = "0%"
                        } else if (hoveredPoint.x > svgWidth - tooltipWidth / 2) {
                          horizontalAlign = "right"
                          translateX = "-100%"
                        }

                        let verticalAlign = "top"
                        let translateY = "-120%"

                        if (hoveredPoint.y < tooltipHeight + 10) {
                          verticalAlign = "bottom"
                          translateY = "20%"
                        }

                        return (
                          <div
                            className="pointer-events-none absolute rounded-lg bg-[#010807] px-2 py-1 text-[10px] shadow-lg"
                            style={{
                              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                              top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                              transform: `translate(${translateX}, ${translateY})`,
                              border: "1px solid #43e5c9",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div className="text-[#96fce4]">{dayjs(hoveredPoint.ts).format("YYYY-MM-DD HH:mm")}</div>
                            <div className="font-semibold text-white">US${hoveredPoint.price.toFixed(2)}</div>
                          </div>
                        )
                      })()}
                  </div>
                </div>
              </div>
            </Card>

            {/* ================= HYPE 推荐质押收益率 ================= */}
            <Card className="col-span-1 lg:col-span-6 p-0 overflow-hidden bg-[#101419] border-[#072027]">
              <div className="block md:hidden">
                <div
                  className="rounded-2xl bg-[#0F1519] p-3"
                  onMouseEnter={() => setStakePaused(true)}
                  onMouseLeave={() => setStakePaused(false)}
                >
                  {/* 顶部：仅标题（移除按钮） */}
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[13px] font-semibold text-emerald-300">HYPE 推荐质押收益率</span>
                    </div>
                  </div>

                  {/* 内容区 */}
                  <div className="relative w-full rounded-xl">
                    {(() => {
                      const item = hypeStakeItems[stakeIdx]
                      const tvl = `$${item.tvlUSD.toLocaleString()}`
                      return (
                        <div className="flex flex-col gap-3 p-1.5">
                          {/* 顶部：Logo + 名称 + （右侧）去质押 按钮 */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 overflow-hidden rounded-md bg-[#112224] flex-shrink-0">
                                {item.logo && (
                                  <img
                                    src={item.logo || "/placeholder.svg"}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="truncate text-[12px] font-semibold text-white">{item.name}</div>
                            </div>

                            {item?.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md bg-[#43e5c9] px-2.5 py-1 text-[11px] font-medium text-[#010807] hover:opacity-90"
                              >
                                去质押
                              </a>
                            )}
                          </div>

                          {/* 中部：APY / TVL / 更新时间 —— 同排等高卡片 */}
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="min-w-0 rounded-lg border border-[#133136] bg-[#0f1b1d] px-2 py-1.5">
                              <div className="text-[10px] text-[#96fce4] leading-none">净 APY</div>
                              <div className="mt-1 text-[13px] font-semibold leading-none text-white whitespace-nowrap">
                                {item.netAPY.toFixed(1)}%
                              </div>
                            </div>
                            <div className="min-w-0 rounded-lg border border-[#133136] bg-[#0f1b1d] px-2 py-1.5">
                              <div className="text-[10px] text-[#96fce4] leading-none">TVL</div>
                              <div className="mt-1 text-[13px] font-semibold leading-none text-white truncate">
                                {tvl}
                              </div>
                            </div>
                            <div className="min-w-0 rounded-lg border border-[#133136] bg-[#0f1b1d] px-2 py-1.5">
                              <div className="text-[10px] text-[#96fce4] leading-none">更新时间</div>
                              <div className="mt-1 text-[12px] font-medium leading-none text-white whitespace-nowrap">
                                {dayjs(item.updatedAt).format("MM-DD HH:mm")}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-[#133136]/60 pt-2">
                            <div className="flex items-center justify-center gap-1">
                              {hypeStakeItems.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setStakeIdx(i)}
                                  aria-label={`slide-${i}`}
                                  className={
                                    i === stakeIdx
                                      ? "h-0.5 w-2 rounded-full bg-[#43e5c9] transition-all"
                                      : "h-0.5 w-1 rounded-full bg-[#2a4b45] transition-all"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* ========== Desktop 保持不变 ========== */}
              <div className="hidden md:block">
                <div
                  className="grid h-[180px] grid-cols-12 items-start gap-3 overflow-hidden px-5 py-4"
                  onMouseEnter={() => setStakePaused(true)}
                  onMouseLeave={() => setStakePaused(false)}
                >
                  {/* 标题 + 右上角按钮 */}
                  <div className="col-span-12 mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-[#96fce4]">HYPE 推荐质押收益率</span>
                    </div>
                    {hypeStakeItems[stakeIdx]?.link && (
                      <a
                        href={hypeStakeItems[stakeIdx].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#43e5c9] px-3 py-1.5 text-xs font-medium text-[#010807] hover:opacity-90"
                      >
                        去质押
                      </a>
                    )}
                  </div>

                  {(() => {
                    const item = hypeStakeItems[stakeIdx]
                    const tvl = `$${item.tvlUSD.toLocaleString()}`
                    return (
                      <>
                        {/* 左：Logo + 名称 */}
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="h-10 w-10 overflow-hidden rounded-lg bg-[#112224]">
                            {item.logo && (
                              <img
                                src={item.logo || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="truncate text-base font-semibold text-white">{item.name}</div>
                        </div>

                        {/* 中：APY 与 TVL 同排（Chip 风格） */}
                        <div className="col-span-5 flex items-stretch gap-3">
                          <div className="flex-1 rounded-lg border border-[#133136] bg-[#0f1b1d] px-3 py-2">
                            <div className="text-[11px] text-[#96fce4]">净 APY</div>
                            <div className="mt-0.5 text-base font-semibold text-white">{item.netAPY.toFixed(1)}%</div>
                          </div>
                          <div className="flex-1 rounded-lg border border-[#133136] bg-[#0f1b1d] px-3 py-2">
                            <div className="text-[11px] text-[#96fce4]">TVL</div>
                            <div className="mt-0.5 text-base font-semibold text-white">{tvl}</div>
                          </div>
                        </div>

                        {/* 右：更新时间 */}
                        <div className="col-span-3">
                          <div className="rounded-lg border border-[#133136] bg-[#0f1b1d] px-3 py-2">
                            <div className="text-[11px] text-[#96fce4]">更新时间</div>
                            <div className="mt-0.5 text-sm font-medium text-white">
                              {dayjs(item.updatedAt).format("MM-DD HH:mm")}
                            </div>
                          </div>
                        </div>

                        {/* 底部整行：指示点居中 + 文案 */}
                        <div className="col-span-12 mt-1 flex flex-col items-center">
                          <div className="flex items-center justify-center gap-2">
                            {hypeStakeItems.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setStakeIdx(i)}
                                className={`h-1 rounded-full transition-all ${
                                  i === stakeIdx ? "w-[10px] bg-[#43e5c9]" : "w-[6px] bg-[#2a4b45]"
                                }`}
                                aria-label={`slide-${i}`}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </Card>
            {/* ================= /HYPE 推荐质押收益率 ================= */}

            <Card className="col-span-1 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:h-full lg:self-stretch p-0 overflow-hidden bg-[#101419] border-[#072027]">
              {/* Mobile version: block md:hidden */}
              <div className="block md:hidden">
                <div className="rounded-2xl bg-[#0F1519] p-3 max-h-[300px] overflow-y-auto">
                  {/* Title */}
                  <div className="flex items-center gap-2 px-1 mb-3">
                    <span>📊</span>
                    <span className="text-[13px] font-semibold text-emerald-300">Hyperliquid 热门代币交易量</span>
                  </div>

                  {/* Token List */}
                  <div className="flex flex-col gap-2">
                    {(hlTopVolume.length ? hlTopVolume : topGainers).slice(0, 10).map((token, i) => (
                      <div key={i} className="flex items-center justify-between px-1">
                        <span className="text-sm text-white truncate">{token.name}</span>
                        <div className="flex items-center gap-3 ml-2">
                          <span className="text-sm tabular-nums text-white whitespace-nowrap">{token.price}</span>
                          <span className="text-sm tabular-nums text-[#43e5c9] whitespace-nowrap">
                            {/* @ts-ignore */}
                            {token.volume24h ? formatVolume(token.volume24h) : formatVolume(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop version: hidden md:block - 100% unchanged */}
              <div className="hidden md:block h-full">
                <div className="h-full overflow-hidden px-5 py-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span>📊</span>
                    <span className="text-sm font-semibold text-[#96fce4]">Hyperliquid 热门代币交易量</span>
                  </div>

                  <div className="flex flex-col gap-2 overflow-hidden lg:grid lg:grid-rows-10">
                    {(hlTopVolume.length ? hlTopVolume : topGainers).slice(0, 10).map((token, i) => (
                      <div key={i} className="flex h-[36px] items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm text-white">{token.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-right text-sm tabular-nums text-white whitespace-nowrap">
                            {token.price}
                          </span>
                          <span className="text-right text-sm tabular-nums text-[#43e5c9] whitespace-nowrap">
                            {/* @ts-ignore */}
                            {token.volume24h ? formatVolume(token.volume24h) : formatVolume(0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 项目列表 —— 左移一格（col-span-9），并缩小卡片尺寸 */}
            <div className="col-span-1 flex flex-col gap-2 overflow-hidden lg:col-span-9 lg:row-start-2 max-[639px]:order-60">
              <div ref={firstCardAnchorRef} aria-hidden />

              <div className="flex flex-wrap gap-2 max-[639px]:-mx-3 max-[639px]:px-3 max-[639px]:flex max-[639px]:gap-2 max-[639px]:overflow-x-auto max-[639px]:no-scrollbar">
                {categoriesList.map((category) => {
                  const isActive = activeCategory === category
                  const isHot = category === "热门"
                  const isLatest = category === "最新"

                  const base = "rounded-lg border px-3 py-1.5"

                  const hotActive = "bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/20"
                  const hotInactive = "text-orange-300 border-orange-500/20 hover:bg-orange-500/10"

                  const latestActive = "bg-[#43b8e5]/15 text-[#43b8e5] border-[#43b8e5]/30 hover:bg-[#43b8e5]/20"
                  const latestInactive = "text-[#43b8e5]/80 border-[#43b8e5]/20 hover:bg-[#43b8e5]/10"

                  const normalActive = "bg-[#43e5c9] border-[#43e5c9] text-[#010807]"
                  const normalInactive = "border-[#072027] bg-[#101419] text-white hover:bg-[#072027]"

                  const cls = isHot
                    ? isActive
                      ? `${base} ${hotActive}`
                      : `${base} ${hotInactive}`
                    : isLatest
                      ? isActive
                        ? `${base} ${latestActive}`
                        : `${base} ${latestInactive}`
                      : isActive
                        ? `${base} ${normalActive}`
                        : `${base} ${normalInactive}`

                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`${cls} max-[639px]:px-3 max-[639px]:h-8 max-[639px]:text-xs max-[639px]:rounded-xl max-[639px]:whitespace-nowrap`}
                    >
                      {category}
                    </button>
                  )
                })}
              </div>

              {currentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 text-6xl">📦</div>
                  <h3 className="mb-2 text-xl font-semibold text-white">暂无项目</h3>
                  <p className="mb-4 text-sm text-[#96fce4]/70">
                    {activeCategory === "全部" ? "暂无项目数据" : `"${activeCategory}" 分类下暂无项目`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 lg:gap-3 max-[639px]:grid max-[639px]:grid-cols-1 max-[639px]:gap-3">
                    {currentProjects.map((project) => {
                      return (
                        <Card
                          key={project.id}
                          className="flex flex-col overflow-hidden rounded-xl border-[#072027] bg-[#101419] p-2 lg:p-1.5 max-[639px]:min-w-0 max-[639px]:overflow-hidden max-[639px]:rounded-2xl max-[639px]:p-4"
                        >
                          <div className="mb-2 flex items-start gap-3 lg:mb-1.5">
                            <img
                              src={project.logo || "/placeholder.svg"}
                              alt={project.name}
                              className="h-8 w-8 flex-shrink-0 rounded-lg object-cover lg:h-7 lg:w-7"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="mb-1 truncate text-[14px] lg:text-[13px] font-extrabold leading-tight text-white lg:mb-0.5 max-[639px]:text-sm max-[639px]:font-semibold max-[639px]:truncate">
                                {project.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 text-[11px] leading-tight text-[#96fce4]/80 lg:text-[10px]">
                                {project.handle && (
                                  <a
                                    href={
                                      project.links?.twitter ??
                                      (project.handle.startsWith("@")
                                        ? `https://x.com/${project.handle.slice(1)}`
                                        : undefined)
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#43e5c9] underline decoration-dotted"
                                    title="Twitter"
                                  >
                                    {project.handle}
                                  </a>
                                )}

                                {(() => {
                                  const websiteUrl = project?.links?.website ?? project?.website
                                  return websiteUrl ? (
                                    <a
                                      href={toHttp(websiteUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-[#43e5c9] underline decoration-dotted"
                                      title={toHttp(websiteUrl)}
                                    >
                                      官方网站
                                    </a>
                                  ) : null
                                })()}

                                {(() => {
                                  const socialUrl =
                                    project?.links?.social ??
                                    project?.social ??
                                    project?.links?.twitter ??
                                    (project?.handle?.startsWith("@")
                                      ? `https://x.com/${project.handle.slice(1)}`
                                      : undefined)

                                  return socialUrl ? (
                                    <a
                                      href={toHttp(socialUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-[#43e5c9] underline decoration-dotted"
                                      title={toHttp(socialUrl)}
                                    >
                                      社交媒体
                                    </a>
                                  ) : null
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="mb-2 lg:mb-1.5">
                            <p className="mb-2 text-[11px] leading-relaxed text-[#96fce4]/90 line-clamp-2 lg:mb-1.5 lg:text-[10px] max-[639px]:text-sm max-[639px]:leading-6 max-[639px]:line-clamp-3">
                              {project.description}
                            </p>

                            {(project.description ?? "").trim().length > 0 && (
                              <button
                                onClick={() =>
                                  setDescModal({
                                    open: true,
                                    title: project.name,
                                    text: project.description ?? "",
                                  })
                                }
                                className="mb-2 inline-block text-[11px] text-[#43e5c9] hover:underline lg:mb-1.5"
                              >
                                展开全文
                              </button>
                            )}
                          </div>

                          <div className="mt-auto flex flex-wrap gap-1 max-[639px]:flex max-[639px]:flex-wrap max-[639px]:gap-2">
                            {(project.categories ?? []).map((cat, i) => {
                              const isHot = cat === "热门"
                              const isLatest = cat === "最新"
                              const color = isHot ? pillHot : isLatest ? pillLatest : pillNormal
                              return (
                                <span
                                  key={`c-${i}`}
                                  className={`${pillShape} ${pillTypo} ${color} max-[639px]:h-8 max-[639px]:px-3 max-[639px]:text-xs max-[639px]:rounded-xl`}
                                >
                                  {cat}
                                </span>
                              )
                            })}

                            {(project.tags ?? []).map((tag, i) => {
                              const isHot = tag === "热门"
                              const isLatest = tag === "最新"
                              const color = isHot ? pillHot : isLatest ? pillLatest : pillNormal
                              return (
                                <span
                                  key={`t-${i}`}
                                  className={`${pillShape} ${pillTypo} ${color} max-[639px]:h-8 max-[639px]:px-3 max-[639px]:text-xs max-[639px]:rounded-xl`}
                                >
                                  {tag}
                                </span>
                              )
                            })}
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {/* 分页 */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] max-[639px]:order-70 max-[639px]:py-3 max-[639px]:flex max-[639px]:items-center max-[639px]:justify-center max-[639px]:gap-2">
                    <span className="text-[#96fce4]">共 {totalItems} 条</span>

                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-[#072027] bg-[#101419] px-2.5 py-1 text-white hover:bg-[#072027] disabled:opacity-50 disabled:cursor-not-allowed max-[639px]:h-8 max-[639px]:min-w-8 max-[639px]:text-xs max-[639px]:rounded-xl"
                    >
                      &lt;
                    </button>

                    <div className="hidden gap-2 sm:flex">
                      {getVisiblePageNumbers().map((page, i) =>
                        page === "..." ? (
                          <span key={`ellipsis-${i}`} className="px-2.5 py-1 text-[#96fce4]">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToSpecificPage(page as number)}
                            className={`rounded-lg px-2.5 py-1 ${
                              page === currentPage
                                ? "bg-[#43e5c9] text-[#010807]"
                                : "border border-[#072027] bg-[#101419] text-white hover:bg-[#072027]"
                            } max-[639px]:h-8 max-[639px]:min-w-8 max-[639px]:text-xs max-[639px]:rounded-xl`}
                          >
                            {page}
                          </button>
                        ),
                      )}
                    </div>

                    <div className="flex gap-2 sm:hidden">
                      {getVisiblePageNumbers()
                        .slice(0, 3)
                        .map((page, i) =>
                          page === "..." ? (
                            <span key={`ellipsis-m-${i}`} className="px-2.5 py-1 text-[#96fce4]">
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => goToSpecificPage(page as number)}
                              className={`rounded-lg px-2.5 py-1 ${
                                page === currentPage
                                  ? "bg-[#43e5c9] text-[#010807]"
                                  : "border border-[#072027] bg-[#101419] text-white hover:bg-[#072027]"
                              } max-[639px]:h-8 max-[639px]:min-w-8 max-[639px]:text-xs max-[639px]:rounded-xl`}
                            >
                              {page}
                            </button>
                          ),
                        )}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-[#072027] bg-[#101419] px-2.5 py-1 text-white hover:bg-[#072027] disabled:opacity-50 disabled:cursor-not-allowed max-[639px]:h-8 max-[639px]:min-w-8 max-[639px]:text-xs max-[639px]:rounded-xl"
                    >
                      &gt;
                    </button>

                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="text-[#96fce4]">前往</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={goToPageInput}
                        onChange={(e) => setGoToPageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGoToPageSubmit()}
                        className="w-10 rounded-lg border border-[#072027] bg-[#101419] px-2 py-1 text-center text-white"
                        placeholder={currentPage.toString()}
                      />
                      <span className="text-[#96fce4]">页</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* /项目列表 */}
          </div>
        </div>
      </main>

      {/* Footer with copyright text */}
      <footer className="border-t border-[#072027] bg-[#010807] py-4 text-center max-[639px]:order-100">
        <p className="text-xs text-[#96fce4]/60">© 2025 Hyperliquid中文社区 All rights reserved.</p>
      </footer>

      {descModal.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDescModal({ open: false, title: "", text: "" })}
        >
          <div
            className="w-full max-w-2xl rounded-xl border border-[#072027] bg-[#101419] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{descModal.title || "项目简介"}</h3>
              <button
                className="rounded-md border border-[#072027] px-2 py-1 text-[12px] text-[#96fce4] hover:bg-[#072027]"
                onClick={() => setDescModal({ open: false, title: "", text: "" })}
              >
                关闭
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto pr-1">
              <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#96fce4]">{descModal.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
