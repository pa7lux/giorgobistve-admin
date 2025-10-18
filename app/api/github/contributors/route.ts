import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkContributorAccess } from '@/lib/github-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await checkContributorAccess(session.accessToken)

    return NextResponse.json({ 
      isContributor: result.isAuthorized,
      // Optional debug info (remove in production if not needed)
      debug: process.env.NODE_ENV === 'development' ? result : undefined
    })
  } catch (error) {
    console.error('Error checking authorization:', error)
    return NextResponse.json({ error: 'Failed to check authorization' }, { status: 500 })
  }
} 