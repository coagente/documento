'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { $getRoot, $getSelection, $createTextNode, $createParagraphNode, EditorState } from 'lexical'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { HeadingNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { LinkNode, $createLinkNode, $isLinkNode } from '@lexical/link'
import { AutoLinkNode } from '@lexical/link'
import { QuoteNode, $createQuoteNode, $isQuoteNode } from '@lexical/rich-text'
import { CodeNode, $createCodeNode, $isCodeNode } from '@lexical/code'
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND, $isElementNode, $isTextNode } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

// Error boundary personalizado para evitar problemas de importación
function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// ============================================
// INTERFACES Y TIPOS
// ============================================

interface DocumentStats {
  words: number
  characters: number
  charactersNoSpaces: number
  paragraphs: number
  readingTime: number
}

interface DocumentInfo {
  id: string
  title: string
  content: string
  lastModified: Date
  wordCount: number
}

// ============================================
// SISTEMA DE TOOLTIPS
// ============================================

interface TooltipProps {
  text: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

function Tooltip({ text, children, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  const showTooltip = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    
    let x = rect.left + rect.width / 2
    let y = rect.top - 8
    
    if (position === 'bottom') {
      y = rect.bottom + 8
    } else if (position === 'left') {
      x = rect.left - 8
      y = rect.top + rect.height / 2
    } else if (position === 'right') {
      x = rect.right + 8
      y = rect.top + rect.height / 2
    }
    
    setCoords({ x, y })
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }, [position, delay])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div 
        ref={elementRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`tooltip show`}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: position === 'top' || position === 'bottom' 
              ? 'translateX(-50%)' 
              : position === 'left' 
                ? 'translateX(-100%) translateY(-50%)'
                : 'translateY(-50%)'
          }}
        >
          {text}
        </div>
      )}
    </>
  )
}

// ============================================
// UTILIDADES PARA ESTADÍSTICAS
// ============================================

function calculateStats(text: string): DocumentStats {
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const words = cleanText ? cleanText.split(' ').filter(word => word.length > 0) : []
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0)
  
  return {
    words: words.length,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    paragraphs: paragraphs.length,
    readingTime: Math.ceil(words.length / 200) // 200 palabras por minuto promedio
  }
}

// ============================================
// CONFIGURACIÓN Y FUNCIONES MARKDOWN
// ============================================

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    code: 'editor-text-code',
  },
  code: 'editor-code',
  link: 'editor-link',
}

// Función mejorada para convertir contenido del editor a Markdown
function convertToMarkdown(editorState: EditorState): string {
  let markdown = ''
  
  editorState.read(() => {
    const root = $getRoot()
    const children = root.getChildren()
    
    children.forEach((child: any) => {
      if ($isHeadingNode(child)) {
        const tag = child.getTag()
        const text = child.getTextContent()
        const level = tag === 'h1' ? '#' : tag === 'h2' ? '##' : '###'
        markdown += `${level} ${text}\n\n`
      } else if ($isQuoteNode(child)) {
        const text = child.getTextContent()
        markdown += `> ${text}\n\n`
      } else if ($isCodeNode(child)) {
        const text = child.getTextContent()
        markdown += `\`\`\`\n${text}\n\`\`\`\n\n`
      } else if (child.getType && child.getType() === 'list') {
        const listType = child.getListType()
        const items = child.getChildren()
        items.forEach((item: any, index: number) => {
          const text = item.getTextContent()
          if (listType === 'bullet') {
            markdown += `- ${text}\n`
          } else {
            markdown += `${index + 1}. ${text}\n`
          }
        })
        markdown += '\n'
      } else if ($isElementNode(child)) {
        const text = child.getTextContent()
        if (text.trim()) {
          // Procesar texto con formato inline
          const formattedText = processInlineFormatting(child)
          markdown += `${formattedText}\n\n`
        }
      }
    })
  })
  
  return markdown.trim()
}

