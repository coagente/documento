'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface DocumentInfo {
  id: string
  title: string
  content: string
  lastModified: Date
  wordCount: number
  folder?: string
  tags: string[]
}

interface DocumentContextType {
  // Estado del documento
  currentDocument: DocumentInfo | null
  documentTitle: string
  documentContent: string
  
  // Funciones para actualizar el documento
  setCurrentDocument: (doc: DocumentInfo | null) => void
  setDocumentTitle: (title: string) => void
  setDocumentContent: (content: string) => void
  updateDocument: (content: string) => void
  
  // Función para que el chat actualice el documento
  onDocumentUpdate: (content: string) => void
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

interface DocumentProviderProps {
  children: ReactNode
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [currentDocument, setCurrentDocument] = useState<DocumentInfo | null>(null)
  const [documentTitle, setDocumentTitle] = useState('Nuevo Documento')
  const [documentContent, setDocumentContent] = useState('')

  // Función para actualizar el contenido del documento
  const updateDocument = useCallback((content: string) => {
    setDocumentContent(content)
    
    // Calcular estadísticas simples
    const words = content.split(' ').filter(w => w.length > 0).length
    
    // Auto-save si hay documento actual
    if (currentDocument) {
      const updatedDocument: DocumentInfo = {
        ...currentDocument,
        content: content,
        wordCount: words,
        lastModified: new Date()
      }
      
      setCurrentDocument(updatedDocument)
      
      // Guardar en localStorage
      const existingDocs = JSON.parse(localStorage.getItem('scribeai_documents') || '[]')
      const updatedDocs = existingDocs.map((doc: DocumentInfo) => 
        doc.id === currentDocument.id ? updatedDocument : doc
      )
      localStorage.setItem('scribeai_documents', JSON.stringify(updatedDocs))
      
      // Notificar al DocumentManager para que actualice su estado
      if (typeof window !== 'undefined' && window.refreshDocumentManager) {
        window.refreshDocumentManager()
      }
      
      console.log('Auto-saving document via context:', updatedDocument.title)
    }
  }, [currentDocument])

  // Función específica para que el chat actualice el documento
  const onDocumentUpdate = useCallback((content: string) => {
    updateDocument(content)
    
    // Notificar al editor para que actualice su contenido
    if (typeof window !== 'undefined') {
      // Disparar evento personalizado para notificar al editor
      const event = new CustomEvent('documentUpdatedByAI', { 
        detail: { content } 
      })
      window.dispatchEvent(event)
    }
  }, [updateDocument])

  const value: DocumentContextType = {
    currentDocument,
    documentTitle,
    documentContent,
    setCurrentDocument,
    setDocumentTitle,
    setDocumentContent,
    updateDocument,
    onDocumentUpdate
  }

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider')
  }
  return context
}

// Hook para sincronizar el contexto con el estado local del editor
export function useDocumentSync() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error('useDocumentSync must be used within a DocumentProvider')
  }
  
  return {
    syncDocument: (title: string, content: string, doc: DocumentInfo | null) => {
      context.setDocumentTitle(title)
      context.setDocumentContent(content)
      context.setCurrentDocument(doc)
    }
  }
} 