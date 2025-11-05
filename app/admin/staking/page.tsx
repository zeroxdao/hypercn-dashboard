"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type StakingProject = {
  id: string
  name: string
  logo?: string
  netAPY: number
  tvlUSD: number
  updatedAt: string
  link: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function StakingAdminPage() {
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")
  const [netAPY, setNetAPY] = useState("")
  const [tvlUSD, setTvlUSD] = useState("")
  const [link, setLink] = useState("")
  const [editId, setEditId] = useState<string | null>(null)

  const [list, setList] = useState<StakingProject[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)

  // 初始化：从服务端加载
  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/staking", { cache: "no-store" })
        if (!res.ok) throw new Error("load from server failed")
        const serverList: StakingProject[] = await res.json()
        if (Array.isArray(serverList)) {
          setList(serverList)
        }
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  const resetForm = () => {
    setName("")
    setLogo("")
    setNetAPY("")
    setTvlUSD("")
    setLink("")
    setEditId(null)
  }

  const onSave = async () => {
    if (!name.trim()) return alert("请输入项目名")
    if (!netAPY.trim() || isNaN(Number(netAPY))) return alert("请输入有效的 APY 数值")
    if (!tvlUSD.trim() || isNaN(Number(tvlUSD))) return alert("请输入有效的 TVL 数值")
    if (!link.trim()) return alert("请输入质押链接")

    const project: StakingProject = {
      id: editId ?? uid(),
      name: name.trim(),
      logo: logo.trim(),
      netAPY: Number(netAPY),
      tvlUSD: Number(tvlUSD),
      updatedAt: new Date().toISOString(),
      link: link.trim(),
    }

    // 本地先行更新
    const optimistic = editId
      ? list.map((x) => (x.id === project.id ? project : x))
      : [project, ...list.filter((x) => x.id !== project.id)]
    setList(optimistic)

    // 同步到服务端
    try {
      const res = await fetch("/api/staking", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "保存失败")
      }
      const serverList: StakingProject[] = await res.json()
      if (Array.isArray(serverList)) setList(serverList)
      resetForm()
      alert("已保存到数据库")
    } catch (e) {
      console.error(e)
      alert("保存到数据库失败，请检查 Vercel 环境变量和日志")
    }
  }

  const onEdit = (id: string) => {
    const p = list.find((x) => x.id === id)
    if (!p) return
    setEditId(p.id)
    setName(p.name ?? "")
    setLogo(p.logo ?? "")
    setNetAPY(String(p.netAPY ?? ""))
    setTvlUSD(String(p.tvlUSD ?? ""))
    setLink(p.link ?? "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onRemove = async (id: string) => {
    if (!confirm("确定删除该质押项目？")) return

    // 本地先删
    const optimistic = list.filter((x) => x.id !== id)
    setList(optimistic)

    try {
      const res = await fetch("/api/staking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "删除失败")
      }
      const serverList: StakingProject[] = await res.json()
      if (Array.isArray(serverList)) setList(serverList)
    } catch (e) {
      console.error(e)
      alert("删除失败，请检查服务端日志")
      setList(list)
    }
  }

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return list
    return list.filter((p) => p.name.toLowerCase().includes(k) || (p.link ?? "").toLowerCase().includes(k))
  }, [list, q])

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-[#010807] px-4 py-6 text-white">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">质押项目管理</h1>
        <Link
          href="/admin"
          className="rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-4 py-2 text-sm hover:bg-[#132224]"
        >
          返回项目管理
        </Link>
      </div>

      <div className="rounded-xl border border-[#133136] bg-[#0b1416] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">项目名 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="例如：DeFiHub"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">Logo URL</label>
            <input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">净 APY (%) *</label>
            <input
              type="number"
              step="0.01"
              value={netAPY}
              onChange={(e) => setNetAPY(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="例如：16.7"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">TVL (USD) *</label>
            <input
              type="number"
              step="0.01"
              value={tvlUSD}
              onChange={(e) => setTvlUSD(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="例如：154000"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-[#96fce4]">质押链接 *</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onSave}
            className="rounded-lg bg-[#43e5c9] px-4 py-2 text-sm font-medium text-[#010807] hover:opacity-90"
          >
            {editId ? "保存修改" : "添加项目"}
          </button>
          {editId && (
            <button onClick={resetForm} className="rounded-lg border border-[#1e2c31] bg-transparent px-4 py-2 text-sm">
              取消编辑
            </button>
          )}
          <button
            onClick={async () => {
              try {
                setLoading(true)
                const res = await fetch("/api/staking", { cache: "no-store" })
                if (!res.ok) throw new Error("refresh failed")
                const data: StakingProject[] = await res.json()
                if (Array.isArray(data)) setList(data)
              } finally {
                setLoading(false)
              }
            }}
            className="rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-4 py-2 text-sm hover:bg-[#132224]"
          >
            刷新
          </button>
          {loading && <span className="text-xs text-[#96fce4]">加载中...</span>}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          质押项目列表 <span className="text-[#96fce4]">({list.length})</span>
        </h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索项目名/链接"
          className="w-64 rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-start gap-2 rounded-xl border border-[#133136] bg-[#0b1416] p-3">
            {/* Logo */}
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-[#112224]">
              {p.logo ? <img src={p.logo || "/placeholder.svg"} alt="" className="h-full w-full object-cover" /> : null}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{p.name}</div>

              <div className="mt-1 space-y-1 text-[11px] text-[#96fce4]">
                <div>净 APY: {p.netAPY}%</div>
                <div>TVL: ${p.tvlUSD.toLocaleString()}</div>
                <div className="truncate">
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {p.link}
                  </a>
                </div>
                <div className="text-[10px]">更新: {new Date(p.updatedAt).toLocaleString()}</div>
              </div>

              {/* Actions */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onEdit(p.id)}
                  className="rounded-md bg-[#1a2a27] px-3 py-1 text-xs hover:bg-[#213430]"
                >
                  编辑
                </button>
                <button
                  onClick={() => onRemove(p.id)}
                  className="rounded-md bg-[#3a1d22] px-3 py-1 text-xs hover:bg-[#4a2228]"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <div className="col-span-full rounded-xl border border-[#133136] bg-[#0b1416] p-6 text-sm text-[#96fce4]">
            暂无质押项目
          </div>
        )}
      </div>
    </div>
  )
}
