'use client'

import React, { useState } from 'react'

export default function TestPage() {
  const [content, setContent] = useState('')

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de funcionalidad básica</h1>
      
      <h2>1. Test de textarea básico</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe aquí para probar funcionalidad básica..."
        style={{
          width: '100%',
          height: '100px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      
      <p>Caracteres: {content.length}</p>
      
      <h2>2. Test de React state</h2>
      <div>
        <button onClick={() => setContent('Contenido de prueba')}>
          Establecer contenido de prueba
        </button>
        <button onClick={() => setContent('')}>
          Limpiar
        </button>
      </div>
      
      <h2>3. Estado actual:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        {JSON.stringify({ content, length: content.length }, null, 2)}
      </pre>
    </div>
  )
} 