"use client"

import { useEffect, useMemo, useState } from "react"

type Project = {
  id: string
  name: string
  logo?: string
  categories: string[]
  website?: string
  social?: string
  description?: string
}

const STORAGE_KEY = "hl_admin_projects"

const CATEGORY_OPTIONS = [
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

const MAX_DESC = 120

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function AdminPage() {
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [website, setWebsite] = useState("")
  const [social, setSocial] = useState("")
  const [description, setDescription] = useState("")
  const [editId, setEditId] = useState<string | null>(null)

  const [list, setList] = useState<Project[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)

  // 统一设置列表 & localStorage
  const setListAndPersist = (next: Project[]) => {
    setList(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  // 初始化：优先服务端，失败则回退本地
  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/project", { cache: "no-store" })
        if (!res.ok) throw new Error("load from server failed")
        const serverList: Project[] = await res.json()
        if (Array.isArray(serverList)) {
          setListAndPersist(serverList)
        } else {
          throw new Error("server returned non-array")
        }
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) setList(JSON.parse(raw))
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  const onToggleCategory = (c: string) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const resetForm = () => {
    setName("")
    setLogo("")
    setCategories([])
    setWebsite("")
    setSocial("")
    setDescription("")
    setEditId(null)
  }

  const onSave = async () => {
    if (!name.trim()) return alert("请输入项目名")
    if (description.length > MAX_DESC) return alert(`简介不能超过 ${MAX_DESC} 字符`)

    const project: Project = {
      id: editId ?? uid(),
      name: name.trim(),
      logo: logo.trim(),
      categories,
      website: website.trim(),
      social: social.trim(),
      description: description.trim(),
    }

    // 本地先行更新（更快 UI 反馈）
    const optimistic = editId
      ? list.map((x) => (x.id === project.id ? project : x))
      : [project, ...list.filter((x) => x.id !== project.id)]
    setListAndPersist(optimistic)

    // 同步到服务端
    try {
      const res = await fetch("/api/project", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "保存失败")
      }
      const serverList: Project[] = await res.json()
      if (Array.isArray(serverList)) {
        setListAndPersist(serverList) // 以后端为准
      }
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
    setCategories(p.categories ?? [])
    setWebsite(p.website ?? "")
    setSocial(p.social ?? "")
    setDescription(p.description ?? "")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onRemove = async (id: string) => {
    if (!confirm("确定删除该项目？")) return

    // 本地先删
    const optimistic = list.filter((x) => x.id !== id)
    setListAndPersist(optimistic)

    try {
      const res = await fetch("/api/project", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "删除失败")
      }
      const serverList: Project[] = await res.json()
      if (Array.isArray(serverList)) {
        setListAndPersist(serverList)
      }
    } catch (e) {
      console.error(e)
      alert("删除失败，请检查服务端日志")
      // 失败回滚（可选）
      setListAndPersist(list)
    }
  }

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase()
    if (!k) return list
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        (p.website ?? "").toLowerCase().includes(k) ||
        (p.social ?? "").toLowerCase().includes(k) ||
        (p.categories ?? []).some((c) => c.toLowerCase().includes(k)),
    )
  }, [list, q])

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-[#010807] px-4 py-6 text-white">
      <h1 className="mb-4 text-xl font-semibold">Admin 面板</h1>

      <div className="rounded-xl border border-[#133136] bg-[#0b1416] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">项目名 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="例如：ApStation"
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

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-[#96fce4]">项目分类（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => {
                const active = categories.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onToggleCategory(c)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-[#43e5c9] text-[#010807]"
                        : "border border-[#133136] bg-[#0f1b1d] text-white hover:bg-[#132224]"
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">官网</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-[#96fce4]">社交</label>
            <input
              value={social}
              onChange={(e) => setSocial(e.target.value)}
              className="w-full rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="https://x.com/xxx 或其它"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-[#96fce4]">简介</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 outline-none"
              placeholder="一句话介绍"
            />
            <div
              className={`mt-1 text-right text-xs ${
                description.length === MAX_DESC ? "text-red-400" : "text-[#96fce4]"
              }`}
            >
              {description.length}/{MAX_DESC}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onSave}
            className="rounded-lg bg-[#43e5c9] px-4 py-2 text-sm font-medium text-[#010807] hover:opacity-90"
          >
            {editId ? "保存修改" : "保存项目"}
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
                const res = await fetch("/api/project", { cache: "no-store" })
                if (!res.ok) throw new Error("refresh failed")
                const data: Project[] = await res.json()
                if (Array.isArray(data)) setListAndPersist(data)
              } finally {
                setLoading(false)
              }
            }}
            className="rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-4 py-2 text-sm hover:bg-[#132224]"
          >
            刷新（服务端）
          </button>
          {loading && <span className="text-xs text-[#96fce4]">加载中...</span>}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          已保存的项目 <span className="text-[#96fce4]">({list.length})</span>
        </h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索项目/官网/分类"
          className="w-64 rounded-lg border border-[#1e2c31] bg-[#0f1b1d] px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-start gap-2 rounded-xl border border-[#133136] bg-[#0b1416] p-3">
            {/* Logo */}
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-[#112224]">
              {p.logo ? <img src={p.logo || "/placeholder.svg"} alt="" className="h-full w-full object-cover" /> : null}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="truncate text-[13px] font-semibold">{p.name}</div>
              </div>

              {/* Categories */}
              <div className="mt-1 flex flex-wrap gap-1">
                {(p.categories ?? []).map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-[#2a4b45] bg-[#0f1b1d] px-2 py-[2px] text-[10px] text-[#96fce4]"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="mt-1 truncate text-[11px] text-[#96fce4]">
                {p.website ? (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {p.website}
                  </a>
                ) : null}
                {p.social ? (
                  <>
                    {" · "}
                    <a href={p.social} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {p.social}
                    </a>
                  </>
                ) : null}
              </div>

              {/* Description */}
              {p.description ? (
                <div className="mt-1 line-clamp-2 text-[11px] text-[#bfeee2]">{p.description}</div>
              ) : null}

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
            暂无项目
          </div>
        )}
      </div>
    </div>
  )
}
