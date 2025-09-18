import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Octokit } from 'octokit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const owner = process.env.GITHUB_OWNER!
    const repo = process.env.GITHUB_REPO!

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // 1) Get the authenticated user's real GitHub login
    const { data: me } = await octokit.rest.users.getAuthenticated()
    const login = me.login

    // 2) Check contributors list (commit authors)
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 100,
      anon: 'false',
    })
    const isInContributors = contributors.some((c: any) => c.login === login)

    // 3) If not in contributors, check if user has write/admin/maintain permissions
    let hasWriteAccess = false
    if (!isInContributors) {
      try {
        const { data: repoData } = await octokit.rest.repos.get({ owner, repo })
        const permissions = repoData.permissions as any
        hasWriteAccess = Boolean(permissions?.push || permissions?.admin || permissions?.maintain)
      } catch (permError) {
        console.error('Error checking repository permissions:', permError)
        // If we can't check permissions, fall back to checking collaborators list
        try {
          const { data: collaborators } = await octokit.rest.repos.listCollaborators({
            owner,
            repo,
            per_page: 100,
          })
          hasWriteAccess = collaborators.some((collab: any) => 
            collab.login === login && 
            ['write', 'admin', 'maintain'].includes(collab.permissions?.permission || '')
          )
        } catch (collabError) {
          console.error('Error checking collaborators:', collabError)
        }
      }
    }

    const isAuthorized = isInContributors || hasWriteAccess

    return NextResponse.json({ 
      isContributor: isAuthorized,
      // Optional debug info (remove in production if not needed)
      debug: process.env.NODE_ENV === 'development' ? {
        login,
        isInContributors,
        hasWriteAccess,
        isAuthorized
      } : undefined
    })
  } catch (error) {
    console.error('Error checking authorization:', error)
    return NextResponse.json({ error: 'Failed to check authorization' }, { status: 500 })
  }
} 