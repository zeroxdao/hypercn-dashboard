# Hyperliquid Dashboard

A real-time dashboard for monitoring Hyperliquid protocol metrics, built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 📊 Real-time market data from multiple APIs
- 💰 HYPE token price tracking with 24h charts
- 🔥 Hot tokens, top gainers, and new tokens
- 📈 Revenue and fees visualization
- 🔄 Automatic data refresh every 10 seconds
- 📱 Fully responsive design
- 🎨 Clean, maintainable code architecture

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **APIs**: 
  - Hyperliquid API (Perps data, token prices)
  - CoinGecko API (HYPE token data, market cap)
  - DefiLlama API (TVL, fees, revenue)

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Main dashboard page (Server Component)
│   └── layout.tsx            # Root layout
├── components/
│   ├── dashboard-client.tsx  # Client component for interactivity
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── hyperliquid.ts   # Hyperliquid API client
│   │   ├── coingecko.ts     # CoinGecko API client
│   │   ├── defillama.ts     # DefiLlama API client
│   │   └── dashboard.ts      # Dashboard data aggregation
│   └── types/
│       └── hyperliquid.ts    # TypeScript type definitions
└── .env.example              # Environment variables template
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. Copy `.env.example` to `.env.local` and configure:

\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Set up your API keys in `.env.local`:

\`\`\`bash
# Optional: For higher rate limits
COINGECKO_API_KEY=your_coingecko_api_key_here
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

This dashboard integrates with multiple APIs to provide comprehensive data:

### Hyperliquid API
- **Perps Data**: Perpetual contracts volume, prices, funding rates
- **Spot Data**: Spot market information
- **Token Prices**: Real-time token prices and 24h changes

**Documentation**: [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)

### CoinGecko API
- **HYPE Token Data**: Price, market cap, 24h volume
- **Market Charts**: Historical price data
- **24h Range**: High/low prices

**Documentation**: [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)

### DefiLlama API
- **Chain TVL**: Hyperliquid L1 Total Value Locked
- **Fees & Revenue**: Protocol fees and revenue data
- **Historical Data**: Time-series data for charts

**Documentation**: [DefiLlama API Docs](https://defillama.com/docs/api)

## Code Architecture

### Clean Code Principles

1. **Separation of Concerns**: 
   - API logic in `lib/api/`
   - Type definitions in `lib/types/`
   - UI components in `components/`
   - Server logic in `app/`

2. **Type Safety**: 
   - Full TypeScript coverage
   - Strict type definitions for all API responses

3. **Error Handling**: 
   - Graceful error handling with fallback data
   - Console logging for debugging
   - API-specific error handling

4. **Performance**: 
   - Server-side data fetching
   - 10-second revalidation cache
   - Parallel API requests with Promise.all

5. **Maintainability**: 
   - Clear function names
   - Comprehensive comments
   - Modular structure
   - Single responsibility principle

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard:
   - `COINGECKO_API_KEY` (optional)
   - `NEXT_PUBLIC_USE_TESTNET` (optional)
4. Deploy

### Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure environment variables
5. Deploy

## Environment Variables

Optional:
- `NEXT_PUBLIC_USE_TESTNET`: Set to `true` to use Hyperliquid testnet (default: `false`)
- `COINGECKO_API_KEY`: CoinGecko API key for higher rate limits

## Data Sources

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| Total Market Cap | CoinGecko | 10s |
| Total Value Locked | DefiLlama | 10s |
| 24h Trading Volume | Hyperliquid API | 10s |
| HYPE Price | CoinGecko | 10s |
| Hot Tokens | Hyperliquid API | 10s |
| Top Gainers | Hyperliquid API | 10s |
| New Tokens | Hyperliquid API | 10s |
| Revenue Chart | DefiLlama | 10s |

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check [Hyperliquid Documentation](https://hyperliquid.gitbook.io/)

---

Built with ❤️ using Next.js, Hyperliquid API, CoinGecko, and DefiLlama
