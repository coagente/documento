# ✍️ ple.ad writer

> **Editor de documentos inteligente con IA integrada - Versión Final**

Un editor de documentos moderno con vista dual (Markdown/Preview) que combina una interfaz elegante con asistencia inteligente de IA para la escritura profesional.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Características Principales

### 📝 **Editor Dual Inteligente**
- **Vista dual**: Editor Markdown + Vista previa en tiempo real
- **Editor sofisticado**: Syntax highlighting y auto-resize
- **Estadísticas en vivo**: Palabras, caracteres, tiempo de lectura
- **Títulos editables**: Click para editar nombres de documentos
- **Diseño profesional**: Tipografía JetBrains Mono para código

### 🤖 **Asistente de IA Integrado (Gemini)**
- **Chat optimizado**: Botón interno sofisticado en input
- **Edición automática**: La IA modifica el documento directamente
- **Integración Gemini AI**: Powered by Google Gemini 2.0
- **Análisis contextual**: Comprende el contenido actual
- **UX premium**: Estados de loading, success/error visuales

### 📥 **Exportación Múltiple**
- **DOCX**: Conversión completa Markdown → Microsoft Word
- **Markdown**: Descarga del archivo .md original
- **PDF**: Captura de vista previa → PDF multi-página
- **Nombres automáticos**: Con timestamp para organización

### 🎨 **Diseño Moderno**
- **Fullscreen**: Sin sidebar, máximo espacio para escritura
- **Responsive**: Funciona perfectamente en móvil, tablet, desktop
- **Interfaz limpia**: Inspirada en editores profesionales
- **Animaciones sutiles**: Hover effects y transiciones fluidas

## 🚀 Inicio Rápido

### Con Docker (Recomendado)
```bash
# Un solo comando para iniciar
docker compose up --build
```

