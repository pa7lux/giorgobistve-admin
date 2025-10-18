import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkContributorAccess } from '@/lib/github-auth'
import { Octokit } from 'octokit'

const LYRICS_PATH = 'public/lyrics'
const INDEX_PATH = 'public/lyrics/index.json'

export async function GET(request: NextRequest) {
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

    // Get lyrics directory contents
    const { data: contents } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: LYRICS_PATH,
    })

    // Get index.json
    const { data: indexFile } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
    })

    const indexContent = JSON.parse(
      Buffer.from((indexFile as any).content, 'base64').toString()
    )

    // Get markdown files
    const markdownFiles = Array.isArray(contents) 
      ? contents.filter((item: any) => item.name.endsWith('.md'))
      : []

    // Fetch content for each markdown file
    const filesWithContent = await Promise.all(
      markdownFiles.map(async (file: any) => {
        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner: process.env.GITHUB_OWNER!,
            repo: process.env.GITHUB_REPO!,
            path: file.path,
          })
          
          const content = Buffer.from((fileData as any).content, 'base64').toString()
          
          return {
            ...file,
            content
          }
        } catch (error) {
          console.error(`Error fetching content for ${file.name}:`, error)
          return {
            ...file,
            content: ''
          }
        }
      })
    )

    return NextResponse.json({ 
      files: filesWithContent, 
      index: indexContent,
      sha: (indexFile as any).sha 
    })
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/github/lyrics - Starting file creation...')
    
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      console.log('POST /api/github/lyrics - No session or access token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('POST /api/github/lyrics - Session found, checking contributor access...')

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      console.log('POST /api/github/lyrics - User not authorized:', contributorCheck)
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    console.log('POST /api/github/lyrics - User authorized, parsing request...')

    const { filename, content, metadata } = await request.json()
    
    console.log('POST /api/github/lyrics - Request data:', {
      filename,
      contentLength: content?.length,
      metadata
    })

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    console.log('POST /api/github/lyrics - Creating file in GitHub...')

    // Create the file
    const fileResult = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${filename}`,
      message: `Add ${filename}`,
      content: Buffer.from(content).toString('base64'),
    })

    console.log('POST /api/github/lyrics - File created successfully:', fileResult.data.commit.sha)

    // Update index.json
    console.log('POST /api/github/lyrics - Fetching index.json...')
    
    const { data: indexFile } = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
    })

    const indexContent = JSON.parse(
      Buffer.from((indexFile as any).content, 'base64').toString()
    )

    console.log('POST /api/github/lyrics - Current index.json songs count:', indexContent.songs?.length || 0)

    indexContent.songs = indexContent.songs || []
    indexContent.songs.push({
      id: metadata.id,
      title: metadata.title,
      titleLatin: metadata.titleLatin,
      description: metadata.description,
      file: filename,
    })

    console.log('POST /api/github/lyrics - Updating index.json with new song...')

    const indexResult = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
      message: `Update index.json for ${filename}`,
      content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString('base64'),
      sha: (indexFile as any).sha,
    })

    console.log('POST /api/github/lyrics - Index.json updated successfully:', indexResult.data.commit.sha)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating file:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create file', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 