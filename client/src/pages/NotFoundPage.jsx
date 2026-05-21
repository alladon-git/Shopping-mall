import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-gray-500">페이지를 찾을 수 없습니다.</p>
      <Link to="/" className="text-blue-500 underline">홈으로 돌아가기</Link>
    </div>
  )
}

export default NotFoundPage
