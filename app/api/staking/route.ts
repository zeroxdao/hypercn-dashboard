import { NextResponse } from "next/server"
import redis from "@/lib/redis"

const KEY = "staking_projects"

type StakingProject = {
  id: string
  name: string
  logo?: string
  netAPY: number
  tvlUSD: number
  updatedAt: string
  link: string
}

// 读列表（保证返回数组）
async function readList(): Promise<StakingProject[]> {
  if (!redis) {
    throw new Error("Storage not configured")
  }
  const data = (await redis.get<StakingProject[] | unknown>(KEY)) ?? []
  return Array.isArray(data) ? (data as StakingProject[]) : []
}

// 写列表（全量覆盖）
async function writeList(arr: StakingProject[]) {
  if (!redis) throw new Error("Storage not configured")
  await redis.set(KEY, arr)
}

// ---- GET /api/staking ----
export async function GET() {
  try {
    const list = await readList()
    return NextResponse.json(list, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
  }
}

// ---- POST /api/staking  新增 ----
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const item: StakingProject | undefined = body?.project
    if (!item || typeof item !== "object" || !item.id || !item.name) {
      return NextResponse.json({ error: "Invalid staking project" }, { status: 400 })
    }

    const list = await readList()
    const exists = list.some((x) => x.id === item.id)
    const next = exists ? list : [item, ...list]
    if (!exists) await writeList(next)
    return NextResponse.json(next, { status: 200 })
  } catch (e) {
    if ((e as Error).message.includes("Storage not configured")) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }
    return NextResponse.json({ error: "Bad Request" }, { status: 400 })
  }
}

// ---- PUT /api/staking  更新 ----
export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const item: StakingProject | undefined = body?.project
    if (!item || typeof item !== "object" || !item.id || !item.name) {
      return NextResponse.json({ error: "Invalid staking project" }, { status: 400 })
    }

    const list = await readList()
    const next = list.some((x) => x.id === item.id)
      ? list.map((x) => (x.id === item.id ? { ...x, ...item } : x))
      : [item, ...list]
    await writeList(next)
    return NextResponse.json(next, { status: 200 })
  } catch (e) {
    if ((e as Error).message.includes("Storage not configured")) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }
    return NextResponse.json({ error: "Bad Request" }, { status: 400 })
  }
}

// ---- DELETE /api/staking  删除 ----
export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const id: string | undefined = body?.id
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    const list = await readList()
    const next = list.filter((x) => x.id !== id)
    await writeList(next)
    return NextResponse.json(next, { status: 200 })
  } catch (e) {
    if ((e as Error).message.includes("Storage not configured")) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
    }
    return NextResponse.json({ error: "Bad Request" }, { status: 400 })
  }
}
