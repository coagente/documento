'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface SimpleEditorProps {
  onContentChange?: (content: string) => void
  initialContent?: string
  documentTitle?: string
  onTitleChange?: (title: string) => void
}

interface DocumentStats {
  words: number
  characters: number
  charactersNoSpaces: number
  paragraphs: number
  readingTime: number
}

// Función para calcular estadísticas
function calculateStats(text: string): DocumentStats {
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const words = cleanText ? cleanText.split(' ').filter(word => word.length > 0) : []
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0)
  
  return {
    words: words.length,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    paragraphs: paragraphs.length,
    readingTime: Math.ceil(words.length / 200)
  }
}

// Función para convertir Markdown a DOCX
function convertMarkdownToDocx(markdown: string, title: string = 'Documento'): Document {
  const lines = markdown.split('\n')
  const children: any[] = []
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()
    
    if (!line) {
      i++
      continue
    }
    
    // Encabezados
    if (line.startsWith('# ')) {
      children.push(new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240 }
      }))
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      }))
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({
        text: line.substring(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 160 }
      }))
    }
    // Citas
    else if (line.startsWith('> ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line.substring(2),
          italics: true,
          color: "666666"
        })],
        indent: { left: 720 },
        spacing: { after: 200 }
      }))
    }
    // Listas
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${line.substring(2)}` })],
        indent: { left: 360 },
        spacing: { after: 120 }
      }))
    }
    // Listas numeradas
    else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/)
      if (match) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `${match[1]}. ${match[2]}` })],
          indent: { left: 360 },
          spacing: { after: 120 }
        }))
      }
    }
    // Bloques de código
    else if (line.startsWith('```')) {
      i++
      let codeContent = ''
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent += lines[i] + '\n'
        i++
      }
      children.push(new Paragraph({
        children: [new TextRun({
          text: codeContent.trim(),
          font: 'Consolas',
          size: 20,
          color: "333333"
        })],
        spacing: { after: 200 }
      }))
    }
    // Párrafos normales
    else {
      const runs = parseInlineFormatting(line)
      children.push(new Paragraph({
        children: runs,
        spacing: { after: 120 }
      }))
    }
    
    i++
  }

  const stats = calculateStats(markdown)

  return new Document({
    sections: [{
      properties: {},
      children: children.length > 0 ? children : [
        new Paragraph({
          children: [new TextRun({
            text: "Documento vacío - creado con ple.ad writer",
            color: "999999",
            italics: true
          })]
        })
      ]
    }],
    creator: "ple.ad writer",
    title: title,
    description: `Documento generado por ple.ad writer | ${stats.words} palabras | ${stats.characters} caracteres`,
    subject: "Documento Markdown"
  })
}

// Función para parsear formato inline en Markdown
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = []
  
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g)
  
  parts.forEach(part => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true
      }))
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true
      }))
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: 'Consolas',
        size: 18,
        color: "333333"
      }))
    } else if (part.trim()) {
      runs.push(new TextRun({ text: part }))
    }
  })
  
  return runs.length > 0 ? runs : [new TextRun({ text: text })]
}

