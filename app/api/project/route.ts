import { NextResponse } from "next/server"
import redis from "@/lib/redis"

const KEY = "projects"

type Project = {
  id: string
  name: string
  logo?: string
  categories?: string[]
  website?: string
  social?: string
  description?: string
}

// 读列表（保证返回数组）
async function readList(): Promise<Project[]> {
  if (!redis) {
    // 构建期或未配置存储
    throw new Error("Storage not configured")
  }
  const data = (await redis.get<Project[] | unknown>(KEY)) ?? []
  return Array.isArray(data) ? (data as Project[]) : []
}

// 写列表（全量覆盖）
async function writeList(arr: Project[]) {
  if (!redis) throw new Error("Storage not configured")
  await redis.set(KEY, arr)
}

// ---- GET /api/project ----
export async function GET() {
  try {
    const list = await readList()
    return NextResponse.json(list, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 })
  }
}

// ---- POST /api/project  新增（若同 id 存在，则追加但不重复）----
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const item: Project | undefined = body?.project
    if (!item || typeof item !== "object" || !item.id || !item.name) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 })
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

// ---- PUT /api/project  更新（按 id 覆盖）----
export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const item: Project | undefined = body?.project
    if (!item || typeof item !== "object" || !item.id || !item.name) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 })
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

// ---- DELETE /api/project  删除（按 id）----
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