// Función para procesar formato inline (bold, italic, code)
function processInlineFormatting(node: any): string {
  let text = ''
  
  if ($isTextNode(node)) {
    let nodeText = node.getTextContent()
    
    // Aplicar formato Markdown
    if (node.hasFormat('bold')) {
      nodeText = `**${nodeText}**`
    }
    if (node.hasFormat('italic')) {
      nodeText = `*${nodeText}*`
    }
    if (node.hasFormat('code')) {
      nodeText = `\`${nodeText}\``
    }
    
    return nodeText
  }
  
  if ($isElementNode(node)) {
    const children = node.getChildren()
    children.forEach((child: any) => {
      text += processInlineFormatting(child)
    })
  }
  
  return text || node.getTextContent?.() || ''
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
            text: "Documento vacío - creado con ScribeAI",
            color: "999999",
            italics: true
          })]
        })
      ]
    }],
    creator: "ScribeAI Editor",
    title: title,
    description: `Documento generado por ScribeAI | ${stats.words} palabras | ${stats.characters} caracteres`,
    subject: "Documento Markdown",
    keywords: ["markdown", "scribeai", "documento"]
  })
}

// Función para parsear formato inline en Markdown
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = []
  
  // Procesar formato básico mejorado
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

// ============================================
// TOOLBAR CON TOOLTIPS MEJORADO
// ============================================

interface ToolbarProps {
  onExportDocx: () => void
  onShowMarkdown: () => void
  stats: DocumentStats
  documentTitle: string
  onTitleChange: (title: string) => void
}

