import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Octokit } from 'octokit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
    })

    const userLogin = session.user?.email?.split('@')[0] || session.user?.name
    const isContributor = contributors.some(
      (contributor: any) => contributor.login === userLogin || contributor.login === session.user?.name
    )

    return NextResponse.json({ isContributor, contributors })
  } catch (error) {
    console.error('Error checking contributors:', error)
    return NextResponse.json({ error: 'Failed to check contributors' }, { status: 500 })
  }
} 