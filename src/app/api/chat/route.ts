import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Configuración de Gemini AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
})

export async function POST(request: NextRequest) {
  try {
    // Verificar que tenemos API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      )
    }

    const { message, documentContent, documentTitle, action } = await request.json()

    // Validar entrada
    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      )
    }

    // Crear prompt contextualizado
    const systemPrompt = `Eres un asistente de escritura experto especializado en edición de documentos en Markdown. 

Documento actual:
Título: "${documentTitle || 'Nuevo Documento'}"
Contenido:
\`\`\`markdown
${documentContent || 'Documento vacío'}
\`\`\`

Tu trabajo es:
${action === 'edit' 
  ? '- Proporcionar el texto corregido/mejorado en formato markdown\n- Explicar brevemente los cambios realizados'
  : '- Analizar el documento y responder la pregunta del usuario\n- Dar sugerencias específicas para mejorar el contenido'
}

Responde en español y se conciso pero útil.`

    const fullPrompt = `${systemPrompt}\n\nPregunta del usuario: ${message}`

    // Llamar a Gemini
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: fullPrompt,
    })

    const aiResponse = response.text || 'Lo siento, no pude generar una respuesta.'

    return NextResponse.json({
      success: true,
      response: aiResponse,
      action: action || 'chat'
    })

  } catch (error: any) {
    console.error('Error en API de chat:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Función para streaming (opcional para respuestas largas)
export async function PATCH(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key de Gemini no configurada' },
        { status: 500 }
      )
    }

    const { message, documentContent, documentTitle } = await request.json()

    const systemPrompt = `Eres un asistente de escritura experto. 
Documento actual: "${documentTitle || 'Nuevo Documento'}"
Contenido: ${documentContent || 'Documento vacío'}

Responde la pregunta del usuario sobre el documento:`

    const response = await genAI.models.generateContentStream({
      model: 'gemini-2.0-flash-001',
      contents: `${systemPrompt}\n\nPregunta: ${message}`,
    })

    // Crear ReadableStream para streaming
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.text
          if (text) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('Error en streaming:', error)
    return NextResponse.json(
      { error: 'Error en streaming', details: error.message },
      { status: 500 }
    )
  }
} 