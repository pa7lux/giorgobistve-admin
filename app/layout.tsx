import './globals.css'
import { Inter } from 'next/font/google'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Giorgobistve Admin',
  description: 'Admin panel for managing Georgian lyrics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Theme>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </Theme>
        </AuthProvider>
      </body>
    </html>
  )
} 