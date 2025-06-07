'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

// Interfaces
interface DocumentInfo {
  id: string
  title: string
  content: string
  lastModified: Date
  wordCount: number
  folder?: string
  tags: string[]
}

interface DocumentStats {
  words: number
  characters: number
  charactersNoSpaces: number
  paragraphs: number
  readingTime: number
}

// Cargar componentes dinámicamente - TEMPORALMENTE USANDO EDITOR SIMPLE
const MarkdownEditor = dynamic(() => import('../components/SimpleEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: '#5f6368',
      fontSize: '14px',
      fontWeight: '500',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        border: '3px solid #e8eaed',
        borderTop: '3px solid #0066cc',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div>
        <div>Iniciando Editor Simplificado...</div>
        <small style={{ color: '#9aa0a6', marginTop: '4px', display: 'block' }}>
          Modo diagnóstico
        </small>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

const DocumentManager = dynamic(() => import('../components/DocumentManager'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#5f6368',
      fontSize: '12px'
    }}>
      📁 Cargando documentos...
    </div>
  )
})

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<DocumentInfo | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [documentTitle, setDocumentTitle] = useState('Nuevo Documento')
  const [documentContent, setDocumentContent] = useState('')
  const [lastStats, setLastStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    readingTime: 0
  })

  // Inicializar funciones globales cuando el componente se monta
  useEffect(() => {
    // Hacer funciones disponibles globalmente para el header
    window.createNewDocument = () => {
      console.log('Creating new document...')
      // Esta función será llamada por el DocumentManager
    }

    window.saveCurrentDocument = () => {
      if (currentDocument) {
        console.log('Saving document:', currentDocument.title)
        // Auto-save está implementado en el onChange
        alert('✓ Documento guardado automáticamente')
      } else {
        alert('No hay documento abierto para guardar')
      }
    }

    window.exportCurrentDocument = () => {
      if (window.exportToDocx) {
        window.exportToDocx()
      } else {
        alert('Funcionalidad de exportación no disponible')
      }
    }

    window.showMarkdownModal = () => {
      if (window.showMarkdown) {
        window.showMarkdown()
      } else {
        alert('Funcionalidad de Markdown no disponible')
      }
    }

    // Actualizar estadísticas iniciales
    if (window.updateFooterStats) {
      window.updateFooterStats(0, 0)
    }

    setIsEditorReady(true)

    return () => {
      // Cleanup
      delete window.createNewDocument
      delete window.saveCurrentDocument
      delete window.exportCurrentDocument
      delete window.showMarkdownModal
    }
  }, [currentDocument])

  // Manejar selección de documento
  const handleDocumentSelect = useCallback((document: DocumentInfo) => {
    setCurrentDocument(document)
    setDocumentTitle(document.title)
    setDocumentContent(document.content)
    console.log('Document selected:', document.title)
  }, [])

  // Manejar nuevo documento
  const handleNewDocument = useCallback(() => {
    setCurrentDocument(null)
    setDocumentTitle('Nuevo Documento')
    setDocumentContent('')
    console.log('New document created')
  }, [])

  // Manejar actualización del documento actual desde DocumentManager
  const handleCurrentDocumentUpdate = useCallback((updatedDocument: DocumentInfo) => {
    setCurrentDocument(updatedDocument)
    setDocumentTitle(updatedDocument.title)
    console.log('Current document updated:', updatedDocument.title)
  }, [])

  // Manejar cambio de título desde el editor
  const handleTitleChange = useCallback((newTitle: string) => {
    setDocumentTitle(newTitle)
    
    if (currentDocument) {
      // Actualizar documento existente
      const updatedDocument = {
        ...currentDocument,
        title: newTitle,
        lastModified: new Date()
      }
      setCurrentDocument(updatedDocument)
      
      // Guardar en localStorage
      const existingDocs = JSON.parse(localStorage.getItem('scribeai_documents') || '[]')
      const updatedDocs = existingDocs.map((doc: DocumentInfo) => 
        doc.id === currentDocument.id ? updatedDocument : doc
      )
      localStorage.setItem('scribeai_documents', JSON.stringify(updatedDocs))
      
      // Forzar actualización inmediata del DocumentManager
      setTimeout(() => {
        if (window.refreshDocumentManager) {
          window.refreshDocumentManager()
        }
      }, 50)
    } else {
      // Crear documento nuevo automáticamente
      const newDoc: DocumentInfo = {
        id: `doc_${Date.now()}`,
        title: newTitle,
        content: documentContent,
        lastModified: new Date(),
        wordCount: 0,
        folder: 'default',
        tags: []
      }
      setCurrentDocument(newDoc)
      
      // Guardar en localStorage
      const existingDocs = JSON.parse(localStorage.getItem('scribeai_documents') || '[]')
      const updatedDocs = [newDoc, ...existingDocs]
      localStorage.setItem('scribeai_documents', JSON.stringify(updatedDocs))
      
      // Forzar actualización inmediata del DocumentManager
      setTimeout(() => {
        if (window.refreshDocumentManager) {
          window.refreshDocumentManager()
        }
      }, 50)
    }
  }, [currentDocument, documentContent])

  // Manejar cambios en el contenido del editor - simplificado para el editor simple
  const handleContentChange = useCallback((content: string) => {
    // Calcular estadísticas simples
    const words = content.split(' ').filter(w => w.length > 0).length
    const stats: DocumentStats = {
      words,
      characters: content.length,
      charactersNoSpaces: content.replace(/\s/g, '').length,
      paragraphs: content.split('\n').filter(p => p.trim().length > 0).length,
      readingTime: Math.ceil(words / 200)
    }
    
    setLastStats(stats)
    
    // Actualizar estadísticas en el footer
    if (window.updateFooterStats) {
      window.updateFooterStats(stats.words, stats.characters)
    }

    // Auto-save si hay documento actual
    if (currentDocument) {
      const updatedDocument: DocumentInfo = {
        ...currentDocument,
        content: content,
        wordCount: stats.words,
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
      if (window.refreshDocumentManager) {
        window.refreshDocumentManager()
      }
      
      console.log('Auto-saving document:', updatedDocument.title)
    }
  }, [currentDocument])

  // Renderizar DocumentManager en el sidebar usando Portal
  useEffect(() => {
    const container = document.getElementById('document-manager-container')
    if (container && isEditorReady) {
      console.log('DocumentManager container ready')
    }
  }, [isEditorReady])

  return (
    <>
      {/* DocumentManager Portal para el sidebar */}
      {isEditorReady && typeof window !== 'undefined' && (
        createPortal(
          <DocumentManager
                    onDocumentSelect={handleDocumentSelect}
        onNewDocument={handleNewDocument}
        currentDocument={currentDocument || undefined}
        onCurrentDocumentUpdate={handleCurrentDocumentUpdate}
          />,
          document.getElementById('document-manager-container') || document.body
        )
      )}



      {/* Contenido principal */}
      <div className="markdown-app">
        <div className="editor-section">
          <div className="editor-container">
            {isEditorReady && (
              <MarkdownEditor 
                onContentChange={handleContentChange}
                documentTitle={documentTitle}
                onTitleChange={handleTitleChange}
                initialContent={documentContent}
              />
            )}
          </div>
        </div>
      </div>

      {/* Script para conectar funciones del editor con el header */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Conectar funciones del editor cuando esté disponible
            const connectEditorFunctions = () => {
              const toolbar = document.querySelector('.simple-toolbar');
              if (toolbar) {
                // Buscar botones específicos del toolbar
                const markdownBtn = toolbar.querySelector('.export-button');
                const docxBtn = toolbar.querySelector('.primary-button');
                
                if (markdownBtn) {
                  window.showMarkdown = () => markdownBtn.click();
                }
                
                if (docxBtn) {
                  window.exportToDocx = () => docxBtn.click();
                }
                
                console.log('Editor functions connected');
              } else {
                // Reintentar en 500ms
                setTimeout(connectEditorFunctions, 500);
              }
            };

            // Iniciar conexión
            setTimeout(connectEditorFunctions, 1000);

            // Función para crear documento desde el header
            window.createNewDocument = () => {
              const newBtn = document.querySelector('.action-btn.primary');
              if (newBtn) {
                newBtn.click();
              } else {
                console.log('Creating new document...');
                // Fallback: recargar la página para crear nuevo documento
                if (confirm('¿Crear un nuevo documento? Los cambios no guardados se perderán.')) {
                  window.location.reload();
                }
              }
            };

            // Mejorar feedback de guardado
            window.saveCurrentDocument = () => {
              console.log('Auto-save activated');
              
              // Mostrar feedback visual
              const saveBtn = document.getElementById('save-doc-btn');
              if (saveBtn) {
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<span class="nav-icon">✓</span><span class="nav-label">Guardado</span>';
                saveBtn.style.background = '#28a745';
                saveBtn.style.color = 'white';
                
                setTimeout(() => {
                  saveBtn.innerHTML = originalText;
                  saveBtn.style.background = '';
                  saveBtn.style.color = '';
                }, 2000);
              }
              
              return true;
            };
          `
        }}
      />
    </>
  )
} 