function MarkdownToolbar({ 
  onExportDocx, 
  onShowMarkdown,
  stats,
  documentTitle,
  onTitleChange
}: ToolbarProps) {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
    setIsBold(!isBold)
  }, [editor, isBold])

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
    setIsItalic(!isItalic)
  }, [editor, isItalic])

  const formatCode = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
  }, [editor])

  const formatHeading = useCallback((headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if (selection) {
        const selectedText = selection.getTextContent()
        const headingNode = $createHeadingNode(headingSize)
        headingNode.append($createTextNode(selectedText || `Nuevo ${headingSize.toUpperCase()}`))
        selection.insertNodes([headingNode])
      }
    })
  }, [editor])

  const insertQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (selection) {
        const quoteNode = $createQuoteNode()
        quoteNode.append($createTextNode('Cita inspiradora...'))
        selection.insertNodes([quoteNode])
      }
    })
  }, [editor])

  const insertUnorderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  return (
    <div className="simple-toolbar">
      {/* Título del documento editable */}
      <div className="toolbar-section document-title-section">
        {isEditingTitle ? (
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
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
            {documentTitle || 'Sin título'}
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
        <Tooltip text="Título Principal (H1)" position="bottom">
          <button
            className="simple-button"
            onClick={() => formatHeading('h1')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h8m-8-6h12M4 18h12"/>
              <line x1="20" y1="4" x2="20" y2="20"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip text="Subtítulo (H2)" position="bottom">
          <button
            className="simple-button"
            onClick={() => formatHeading('h2')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h8m-8-6h8M4 18h8"/>
              <path d="M15 18h6m-3-3v6"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip text="Título Menor (H3)" position="bottom">
          <button
            className="simple-button"
            onClick={() => formatHeading('h3')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h8m-8-6h6M4 18h6"/>
              <path d="M15 14c0 1.5 1.5 3 3 3s3-1.5 3-3-1.5-3-3-3-3 1.5-3 3z"/>
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Sección de formato */}
      <div className="toolbar-section">
        <Tooltip text="Texto en Negrita (Ctrl+B)" position="bottom">
          <button
            className={`simple-button ${isBold ? 'active' : ''}`}
            onClick={formatBold}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip text="Texto en Cursiva (Ctrl+I)" position="bottom">
          <button
            className={`simple-button ${isItalic ? 'active' : ''}`}
            onClick={formatItalic}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="4" x2="10" y2="4"/>
              <line x1="14" y1="20" x2="5" y2="20"/>
              <line x1="15" y1="4" x2="9" y2="20"/>
            </svg>
          </button>
        </Tooltip>

        <Tooltip text="Insertar Cita" position="bottom">
          <button
            className="simple-button"
            onClick={insertQuote}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Sección de listas */}
      <div className="toolbar-section">
        <Tooltip text="Lista con Viñetas" position="bottom">
          <button
            className="simple-button"
            onClick={insertUnorderedList}
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
        </Tooltip>
        
        <Tooltip text="Lista Numerada" position="bottom">
          <button
            className="simple-button"
            onClick={insertOrderedList}
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
        </Tooltip>
      </div>

      {/* Sección de acciones discretas */}
      <div className="toolbar-section">
        <Tooltip text="Nuevo documento (Ctrl+N)" position="bottom">
          <button
            className="simple-button action-button"
            onClick={() => window.createNewDocument?.()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip text="Guardar (Ctrl+S)" position="bottom">
          <button
            className="simple-button action-button"
            onClick={() => window.saveCurrentDocument?.()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
            </svg>
          </button>
        </Tooltip>
        
        <Tooltip text="Pantalla completa (F11)" position="bottom">
          <button
            className="simple-button action-button"
            onClick={() => window.toggleFullscreen?.()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Sección de exportación */}
      <div className="toolbar-section export-section">
        <Tooltip text="Ver Código Markdown Raw" position="bottom">
          <button
            className="simple-button export-button"
            onClick={onShowMarkdown}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
            MD
          </button>
        </Tooltip>
        
        <Tooltip text="Descargar como DOCX" position="bottom">
          <button
            className="simple-button primary-button"
            onClick={onExportDocx}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            DOCX
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

function Placeholder() {
  return (
    <div className="editor-placeholder">
      Empiece a escribir su documento aquí...
    </div>
  )
}

// ============================================
// EDITOR PRINCIPAL
// ============================================

interface MarkdownEditorProps {
  onContentChange?: (content: string, stats: DocumentStats) => void
  onStatsUpdate?: (stats: DocumentStats) => void
  documentTitle?: string
  onTitleChange?: (title: string) => void
  initialContent?: string
}

export default function MarkdownEditor({ 
  onContentChange, 
  onStatsUpdate,
  documentTitle: externalTitle,
  onTitleChange,
  initialContent
}: MarkdownEditorProps) {
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    readingTime: 0
  })
  const [internalTitle, setInternalTitle] = useState('Nuevo Documento')
  
  // Usar título externo si está disponible, sino usar el interno
  const documentTitle = externalTitle || internalTitle
  
  // Sincronizar título interno cuando cambie el externo
  useEffect(() => {
    if (externalTitle && externalTitle !== internalTitle) {
      setInternalTitle(externalTitle)
    }
  }, [externalTitle, internalTitle])
  
  // Función para manejar cambios de título
  const handleTitleChange = useCallback((newTitle: string) => {
    // Actualizar siempre el título interno
    setInternalTitle(newTitle)
    
    // Si hay callback externo, llamarlo
    if (onTitleChange) {
      onTitleChange(newTitle)
    }
  }, [onTitleChange])

  const initialConfig = {
    namespace: 'MarkdownEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error)
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode,
      AutoLinkNode,
    ],
    editable: true,
  }

  // Componente para manejar la carga inicial de contenido
  function ContentLoader({ content }: { content?: string }) {
    const [editor] = useLexicalComposerContext()
    
    useEffect(() => {
      if (content && content.trim()) {
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          
          // Dividir el contenido en párrafos y recrear la estructura
          const paragraphs = content.split('\n').filter(p => p.trim())
          
          if (paragraphs.length === 0) {
            const paragraph = $createParagraphNode()
            paragraph.append($createTextNode(''))
            root.append(paragraph)
          } else {
            paragraphs.forEach((text, index) => {
              const paragraph = $createParagraphNode()
              paragraph.append($createTextNode(text))
              root.append(paragraph)
            })
          }
        })
      } else if (content === '') {
        // Si el contenido está vacío explícitamente, limpiar el editor
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          const paragraph = $createParagraphNode()
          root.append(paragraph)
        })
      }
    }, [content, editor])
    
    return null
  }

  // Manejar cambios en el editor
  const handleEditorChange = useCallback((newEditorState: EditorState) => {
    setEditorState(newEditorState)
    
    // Extraer texto y calcular estadísticas
    const textContent = newEditorState.read(() => {
      const root = $getRoot()
      return root.getTextContent()
    })
    
    const newStats = calculateStats(textContent)
    setStats(newStats)
    
    // Callbacks opcionales
    onContentChange?.(textContent, newStats)
    onStatsUpdate?.(newStats)
  }, [onContentChange, onStatsUpdate])

  const exportToDocx = useCallback(() => {
    if (!editorState) {
      alert('No hay contenido para exportar')
      return
    }

    try {
      const markdown = convertToMarkdown(editorState)
      const doc = convertMarkdownToDocx(markdown, documentTitle)
      
      Packer.toBlob(doc).then(blob => {
        const timestamp = new Date().toISOString().slice(0, 10)
        const fileName = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.docx`
        saveAs(blob, fileName)
      })
    } catch (error) {
      console.error('Error al exportar DOCX:', error)
      alert('Error al exportar el documento. Por favor, inténtelo de nuevo.')
    }
  }, [editorState, documentTitle])

  const showMarkdownRaw = useCallback(() => {
    if (!editorState) {
      setMarkdownContent('# El documento está vacío\n\nEmpiece a escribir para ver el código Markdown.')
      setShowMarkdown(true)
      return
    }

    try {
      const markdown = convertToMarkdown(editorState)
      setMarkdownContent(markdown || '# El documento está vacío\n\nEmpiece a escribir para ver el código Markdown.')
      setShowMarkdown(true)
    } catch (error) {
      console.error('Error al generar Markdown:', error)
      setMarkdownContent('# Error al generar Markdown\n\nHubo un problema al procesar el contenido.')
      setShowMarkdown(true)
    }
  }, [editorState])

  const copyMarkdownToClipboard = useCallback(() => {
    navigator.clipboard.writeText(markdownContent).then(() => {
      const button = document.querySelector('.copy-button') as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = 'Copiado ✓'
        button.style.background = '#28a745'
        setTimeout(() => {
          button.textContent = originalText
          button.style.background = ''
        }, 2000)
      }
    }).catch(err => {
      console.error('Error al copiar:', err)
      alert('Error al copiar al portapapeles')
    })
  }, [markdownContent])

  const MarkdownModal = () => {
    if (!showMarkdown) return null

    return (
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
            <pre>{markdownContent}</pre>
          </div>
          <div className="markdown-modal-footer">
            <button 
              className="copy-button"
              onClick={copyMarkdownToClipboard}
            >
              📋 Copiar Código
            </button>
            <button 
              className="export-md-button"
              onClick={() => {
                const blob = new Blob([markdownContent], { type: 'text/markdown' })
                const timestamp = new Date().toISOString().slice(0, 10)
                const fileName = `${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.md`
                saveAs(blob, fileName)
              }}
            >
              💾 Descargar .MD
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="markdown-editor">
          <MarkdownToolbar 
            onExportDocx={exportToDocx}
            onShowMarkdown={showMarkdownRaw}
            stats={stats}
            documentTitle={documentTitle}
            onTitleChange={handleTitleChange}
          />
          
          <div className="editor-wrapper">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="editor-input"
                  style={{ outline: 'none' }}
                  spellCheck={true}
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={SimpleErrorBoundary}
            />
            
            <ContentLoader content={initialContent} />
            <OnChangePlugin onChange={handleEditorChange} />
            <HistoryPlugin />
            <ListPlugin />
          </div>
        </div>
      </LexicalComposer>
      
      <MarkdownModal />
    </>
  )
} 