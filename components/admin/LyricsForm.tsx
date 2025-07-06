'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import { Button, Card, Flex, Heading, TextArea, Tabs, Box } from '@radix-ui/themes'
import { Bold, Italic, List, Heading1, Heading2, Heading3, Code } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'

// Simple markdown to HTML converter - treats HTML as plain text and preserves exact formatting
const markdownToHtml = (markdown: string): string => {
  // Escape HTML tags so they show as plain text
  let result = markdown
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Now do basic markdown conversions
  result = result
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists - numbered (basic)
    .replace(/^\d+\.\s+(.*$)/gm, '<li>$1</li>')
    // Lists - bullet (basic)
    .replace(/^[-*+]\s+(.*$)/gm, '<li>$1</li>')
    // Split into paragraphs by double newlines
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => {
      // If it's a header, don't wrap in <p>
      if (paragraph.match(/^<h[1-6]/)) {
        return paragraph
      }
      // Convert single newlines within paragraphs to <br>
      const content = paragraph.replace(/\n/g, '<br>')
      return `<p>${content}</p>`
    })
    .join('')
  
  return result
}

// Simple HTML to markdown converter - preserves exact formatting
const htmlToMarkdown = (html: string): string => {
  // Convert HTML entities back to plain text
  let result = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  
  // Extract and preserve HTML blocks that should remain as-is
  const preservedHtml: string[] = []
  result = result.replace(/<iframe[\s\S]*?<\/iframe>|<[^>]+\/>/g, (match) => {
    preservedHtml.push(match)
    return `__PRESERVE_HTML_${preservedHtml.length - 1}__`
  })
  
  // Handle TipTap's complex HTML structure more robustly
  // First, let's handle nested elements by processing from inside out
  
  // Convert line breaks first
  result = result.replace(/<br[^>]*>/g, '\n')
  
  // Convert bold and italic (handle nested cases)
  result = result.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, '**$1**')
  result = result.replace(/<em[^>]*>([\s\S]*?)<\/em>/g, '*$1*')
  
  // Convert headers
  result = result.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '# $1\n\n')
  result = result.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '## $1\n\n')
  result = result.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '### $1\n\n')
  
  // Convert list items
  result = result.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '- $1')
  
  // Convert paragraphs to double newlines
  result = result.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, '$1\n\n')
  
  // Remove all remaining HTML tags (but preserved HTML is already extracted)
  result = result.replace(/<[^>]*>/g, '')
  
  // Restore preserved HTML blocks
  preservedHtml.forEach((htmlBlock, index) => {
    result = result.replace(`__PRESERVE_HTML_${index}__`, htmlBlock)
  })
  
  // Clean up whitespace
  result = result
    .replace(/\n\n\n+/g, '\n\n')  // Remove triple+ newlines
    .replace(/^\n+/, '')          // Remove leading newlines
    .replace(/\n+$/, '')          // Remove trailing newlines
    .trim()
  
  return result
}

interface LyricsFormProps {
  onSave: () => void
  onCancel: () => void
}

