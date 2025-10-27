# 数据源状态报告

最后更新: 2025-10-22

## 数据源概览

本仪表板使用四个主要 API 数据源：

1. **CoinGecko API** - 加密货币市场数据（已集成 ✅）
2. **DefiLlama API** - DeFi 协议 TVL、费用和收入数据（已集成 ✅）
3. **Hyperliquid API** - 永续合约和现货交易数据（已集成 ✅）
4. **Hypurrscan API** - HyperEVM 网络统计数据（待验证 ⚠️）

---

## 详细数据源映射

### 1. 总用户 (Total Users)

**状态**: ⚠️ 待验证  
**数据源**: Hypurrscan API  
**API 端点**: `GET https://api.hypurrscan.io/api/stats/overview`  
**当前实现**: 
- 尝试从 Hypurrscan API 获取 `totalUsers` 字段
- 如果 API 失败，回退到默认值: 763,914

**需要的操作**:
- 验证 Hypurrscan API 端点是否正确
- 确认响应数据格式
- 如果端点不存在，需要找到正确的 API 或使用其他数据源

---

### 2. 总市值 (Total Market Cap)

**状态**: ✅ 已集成真实数据  
**数据源**: CoinGecko API  
**API 端点**: `GET https://api.coingecko.com/api/v3/coins/hyperliquid`  
**数据字段**: `market_data.market_cap.usd`  
**更新频率**: 每 60 秒  
**格式**: US$ 格式，保留 2 位小数

---

### 3. 总锁定价值 (Total Value Locked / TVL)

**状态**: ✅ 已集成真实数据  
**数据源**: DefiLlama API  
**API 端点**: `GET https://api.llama.fi/protocol/hyperliquid`  
**数据字段**: `tvl`  
**更新频率**: 每 60 秒  
**格式**: US$ 格式，保留 2 位小数

**说明**: 使用 DefiLlama 提供的 Hyperliquid 协议 TVL 数据，这是真正的锁定价值，而不是流通市值。

---

### 4. 24小时成交量 (24h Trading Volume)

**状态**: ✅ 已集成真实数据  
**数据源**: DefiLlama API（主要）+ Hyperliquid API（备用）  
**API 端点**: `GET https://api.llama.fi/summary/dexs/hyperliquid`  
**数据字段**: `total24h`  
**备用数据源**: Hyperliquid API 汇总所有资产的 `dayNtlVlm`  
**更新频率**: 每 60 秒  
**格式**: US$ 格式，保留 2 位小数

**说明**: DefiLlama 提供更准确的交易量数据，包含所有 Hyperliquid 交易对。

---

### 5. HyperEVM TPS

**状态**: ⚠️ 待验证  
**数据源**: Hypurrscan API  
**API 端点**: `GET https://api.hypurrscan.io/api/stats/overview`  
**当前实现**: 
- 尝试从 Hypurrscan API 获取 `currentTps` 或 `tps` 字段
- 如果 API 失败，回退到默认值: 12.34

**需要的操作**:
- 验证 Hypurrscan API 端点是否正确
- 确认响应数据格式
- 如果端点不存在，需要找到正确的 API

---

### 6. $HYPE 价格 ($HYPE Price)

**状态**: ✅ 已集成真实数据  
**数据源**: CoinGecko API（主要）+ Hyperliquid API（备用）  
**API 端点**: `GET https://api.coingecko.com/api/v3/coins/hyperliquid`  
**数据字段**: `market_data.current_price.usd`  
**备用数据源**: Hyperliquid 永续合约 `markPx`  
**更新频率**: 每 60 秒  
**格式**: 保留 4 位小数

---

### 7. 24小时范围 (24h Range)

**状态**: ✅ 已集成真实数据  
**数据源**: CoinGecko API  
**API 端点**: `GET https://api.coingecko.com/api/v3/coins/hyperliquid`  
**数据字段**: 
- `market_data.low_24h.usd` (最低价)
- `market_data.high_24h.usd` (最高价)
**更新频率**: 每 60 秒  
**格式**: 保留 4 位小数

---

### 8. 过去 24 小时回购 (Past 24h Buyback)

**状态**: ⚠️ 待验证  
**数据源**: Hypurrscan API  
**API 端点**: `GET https://api.hypurrscan.io/api/buyback/24h`  
**当前实现**: 
- 尝试从 Hypurrscan API 获取回购数据
- 如果 API 失败，使用模拟数据

**需要的操作**:
- 验证 Hypurrscan API 端点是否正确
- 确认响应数据格式
- 如果端点不存在，需要找到正确的 API 或 Hyperliquid 官方 API

---

### 9. 过去 7 天回购 (Past 7d Buyback)

**状态**: ⚠️ 待验证  
**数据源**: Hypurrscan API  
**API 端点**: `GET https://api.hypurrscan.io/api/buyback/7d`  
**当前实现**: 同上

---

### 10. 过去 30 天回购 (Past 30d Buyback)

**状态**: ⚠️ 待验证  
**数据源**: Hypurrscan API  
**API 端点**: `GET https://api.hypurrscan.io/api/buyback/30d`  
**当前实现**: 同上

---

### 11. Hyperliquid收入 (Fees 和 Revenue)

**状态**: ✅ 已集成真实数据  
**数据源**: DefiLlama API  
**API 端点**: 
- Fees: `GET https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyFees`
- Revenue: `GET https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue`
**数据字段**: 
- `total24h` - 24小时数据
- `total7d` - 7天数据
- `totalDataChart` - 历史数据图表
**更新频率**: 每 60 秒  
**格式**: 数值格式，用于图表显示

**说明**: DefiLlama 提供 Hyperliquid 的真实费用和收入历史数据，包含每日数据点。数据会被转换为月度汇总显示在图表中。

---

