# Hyperliquid Dashboard API 集成指南

本文档说明如何将模拟数据替换为真实 API 调用。

## 📊 API 集成状态总览

### ✅ 已完成（使用真实 API）
1. **总市值** - 从 `getMetaAndAssetCtxs()` 计算
2. **24小时成交量** - 从 `getMetaAndAssetCtxs()` 计算
3. **$HYPE 当前价格** - 从 `getAllMids()` 和 `getMetaAndAssetCtxs()` 获取
4. **24小时价格范围** - 从 `getMetaAndAssetCtxs()` 获取
5. **HYPEREVM 热门代币** - 从 `getSpotMetaAndAssetCtxs()` 获取
6. **HYPEREVM 最大涨幅代币** - 从 `getSpotMetaAndAssetCtxs()` 获取
7. **HYPEREVM 全新代币** - 从 `getSpotMetaAndAssetCtxs()` 获取

### 🟡 待集成（使用模拟数据）
1. **总用户数** - 需要用户统计 API
2. **总流通量** - 需要流通量 API
3. **HyperEVM TPS** - 需要 HyperEVM 性能 API
4. **过去 24 小时回购** - 需要回购数据 API
5. **过去 7 天回购** - 需要回购数据 API
6. **过去 30 天回购** - 需要回购数据 API
7. **Hyperliquid 收入（Fees 和 Revenue）** - 需要收入数据 API
8. **历史价格图表数据** - 需要 K线/蜡烛图 API

---

## 🔧 快速集成指南

### 1. 总用户数 (Total Users)

**文件位置**: `lib/api/dashboard.ts` → `fetchTotalUsers()`

**当前状态**: 返回硬编码值 `763914`

**集成步骤**:
\`\`\`typescript
async function fetchTotalUsers(): Promise<number> {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'userStats' }),
      next: { revalidate: 60 } // 缓存60秒
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.totalUsers
  } catch (error) {
    console.error("[v0] Error fetching total users:", error)
    return 0 // 返回默认值
  }
}
\`\`\`

**API 端点**: `POST https://api.hyperliquid.xyz/info`  
**请求体**: `{ "type": "userStats" }`  
**响应格式**: `{ "totalUsers": number }`

---

### 2. 总流通量 (Total Circulation)

**文件位置**: `lib/api/dashboard.ts` → `fetchTotalCirculation()`

**当前状态**: 返回估算值 `8500000000`

**集成步骤**:
\`\`\`typescript
async function fetchTotalCirculation(): Promise<number> {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'circulation', coin: 'HYPE' }),
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.circulatingSupply
  } catch (error) {
    console.error("[v0] Error fetching total circulation:", error)
    return 0
  }
}
\`\`\`

**API 端点**: `POST https://api.hyperliquid.xyz/info`  
**请求体**: `{ "type": "circulation", "coin": "HYPE" }`  
**响应格式**: `{ "circulatingSupply": number, "totalSupply": number }`

---

### 3. HyperEVM TPS

**文件位置**: `lib/api/dashboard.ts` → `fetchHyperEVMTps()`

**当前状态**: 返回硬编码值 `12.34`

**集成步骤**:
\`\`\`typescript
async function fetchHyperEVMTps(): Promise<number> {
  try {
    const response = await fetch('https://api.hypervm.xyz/stats/tps', {
      next: { revalidate: 10 } // 每10秒更新
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.currentTps
  } catch (error) {
    console.error("[v0] Error fetching HyperEVM TPS:", error)
    return 0
  }
}
\`\`\`

**API 端点**: `GET https://api.hypervm.xyz/stats/tps`  
**响应格式**: `{ "currentTps": number, "avgTps": number, "peakTps": number }`

---

### 4. 回购数据 (Buyback Data)

**文件位置**: `lib/api/dashboard.ts` → `getBuybackData()`

**当前状态**: 返回模拟数据数组

