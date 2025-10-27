export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010807]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-[#43e5c9] mb-8">页面未找到</p>
        <a 
          href="/" 
          className="px-4 py-2 bg-[#43e5c9] text-[#010807] rounded-lg hover:bg-[#2da691] transition-colors"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}