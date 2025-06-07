import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { DocumentProvider } from '../context/DocumentContext'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ple.ad writer - Editor Inteligente',
  description: 'Editor de documentos con IA integrada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <DocumentProvider>
          {/* Header sofisticado con glassmorphism */}
          <header className="app-header-enhanced">
            <div className="header-content-enhanced">
              <div className="header-brand-enhanced">
                <div className="brand-logo-enhanced">
                  <div className="logo-icon-enhanced">
                    <svg 
                      className="logo-svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path 
                        className="logo-path-main" 
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      />
                      <polyline 
                        className="logo-path-fold" 
                        points="14,2 14,8 20,8"
                      />
                      <g className="logo-content">
                        <line 
                          className="logo-line" 
                          x1="16" y1="13" x2="8" y2="13"
                        />
                        <line 
                          className="logo-line" 
                          x1="16" y1="17" x2="8" y2="17"
                        />
                        <line 
                          className="logo-line" 
                          x1="10" y1="9" x2="8" y2="9"
                        />
                      </g>
                    </svg>
                  </div>
                  <div className="brand-text">
                    <div className="brand-name-enhanced">ple.ad writer</div>
                    <div className="brand-tagline-enhanced">Editor Inteligente con IA</div>
                  </div>
                </div>
              </div>

              <nav className="header-nav-enhanced">
                <div className="nav-subtitle-enhanced">
                  <span className="nav-item">Documento único</span>
                  <span className="nav-separator">•</span>
                  <span className="nav-item">Sin guardar</span>
                  <span className="nav-separator">•</span>
                  <span className="nav-item">Edición en tiempo real</span>
                </div>
              </nav>

              <div className="header-status-enhanced">
                <div className="status-badge-enhanced">
                  <div className="status-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <circle className="status-dot" cx="12" cy="11" r="1"/>
                      <circle className="status-dot" cx="16" cy="11" r="1"/>
                      <circle className="status-dot" cx="8" cy="11" r="1"/>
                    </svg>
                  </div>
                  <span className="status-text">IA Activa</span>
                  <div className="status-glow"></div>
                </div>
              </div>
            </div>
            
            {/* Gradiente de borde sutil */}
            <div className="header-border-gradient"></div>
          </header>

          {/* Layout principal - Solo editor, sin sidebar */}
          <div className="app-layout-fullscreen">
            <main className="main-content-fullscreen">
              {children}
            </main>
          </div>
        </DocumentProvider>
      </body>
    </html>
  )
} 