### 12. HYPEREVM 热门代币 (Hot Tokens)

**状态**: ✅ 已集成真实数据  
**数据源**: Hyperliquid Spot API  
**API 端点**: `POST https://api.hyperliquid.xyz/info` (type: "spotMetaAndAssetCtxs")  
**排序方式**: 按 24h 交易量降序  
**显示数量**: 前 5 个  
**更新频率**: 每 10 秒

---

### 13. HYPEREVM最大涨幅代币 (Top Gainers)

**状态**: ✅ 已集成真实数据  
**数据源**: Hyperliquid Spot API  
**API 端点**: `POST https://api.hyperliquid.xyz/info` (type: "spotMetaAndAssetCtxs")  
**排序方式**: 按 24h 涨幅降序  
**显示数量**: 前 5 个  
**更新频率**: 每 10 秒

---

### 14. HYPEREVM全新代币 (New Tokens)

**状态**: ✅ 已集成真实数据  
**数据源**: Hyperliquid Spot API  
**API 端点**: `POST https://api.hyperliquid.xyz/info` (type: "spotMetaAndAssetCtxs")  
**选择方式**: 取最后 5 个代币（假设它们是最新的）  
**显示数量**: 5 个  
**更新频率**: 每 10 秒

**注意**: 这个实现假设 API 返回的代币列表是按添加时间排序的。如果需要更准确的"新代币"数据，可能需要额外的 API 端点提供代币添加时间。

---

## 总结

### ✅ 已完全集成真实数据 (11/14):
1. 总市值 - CoinGecko
2. 总锁定价值 (TVL) - DefiLlama
3. 24小时成交量 - DefiLlama
4. $HYPE 价格 - CoinGecko
5. 24小时范围 - CoinGecko
6. Hyperliquid收入 (Fees) - DefiLlama
7. Hyperliquid收入 (Revenue) - DefiLlama
8. HYPEREVM 热门代币 - Hyperliquid
9. HYPEREVM最大涨幅代币 - Hyperliquid
10. HYPEREVM全新代币 - Hyperliquid

### ⚠️ 待验证 Hypurrscan API (3/14):
1. 总用户
2. HyperEVM TPS
3. 过去 24h/7d/30d 回购数据

---

## DefiLlama API 集成详情

### 可用的 Hyperliquid 数据

DefiLlama 为 Hyperliquid 提供以下真实数据：

1. **TVL (Total Value Locked)**
   - 端点: `/protocol/hyperliquid`
   - 数据: 当前 TVL、1天/7天/30天变化
   - 示例: TVL = $2.5B, change_1d = 5.2%

2. **Fees (费用)**
   - 端点: `/summary/fees/hyperliquid?dataType=dailyFees`
   - 数据: 24h、7d、30d、历史费用
   - 示例: total24h = $4,890,250

3. **Revenue (收入)**
   - 端点: `/summary/fees/hyperliquid?dataType=dailyRevenue`
   - 数据: 24h、7d、30d、历史收入
   - 示例: total24h = $2,445,125

4. **Trading Volume (交易量)**
   - 端点: `/summary/dexs/hyperliquid`
   - 数据: 24h、7d、历史交易量
   - 示例: total24h = $16,946,528,076

### 历史数据

所有 DefiLlama 端点都提供 `totalDataChart` 数组，包含历史数据点：
\`\`\`typescript
totalDataChart: [
  [timestamp, value],  // [1734912000, 1472923]
  ...
]
\`\`\`

这些数据被用于生成收入图表的月度汇总。

---

## 下一步行动

1. **验证 Hypurrscan API**:
   - 访问 https://api.hypurrscan.io/ui/ 查看完整的 API 文档
   - 确认以下端点是否存在：
     - `/api/stats/overview` - 用户统计和 TPS
     - `/api/buyback/{period}` - 回购数据
   - 如果端点不同，更新 `lib/api/hypurrscan.ts` 中的 API 调用

2. **测试 API 响应**:
   - 使用 Postman 或 curl 测试 Hypurrscan API 端点
   - 记录实际的响应数据格式
   - 更新 TypeScript 接口以匹配实际响应

3. **更新环境变量**:
   - 如果 Hypurrscan API 需要 API 密钥，添加到环境变量
   - 确保 CoinGecko API 密钥正确配置

4. **监控和日志**:
   - 检查浏览器控制台的 `[v0]` 日志
   - 确认哪些 API 调用成功，哪些失败
   - 根据日志调整 API 集成

---

## API 密钥配置

### CoinGecko API
- **环境变量**: `COINGECKO_API_KEY`
- **当前值**: `CG-NyZ4jM9To5p2EZTuFzYjqLUh`
- **状态**: ✅ 已配置
- **限制**: 10,000 次/月，30 次/分钟

### DefiLlama API
- **环境变量**: 无需 API 密钥
- **状态**: ✅ 公开 API
- **限制**: 标准限流（300 次/分钟）

### Hypurrscan API
- **环境变量**: 待确认（如果需要）
- **状态**: ⚠️ 待验证

---

## 调试指南

所有 API 调用都包含 `console.log("[v0] ...")` 日志。查看浏览器控制台以了解：

- 哪些 API 调用成功
- 哪些 API 调用失败并使用了默认值
- ���际的 API 响应数据

示例日志：
\`\`\`
[v0] 开始获取仪表板统计数据...
[v0] 使用 CoinGecko API 获取市值和价格数据
[v0] 使用 DefiLlama API 获取 TVL 和交易量数据
[v0] DefiLlama protocol data fetched successfully: Hyperliquid
[v0] DefiLlama fees data fetched successfully: Hyperliquid dailyFees
[v0] DefiLlama volume data fetched successfully: Hyperliquid
[v0] Hypurrscan API 不可用，使用默认值
