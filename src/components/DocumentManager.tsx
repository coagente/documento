'use client'

import React, { useState, useCallback, useEffect } from 'react'

// ============================================
// INTERFACES
// ============================================

interface DocumentInfo {
  id: string
  title: string
  content: string
  lastModified: Date
  wordCount: number
  folder?: string
  tags: string[]
}

interface Folder {
  id: string
  name: string
  color: string
  documentCount: number
}

interface DocumentManagerProps {
  onDocumentSelect: (document: DocumentInfo) => void
  onNewDocument: () => void
  currentDocument?: DocumentInfo
  onCurrentDocumentUpdate?: (document: DocumentInfo) => void
}

// ============================================
// UTILIDADES DE STORAGE
// ============================================

const STORAGE_KEYS = {
  DOCUMENTS: 'scribeai_documents',
  FOLDERS: 'scribeai_folders',
  SETTINGS: 'scribeai_settings'
}

function loadDocuments(): DocumentInfo[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
    return stored ? JSON.parse(stored).map((doc: DocumentInfo) => ({
      ...doc,
      lastModified: new Date(doc.lastModified)
    })) : []
  } catch (error) {
    console.error('Error loading documents:', error)
    return []
  }
}

function saveDocuments(documents: DocumentInfo[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
  } catch (error) {
    console.error('Error saving documents:', error)
  }
}

function loadFolders(): Folder[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FOLDERS)
    return stored ? JSON.parse(stored) : [
      { id: 'default', name: 'Mis Documentos', color: '#0066cc', documentCount: 0 }
    ]
  } catch (error) {
    console.error('Error loading folders:', error)
    return [
      { id: 'default', name: 'Mis Documentos', color: '#0066cc', documentCount: 0 }
    ]
  }
}

