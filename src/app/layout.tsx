import React from 'react'
import './globals.css'
import './responsive-improvements.css'
import type { Metadata } from 'next'
import ChatInterface from '../components/ChatInterface'

export const metadata: Metadata = {
  title: 'ple.ad writer - Agente de edición de documentos',
  description: 'Agente inteligente para la edición profesional de documentos con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Header minimalista */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-brand">
              <div className="brand-logo">
                <div className="logo-icon"></div>
                <h1 className="brand-name">ple.ad writer</h1>
              </div>
              <span className="brand-tagline">Agente de edición de documentos</span>
            </div>
            
            <nav className="header-nav">
              <span className="nav-subtitle">Agente inteligente para edición profesional</span>
            </nav>

            <div className="header-actions">
              <button className="action-button" id="help-btn" title="Ayuda">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <circle cx="12" cy="17" r="1"/>
                </svg>
              </button>
              <button className="action-button" id="settings-btn" title="Configuración">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
              </button>
              <div className="user-avatar" id="user-menu" title="Usuario">
                <span>KA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Layout principal */}
        <div className="app-layout">
          <main className="main-content">
            {children}
          </main>
          
          {/* Sidebar: DocumentManager + Chat */}
          <aside className="chat-sidebar">
            <div id="document-manager-container"></div>
            
            <div className="chat-header">
              <div className="chat-title">
                <svg className="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <h3>Asistente</h3>
              </div>
            </div>
            
            <div className="chat-content">
              <div className="chat-messages">
                <div className="message-welcome">
                  <div className="message-content">
                    <p>Asistente de edición disponible.</p>
                    <p className="welcome-description">Pregúntame sobre corrección, estilo o mejoras para tu documento.</p>
                  </div>
                </div>
              </div>
              
              <ChatInterface />
            </div>
          </aside>
        </div>

        {/* Scripts de funcionalidad */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const connectEditorFunctions = () => {
                const toolbar = document.querySelector('.simple-toolbar');
                if (toolbar) {
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
                  setTimeout(connectEditorFunctions, 500);
                }
              };

              setTimeout(connectEditorFunctions, 1000);

              window.createNewDocument = () => {
                const newBtn = document.querySelector('.action-btn.primary');
                if (newBtn) {
                  newBtn.click();
                } else {
                  console.log('Creating new document...');
                  if (confirm('¿Crear un nuevo documento? Los cambios no guardados se perderán.')) {
                    window.location.reload();
                  }
                }
              };

              window.saveCurrentDocument = () => {
                console.log('Auto-save activated');
                
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
    </body>
  </html>
  )
} 