Visita **[http://localhost:3001](http://localhost:3001)** para usar la aplicación.

### Instalación Local
```bash
# Clonar e instalar
git clone [tu-repo]
cd documento
npm install

# Configurar variables de entorno (opcional para IA)
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env

# Ejecutar en desarrollo
npm run dev
```

### 🔐 Configuración de IA (Opcional)

Para habilitar la funcionalidad de IA:

1. **Obtener API Key de Gemini**:
   - Visita [Google AI Studio](https://aistudio.google.com)
   - Crea un proyecto y genera una API key
   - Es gratuito con límites generosos

2. **Configurar variable de entorno**:
   ```bash
   # Crear archivo .env en la raíz del proyecto
   echo "GEMINI_API_KEY=tu_api_key_aqui" > .env
   ```

3. **Reiniciar la aplicación**:
   ```bash
   docker compose down && docker compose up --build
   ```

> **Nota**: La aplicación funciona completamente sin IA, solo no tendrás la funcionalidad de chat inteligente.

## 🏗️ Arquitectura

### **Componentes Principales**
```
src/
├── app/
│   ├── layout.tsx           # Layout principal con header
│   ├── page.tsx             # Página principal (wrapper)
│   ├── globals.css          # Estilos consolidados
│   └── api/chat/route.ts    # API de Gemini AI
├── components/
│   └── FullscreenEditor.tsx # Editor principal (único componente)
├── context/
│   └── DocumentContext.tsx  # Estado global del documento
└── types/
    └── global.d.ts          # Tipos TypeScript
```

### **Flujo de Datos**
```
DocumentContext → FullscreenEditor → [Editor, Preview, Chat, Export]
                                  ↓
                                API Gemini → Actualización automática
```

## 🎯 Funcionalidades Detalladas

### **1. Editor Dual**
- ✅ Auto-resize del textarea
- ✅ Syntax highlighting para Markdown
- ✅ Toggle vista dual/solo editor
- ✅ Estadísticas en tiempo real
- ✅ Placeholder educativo

### **2. Chat IA Optimizado**
- ✅ Botón interno de 36px elegante
- ✅ Auto-resize inteligente (44-120px)
- ✅ Enter para enviar, Shift+Enter nueva línea
- ✅ Estados visuales: focus, hover, loading
- ✅ Altura optimizada: solo 120px total

### **3. Exportación Avanzada**
- **DOCX**: Conversión completa con formato
- **MD**: Descarga directa del Markdown
- **PDF**: html2canvas → jsPDF multi-página
- **Nombres**: `Documento_2024-01-15.extension`

## 🔧 Stack Tecnológico

| Tecnología | Uso | Versión |
|------------|-----|---------|
| **Next.js** | Framework React full-stack | 15.3.3 |
| **React** | Biblioteca UI con hooks | 18.3.1 |
| **TypeScript** | Tipado estático | 5.x |
| **@google/genai** | Integración Gemini AI | 0.21.0 |
| **react-markdown** | Renderizado Markdown | 9.x |
| **docx** | Generación documentos Word | 8.5.0 |
| **jsPDF + html2canvas** | Generación PDF | Latest |
| **file-saver** | Descarga de archivos | 2.0.5 |

## 📱 Responsive Design

### **Desktop (1024px+)**
- Vista dual completa
- Chat con botón interno 36px
- Todos los botones con texto

### **Tablet (768-1024px)**
- Botones solo iconos
- Layout dual mantenido
- Chat optimizado

### **Mobile (<768px)**
- Layout stack vertical
- Chat botón 32px
- Adaptación completa

## ⚡ Flujos de Usuario

### **🖋️ Flujo de Escritura**
1. **Abrir aplicación** → Documento de bienvenida cargado
2. **Click en título** → Editar nombre del documento
3. **Escribir en editor** → Vista previa se actualiza en tiempo real
4. **Ver estadísticas** → Palabras, caracteres, tiempo de lectura

### **🤖 Flujo de IA**
1. **Escribir solicitud** en chat inferior
2. **Presionar Enter** → Procesamiento con spinner
3. **IA analiza** documento completo + solicitud
4. **Aplicación automática** → Contenido se actualiza
5. **Feedback visual** → Estado de éxito/error temporal

### **📥 Flujo de Exportación**
1. **Escribir contenido** en formato Markdown
2. **Elegir formato**: DOCX (azul), MD (verde), PDF (rojo)
3. **Click botón** → Procesamiento automático
4. **Descarga** → Archivo con nombre y timestamp

## 🐳 Docker

### **Scripts útiles**
```bash
# Inicio rápido
./start-docker.sh

# Parar aplicación  
./stop-docker.sh

# Ver logs
docker compose logs -f

# Rebuild completo
docker compose down && docker compose up --build
```

## 🛠️ Desarrollo

### **Scripts NPM**
```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter de código
```

### **Estructura de Archivos**
```
documento/
├── 📁 src/                  # Código fuente
├── 🐳 docker-compose.yml   # Configuración Docker
├── 📦 package.json         # Dependencias
├── 📚 README.md            # Esta documentación
└── 📄 LICENSE              # Licencia MIT
```

## 🎯 Casos de Uso

### **👨‍💼 Profesionales**
- Redacción de informes técnicos
- Documentación de proyectos
- Propuestas comerciales
- Manuales de usuario

### **✍️ Escritores**
- Borradores de artículos
- Estructuración de contenido
- Revisión de estilo y gramática
- Exportación a múltiples formatos

### **🎓 Estudiantes**
- Ensayos académicos
- Notas de estudio
- Trabajos de investigación
- Colaboración en proyectos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este proyecto está listo para colaboración.

### **Cómo contribuir:**
1. **Fork** del repositorio
2. **Crear rama**: `git checkout -b feature/NuevaFuncionalidad`
3. **Desarrollar** siguiendo las convenciones existentes
4. **Testing**: Verificar en móvil y desktop
5. **Pull Request** con descripción detallada

### **Guías de desarrollo:**
- Usar **TypeScript** para todo código nuevo
- Mantener **responsive design**
- Seguir **convenciones de nombres** existentes
- Documentar **funciones complejas**
- Testing en **múltiples dispositivos**

### **Configuración de desarrollo:**
```bash
# Fork y clone del repo
git clone [tu-fork]
cd documento

# Instalar dependencias
npm install

# Configurar pre-commit hooks
npm run prepare

# Ejecutar en desarrollo
npm run dev
```

## 🚧 Roadmap

### **✅ Versión Actual (1.0.0)**
- [x] Editor dual Markdown/Preview
- [x] Chat IA integrado y optimizado
- [x] Exportación DOCX, MD, PDF
- [x] Responsive design completo
- [x] Integración Gemini AI

### **🔮 Futuras Versiones**

#### **v1.1.0 - Mejoras UX**
- [ ] Dark mode toggle
- [ ] Múltiples documentos/tabs
- [ ] Historial de cambios
- [ ] Atajos de teclado

#### **v1.2.0 - Colaboración**
- [ ] Edición colaborativa
- [ ] Comentarios en línea
- [ ] Control de versiones
- [ ] Compartir documentos

#### **v1.3.0 - Funciones Avanzadas**
- [ ] Importación DOCX → Markdown
- [ ] Plantillas predefinidas
- [ ] Integración con servicios cloud
- [ ] API pública

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles.

## 📞 Contacto

- **Repositorio**: [GitHub Repository](https://github.com/tu-usuario/documento)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/documento/issues)
- **Documentación**: Toda la información está en este README

---

<div align="center">

**[⬆ Volver arriba](#-plead-writer)**

✨ **Hecho con ❤️ para escritores que buscan eficiencia y elegancia** ✨

**v1.0.0 Final** | Editor dual + IA integrada + Exportación múltiple

**🚀 Inicio inmediato**: `docker compose up --build` → http://localhost:3001

</div> 