function saveFolders(folders: Folder[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders))
  } catch (error) {
    console.error('Error saving folders:', error)
  }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DocumentManager({ onDocumentSelect, onNewDocument, currentDocument, onCurrentDocumentUpdate }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'modified' | 'title' | 'wordCount'>('modified')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    setDocuments(loadDocuments())
  }, [])

  // Función para refrescar documentos desde localStorage
  const refreshDocuments = useCallback(() => {
    const freshDocuments = loadDocuments()
    setDocuments(freshDocuments)
  }, [])

  // Escuchar cambios en localStorage directamente
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.DOCUMENTS) {
        refreshDocuments()
      }
    }

    // Escuchar eventos de storage
    window.addEventListener('storage', handleStorageChange)

    // También crear un polling para detectar cambios locales (mismo tab)
    const pollInterval = setInterval(() => {
      const storedDocs = loadDocuments()
      
      // Comparar longitudes y últimas modificaciones para detección rápida
      if (storedDocs.length !== documents.length) {
        setDocuments(storedDocs)
        return
      }
      
      // Comparar títulos y últimas modificaciones
      const hasChanges = storedDocs.some((storedDoc, index) => {
        const currentDoc = documents[index]
        return !currentDoc || 
               storedDoc.title !== currentDoc.title || 
               storedDoc.lastModified.getTime() !== currentDoc.lastModified.getTime()
      })
      
      if (hasChanges) {
        setDocuments(storedDocs)
      }
    }, 250) // Revisar cada 250ms para mayor responsividad

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
    }
  }, [documents, refreshDocuments])

  // Exponer función de refresh globalmente (backup)
  useEffect(() => {
    window.refreshDocumentManager = refreshDocuments
    return () => {
      delete window.refreshDocumentManager
    }
  }, [refreshDocuments])

  // Crear nuevo documento
  const createDocument = useCallback(() => {
    const newDoc: DocumentInfo = {
      id: `doc_${Date.now()}`,
      title: 'Nuevo Documento',
      content: '',
      lastModified: new Date(),
      wordCount: 0,
      folder: 'default',
      tags: []
    }
    
    const updatedDocs = [newDoc, ...documents]
    setDocuments(updatedDocs)
    saveDocuments(updatedDocs)
    onDocumentSelect(newDoc)
    onNewDocument()
  }, [documents, onDocumentSelect, onNewDocument])

  // Actualizar documento existente
  const updateDocument = useCallback((updatedDoc: DocumentInfo) => {
    const updatedDocs = documents.map(doc => 
      doc.id === updatedDoc.id ? { ...updatedDoc, lastModified: new Date() } : doc
    )
    setDocuments(updatedDocs)
    saveDocuments(updatedDocs)
  }, [documents])

  // Eliminar documento
  const deleteDocument = useCallback((docId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este documento?')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId)
      setDocuments(updatedDocs)
      saveDocuments(updatedDocs)
    }
  }, [documents])

  // Duplicar documento
  const duplicateDocument = useCallback((doc: DocumentInfo) => {
    const duplicate: DocumentInfo = {
      ...doc,
      id: `doc_${Date.now()}`,
      title: `${doc.title} - Copia`,
      lastModified: new Date()
    }
    
    const updatedDocs = [duplicate, ...documents]
    setDocuments(updatedDocs)
    saveDocuments(updatedDocs)
    onDocumentSelect(duplicate)
  }, [documents, onDocumentSelect])

  // Descargar documento como Markdown
  const downloadDocument = useCallback((doc: DocumentInfo) => {
    const blob = new Blob([doc.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // Cambiar nombre del documento
  const renameDocument = useCallback((docId: string, newTitle: string) => {
    if (!newTitle.trim()) return
    
    const updatedDocs = documents.map(doc => {
      if (doc.id === docId) {
        const updatedDoc = { ...doc, title: newTitle.trim(), lastModified: new Date() }
        // Si es el documento actual, notificar al editor
        if (currentDocument?.id === docId && onCurrentDocumentUpdate) {
          onCurrentDocumentUpdate(updatedDoc)
        }
        return updatedDoc
      }
      return doc
    })
    setDocuments(updatedDocs)
    saveDocuments(updatedDocs)
  }, [documents, currentDocument, onCurrentDocumentUpdate])

  // Estado para edición de nombres
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // Filtrar y ordenar documentos
  const filteredAndSortedDocuments = React.useMemo(() => {
    let filtered = documents

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'wordCount':
          return b.wordCount - a.wordCount
        case 'modified':
        default:
          return b.lastModified.getTime() - a.lastModified.getTime()
      }
    })

    return filtered
  }, [documents, searchTerm, sortBy])

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const totalDocs = documents.length
    const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0)
    const recentDocs = documents.filter(doc => 
      Date.now() - doc.lastModified.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length

    return { totalDocs, totalWords, recentDocs }
  }, [documents])

  if (isCollapsed) {
    return (
      <div className="file-explorer collapsed">
        <button 
          className="expand-button"
          onClick={() => setIsCollapsed(false)}
          title="Expandir explorer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="file-explorer">
      {/* Header minimalista */}
      <div className="explorer-header">
        <div className="explorer-title">
          <svg className="explorer-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>FILES</h3>
          <button 
            className="collapse-button"
            onClick={() => setIsCollapsed(true)}
            title="Colapsar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="explorer-toolbar">
        <button 
          className="new-file-btn"
          onClick={createDocument}
          title="Nuevo archivo"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="12" y1="17" x2="12" y2="9"/>
          </svg>
        </button>
      </div>

      {/* Tree */}
      <div className="file-tree">
        <div className="folder-header">
          <svg className="folder-toggle" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
          <svg className="folder-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="folder-name">documentos</span>
          <span className="file-count">{filteredAndSortedDocuments.length}</span>
        </div>
        
        <div className="file-list">
          {filteredAndSortedDocuments.length === 0 ? (
            <div className="empty-explorer">
              <small>Sin archivos</small>
            </div>
          ) : (
            filteredAndSortedDocuments.map(doc => (
              <div
                key={doc.id}
                className={`file-item ${currentDocument?.id === doc.id ? 'active' : ''}`}
                onClick={() => onDocumentSelect(doc)}
              >
                <div className="file-content">
                  <svg className="file-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  {editingDocId === doc.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        renameDocument(doc.id, editingTitle)
                        setEditingDocId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          renameDocument(doc.id, editingTitle)
                          setEditingDocId(null)
                        }
                        if (e.key === 'Escape') {
                          setEditingDocId(null)
                        }
                      }}
                      className="file-rename-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="file-name"
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingDocId(doc.id)
                        setEditingTitle(doc.title)
                      }}
                    >
                      {doc.title}.md
                    </span>
                  )}
                </div>
                
                {/* Acciones */}
                <div className="file-actions">
                  <button 
                    className="file-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateDocument(doc)
                    }}
                    title="Duplicar"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                  <button 
                    className="file-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadDocument(doc)
                    }}
                    title="Descargar"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button 
                    className="file-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDocument(doc.id)
                    }}
                    title="Eliminar"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 