export default function SimpleEditor({ 
  onContentChange, 
  initialContent = '',
  documentTitle = 'Nuevo Documento',
  onTitleChange
}: SimpleEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(documentTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const stats = calculateStats(content)

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onContentChange?.(newContent)
  }, [onContentChange])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    onTitleChange?.(newTitle)
  }, [onTitleChange])

  // Funciones de formato
  const insertAtCursor = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end)
    
    setContent(newContent)
    onContentChange?.(newContent)
    
    // Restaurar el foco y posición del cursor
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [content, onContentChange])

  const formatHeading = useCallback((level: number) => {
    const prefix = '#'.repeat(level) + ' '
    insertAtCursor(prefix, '\n\n')
  }, [insertAtCursor])

  const formatBold = useCallback(() => {
    insertAtCursor('**', '**')
  }, [insertAtCursor])

  const formatItalic = useCallback(() => {
    insertAtCursor('*', '*')
  }, [insertAtCursor])

  const formatCode = useCallback(() => {
    insertAtCursor('`', '`')
  }, [insertAtCursor])

  const insertQuote = useCallback(() => {
    insertAtCursor('> ', '\n\n')
  }, [insertAtCursor])

  const insertList = useCallback(() => {
    insertAtCursor('- ', '\n')
  }, [insertAtCursor])

  const insertOrderedList = useCallback(() => {
    insertAtCursor('1. ', '\n')
  }, [insertAtCursor])

  const insertCodeBlock = useCallback(() => {
    insertAtCursor('```\n', '\n```\n\n')
  }, [insertAtCursor])

  // Exportar a DOCX
  const exportToDocx = useCallback(() => {
    if (!content.trim()) {
      alert('No hay contenido para exportar')
      return
    }

    try {
      const doc = convertMarkdownToDocx(content, title)
      
      Packer.toBlob(doc).then(blob => {
        const timestamp = new Date().toISOString().slice(0, 10)
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.docx`
        saveAs(blob, fileName)
      })
    } catch (error) {
      console.error('Error al exportar DOCX:', error)
      alert('Error al exportar el documento. Por favor, inténtelo de nuevo.')
    }
  }, [content, title])

  // Exportar Markdown
  const exportMarkdown = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, title])

  // Copiar al portapapeles
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      alert('¡Contenido copiado al portapapeles!')
    }).catch(() => {
      alert('Error al copiar al portapapeles')
    })
  }, [content])

  return (
    <>
      <div className="markdown-editor">
        {/* Toolbar completo */}
        <div className="simple-toolbar">
          {/* Título del documento */}
          <div className="toolbar-section document-title-section">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false)
                  }
                }}
                className="document-title-input"
                autoFocus
                placeholder="Título del documento"
              />
            ) : (
              <button
                className="document-title-display"
                onClick={() => setIsEditingTitle(true)}
                title="Clic para editar título"
              >
                {title || 'Sin título'}
              </button>
            )}
            
            <div className="document-stats">
              <span className="stats-item">{stats.words} palabras</span>
              <span className="stats-separator">•</span>
              <span className="stats-item">{stats.characters} caracteres</span>
              {stats.readingTime > 0 && (
                <>
                  <span className="stats-separator">•</span>
                  <span className="stats-item">{stats.readingTime} min lectura</span>
                </>
              )}
            </div>
          </div>

          {/* Sección de títulos */}
          <div className="toolbar-section">
            <button
              className="simple-button"
              onClick={() => formatHeading(1)}
              title="Título Principal (H1)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h8m-8-6h12M4 18h12"/>
                <line x1="20" y1="4" x2="20" y2="20"/>
              </svg>
            </button>
            
            <button
              className="simple-button"
              onClick={() => formatHeading(2)}
              title="Subtítulo (H2)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h8m-8-6h8M4 18h8"/>
                <path d="M15 18h6m-3-3v6"/>
              </svg>
            </button>
            
            <button
              className="simple-button"
              onClick={() => formatHeading(3)}
              title="Título Menor (H3)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h8m-8-6h6M4 18h6"/>
                <path d="M15 14c0 1.5 1.5 3 3 3s3-1.5 3-3-1.5-3-3-3-3 1.5-3 3z"/>
              </svg>
            </button>
          </div>

          {/* Sección de formato */}
          <div className="toolbar-section">
            <button
              className="simple-button"
              onClick={formatBold}
              title="Texto en Negrita (Ctrl+B)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              </svg>
            </button>
            
            <button
              className="simple-button"
              onClick={formatItalic}
              title="Texto en Cursiva (Ctrl+I)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="4" x2="10" y2="4"/>
                <line x1="14" y1="20" x2="5" y2="20"/>
                <line x1="15" y1="4" x2="9" y2="20"/>
              </svg>
            </button>

            <button
              className="simple-button"
              onClick={formatCode}
              title="Código inline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
            </button>

            <button
              className="simple-button"
              onClick={insertQuote}
              title="Insertar Cita"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </button>
          </div>

          {/* Sección de listas */}
          <div className="toolbar-section">
            <button
              className="simple-button"
              onClick={insertList}
              title="Lista con Viñetas"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            
            <button
              className="simple-button"
              onClick={insertOrderedList}
              title="Lista Numerada"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="10" y1="6" x2="21" y2="6"/>
                <line x1="10" y1="12" x2="21" y2="12"/>
                <line x1="10" y1="18" x2="21" y2="18"/>
                <path d="M4 6h1v4"/>
                <path d="M4 10h2"/>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
              </svg>
            </button>

            <button
              className="simple-button"
              onClick={insertCodeBlock}
              title="Bloque de Código"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </button>
          </div>

          {/* Sección de exportación */}
          <div className="toolbar-section export-section">
            <button
              className="simple-button export-button"
              onClick={() => setShowMarkdown(true)}
              title="Ver Código Markdown"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
              MD
            </button>
            
            <button
              className="simple-button primary-button"
              onClick={exportToDocx}
              title="Descargar como DOCX"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              DOCX
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <div className="editor-wrapper">
          <textarea
            ref={textareaRef}
            className="editor-input"
            value={content}
            onChange={handleContentChange}
            placeholder="Empiece a escribir su documento aquí..."
            style={{
              flex: 1,
              padding: 'var(--space-5)',
              outline: 'none',
              fontFamily: 'Inter, monospace',
              fontSize: 'var(--font-base)',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              resize: 'none',
              overflowY: 'auto',
              minHeight: '400px'
            }}
            onKeyDown={(e) => {
              // Shortcuts de teclado
              if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                  case 'b':
                    e.preventDefault()
                    formatBold()
                    break
                  case 'i':
                    e.preventDefault()
                    formatItalic()
                    break
                  case '`':
                    e.preventDefault()
                    formatCode()
                    break
                }
              }
            }}
          />
        </div>
      </div>

      {/* Modal de Markdown */}
      {showMarkdown && (
        <div className="markdown-modal-overlay" onClick={() => setShowMarkdown(false)}>
          <div className="markdown-modal" onClick={e => e.stopPropagation()}>
            <div className="markdown-modal-header">
              <h3>Código Markdown Raw</h3>
              <div className="modal-stats">
                <span>{stats.words} palabras • {stats.characters} caracteres</span>
              </div>
              <button 
                className="close-button"
                onClick={() => setShowMarkdown(false)}
              >
                ✕
              </button>
            </div>
            <div className="markdown-modal-content">
              <pre>{content || '# El documento está vacío\n\nEmpiece a escribir para ver el código Markdown.'}</pre>
            </div>
            <div className="markdown-modal-footer">
              <button 
                className="copy-button"
                onClick={copyToClipboard}
              >
                📋 Copiar Código
              </button>
              <button 
                className="export-md-button"
                onClick={exportMarkdown}
              >
                💾 Descargar .MD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 