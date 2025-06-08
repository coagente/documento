'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'
import * as jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface ChangeHistoryItem {
  id: string
  timestamp: Date
  action: string
  preview: string
  content: string
}

interface ChatParticle {
  id: string
  x: number
  y: number
  velocity: { x: number; y: number }
  life: number
  color: string
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
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [particles, setParticles] = useState<ChatParticle[]>([])
  const [characterCount, setCharacterCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  
  // Estados para preview de cambios
  const [pendingChanges, setPendingChanges] = useState<{
    newContent: string;
    originalRequest: string;
    changes: Array<{
      lineNumber: number;
      oldLine: string;
      newLine: string;
      type: 'added' | 'removed' | 'modified';
    }>;
  } | null>(null)
  const [showChangesPreview, setShowChangesPreview] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const chatButtonRef = useRef<HTMLButtonElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)

  // Estadísticas del documento
  const stats = {
    words: content.split(/\s+/).filter(word => word.length > 0).length,
    characters: content.length,
    charactersNoSpaces: content.replace(/\s/g, '').length,
    readingTime: Math.max(1, Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200))
  }

  // Nuevos estados para números de línea
  const [lineNumbers, setLineNumbers] = useState<number[]>([1])
  const [scrollSync, setScrollSync] = useState({ top: 0 })

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
      addToHistory('Documento creado', welcomeContent)
    }
  }, [content, initialContent, title, onContentChange])

  // Sincronización
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent)
    }
  }, [initialContent])

  // Actualizar contador de caracteres del chat
  useEffect(() => {
    setCharacterCount(chatMessage.length)
  }, [chatMessage])

  // Función mejorada para calcular números de línea que asegure cobertura completa
  const updateLineNumbers = useCallback(() => {
    // Usar timeout para asegurar que el DOM esté actualizado
    setTimeout(() => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight) || 18;
      
      // Calcular líneas de contenido real
      const contentLines = Math.max(content.split('\n').length, 1);
      
      // Calcular líneas visibles en el viewport del textarea
      const textareaHeight = textarea.clientHeight || 400; // fallback si no hay altura
      const visibleLines = Math.ceil(textareaHeight / lineHeight);
      
      // Calcular líneas totales necesarias con múltiples criterios
      const totalLines = Math.max(
        contentLines + 50,        // Contenido + buffer muy generoso para scroll
        visibleLines + 50,        // Líneas visibles + buffer para scroll completo
        150                       // Mínimo absoluto para asegurar cobertura total
      );
      
      // Generar array de números de línea
      const newLineNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);
      setLineNumbers(newLineNumbers);
    }, 10);
  }, [content]);

  // Función para agregar al historial
  const addToHistory = useCallback((action: string, newContent: string) => {
    const newItem: ChangeHistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action,
      preview: newContent.slice(0, 100) + (newContent.length > 100 ? '...' : ''),
      content: newContent
    }
    
    setChangeHistory(prev => [newItem, ...prev.slice(0, 19)]) // Mantener solo los últimos 20
  }, [])

  // Inicializar números de línea cuando el contenido cambia
  useEffect(() => {
    updateLineNumbers();
  }, [content, updateLineNumbers])

  // Calcular líneas iniciales cuando el componente se monta
  useEffect(() => {
    const timer = setTimeout(() => {
      updateLineNumbers();
    }, 200); // Delay para asegurar que el DOM esté completamente renderizado

    return () => clearTimeout(timer);
  }, [updateLineNumbers])

  // Efecto adicional para forzar actualización cuando el textarea esté listo
  useEffect(() => {
    const checkAndUpdate = () => {
      if (textareaRef.current && textareaRef.current.clientHeight > 0) {
        updateLineNumbers();
      } else {
        // Si el textarea no está listo, intentar de nuevo
        setTimeout(checkAndUpdate, 50);
      }
    };
    
    // Ejecutar inmediatamente y como backup
    checkAndUpdate();
    
    // También actualizar cuando cambie el tamaño de viewport
    const resizeObserver = new ResizeObserver(() => {
      updateLineNumbers();
    });
    
    if (textareaRef.current) {
      resizeObserver.observe(textareaRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [])

  // Recalcular líneas cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      updateLineNumbers();
    };

    window.addEventListener('resize', handleResize);
    
    // Calcular inicialmente después de un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateLineNumbers])

  // Manejar cambios en el contenido
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onContentChange?.(newContent)
    
    // Actualizar números de línea usando el cálculo inteligente
    setTimeout(() => {
      updateLineNumbers();
    }, 0)
    
    // Agregar al historial
    if (newContent !== content) {
      addToHistory('Edición manual', newContent)
    }
  }, [content, onContentChange, addToHistory])

  // Manejar cambios en el título
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setIsEditingTitle(false)
    onTitleChange?.(newTitle)
  }

  // Función para crear partículas
  const createParticles = (x: number, y: number) => {
    const newParticles: ChatParticle[] = []
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4 - 2
        },
        life: 1,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)]
      })
    }
    setParticles(newParticles)
    
    // Limpiar partículas después de 2 segundos
    setTimeout(() => setParticles([]), 2000)
  }

  // Función para mostrar feedback
  const showFeedbackMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedbackMessage(message)
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      setFeedbackMessage('')
    }, 3000)
  }

  // Función para generar diff entre contenido actual y propuesto
  const generateDiff = (originalContent: string, newContent: string) => {
    const originalLines = originalContent.split('\n')
    const newLines = newContent.split('\n')
    const changes: Array<{
      lineNumber: number;
      oldLine: string;
      newLine: string;
      type: 'added' | 'removed' | 'modified';
    }> = []

    const maxLines = Math.max(originalLines.length, newLines.length)
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = originalLines[i] || ''
      const newLine = newLines[i] || ''
      
      if (oldLine !== newLine) {
        if (!oldLine && newLine) {
          changes.push({
            lineNumber: i + 1,
            oldLine: '',
            newLine: newLine,
            type: 'added'
          })
        } else if (oldLine && !newLine) {
          changes.push({
            lineNumber: i + 1,
            oldLine: oldLine,
            newLine: '',
            type: 'removed'
          })
        } else {
          changes.push({
            lineNumber: i + 1,
            oldLine: oldLine,
            newLine: newLine,
            type: 'modified'
          })
        }
      }
    }
    
    return changes
  }

  // Función para aprobar cambios
  const approveChanges = () => {
    if (pendingChanges) {
      setContent(pendingChanges.newContent)
      onContentChange?.(pendingChanges.newContent)
      addToHistory(`IA: ${pendingChanges.originalRequest}`, pendingChanges.newContent)
      showFeedbackMessage('¡Cambios aplicados con éxito!', 'success')
      
      // Limpiar preview
      setPendingChanges(null)
      setShowChangesPreview(false)
    }
  }

  // Función para rechazar cambios
  const rejectChanges = () => {
    setPendingChanges(null)
    setShowChangesPreview(false)
    showFeedbackMessage('Cambios descartados', 'info')
  }

  // Chat integrado con mejoras
  const handleChatSubmit = async () => {
    const trimmedMessage = chatMessage.trim()
    if (!trimmedMessage || isProcessing) return

    // Crear partículas desde el botón
    if (chatButtonRef.current) {
      const rect = chatButtonRef.current.getBoundingClientRect()
      createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }

    setIsProcessing(true)
    setChatStatus('🤖 Procesando...')
    setChatMessage('')
    
    // Feedback inmediato
    showFeedbackMessage('Enviando solicitud a la IA...', 'info')

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
          // Generar diff en lugar de aplicar directamente
          const changes = generateDiff(content, extractedMarkdown)
          
          if (changes.length > 0) {
            // Mostrar preview de cambios
            setPendingChanges({
              newContent: extractedMarkdown,
              originalRequest: trimmedMessage,
              changes: changes
            })
            setShowChangesPreview(true)
            setChatStatus(`📋 ${changes.length} cambios propuestos`)
            showFeedbackMessage(`Se proponen ${changes.length} cambios. Revisa y aprueba.`, 'info')
            
            setTimeout(() => setChatStatus(''), 5000)
          } else {
            setChatStatus('ℹ️ No se requieren cambios')
            showFeedbackMessage('El documento ya está optimizado', 'info')
          }
        } else {
          setChatStatus('❌ No se pudo aplicar la edición')
          showFeedbackMessage('No se pudo procesar la respuesta', 'error')
        }
      } else {
        setChatStatus(`❌ Error: ${data.error || 'Error desconocido'}`)
        showFeedbackMessage(`Error: ${data.error || 'Error desconocido'}`, 'error')
      }
    } catch (error: any) {
      console.error('Error al procesar chat:', error)
      setChatStatus('❌ Error de conexión')
      showFeedbackMessage('Error de conexión con el servidor', 'error')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setChatStatus(''), 5000)
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

  // Función para revertir cambio del historial
  const revertToChange = (historyItem: ChangeHistoryItem) => {
    setContent(historyItem.content)
    onContentChange?.(historyItem.content)
    showFeedbackMessage(`Revertido a: ${historyItem.action}`, 'success')
    setShowHistory(false)
  }

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

  // Sincronización de scroll entre números de línea y textarea
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setScrollSync({ top: target.scrollTop })
  }

  return (
    <div className="fullscreen-editor-enhanced">
      {/* Canvas para partículas */}
      <canvas
        ref={particleCanvasRef}
        className="particle-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />

      {/* Feedback flotante */}
      {showFeedback && (
        <div className="feedback-overlay">
          <div className="feedback-message">
            {feedbackMessage}
          </div>
        </div>
      )}

      {/* Header con info del archivo */}
      <div className="editor-header-enhanced">
        <div className="working-file-info-enhanced">
          <svg className="file-icon-enhanced" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          <div className="file-details-enhanced">
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
                className="title-input-enhanced"
              />
            ) : (
              <h2 className="document-title-enhanced" onClick={() => setIsEditingTitle(true)}>
                {title}
              </h2>
            )}
            <div className="file-stats-enhanced">
              <span className="stat-item">{stats.words} palabras</span>
              <span className="stat-separator">•</span>
              <span className="stat-item">{stats.characters} caracteres</span>
              <span className="stat-separator">•</span>
              <span className="stat-item">{stats.readingTime} min lectura</span>
            </div>
          </div>
        </div>

        {/* Acciones del editor */}
        <div className="editor-actions-enhanced">
          {/* Historial de cambios */}
          <button 
            className="history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
            title="Historial de cambios"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
            <span className="history-count">{changeHistory.length}</span>
          </button>

          {/* Exportación triple */}
          <div className="export-group-enhanced">
            <button className="export-btn-enhanced docx" onClick={exportToDocx}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              DOCX
            </button>
            <button className="export-btn-enhanced md" onClick={exportMarkdown}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              MD
            </button>
            <button className="export-btn-enhanced pdf" onClick={exportToPdf}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Historial lateral */}
      {showHistory && (
        <div className="history-sidebar">
          <div className="history-header">
            <h3>Historial de Cambios</h3>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="history-list">
            {changeHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-header">
                  <span className="history-action">{item.action}</span>
                  <span className="history-time">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="history-preview">{item.preview}</div>
                <button 
                  className="history-revert"
                  onClick={() => revertToChange(item)}
                >
                  Revertir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor principal */}
      <div className="editor-main-enhanced">
        {/* Panel de edición */}
        <div className="editor-pane-enhanced">
          <div className="editor-pane-header-enhanced">
            <div className="pane-title-enhanced">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editor Markdown
            </div>
          </div>
          
          {/* Contenedor del editor con números de línea */}
          <div className="editor-with-line-numbers">
            {/* Números de línea */}
            <div 
              className="line-numbers" 
              style={{ transform: `translateY(-${scrollSync.top}px)` }}
            >
              {lineNumbers.map((num) => (
                <div key={num} className="line-number">
                  {num}
                </div>
              ))}
            </div>
            
            {/* Editor de texto */}
            <textarea
              ref={textareaRef}
              className="markdown-input-enhanced with-line-numbers"
              value={content}
              onChange={handleContentChange}
              onScroll={handleEditorScroll}
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
        </div>

        {/* Panel de vista previa */}
        {showPreview && (
          <div className="editor-pane-enhanced preview-pane">
            <div className="editor-pane-header-enhanced">
              <div className="pane-title-enhanced">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                Vista Previa
              </div>
            </div>
            
            <div className="markdown-preview-enhanced" ref={previewRef}>
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <div className="preview-placeholder">
                  La vista previa aparecerá aquí cuando escribas...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat optimizado y sofisticado */}
      <div className="integrated-chat-sophisticated">
        <div className="chat-header-sophisticated">
          <div className="chat-title-sophisticated">
            <div className="chat-icon-sophisticated">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle className="chat-dot" cx="12" cy="11" r="1"/>
                <circle className="chat-dot" cx="16" cy="11" r="1"/>
                <circle className="chat-dot" cx="8" cy="11" r="1"/>
              </svg>
            </div>
            <span>Asistente de Edición IA</span>
          </div>
          {chatStatus && (
            <div className={`chat-status-sophisticated ${
              isProcessing ? 'processing' : 
              chatStatus.includes('✅') ? 'success' : 
              chatStatus.includes('❌') ? 'error' : ''
            }`}>
              {chatStatus}
            </div>
          )}
        </div>
        
        <div className="chat-input-container-sophisticated">
          <div className="chat-input-wrapper-sophisticated">
            <textarea
              ref={chatInputRef}
              className="chat-input-sophisticated"
              value={chatMessage}
              onChange={handleChatInputChange}
              onKeyDown={handleChatKeyDown}
              placeholder="Describe cómo mejorar el documento... (Enter para enviar)"
              disabled={isProcessing}
              rows={2}
            />
            
            {/* Contador de caracteres orbital */}
            <div className="character-counter-orbital">
              <svg className="counter-ring" viewBox="0 0 36 36">
                <path
                  className="counter-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="counter-progress"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{
                    strokeDasharray: `${Math.min(characterCount / 500 * 100, 100)}, 100`
                  }}
                />
              </svg>
              <span className="counter-text">{characterCount}</span>
            </div>
            
            {/* Botón flecha simple */}
            <button 
              ref={chatButtonRef}
              className="chat-send-btn-orbital"
              onClick={handleChatSubmit}
              disabled={!chatMessage.trim() || isProcessing}
              title="Enviar (Enter)"
            >
              {isProcessing ? (
                <div className="spinner-simple" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 19V5"/>
                  <path d="M5 12l7-7 7 7"/>
                </svg>
              )}
            </button>
          </div>
          
          <div className="chat-hint-sophisticated">
            <span>💡 Enter para enviar • Shift+Enter para nueva línea • Comandos: /reformatear /resumir /expandir</span>
          </div>
        </div>
      </div>

      {/* Preview de cambios propuestos */}
      {showChangesPreview && pendingChanges && (
        <div className="changes-preview-overlay">
          <div className="changes-preview-modal">
            <div className="changes-preview-header">
              <h3>Cambios Propuestos</h3>
              <p>Solicitud: <strong>"{pendingChanges.originalRequest}"</strong></p>
              <p className="changes-count">{pendingChanges.changes.length} líneas modificadas</p>
            </div>
            
            <div className="changes-preview-content">
              {pendingChanges.changes.map((change, index) => (
                <div key={index} className={`change-item change-${change.type}`}>
                  <div className="change-line-number">L{change.lineNumber}</div>
                  <div className="change-details">
                    {change.type === 'modified' && (
                      <>
                        <div className="old-line">
                          <span className="change-indicator">-</span>
                          <span>{change.oldLine || '(línea vacía)'}</span>
                        </div>
                        <div className="new-line">
                          <span className="change-indicator">+</span>
                          <span>{change.newLine || '(línea vacía)'}</span>
                        </div>
                      </>
                    )}
                    {change.type === 'added' && (
                      <div className="new-line">
                        <span className="change-indicator">+</span>
                        <span>{change.newLine}</span>
                      </div>
                    )}
                    {change.type === 'removed' && (
                      <div className="old-line">
                        <span className="change-indicator">-</span>
                        <span>{change.oldLine}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="changes-preview-actions">
              <button 
                className="approve-changes-btn"
                onClick={approveChanges}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Aprobar Cambios
              </button>
              
              <button 
                className="reject-changes-btn"
                onClick={rejectChanges}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 