import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkContributorAccess } from '@/lib/github-auth'
import { Octokit } from 'octokit'

const LYRICS_PATH = 'public/lyrics'
const INDEX_PATH = 'public/lyrics/index.json'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    const { data: file } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${params.filename}`,
    })

    const content = Buffer.from((file as any).content, 'base64').toString()

    return NextResponse.json({ 
      content, 
      sha: (file as any).sha 
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    console.log(`PUT /api/github/lyrics/${params.filename} - Starting file update...`)
    
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      console.log('PUT /api/github/lyrics - No session or access token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('PUT /api/github/lyrics - Session found, checking contributor access...')

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      console.log('PUT /api/github/lyrics - User not authorized:', contributorCheck)
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    console.log('PUT /api/github/lyrics - User authorized, parsing request...')

    const { content, sha } = await request.json()
    
    console.log(`PUT /api/github/lyrics - Request data:`, {
      filename: params.filename,
      contentLength: content?.length,
      sha: sha?.substring(0, 8) + '...'
    })

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    console.log('PUT /api/github/lyrics - Updating file in GitHub...')

    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${params.filename}`,
      message: `Update ${params.filename}`,
      content: Buffer.from(content).toString('base64'),
      sha,
    })

    console.log('PUT /api/github/lyrics - File updated successfully:', result.data.commit.sha)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating file:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json({ 
      error: 'Failed to update file', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // Get file SHA
    const { data: file } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${params.filename}`,
    })

    // Delete the file
    await octokit.rest.repos.deleteFile({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${params.filename}`,
      message: `Delete ${params.filename}`,
      sha: (file as any).sha,
    })

    // Update index.json
    const { data: indexFile } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
    })

    const indexContent = JSON.parse(
      Buffer.from((indexFile as any).content, 'base64').toString()
    )

    indexContent.songs = indexContent.songs.filter(
      (song: any) => song.file !== params.filename
    )

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
      message: `Update index.json - remove ${params.filename}`,
      content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString('base64'),
      sha: (indexFile as any).sha,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
} 