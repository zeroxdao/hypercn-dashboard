'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010807]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">500</h1>
        <p className="text-[#43e5c9] mb-8">服务器内部错误</p>
        <button 
          onClick={reset}
          className="px-4 py-2 bg-[#43e5c9] text-[#010807] rounded-lg hover:bg-[#2da691] transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  )
}