export function LyricsForm({ onSave, onCancel }: LyricsFormProps) {
  const [metadata, setMetadata] = useState({
    id: '',
    title: '',
    titleLatin: '',
    description: '',
  })
  const [markdownContent, setMarkdownContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'wysiwyg' | 'markdown'>('wysiwyg')
  const [editorUpdateKey, setEditorUpdateKey] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlock,
    ],
    immediatelyRender: false,
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none p-4 min-h-96',
      },
      handleKeyDown: (view, event) => {
        // Cmd+Enter or Ctrl+Enter creates a line break
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
          event.preventDefault()
          view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.hardBreak.create()))
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      setEditorUpdateKey(prev => prev + 1)
    },
  })

  const handleMetadataChange = (field: string, value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const handleModeChange = (newMode: 'wysiwyg' | 'markdown') => {
    if (mode === newMode) return
    
    if (mode === 'wysiwyg' && editor) {
      // When switching from WYSIWYG to markdown, get the content and convert basic HTML back
      const htmlContent = editor.getHTML()
      const markdown = htmlToMarkdown(htmlContent)
      setMarkdownContent(markdown)
    } else if (newMode === 'wysiwyg' && editor) {
      // When switching from markdown to WYSIWYG, convert markdown to HTML
      const htmlContent = markdownToHtml(markdownContent)
      editor.commands.setContent(htmlContent, false, {
        preserveWhitespace: 'full',
      })
    }
    
    setMode(newMode)
  }

  const handleSave = async () => {
    if (!metadata.id || !metadata.title) {
      alert('Please fill in the required fields (ID and Title)')
      return
    }

    setSaving(true)
    try {
      // Get the current content based on mode
      let finalContent = markdownContent
      
      if (mode === 'wysiwyg' && editor) {
        const htmlContent = editor.getHTML()
        finalContent = htmlToMarkdown(htmlContent)
      }
      
      const filename = `${metadata.id}.md`
      
      const response = await fetch('/api/github/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          content: finalContent,
          metadata: {
            ...metadata,
            file: filename,
          },
        }),
      })

      if (response.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error creating file:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const setHeading = (level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run()
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run()

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Flex justify="between" align="center" className="mb-4">
          <Heading size="6">Create New Song</Heading>
          <Flex gap="3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </Flex>
        </Flex>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Heading size="4" className="mb-4">Song Metadata</Heading>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID (required) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.id}
                onChange={(e) => handleMetadataChange('id', e.target.value)}
                placeholder="e.g., alilo"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (required) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                placeholder="e.g., ალილო"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (Latin)
              </label>
              <input
                type="text"
                value={metadata.titleLatin}
                onChange={(e) => handleMetadataChange('titleLatin', e.target.value)}
                placeholder="e.g., Alilo"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <TextArea
                value={metadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                placeholder="e.g., Traditional Georgian Christmas carol"
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Heading size="4" className="mb-4">Song Content</Heading>
          <Tabs.Root defaultValue="wysiwyg" value={mode} onValueChange={(value) => handleModeChange(value as 'wysiwyg' | 'markdown')}>
            <Tabs.List className="mb-4">
              <Tabs.Trigger value="wysiwyg">WYSIWYG Editor</Tabs.Trigger>
              <Tabs.Trigger value="markdown">Markdown</Tabs.Trigger>
              <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="wysiwyg">
              <div className="mb-4">
                <Flex gap="2" className="p-2 border-b">
                  <Button
                    size="1"
                    variant={editor?.isActive('bold') ? 'solid' : 'outline'}
                    color={editor?.isActive('bold') ? 'blue' : undefined}
                    onClick={toggleBold}
                  >
                    <Bold size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('italic') ? 'solid' : 'outline'}
                    color={editor?.isActive('italic') ? 'blue' : undefined}
                    onClick={toggleItalic}
                  >
                    <Italic size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('heading', { level: 1 }) ? 'solid' : 'outline'}
                    color={editor?.isActive('heading', { level: 1 }) ? 'blue' : undefined}
                    onClick={() => setHeading(1)}
                  >
                    <Heading1 size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('heading', { level: 2 }) ? 'solid' : 'outline'}
                    color={editor?.isActive('heading', { level: 2 }) ? 'blue' : undefined}
                    onClick={() => setHeading(2)}
                  >
                    <Heading2 size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('heading', { level: 3 }) ? 'solid' : 'outline'}
                    color={editor?.isActive('heading', { level: 3 }) ? 'blue' : undefined}
                    onClick={() => setHeading(3)}
                  >
                    <Heading3 size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('bulletList') ? 'solid' : 'outline'}
                    color={editor?.isActive('bulletList') ? 'blue' : undefined}
                    onClick={toggleBulletList}
                  >
                    <List size={16} />
                  </Button>
                  <Button
                    size="1"
                    variant={editor?.isActive('codeBlock') ? 'solid' : 'outline'}
                    color={editor?.isActive('codeBlock') ? 'blue' : undefined}
                    onClick={toggleCodeBlock}
                  >
                    <Code size={16} />
                  </Button>
                </Flex>
              </div>
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong>Info:</strong> HTML content (like iframes) will be displayed as plain text in both WYSIWYG and Markdown modes. Use Preview to see how HTML will be rendered.<br/>
                <strong>WYSIWYG shortcuts:</strong> Enter = new paragraph, Cmd+Enter = line break
              </div>
              <EditorContent editor={editor} className="prose max-w-none" />
            </Tabs.Content>

            <Tabs.Content value="markdown">
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-full h-96 p-4 border rounded-md font-mono text-sm"
                placeholder="Write your song content here..."
              />
            </Tabs.Content>

            <Tabs.Content value="preview">
              <Box className="p-6 border rounded-md min-h-96 bg-white">
                <div className="preview-content max-w-none">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      h1: ({children}) => <h1 className="text-3xl font-bold mb-4 mt-6 text-gray-900 border-b border-gray-200 pb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-2xl font-semibold mb-3 mt-5 text-gray-800">{children}</h2>,
                      h3: ({children}) => <h3 className="text-xl font-medium mb-2 mt-4 text-gray-700">{children}</h3>,
                      p: ({children}) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                      ul: ({children}) => <ul className="mb-4 pl-6 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="mb-4 pl-6 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-gray-700">{children}</li>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600">{children}</blockquote>,
                      code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
                      pre: ({children}) => <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">{children}</pre>,
                      br: () => <br />,
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Card>
      </div>
    </div>
  )
} 