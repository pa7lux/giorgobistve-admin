'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button, Card, Flex, Heading, Text, Avatar, TextField } from '@radix-ui/themes'
import { ExitIcon, PlusIcon, Pencil1Icon, TrashIcon, MagnifyingGlassIcon, Cross1Icon } from '@radix-ui/react-icons'
import { LyricsEditor } from './LyricsEditor'
import { LyricsForm } from './LyricsForm'

interface LyricsFile {
  name: string
  path: string
  sha: string
  content: string
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
  const [filterTerm, setFilterTerm] = useState('')

  // Create a map of filename to content for easy lookup
  const contentMap = lyrics?.files?.reduce((map, file) => {
    map[file.name] = file.content || ''
    return map
  }, {} as Record<string, string>) || {}

  // Filter songs based on search term across all properties including content
  const filteredSongs = lyrics?.index?.songs?.filter(song => {
    if (!filterTerm) return true
    
    const searchTerm = filterTerm.toLowerCase()
    const songContent = contentMap[song.file] || ''
    
    return (
      song.id.toLowerCase().includes(searchTerm) ||
      song.title.toLowerCase().includes(searchTerm) ||
      song.titleLatin.toLowerCase().includes(searchTerm) ||
      song.description.toLowerCase().includes(searchTerm) ||
      song.file.toLowerCase().includes(searchTerm) ||
      songContent.toLowerCase().includes(searchTerm)
    )
  }) || []

  useEffect(() => {
    fetchLyrics()
  }, [])

  const fetchLyrics = async () => {
    try {
      const response = await fetch('/api/github/lyrics')
      if (response.status === 403) {
        // User is not authorized - redirect to sign out or show error
        console.error('Access denied: User is not a contributor')
        alert('Access denied. You must be a contributor to access this resource.')
        return
      }
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

      if (response.status === 403) {
        alert('Access denied. You must be a contributor to delete files.')
        return
      }

      if (response.ok) {
        await fetchLyrics()
      } else {
        const errorData = await response.json()
        alert(`Error deleting file: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file. Please try again.')
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

        {/* Filter Input */}
        <div className="mb-6">
          <Flex align="center" gap="2" className="max-w-md">
            <div className="relative flex-1">
              <TextField.Root size="3">
                <TextField.Slot>
                  <MagnifyingGlassIcon />
                </TextField.Slot>
                <TextField.Input
                  placeholder="Search titles, content, descriptions..."
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                />
              </TextField.Root>
            </div>
            {filterTerm && (
              <Button
                variant="outline"
                size="2"
                onClick={() => setFilterTerm('')}
                color="gray"
              >
                <Cross1Icon />
              </Button>
            )}
          </Flex>
          {filterTerm && (
            <Text size="2" color="gray" className="mt-2">
              Found {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} matching "{filterTerm}"
            </Text>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSongs.map((song) => (
          <Card key={song.id} className="p-4">
            <div className="grid h-full" style={{ gridTemplateRows: '1fr min-content' }}>
              <div className="mb-4">
                <Heading size="4" className="mb-2 block">
                  {song.titleLatin}
                </Heading>
                <Text size="1" color="gray" className="mb-3 block">
                  {song.title}
                </Text>
                <Text size="1" color="gray" className="mb-3 block">
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
            </div>
          </Card>
        ))}
      </div>

      {filteredSongs.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <Text size="3" color="gray">
            {filterTerm 
              ? `No songs found matching "${filterTerm}". Try a different search term.`
              : "No songs found. Create your first song to get started."
            }
          </Text>
        </Card>
      )}
    </div>
  )
} 