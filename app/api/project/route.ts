import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const GET = async () => {
  const keys = await redis.keys('project:*')
  const items = await Promise.all(keys.map((k) => redis.get(k)))
  return NextResponse.json({ items })
}

export const POST = async (req: Request) => {
  const body = await req.json()
  // 约定 key：project:<id>
  await redis.set(`project:${body.id}`, body)
  return NextResponse.json({ ok: true })
}
