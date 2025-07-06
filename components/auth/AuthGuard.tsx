'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@radix-ui/themes'
import { GitHubLogoIcon } from '@radix-ui/react-icons'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const [isContributor, setIsContributor] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkContributor()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])

  const checkContributor = async () => {
    try {
      const response = await fetch('/api/github/contributors')
      const data = await response.json()
      setIsContributor(data.isContributor)
    } catch (error) {
      console.error('Error checking contributor status:', error)
      setIsContributor(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Giorgobistve Admin
            </h1>
            <p className="text-gray-600 mb-6">
              Sign in with your GitHub account to access the admin panel
            </p>
            <Button
              size="3"
              className="w-full"
              onClick={() => signIn('github')}
            >
              <GitHubLogoIcon className="mr-2" />
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isContributor === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be a contributor to the giorgobistve repository to access this admin panel.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Contact the admin</strong><br />
                Please reach out to the repository owner (@pa7lux) to request contributor access.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 