import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDev = process.env.NODE_ENV !== "production"

/** 只在 dev 打一次同类日志 */
export function logOnce(key: string, msg: string) {
  if (!isDev) return
  ;(globalThis as any).__LOG_KEYS ??= new Set<string>()
  const set = (globalThis as any).__LOG_KEYS as Set<string>
  if (!set.has(key)) {
    set.add(key)
    console.warn(msg)
  }
}

/** 按最小长度配对两个数组，并在 dev 提示一次长度不一致 */
export function zipByMin<T, U>(a: T[], b: U[], tag = "zip-mismatch") {
  const n = Math.min(a?.length ?? 0, b?.length ?? 0)
  if ((a?.length ?? 0) !== (b?.length ?? 0)) {
    logOnce(tag, `Array length mismatch: a(${a?.length ?? 0}) vs b(${b?.length ?? 0}), using ${n}`)
  }
  const out: Array<[T, U]> = []
  for (let i = 0; i < n; i++) out.push([a[i], b[i]])
  return out
}
