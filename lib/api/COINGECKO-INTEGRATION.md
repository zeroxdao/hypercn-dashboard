# CoinGecko API 集成指南

## API 密钥

您的 CoinGecko Demo API 密钥：`YOUR_KEY_HERE`

## 环境变量设置

在项目的环境变量中添加：

\`\`\`env
COINGECKO_API_KEY=YOUR_KEY_HERE
\`\`\`

## API 使用限制

- **每月调用总量**: 10,000 次
- **每分钟调用限制**: 30 次
- **当前使用量**: 0 / 10,000
- **重置日期**: 每月 1 号

## 已集成的数据

### ✅ 真实数据（来自 CoinGecko）

1. **总市值** - `market_data.market_cap.usd`
2. **市值 24h 变化** - `market_data.market_cap_change_percentage_24h`
3. **总流通量** - `circulating_supply * current_price.usd`
4. **$HYPE 价格** - `market_data.current_price.usd`
5. **24h 价格变化** - `market_data.price_change_percentage_24h`
6. **24h 最高价** - `market_data.high_24h.usd`
7. **24h 最低价** - `market_data.low_24h.usd`
8. **24h 交易量** - `market_data.total_volume.usd`
9. **历史价格图表** - `market_chart` API

### 🟡 混合数据

- **热门代币** - 来自 Hyperliquid Spot API
- **涨幅榜** - 来自 Hyperliquid Spot API
- **新代币** - 来自 Hyperliquid Spot API

### ❌ 待集成（模拟数据）

1. **总用户数** - 需要 Hyperliquid 官方 API
2. **HyperEVM TPS** - 需要 HyperEVM API
3. **回购数据** - 需要 Hyperliquid 官方 API
4. **收入数据** - 需要 Hyperliquid 官方 API

## API 端点说明

### 1. 获取完整代币数据

\`\`\`typescript
GET https://api.coingecko.com/api/v3/coins/hyperliquid
Headers: { "x-cg-demo-api-key": "YOUR_KEY_HERE" }
\`\`\`

返回：完整的代币信息，包括市值、价格、流通量、交易量等

### 2. 获取简单价格（更快）

\`\`\`typescript
GET https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true
Headers: { "x-cg-demo-api-key": "YOUR_KEY_HERE" }
\`\`\`

返回：简化的价格数据，响应更快

### 3. 获取历史价格图表

\`\`\`typescript
GET https://api.coingecko.com/api/v3/coins/hyperliquid/market_chart?vs_currency=usd&days=1
Headers: { "x-cg-demo-api-key": "YOUR_KEY_HERE" }
\`\`\`

返回：历史价格、市值、交易量数据

## 缓存策略

为了节省 API 调用次数，我们使用了 Next.js 的缓存机制：

- **完整代币数据**: 60 秒缓存
- **简单价格**: 30 秒缓存
- **历史图表**: 5 分钟缓存

## 错误处理

如果 CoinGecko API 失败，系统会自动回退到 Hyperliquid API 作为备用数据源。

## 数据对比

### CoinGecko vs 其他平台

CoinGecko 的数据来源于多个交易所的聚合，因此：

- **价格**: 可能与单一交易所略有差异（通常在 0.1-0.5% 范围内）
- **市值**: 基于流通量 × 价格计算，是行业标准方法
- **交易量**: 聚合多个交易所的 24h 交易量

### 为什么数据更准确

1. **市值计算**: 使用 `流通量 × 现货价格`，而不是永续合约的未平仓量
2. **价格来源**: 聚合多个交易所的现货价格，而不是单一永续合约价格
3. **交易量**: 包含现货和衍生品的总交易量

## 监控 API 使用

您可以在 CoinGecko 控制台查看 API 使用情况：
https://www.coingecko.com/en/developers/dashboard

## 下一步

如果需要更高的调用限制，可以升级到 CoinGecko 的付费计划：
- **Analyst**: 500,000 次/月
- **Lite**: 10,000 次/月（当前）
- **Pro**: 50,000 次/月
