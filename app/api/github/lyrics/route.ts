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
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is authorized contributor
    const contributorCheck = await checkContributorAccess(session.accessToken)
    if (!contributorCheck.isAuthorized) {
      return NextResponse.json({ error: 'Access denied. You must be a contributor to access this resource.' }, { status: 403 })
    }

    const { filename, content, metadata } = await request.json()

    const octokit = new Octokit({
      auth: session.accessToken,
    })

    // Create the file
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `${LYRICS_PATH}/${filename}`,
      message: `Add ${filename}`,
      content: Buffer.from(content).toString('base64'),
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

    indexContent.songs.push({
      id: metadata.id,
      title: metadata.title,
      titleLatin: metadata.titleLatin,
      description: metadata.description,
      file: filename,
    })

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: INDEX_PATH,
      message: `Update index.json for ${filename}`,
      content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString('base64'),
      sha: (indexFile as any).sha,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
  }
} 