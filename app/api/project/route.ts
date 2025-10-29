import { NextResponse } from "next/server"
import redis from "@/lib/redis"

const KEY = "projects"

// Declare defaultList type for use in redis.get
type defaultList = any[]

export async function GET() {
  // 从 Redis 读取项目数组；若没有则返回空数组
  const list = (await redis.get<defaultList>(KEY)) ?? []
  return NextResponse.json(list, { status: 200 })
}

// 约束：不改变现有字段结构；仅透传 body.project
type Project = Record<string, any>

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item: Project = body?.project

    if (!item || typeof item !== "object") {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 })
    }

    const current = (await redis.get<defaultList>(KEY)) ?? []
    current.push(item)

    // 覆盖写回
    await redis.set(KEY, current)

    return NextResponse.json(current, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 })
  }
}
