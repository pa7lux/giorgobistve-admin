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
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    const { content, sha } = await request.json()

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${params.filename}`,
      message: `Update ${params.filename}`,
      content: Buffer.from(content).toString('base64'),
      sha,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating file:', error)
    return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
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