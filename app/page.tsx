import { AuthGuard } from '@/components/auth/AuthGuard'
import { AdminPanel } from '@/components/admin/AdminPanel'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <AuthGuard>
        <AdminPanel />
      </AuthGuard>
    </main>
  )
} 