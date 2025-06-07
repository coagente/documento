'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface FullscreenEditorProps {
  onContentChange?: (content: string) => void
  initialContent?: string
  documentTitle?: string
  onTitleChange?: (title: string) => void
}

interface DocumentStats {
  words: number
  characters: number
  paragraphs: number
  readingTime: number
}

function calculateStats(text: string): DocumentStats {
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const words = cleanText ? cleanText.split(' ').filter(word => word.length > 0) : []
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0)
  
  return {
    words: words.length,
    characters: text.length,
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
    } else if (line.startsWith('> ')) {
      children.push(new Paragraph({
        children: [new TextRun({
          text: line.substring(2),
          italics: true,
          color: "666666"
        })],
        indent: { left: 720 },
        spacing: { after: 200 }
      }))
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${line.substring(2)}` })],
        indent: { left: 360 },
        spacing: { after: 120 }
      }))
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)/)
      if (match) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `${match[1]}. ${match[2]}` })],
          indent: { left: 360 },
          spacing: { after: 120 }
        }))
      }
    } else if (line.startsWith('```')) {
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
    } else {
      // Parsear texto con formato inline
      const runs = parseInlineFormatting(line)
      children.push(new Paragraph({
        children: runs,
        spacing: { after: 120 }
      }))
    }
    
    i++
  }

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
    description: `Documento generado por ple.ad writer`,
    subject: "Documento Markdown"
  })
}

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

export default function FullscreenEditor({ 
  onContentChange, 
  initialContent = '',
  documentTitle = 'Nuevo Documento',
  onTitleChange
}: FullscreenEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [title, setTitle] = useState(documentTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [chatMessage, setChatMessage] = useState('')
  const [chatStatus, setChatStatus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Crear contenido inicial si está vacío
  useEffect(() => {
    if (!content && !initialContent && title === 'Nuevo Documento') {
      const welcomeContent = `# ${title}

¡Bienvenido a ple.ad writer! 

Este es tu nuevo documento. Puedes empezar a escribir inmediatamente usando Markdown.

## Características principales:

- **Vista dual**: Edita Markdown y ve el resultado en tiempo real
- **Chat integrado**: Usa Enter para mejorar tu documento con IA
- **Exportación múltiple**: DOCX, Markdown y PDF
- **Estadísticas**: Palabras, caracteres y tiempo de lectura

### ¿Cómo usar el chat?

1. Escribe tu solicitud en la barra inferior
2. Presiona **Enter** para enviar
3. La IA procesará y aplicará los cambios automáticamente

### Exportación

Puedes exportar tu documento en tres formatos:
- **DOCX**: Para Microsoft Word
- **MD**: Archivo Markdown original 
- **PDF**: Para compartir o imprimir

---

*¡Comienza a escribir y experimenta la edición inteligente!*`

      setContent(welcomeContent)
      onContentChange?.(welcomeContent)
    }
  }, [content, initialContent, title, onContentChange])

  // Sincronización
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent)
    }
  }, [initialContent])

  useEffect(() => {
    if (documentTitle !== title) {
      setTitle(documentTitle)
    }
  }, [documentTitle])

  const stats = calculateStats(content)

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onContentChange?.(newContent)
  }, [onContentChange])

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    onTitleChange?.(newTitle)
    setIsEditingTitle(false)
  }, [onTitleChange])

  // Funciones de exportación
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
      alert('Error al exportar el documento.')
    }
  }, [content, title])

  const exportMarkdown = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [content, title])

  const exportToPdf = useCallback(async () => {
    if (!previewRef.current || !content.trim()) {
      alert('No hay contenido para exportar o la vista previa no está disponible')
      return
    }

    try {
      // Importación dinámica para evitar errores de SSR
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const timestamp = new Date().toISOString().slice(0, 10)
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      alert('Error al generar el PDF')
    }
  }, [content, title])

  // Chat integrado
  const handleChatSubmit = async () => {
    const trimmedMessage = chatMessage.trim()
    if (!trimmedMessage || isProcessing) return

    setIsProcessing(true)
    setChatStatus('Procesando...')
    setChatMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          documentContent: content,
          documentTitle: title,
          action: 'edit'
        })
      })

      const data = await response.json()

      if (data.success && data.response) {
        const extractedMarkdown = extractMarkdown(data.response)
        if (extractedMarkdown) {
          setContent(extractedMarkdown)
          onContentChange?.(extractedMarkdown)
          setChatStatus('✅ Documento actualizado')
          
          setTimeout(() => setChatStatus(''), 3000)
        } else {
          setChatStatus('❌ No se pudo aplicar la edición')
        }
      } else {
        setChatStatus(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error: any) {
      console.error('Error al procesar chat:', error)
      setChatStatus('❌ Error de conexión')
    } finally {
      setIsProcessing(false)
    }
  }

  const extractMarkdown = (response: string): string | null => {
    const patterns = [
      /```markdown\n([\s\S]*?)\n```/,
      /```\n([\s\S]*?)\n```/,
      /```([\s\S]*?)```/,
      /(?:^|\n)(# [\s\S]*?)(?:\n\n|\n$|$)/
    ]
    
    for (const pattern of patterns) {
      const match = response.match(pattern)
      if (match && match[1]?.trim()) {
        return match[1].trim()
      }
    }
    
    const lines = response.split('\n')
    let markdownContent = ''
    let foundMarkdown = false
    
    for (const line of lines) {
      if (line.trim().startsWith('#') || foundMarkdown) {
        foundMarkdown = true
        markdownContent += line + '\n'
      }
    }
    
    return markdownContent.trim() || null
  }

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSubmit()
    }
  }

  const handleChatInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatMessage(e.target.value)
    
    // Auto-resize
    const textarea = e.target
    textarea.style.height = '44px'
    const scrollHeight = Math.min(textarea.scrollHeight, 120)
    textarea.style.height = scrollHeight + 'px'
  }

  return (
    <div className="fullscreen-editor">
      {/* Header con info del archivo */}
      <div className="editor-header-full">
        <div className="working-file-info">
          <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <div className="file-details">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleTitleChange(title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleChange(title)
                  }
                }}
                autoFocus
                style={{
                  fontSize: 'var(--font-lg)',
                  fontWeight: '600',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            ) : (
              <h2 onClick={() => setIsEditingTitle(true)}>
                {title}
              </h2>
            )}
            <div className="file-stats">
              {stats.words} palabras • {stats.characters} caracteres • {stats.readingTime} min lectura
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button 
            className="action-btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {showPreview ? 'Solo Editor' : 'Vista Dual'}
          </button>
          
          <div className="export-group">
            <button className="export-btn docx" onClick={exportToDocx} title="Exportar como DOCX">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              DOCX
            </button>
            
            <button className="export-btn md" onClick={exportMarkdown} title="Exportar como Markdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16,18 22,12 16,6"/>
                <polyline points="8,6 2,12 8,18"/>
              </svg>
              MD
            </button>
            
            <button className="export-btn pdf" onClick={exportToPdf} title="Exportar como PDF">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Editor principal */}
      <div className="editor-main">
        {/* Panel de edición */}
        <div className="editor-pane">
          <div className="editor-pane-header">
            <div className="pane-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editor Markdown
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            className="markdown-input"
            value={content}
            onChange={handleContentChange}
            placeholder="# Mi Documento

