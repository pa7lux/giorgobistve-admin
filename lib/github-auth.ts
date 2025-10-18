import { Octokit } from 'octokit'

export interface ContributorCheckResult {
  isAuthorized: boolean
  isInContributors: boolean
  hasWriteAccess: boolean
  login: string
}

export async function checkContributorAccess(accessToken: string): Promise<ContributorCheckResult> {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!

  const octokit = new Octokit({
    auth: accessToken,
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

  return {
    isAuthorized,
    isInContributors,
    hasWriteAccess,
    login
  }
}
