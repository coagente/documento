'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDocument, useDocumentSync } from '../context/DocumentContext'

// Cargar el nuevo editor fullscreen
const FullscreenEditor = dynamic(() => import('../components/FullscreenEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#5f6368',
      fontSize: '16px',
      fontWeight: '500',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid #e8eaed',
        borderTop: '3px solid #dc2626',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div>
        <div>Cargando Editor...</div>
        <small style={{ color: '#9aa0a6', marginTop: '8px', display: 'block' }}>
          Vista dual con IA integrada
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

export default function Home() {
  // Usar el contexto del documento
  const { 
    documentTitle, 
    documentContent,
    setDocumentTitle,
    updateDocument
  } = useDocument()
  
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Inicializar editor
  useEffect(() => {
    setIsEditorReady(true)
  }, [])

  // Manejar cambio de título
  const handleTitleChange = useCallback((newTitle: string) => {
    setDocumentTitle(newTitle)
  }, [setDocumentTitle])

  // Manejar cambios en el contenido
  const handleContentChange = useCallback((content: string) => {
    updateDocument(content)
  }, [updateDocument])

  return (
    <>
      {/* Editor fullscreen */}
      {isEditorReady && (
        <FullscreenEditor
          onContentChange={handleContentChange}
          documentTitle={documentTitle}
          onTitleChange={handleTitleChange}
          initialContent={documentContent}
        />
      )}
    </>
  )
} 