**集成步骤**:
\`\`\`typescript
export async function getBuybackData(): Promise<BuybackData[]> {
  try {
    const periods = ['24h', '7d', '30d'] as const
    
    const buybackData = await Promise.all(
      periods.map(async (period) => {
        const response = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'buyback', period }),
          next: { revalidate: 60 }
        })
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`)
        }
        
        const data = await response.json()
        return {
          period,
          amount: data.totalAmount,
          hypeAmount: data.hypeAmount,
          avgPrice: data.avgPrice
        }
      })
    )
    
    return buybackData
  } catch (error) {
    console.error("[v0] Error fetching buyback data:", error)
    return [] // 返回空数组
  }
}
\`\`\`

**API 端点**: `POST https://api.hyperliquid.xyz/info`  
**请求体**: `{ "type": "buyback", "period": "24h" | "7d" | "30d" }`  
**响应格式**: 
\`\`\`json
{
  "totalAmount": "$1.54m",
  "hypeAmount": "41.26K",
  "avgPrice": "US$37.34"
}
\`\`\`

---

### 5. 收入数据 (Revenue Data)

**文件位置**: `lib/api/dashboard.ts` → `getRevenueData()`

**当前状态**: 返回生成的模拟月度数据

**集成步骤**:
\`\`\`typescript
export async function getRevenueData(): Promise<RevenueData[]> {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'revenue',
        timeframe: 'yearly',
        year: new Date().getFullYear()
      }),
      next: { revalidate: 3600 } // 每小时更新
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.monthlyRevenue.map(item => ({
      month: item.month,
      fees: item.fees,
      revenue: item.revenue
    }))
  } catch (error) {
    console.error("[v0] Error fetching revenue data:", error)
    return []
  }
}
\`\`\`

**API 端点**: `POST https://api.hyperliquid.xyz/info`  
**请求体**: 
\`\`\`json
{
  "type": "revenue",
  "timeframe": "yearly",
  "year": 2025
}
\`\`\`
**响应格式**: 
\`\`\`json
{
  "monthlyRevenue": [
    { "month": "一月", "fees": 1500000000, "revenue": 1300000000 },
    { "month": "二月", "fees": 1650000000, "revenue": 1440000000 }
  ]
}
\`\`\`

---

### 6. 历史价格数据 (Historical Price Chart)

**文件位置**: `lib/api/dashboard.ts` → `fetchHistoricalPrices()`

**当前状态**: 返回随机生成的价格数据

**集成步骤**:
\`\`\`typescript
async function fetchHistoricalPrices(coin: string, currentPrice: number, hours = 24) {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'candleSnapshot',
        coin: coin,
        interval: '1h',
        startTime: Date.now() - hours * 3600000
      }),
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.map(candle => ({
      time: candle.t,
      price: parseFloat(candle.c) // 使用收盘价
    }))
  } catch (error) {
    console.error("[v0] Error fetching historical prices:", error)
    return []
  }
}
\`\`\`

**API 端点**: `POST https://api.hyperliquid.xyz/info`  
**请求体**: 
\`\`\`json
{
  "type": "candleSnapshot",
  "coin": "HYPE",
  "interval": "1h",
  "startTime": 1234567890000
}
\`\`\`
**响应格式**: 
\`\`\`json
[
  {
    "t": 1234567890000,
    "o": "37.50",
    "h": "38.20",
    "l": "37.10",
    "c": "37.80",
    "v": "1234567.89"
  }
]
\`\`\`

---

## 🧪 测试步骤

### 1. 本地开发测试
\`\`\`bash
# 启动开发服务器
npm run dev

# 打开浏览器访问
http://localhost:3000

# 打开浏览器控制台查看日志
# 所有 API 调用都会输出 [v0] 开头的日志
\`\`\`

### 2. 检查 API 调用
- 打开浏览器开发者工具 → Network 标签
- 筛选 XHR/Fetch 请求
- 查看请求和响应数据是否正确

### 3. 错误处理测试
- 断开网络连接测试回退逻辑
- 检查是否显示默认值（0 或空数组）
- 确认不会出现白屏或崩溃

---

## 📝 环境变量配置

如果 API 需要认证密钥，在项目根目录创建 `.env.local` 文件：

\`\`\`env
# Hyperliquid API 配置
HYPERLIQUID_API_KEY=your_api_key_here
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz

# HyperEVM API 配置
HYPERVM_API_KEY=your_hypervm_api_key_here
HYPERVM_API_URL=https://api.hypervm.xyz

# 是否使用测试网
NEXT_PUBLIC_USE_TESTNET=false
\`\`\`

在代码中使用环境变量：
\`\`\`typescript
const apiKey = process.env.HYPERLIQUID_API_KEY
const apiUrl = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz'

const response = await fetch(`${apiUrl}/info`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}` // 如果需要
  },
  body: JSON.stringify({ type: 'userStats' })
})
\`\`\`

---

## ⚡ 性能优化建议

### 1. 使用 Next.js 缓存
\`\`\`typescript
// 静态数据（很少变化）- 缓存1小时
next: { revalidate: 3600 }

// 动态数据（频繁变化）- 缓存10秒
next: { revalidate: 10 }

// 实时数据（不缓存）
cache: 'no-store'
\`\`\`

### 2. 并行请求
\`\`\`typescript
// ✅ 好 - 并行请求
const [users, circulation, tps] = await Promise.all([
  fetchTotalUsers(),
  fetchTotalCirculation(),
  fetchHyperEVMTps()
])

// ❌ 差 - 串行请求
const users = await fetchTotalUsers()
const circulation = await fetchTotalCirculation()
const tps = await fetchHyperEVMTps()
\`\`\`

### 3. 错误边界
所有 API 函数都已包含 try-catch 和默认值返回，确保不会因为单个 API 失败导致整个页面崩溃。

---

## 📚 相关文件

- `lib/api/hyperliquid.ts` - 底层 API 客户端（已完成）
- `lib/api/dashboard.ts` - 数据聚合层（需要集成）
- `lib/api/mock-data.ts` - 模拟数据生成器（可选删除）
- `lib/types/hyperliquid.ts` - TypeScript 类型定义
- `app/page.tsx` - 主页面（服务端数据获取）
- `components/dashboard-client.tsx` - 客户端组件（数据展示）

---

## 🆘 常见问题

### Q: API 返回 CORS 错误怎么办？
A: 确保使用服务端 API 调用（在 `app/page.tsx` 或 API 路由中），不要在客户端组件中直接调用外部 API。

### Q: 如何调试 API 调用？
A: 查看浏览器控制台中 `[v0]` 开头的日志，或在 API 函数中添加更多 `console.log` 语句。

### Q: 数据不更新怎么办？
A: 检查 `revalidate` 缓存时间设置，或在开发环境中禁用缓存：`cache: 'no-store'`

### Q: 如何切换测试网和主网？
A: 修改 `.env.local` 中的 `NEXT_PUBLIC_USE_TESTNET` 环境变量。

---

## ✅ 集成完成检查清单

- [ ] 总用户数 API 已集成并测试
- [ ] 总流通量 API 已集成并测试
- [ ] HyperEVM TPS API 已集成并测试
- [ ] 回购数据 API（24h/7d/30d）已集成并测试
- [ ] 收入数据 API 已集成并测试
- [ ] 历史价格图表 API 已集成并测试
- [ ] 所有 API 错误处理已验证
- [ ] 环境变量已配置
- [ ] 缓存策略已优化
- [ ] 生产环境测试通过

---

**最后更新**: 2025-10-22  
**维护者**: v0 AI Assistant
