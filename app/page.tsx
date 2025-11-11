"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"

export default function LandingPage() {
  const teamScrollRef = useRef<HTMLDivElement>(null)

  const socialLinks = [
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
    {
      name: "Anon",
      icon: "https://media.istockphoto.com/id/170091505/photo/blue-question-mark.jpg?s=612x612&w=0&k=20&c=LPPlKrRZBRmHpoJWwYFo0CRB8vtZjGHLi2yuUCv6t8M=",
      url: "https://t.me/chinesehyperliquid",
    },
  ]

  useEffect(() => {
    const scrollContainer = teamScrollRef.current
    if (!scrollContainer) return

    let scrollPosition = 0
    const scroll = () => {
      scrollPosition += 0.5
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }
      scrollContainer.scrollLeft = scrollPosition
    }

    const intervalId = setInterval(scroll, 20)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0e12] text-white">
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e12] via-[#0f1519] to-[#0a0e12]" />

        {/* Multiple animated grids for depth */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(67, 229, 201, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(67, 229, 201, 0.15) 1px, transparent 1px)`,
            backgroundSize: "10px 10px",
            animation: "gridMove 20s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(67, 229, 201, 0.1) 8px, transparent 8px), linear-gradient(90deg, rgba(67, 229, 201, 0.1) 8px, transparent 8px)`,
            backgroundSize: "300px 300px",
            animation: "gridMove 30s linear infinite reverse",
          }}
        />

        {/* Enhanced glowing orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(67,229,201,0.2),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(67,229,201,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(67,229,201,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(45,212,191,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(45,212,191,0.08),transparent_50%)]" />

        {/* Floating particles - increased count */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-[#43e5c9]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        {/* Geometric shapes floating in background */}
        <div
          className="absolute left-10 top-20 h-32 w-32 rounded-full border border-[#43e5c9]/10 opacity-30"
          style={{ animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute right-20 top-40 h-24 w-24 rotate-45 border border-[#43e5c9]/10 opacity-20"
          style={{ animation: "float 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute bottom-32 left-1/4 h-40 w-40 rounded-full border border-[#2dd4bf]/10 opacity-25"
          style={{ animation: "float 12s ease-in-out infinite 1s" }}
        />
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(450px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(450px) rotate(-360deg); }
        }
        @keyframes orbitReverse {
          0% { transform: rotate(0deg) translateX(400px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(400px) rotate(360deg); }
        }
        @keyframes orbitSlow {
          0% { transform: rotate(0deg) translateX(500px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(500px) rotate(-360deg); }
        }
        @keyframes orbitTablet {
          0% { transform: rotate(0deg) translateX(350px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(350px) rotate(-360deg); }
        }
        @keyframes orbitReverseTablet {
          0% { transform: rotate(0deg) translateX(300px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(300px) rotate(360deg); }
        }
        @keyframes orbitSlowTablet {
          0% { transform: rotate(0deg) translateX(400px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(400px) rotate(-360deg); }
        }
        @keyframes orbitMobile {
          0% { transform: rotate(0deg) translateX(220px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(220px) rotate(-360deg); }
        }
        @keyframes orbitReverseMobile {
          0% { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(180px) rotate(360deg); }
        }
        @keyframes orbitSlowMobile {
          0% { transform: rotate(0deg) translateX(260px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(260px) rotate(-360deg); }
        }
        
        /* Added tech button animations for rotating borders and effects */
        @keyframes rotateBorder {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <div className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 py-12 text-center md:py-20">
          <div className="mb-8 flex justify-center md:mb-12">
            <div className="relative">
              {/* Orbital rings container - positioned behind the image */}
              <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
                {/* Desktop orbital rings - increased radius for larger image */}
                <div className="hidden lg:block">
                  <div style={{ animation: "orbitSlow 8s linear infinite" }}>
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbit 6s linear infinite" }}>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#2dd4bf] to-transparent shadow-lg shadow-[#2dd4bf]/50" />
                  </div>

                  <div style={{ animation: "orbitReverse 4s linear infinite" }}>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbit 5s linear infinite", animationDelay: "1s" }}>
                    <div className="h-2.5 w-2.5 rounded-full bg-[#43e5c9] opacity-60" />
                  </div>
                  <div style={{ animation: "orbitReverse 7s linear infinite", animationDelay: "2s" }}>
                    <div className="h-2.5 w-2.5 rounded-full bg-[#2dd4bf] opacity-60" />
                  </div>
                  <div style={{ animation: "orbitSlow 9s linear infinite", animationDelay: "3s" }}>
                    <div className="h-2 w-2 rounded-full bg-[#43e5c9] opacity-50" />
                  </div>
                </div>

                {/* Tablet orbital rings - medium radius */}
                <div className="hidden md:block lg:hidden">
                  <div style={{ animation: "orbitSlowTablet 8s linear infinite" }}>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbitTablet 6s linear infinite" }}>
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#2dd4bf] to-transparent shadow-lg shadow-[#2dd4bf]/50" />
                  </div>

                  <div style={{ animation: "orbitReverseTablet 4s linear infinite" }}>
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbitTablet 5s linear infinite", animationDelay: "1s" }}>
                    <div className="h-2 w-2 rounded-full bg-[#43e5c9] opacity-60" />
                  </div>
                  <div style={{ animation: "orbitReverseTablet 7s linear infinite", animationDelay: "2s" }}>
                    <div className="h-2 w-2 rounded-full bg-[#2dd4bf] opacity-60" />
                  </div>
                </div>

                {/* Mobile orbital rings - smaller radius */}
                <div className="md:hidden">
                  <div style={{ animation: "orbitSlowMobile 8s linear infinite" }}>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbitMobile 6s linear infinite" }}>
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#2dd4bf] to-transparent shadow-lg shadow-[#2dd4bf]/50" />
                  </div>

                  <div style={{ animation: "orbitReverseMobile 4s linear infinite" }}>
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#43e5c9] to-transparent shadow-lg shadow-[#43e5c9]/50" />
                  </div>

                  <div style={{ animation: "orbitMobile 5s linear infinite", animationDelay: "1s" }}>
                    <div className="h-2 w-2 rounded-full bg-[#43e5c9] opacity-60" />
                  </div>
                  <div style={{ animation: "orbitReverseMobile 7s linear infinite", animationDelay: "2s" }}>
                    <div className="h-2 w-2 rounded-full bg-[#2dd4bf] opacity-60" />
                  </div>
                </div>
              </div>

              {/* Cat image - dramatically increased size to be the main focal point */}
              <div className="relative z-10">
                <img
                  src="/images/design-mode/Hypurr(1).png"
                  alt="Hyperliquid 中文社区吉祥物"
                  className="relative h-[280px] w-[280px] object-contain drop-shadow-2xl sm:h-[380px] sm:w-[380px] md:h-[480px] md:w-[480px] lg:h-[550px] lg:w-[550px]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-[#43e5c9] to-white bg-clip-text text-transparent">
              Hyperliquid 中文信息中心
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#bfeee2] md:text-xl">
            专为华语社区打造的Hyperliquid 生态系统信息枢纽
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="tech-button group relative overflow-hidden rounded-xl
                         inline-flex h-12 w-[180px] items-center justify-center
                         text-[15px] font-semibold text-white transition-all"
            >
              {/* Rotating border lines */}
              <div className="absolute inset-0 z-10" style={{ animation: "rotateBorder 4s linear infinite" }}>
                <div className="absolute left-0 top-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-[#43e5c9] to-transparent" />
                <div className="absolute right-0 top-0 h-1/3 w-[2px] bg-gradient-to-b from-transparent via-[#43e5c9] to-transparent" />
                <div className="absolute bottom-0 right-0 h-[2px] w-1/3 bg-gradient-to-l from-transparent via-[#43e5c9] to-transparent" />
                <div className="absolute bottom-0 left-0 h-1/3 w-[2px] bg-gradient-to-t from-transparent via-[#43e5c9] to-transparent" />
              </div>

              {/* Corner accents */}
              <div className="absolute left-0 top-0 z-10 h-3 w-3 border-l-2 border-t-2 border-[#43e5c9]" />
              <div className="absolute right-0 top-0 z-10 h-3 w-3 border-r-2 border-t-2 border-[#43e5c9]" />
              <div className="absolute bottom-0 left-0 z-10 h-3 w-3 border-b-2 border-l-2 border-[#43e5c9]" />
              <div className="absolute bottom-0 right-0 z-10 h-3 w-3 border-b-2 border-r-2 border-[#43e5c9]" />

              {/* Scanning line effect */}
              <div className="absolute inset-0 z-10 overflow-hidden">
                <div
                  className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#43e5c9] to-transparent opacity-50"
                  style={{ animation: "scan-line 3s ease-in-out infinite" }}
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#43e5c9]/20 to-[#2dd4bf]/20 opacity-0 transition-opacity group-hover:opacity-100" />

              <span className="relative z-30 flex items-center gap-2">
                <span className="drop-shadow-[0_0_8px_rgba(67,229,201,0.8)]">HYPE Only</span>
                <img
                  src="https://hyperfoundation.org/landing/blob_green.gif"
                  alt=""
                  className="h-5 w-5 object-contain"
                />
              </span>

              {/* Multiple shadow layers for depth */}
              <div className="absolute inset-0 -z-10 rounded-xl bg-[#0a0e12] shadow-[0_0_20px_rgba(67,229,201,0.3),0_0_40px_rgba(67,229,201,0.2),0_0_60px_rgba(67,229,201,0.1)] transition-all group-hover:shadow-[0_0_30px_rgba(67,229,201,0.5),0_0_60px_rgba(67,229,201,0.3),0_0_90px_rgba(67,229,201,0.2)]" />
            </Link>

            <a
              href="https://t.me/chinesehyperliquid"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl border border-[#43e5c9]/30 bg-[#0f1519]/50 inline-flex h-12 w-[180px] items-center justify-center text-[15px] font-semibold text-[#43e5c9] backdrop-blur-sm transition-all hover:border-[#43e5c9]/50 hover:bg-[#0f1519]/80`}
            >
              加入社群
            </a>
          </div>
        </section>
        
        {/* <section className="border-t border-[#1a2329] bg-[#0a0e12]/50 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-4 text-center text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#43e5c9] to-[#2dd4bf] bg-clip-text text-transparent">
                关于我们
              </span>
            </h2>

            <p className="mx-auto mb-12 max-w-2xl text-center text-lg leading-relaxed text-[#bfeee2]">
              中文让彼此更近。让 HyperEVM 的每个项目，都能被看见。
            </p>

            <div className="relative overflow-hidden">
              <div ref={teamScrollRef} className="flex gap-6 overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
                {[...socialLinks, ...socialLinks].map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-w-[280px] flex-col items-center gap-4 rounded-2xl border border-[#1a2329] bg-[#0f1519]/50 p-6 backdrop-blur-sm transition-all hover:border-[#43e5c9]/50 hover:bg-[#0f1519]/80"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-[#43e5c9]/20 blur-xl transition-all group-hover:bg-[#43e5c9]/30" />
                      <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-[#43e5c9]/30 transition-all group-hover:ring-[#43e5c9]/50">
                        <img
                          src={social.icon || "/placeholder.svg"}
                          alt={social.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold transition-colors group-hover:text-[#43e5c9]">
                        {social.name}
                      </h3>
                      <p className="text-sm text-[#43e5c9]">贡献者</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Footer */}
        <footer className="border-t border-[#1a2329] bg-[#0a0e12]/80 py-8 text-center backdrop-blur-sm">
          <p className="text-sm text-[#96fce4]">
            © {new Date().getFullYear()} Hyperliquid 中文社区 · All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  )
}
