'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatInterface() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const mockResponses = [
    "¡Excelente pregunta! Te ayudo a mejorar esa sección de tu documento.",
    "He revisado tu texto y puedo sugerirte algunas mejoras en el estilo.",
    "Perfecto, vamos a corregir la gramática y estructurar mejor las ideas.",
    "Te sugiero reorganizar los párrafos para mayor claridad y fluidez.",
    "Excelente contenido. ¿Te gustaría que revise el tono para hacerlo más profesional?",
    "He identificado algunas oportunidades para fortalecer tus argumentos.",
    "El documento se ve bien. ¿Necesitas ayuda con las conclusiones?",
    "Te puedo ayudar a hacer el texto más conciso y directo.",
    "¡Buena estructura! Podríamos añadir algunas transiciones entre párrafos.",
    "He notado algunos elementos que podríamos mejorar para mayor impacto."
  ]

  const simulateResponse = (userMessage: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1500)
  }

  const sendMessage = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: trimmedMessage,
        isUser: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      setMessage('')
      simulateResponse(trimmedMessage)
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px'
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = '44px' // Reset to minimum
    const scrollHeight = Math.min(textarea.scrollHeight, 120) // Max height 120px
    textarea.style.height = scrollHeight + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <>
      {messages.length > 0 && (
        <div className="chat-messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.isUser ? 'user' : 'ai'}`}>
              <div className="message-content">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div className="chat-input-area-improved">
        <div className="chat-input-container-improved">
          <textarea 
            ref={textareaRef}
            className="chat-input-improved"
            placeholder="Escribe tu pregunta sobre el documento..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            style={{ 
              height: '44px',
              maxHeight: '120px',
              minHeight: '44px',
              resize: 'none',
              width: '100%'
            }}
          />
          <button 
            className="chat-send-improved" 
            title="Enviar mensaje (Enter)" 
            onClick={sendMessage}
            disabled={!message.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
            </svg>
          </button>
        </div>
        <div className="chat-input-hint">
          <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
        </div>
      </div>
    </>
  )
} 