Escribe aquí tu contenido en Markdown...

## Subtítulo

- Lista de elementos
- Otro elemento

**Texto en negrita** y *texto en cursiva*

> Una cita inspiradora

```
Código de ejemplo
```"
          />
        </div>

        {/* Panel de vista previa */}
        {showPreview && (
          <div className="editor-pane">
            <div className="editor-pane-header">
              <div className="pane-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Vista Previa
              </div>
            </div>
            
            <div className="markdown-preview" ref={previewRef}>
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  La vista previa aparecerá aquí cuando escribas...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat optimizado con botón interno */}
      <div className="integrated-chat-optimized">
        <div className="chat-header-optimized">
          <div className="chat-title-optimized">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Asistente de Edición IA</span>
          </div>
          {chatStatus && (
            <div className={`chat-status-optimized ${
              isProcessing ? 'processing' : 
              chatStatus.includes('✅') ? 'success' : 
              chatStatus.includes('❌') ? 'error' : ''
            }`}>
              {chatStatus}
            </div>
          )}
        </div>
        
        <div className="chat-input-container-optimized">
          <div className="chat-input-wrapper">
            <textarea
              ref={chatInputRef}
              className="chat-input-optimized"
              value={chatMessage}
              onChange={handleChatInputChange}
              onKeyDown={handleChatKeyDown}
              placeholder="Describe cómo mejorar el documento... (Enter para enviar)"
              disabled={isProcessing}
              rows={2}
            />
            
            <button 
              className="chat-send-btn-internal"
              onClick={handleChatSubmit}
              disabled={!chatMessage.trim() || isProcessing}
              title="Enviar (Enter)"
            >
              {isProcessing ? (
                <div className="spinner-internal"></div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                </svg>
              )}
            </button>
          </div>
          
          <div className="chat-hint-optimized">
            <span>💡 Enter para enviar • Shift+Enter para nueva línea</span>
          </div>
        </div>
      </div>
    </div>
  )
} 