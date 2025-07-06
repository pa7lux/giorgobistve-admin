'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button, Card, Flex, Heading, Text, Avatar } from '@radix-ui/themes'
import { ExitIcon, PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { LyricsEditor } from './LyricsEditor'
import { LyricsForm } from './LyricsForm'

interface LyricsFile {
  name: string
  path: string
  sha: string
}

interface Song {
  id: string
  title: string
  titleLatin: string
  description: string
  file: string
}

interface LyricsData {
  files: LyricsFile[]
  index: {
    songs: Song[]
  }
  sha: string
}

export function AdminPanel() {
  const { data: session } = useSession()
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)


  useEffect(() => {
    fetchLyrics()
  }, [])

  const fetchLyrics = async () => {
    try {
      const response = await fetch('/api/github/lyrics')
      const data = await response.json()
      setLyrics(data)
    } catch (error) {
      console.error('Error fetching lyrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (filename: string) => {
    setEditingFile(filename)
    setCreatingNew(false)
  }

  const handleCreate = () => {
    setCreatingNew(true)
    setEditingFile(null)
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return

    try {
      const response = await fetch(`/api/github/lyrics/${filename}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchLyrics()
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleSave = async () => {
    await fetchLyrics()
    setEditingFile(null)
    setCreatingNew(false)
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lyrics...</p>
        </div>
      </div>
    )
  }

  if (editingFile) {
    return (
      <LyricsEditor
        filename={editingFile}
        onSave={handleSave}
        onCancel={() => setEditingFile(null)}
      />
    )
  }

  if (creatingNew) {
    return (
      <LyricsForm
        onSave={handleSave}
        onCancel={() => setCreatingNew(false)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Flex justify="between" align="center" className="mb-4">
          <div>
            <Heading size="6" className="mb-2">
              Giorgobistve Admin Panel
            </Heading>
            <Text size="2" color="gray">
              Manage Georgian lyrics and songs
            </Text>
          </div>
          <Flex align="center" gap="4">
            <Avatar
              src={session?.user?.image || ''}
              fallback={session?.user?.name?.charAt(0) || 'U'}
              size="2"
            />
            <Text size="2">{session?.user?.name}</Text>
            <Button
              variant="outline"
              size="2"
              onClick={() => signOut()}
            >
              <ExitIcon />
              Sign out
            </Button>
          </Flex>
        </Flex>

        <Flex justify="between" align="center" className="mb-6">
          <Button
            size="3"
            onClick={handleCreate}
          >
            <PlusIcon />
            Create New Song
          </Button>
        </Flex>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lyrics?.index.songs.map((song) => (
          <Card key={song.id} className="p-4">
            <div className="mb-4 grid grid-cols-1 gap-1">
              <Heading size="4" className="mb-2">
                {song.titleLatin}
              </Heading>
              <Text size="1" color="gray" className="mb-3">
                {song.title}
              </Text>
              <Text size="1" color="gray">
                {song.description}
              </Text>
            </div>
            <Flex justify="between" align="center">
              <Text size="1" color="gray">
                {song.file}
              </Text>
              <Flex gap="2">
                <Button
                  size="1"
                  variant="outline"
                  onClick={() => handleEdit(song.file)}
                >
                  <Pencil1Icon />
                </Button>
                <Button
                  size="1"
                  variant="outline"
                  color="red"
                  onClick={() => handleDelete(song.file)}
                >
                  <TrashIcon />
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}
      </div>

      {lyrics?.index.songs.length === 0 && (
        <Card className="p-8 text-center">
          <Text size="3" color="gray">
            No songs found. Create your first song to get started.
          </Text>
        </Card>
      )}
    </div>
  )
} 